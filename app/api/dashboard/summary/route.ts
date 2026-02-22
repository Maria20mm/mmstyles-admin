import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Products";
import Customer from "@/lib/models/Customer";

const toDayKey = (date: Date) => date.toISOString().slice(0, 10);

export const GET = async () => {
  try {
    await connectToDB();

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const [productsActive, customersCount, ordersLast30, recentOrders] =
      await Promise.all([
        Product.countDocuments({}),
        Customer.countDocuments({}),
        Order.find({ createdAt: { $gte: thirtyDaysAgo } })
          .select("_id customerName customerEmail country items totalAmount currency status createdAt")
          .sort({ createdAt: -1 })
          .lean(),
        Order.find({})
          .select("_id customerName customerEmail country totalAmount currency status createdAt")
          .sort({ createdAt: -1 })
          .limit(6)
          .lean(),
      ]);

    const revenue30d = ordersLast30.reduce(
      (sum: number, order: any) => sum + Number(order.totalAmount || 0),
      0
    );

    const ordersCount30d = ordersLast30.length;
    const conversionRate = customersCount > 0
      ? Number(((ordersCount30d / customersCount) * 100).toFixed(2))
      : 0;

    const regionTotals = new Map<string, number>();
    const currencyTotals = new Map<string, number>();
    const fulfillmentTotals = new Map<string, number>();
    const dayTotals = new Map<string, number>();

    for (const order of ordersLast30) {
      const amount = Number(order.totalAmount || 0);
      const country = order.country || "Unknown";
      const currency = order.currency || "USD";
      const status = order.status || "Pending";
      const day = toDayKey(new Date(order.createdAt));

      regionTotals.set(country, (regionTotals.get(country) || 0) + amount);
      currencyTotals.set(currency, (currencyTotals.get(currency) || 0) + amount);
      fulfillmentTotals.set(status, (fulfillmentTotals.get(status) || 0) + 1);
      dayTotals.set(day, (dayTotals.get(day) || 0) + amount);
    }

    const regionalRevenue = Array.from(regionTotals.entries())
      .map(([region, value]) => ({ region, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const currencyMix = Array.from(currencyTotals.entries())
      .map(([currency, value]) => ({ currency, value }))
      .sort((a, b) => b.value - a.value);

    const fulfillment = Array.from(fulfillmentTotals.entries()).map(
      ([status, count]) => ({
        status,
        count,
      })
    );

    const dailyRevenue = Array.from(dayTotals.entries())
      .map(([day, value]) => ({ day, value }))
      .sort((a, b) => (a.day > b.day ? 1 : -1));

    const recent = recentOrders.map((order: any) => ({
      _id: String(order._id),
      customer: order.customerName || order.customerEmail || "Guest",
      country: order.country || "Unknown",
      totalAmount: Number(order.totalAmount || 0),
      currency: order.currency || "USD",
      status: order.status || "Pending",
      createdAt: new Date(order.createdAt).toISOString().slice(0, 10),
    }));

    return NextResponse.json(
      {
        kpis: {
          revenue30d,
          orders30d: ordersCount30d,
          productsActive,
          conversionRate,
        },
        regionalRevenue,
        currencyMix,
        fulfillment,
        dailyRevenue,
        recentOrders: recent,
      },
      { status: 200 }
    );
  } catch (err) {
    console.log("[dashboard_summary_GET]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
