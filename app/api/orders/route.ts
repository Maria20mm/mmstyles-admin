import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import Customer from "@/lib/models/Customer";

export const GET = async () => {
  try {
    await connectToDB();
    const orders = await Order.find()
      .select("_id customer customerName customerEmail country items totalAmount currency status createdAt")
      .populate({ path: "customer", model: Customer, select: "name email country" })
      .sort({ createdAt: -1 })
      .lean();

    const rows = orders.map((order: any) => ({
      _id: String(order._id),
      customer:
        order.customer?.name ||
        order.customerName ||
        order.customer?.email ||
        order.customerEmail ||
        "Guest",
      country: order.country || order.customer?.country || "Unknown",
      products: Array.isArray(order.items)
        ? order.items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
        : 0,
      totalAmount: Number(order.totalAmount || 0),
      currency: order.currency || "USD",
      status: order.status || "Pending",
      createdAt: new Date(order.createdAt).toISOString().slice(0, 10),
    }));

    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.log("[orders_GET]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = auth();
    const skipAuth = process.env.SKIP_AUTH === "true";

    if (!userId && !skipAuth) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();
    const {
      customerId,
      customerName,
      customerEmail,
      country,
      items,
      totalAmount,
      currency,
      status,
    } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return new NextResponse("At least one order item is required", { status: 400 });
    }

    const mappedItems = items.map((item: any) => ({
      product: item.product || undefined,
      productTitle: item.productTitle || "Untitled Product",
      color: item.color || "",
      size: item.size || "",
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
    }));

    const computedTotal = mappedItems.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price,
      0
    );

    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId && customerEmail) {
      const customer = await Customer.findOneAndUpdate(
        { email: customerEmail },
        {
          name: customerName || customerEmail,
          email: customerEmail,
          country: country || "Unknown",
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
      resolvedCustomerId = String(customer._id);
    }

    const order = await Order.create({
      customer: resolvedCustomerId || undefined,
      customerName: customerName || "Guest",
      customerEmail: customerEmail || "",
      country: country || "Unknown",
      items: mappedItems,
      totalAmount: Number(totalAmount || computedTotal),
      currency: currency || "USD",
      status: status || "Pending",
    });

    return NextResponse.json(order, { status: 200 });
  } catch (err) {
    console.log("[orders_POST]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
