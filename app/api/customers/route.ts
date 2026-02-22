import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { connectToDB } from "@/lib/mongoDB";
import Customer from "@/lib/models/Customer";

export const GET = async () => {
  try {
    await connectToDB();
    const customers = await Customer.find()
      .select("_id clerkId name email country createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(customers, { status: 200 });
  } catch (err) {
    console.log("[customers_GET]", err);
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
    const { clerkId, name, email, country } = await req.json();

    if (!name || !email) {
      return new NextResponse("Name and email are required", { status: 400 });
    }

    const customer = await Customer.findOneAndUpdate(
      { email },
      { clerkId: clerkId ?? "", name, email, country: country ?? "Unknown", updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json(customer, { status: 200 });
  } catch (err) {
    console.log("[customers_POST]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
