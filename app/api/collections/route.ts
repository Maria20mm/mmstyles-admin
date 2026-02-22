import { connectToDB } from "@/lib/mongoDB";

import { NextRequest, NextResponse } from "next/server";

import Collection from "@/lib/models/Collection";
import Product from "@/lib/models/Products";
import { auth } from "@clerk/nextjs/server";
import { demoCollections, makeId } from "@/lib/demoData";

export const POST = async (req: NextRequest) => {
  let title = "";
  let description = "";
  let image = "";

  try {
    const body = await req.json();
    title = (body?.title ?? "").trim();
    description = (body?.description ?? "").trim();
    image = (body?.image ?? "").trim();
    const { userId } = auth();
    const demoMode = process.env.DEMO_MODE === "true";
    const skipAuth = process.env.SKIP_AUTH === "true";

    if (!userId && !demoMode && !skipAuth) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await connectToDB()

    const existingCollection = await Collection.findOne({ title })

    if (existingCollection) {
      return new NextResponse("Collection already exists", { status: 400 })
    }

    if (!title || !image) {
      return new NextResponse("Title and image are required", { status: 400 })
    }

    const newCollection = await Collection.create({
      title,
      description,
      image,
    })

    await newCollection.save()

    return NextResponse.json(
      { ...newCollection.toObject(), _db: process.env.MONGODB_DB_NAME || "MMSTYLES_ADMIN" },
      { status: 200 }
    )
  } catch (err) {
    console.log("[collections_POST]", err)
    if (process.env.DEMO_MODE === "true") {
      const alreadyExists = demoCollections.some(
        (collection) => collection.title.toLowerCase() === title.toLowerCase()
      );
      if (alreadyExists) {
        return new NextResponse("Collection already exists", { status: 400 });
      }
      if (!title || !image) {
        return new NextResponse("Title and image are required", { status: 400 });
      }

      const now = new Date().toISOString();
      const collection = {
        _id: makeId("demo-col"),
        title,
        description,
        image,
        products: [],
        createdAt: now,
        updatedAt: now,
      };
      demoCollections.unshift(collection);
      return NextResponse.json(collection, { status: 200 });
    }

    const message = err instanceof Error ? err.message : "Internal Server Error";
    return new NextResponse(message, { status: 500 })
  }
}

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB()

    const collections = await Collection.find()
      .select("_id title description image products createdAt")
      .sort({ createdAt: "desc" })
      .lean();

    const productCountsByCollection = await Product.aggregate([
      { $unwind: "$collections" },
      { $group: { _id: "$collections", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>(
      productCountsByCollection.map((item) => [String(item._id), item.count])
    );

    const lightweightCollections = collections.map((collection) => ({
      ...collection,
      productCount: countMap.get(String(collection._id)) ?? 0,
    }));

    return NextResponse.json(lightweightCollections, { status: 200 })
  } catch (err) {
    console.log("[collections_GET]", err)
    if (process.env.DEMO_MODE === "true") {
      const lightweightCollections = demoCollections.map((collection) => ({
        ...collection,
        productCount: collection.products.length,
      }));
      return NextResponse.json(lightweightCollections, { status: 200 });
    }

    const message = err instanceof Error ? err.message : "Internal Server Error";
    return new NextResponse(message, { status: 500 })
  }
}

export const dynamic = "force-dynamic";
