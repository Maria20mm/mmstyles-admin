
import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/mongoDB";

import Collection from "@/lib/models/Collection";
import { auth } from "@clerk/nextjs/server";
import Product from "@/lib/models/Products";
import { demoCollections, demoProducts, makeId } from "@/lib/demoData";

export const POST = async (req: NextRequest) => {
  let title: string = "";
  let description: string = "";
  let media: string[] = [];
  let category: string = "";
  let collections: string[] = [];
  let tags: string[] = [];
  let sizes: string[] = [];
  let colors: string[] = [];
  let price: number = 0;
  let expense: number = 0;

  try {
    const body = await req.json();
    title = body?.title ?? "";
    description = body?.description ?? "";
    media = body?.media ?? [];
    category = body?.category ?? "";
    collections = body?.collections ?? [];
    tags = body?.tags ?? [];
    sizes = body?.sizes ?? [];
    colors = body?.colors ?? [];
    price = Number(body?.price ?? 0);
    expense = Number(body?.expense ?? 0);

    const { userId } = auth();
    const demoMode = process.env.DEMO_MODE === "true";
    const skipAuth = process.env.SKIP_AUTH === "true";

    if (!userId && !demoMode && !skipAuth) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    if (!title || !description || !media.length || !category || !price || !expense) {
      return new NextResponse("Not enough data to create a product", {
        status: 400,
      });
    }

    const newProduct = await Product.create({
      title,
      description,
      media,
      category,
      collections,
      tags,
      sizes,
      colors,
      price,
      expense,
    });

    await newProduct.save();

    if (collections) {
      for (const collectionId of collections) {
        await Collection.findByIdAndUpdate(collectionId, {
          $addToSet: { products: newProduct._id },
        });
      }
    }

    return NextResponse.json(newProduct, { status: 200 });
  } catch (err) {
    console.log("[products_POST]", err);
    if (process.env.DEMO_MODE === "true") {
      if (!title || !description || !media.length || !category || !price || !expense) {
        return new NextResponse("Not enough data to create a product", {
          status: 400,
        });
      }

      const now = new Date().toISOString();
      const newProduct = {
        _id: makeId("demo-pro"),
        title,
        description,
        media,
        category,
        collections: collections ?? [],
        tags: tags ?? [],
        sizes: sizes ?? [],
        colors: colors ?? [],
        price: Number(price),
        expense: Number(expense),
        createdAt: now,
        updatedAt: now,
      };

      demoProducts.unshift(newProduct);
      for (const collectionId of newProduct.collections) {
        const collection = demoCollections.find((item) => item._id === collectionId);
        if (collection && !collection.products.includes(newProduct._id)) {
          collection.products.push(newProduct._id);
        }
      }
      const productWithCollections = {
        ...newProduct,
        collections: demoCollections.filter((collection) =>
          newProduct.collections.includes(collection._id)
        ),
      };

      return NextResponse.json(productWithCollections, { status: 200 });
    }
    const message = err instanceof Error ? err.message : "Internal Error";
    return new NextResponse(message, { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const products = await Product.find()
      .select("_id title category collections colors sizes price expense createdAt")
      .sort({ createdAt: "desc" })
      .populate({ path: "collections", model: Collection, select: "_id title" });

    return NextResponse.json(products, { status: 200 });
  } catch (err) {
    console.log("[products_GET]", err);
    if (process.env.DEMO_MODE === "true") {
      const products = demoProducts.map((product) => ({
        ...product,
        collections: demoCollections.filter((collection) =>
          product.collections.includes(collection._id)
        ),
      }));
      return NextResponse.json(products, { status: 200 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
