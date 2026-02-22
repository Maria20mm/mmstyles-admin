import { NextRequest, NextResponse } from "next/server";


import { connectToDB } from "@/lib/mongoDB";
import Collection from "@/lib/models/Collection";

import { auth } from "@clerk/nextjs/server";
import Product from "@/lib/models/Products";
import { demoCollections } from "@/lib/demoData";

export const GET = async (
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) => {
  try {
    await connectToDB();

    const collection = await Collection.findById(params.collectionId).select("title description image");

    if (!collection) {
      return new NextResponse(
        JSON.stringify({ message: "Collection not found" }),
        { status: 404 }
      );
    }

    return NextResponse.json(collection, { status: 200 });
  } catch (err) {
    console.log("[collectionId_GET]", err);
    if (process.env.DEMO_MODE === "true") {
      const collection = demoCollections.find(
        (item) => item._id === params.collectionId
      );
      if (!collection) {
        return new NextResponse("Collection not found", { status: 404 });
      }
      return NextResponse.json(collection, { status: 200 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) => {
  const { title, description, image } = await req.json();

  try {
    const { userId } = auth();
    const demoMode = process.env.DEMO_MODE === "true";

    if (!userId && !demoMode) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    let collection = await Collection.findById(params.collectionId);

    if (!collection) {
      return new NextResponse("Collection not found", { status: 404 });
    }

    if (!title || !image) {
      return new NextResponse("Title and image are required", { status: 400 });
    }

    collection = await Collection.findByIdAndUpdate(
      params.collectionId,
      { title, description, image },
      { new: true }
    );

    await collection.save();

    return NextResponse.json(collection, { status: 200 });
  } catch (err) {
    console.log("[collectionId_POST]", err);
    if (process.env.DEMO_MODE === "true") {
      const index = demoCollections.findIndex(
        (item) => item._id === params.collectionId
      );
      if (index === -1) {
        return new NextResponse("Collection not found", { status: 404 });
      }
      if (!title || !image) {
        return new NextResponse("Title and image are required", { status: 400 });
      }
      demoCollections[index] = {
        ...demoCollections[index],
        title,
        description: description ?? "",
        image,
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json(demoCollections[index], { status: 200 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) => {
  try {
    const { userId } = auth();
    const demoMode = process.env.DEMO_MODE === "true";

    if (!userId && !demoMode) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    await Collection.findByIdAndDelete(params.collectionId);

    await Product.updateMany(
      { collections: params.collectionId },
      { $pull: { collections: params.collectionId } }
    );
    
    return new NextResponse("Collection is deleted", { status: 200 });
  } catch (err) {
    console.log("[collectionId_DELETE]", err);
    if (process.env.DEMO_MODE === "true") {
      const index = demoCollections.findIndex(
        (item) => item._id === params.collectionId
      );
      if (index === -1) {
        return new NextResponse("Collection not found", { status: 404 });
      }
      demoCollections.splice(index, 1);
      return new NextResponse("Collection is deleted", { status: 200 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
