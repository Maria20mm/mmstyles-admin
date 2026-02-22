import Collection from "@/lib/models/Collection";
import Product from "@/lib/models/Products";


import { connectToDB } from "@/lib/mongoDB";
import { auth } from "@clerk/nextjs/server";


import { NextRequest, NextResponse } from "next/server";
import { demoCollections, demoProducts } from "@/lib/demoData";

export const GET = async (
  req: NextRequest,
  { params }: { params: { productId: string } }
) => {
  try {
    await connectToDB();

    const product = await Product.findById(params.productId).populate({
      path: "collections",
      model: Collection,
    });

    if (!product) {
      return new NextResponse(
        JSON.stringify({ message: "Product not found" }),
        { status: 404 }
      );
    }
    return new NextResponse(JSON.stringify(product), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": `${process.env.ECOMMERCE_STORE_URL}`,
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (err) {
    console.log("[productId_GET]", err);
    if (process.env.DEMO_MODE === "true") {
      const product = demoProducts.find((item) => item._id === params.productId);
      if (!product) {
        return new NextResponse(JSON.stringify({ message: "Product not found" }), {
          status: 404,
        });
      }
      return NextResponse.json({
        ...product,
        collections: demoCollections.filter((collection) =>
          product.collections.includes(collection._id)
        ),
      });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { productId: string } }
) => {
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

    const { userId } =auth();
    const demoMode = process.env.DEMO_MODE === "true";
    const skipAuth = process.env.SKIP_AUTH === "true";

    if (!userId && !demoMode && !skipAuth) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    const product = await Product.findById(params.productId);

    if (!product) {
      return new NextResponse(
        JSON.stringify({ message: "Product not found" }),
        { status: 404 }
      );
    }

    if (!title || !description || !media.length || !category || !price || !expense) {
      return new NextResponse("Not enough data to create a new product", {
        status: 400,
      });
    }

    const previousCollectionIds = product.collections.map((id: any) => String(id));
    const nextCollectionIds = (collections ?? []).map((id: string) => String(id));

    const addedCollections = nextCollectionIds.filter(
      (collectionId: string) => !previousCollectionIds.includes(collectionId)
    );
    // included in new data, but not included in the previous data

    const removedCollections = previousCollectionIds.filter(
      (collectionId: string) => !nextCollectionIds.includes(collectionId)
    );
    // included in previous data, but not included in the new data

    // Update collections
    await Promise.all([
      // Update added collections with this product
      ...addedCollections.map((collectionId: string) =>
        Collection.findByIdAndUpdate(collectionId, {
          $addToSet: { products: product._id },
        })
      ),

      // Update removed collections without this product
      ...removedCollections.map((collectionId: string) =>
        Collection.findByIdAndUpdate(collectionId, {
          $pull: { products: product._id },
        })
      ),
    ]);

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      {
        title,
        description,
        media,
        category,
        collections: nextCollectionIds,
        tags,
        sizes,
        colors,
        price,
        expense,
      },
      { new: true }
    ).populate({ path: "collections", model: Collection });

    await updatedProduct.save();

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (err) {
    console.log("[productId_POST]", err);
    if (process.env.DEMO_MODE === "true") {
      const index = demoProducts.findIndex((item) => item._id === params.productId);
      if (index === -1) {
        return new NextResponse(
          JSON.stringify({ message: "Product not found" }),
          { status: 404 }
        );
      }
      if (!title || !description || !media.length || !category || !price || !expense) {
        return new NextResponse("Not enough data to create a new product", {
          status: 400,
        });
      }

      const previousCollectionIds = demoProducts[index].collections;
      const nextCollectionIds = collections ?? [];

      for (const collection of demoCollections) {
        const had = previousCollectionIds.includes(collection._id);
        const has = nextCollectionIds.includes(collection._id);
        if (had && !has) {
          collection.products = collection.products.filter(
            (productId) => productId !== params.productId
          );
        }
        if (!had && has) {
          collection.products.push(params.productId);
        }
      }

      demoProducts[index] = {
        ...demoProducts[index],
        title,
        description,
        media,
        category,
        collections: nextCollectionIds,
        tags: tags ?? [],
        sizes: sizes ?? [],
        colors: colors ?? [],
        price: Number(price),
        expense: Number(expense),
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json({
        ...demoProducts[index],
        collections: demoCollections.filter((collection) =>
          demoProducts[index].collections.includes(collection._id)
        ),
      });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return new NextResponse(message, { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { productId: string } }
) => {
  try {
    const { userId } = auth();
    const demoMode = process.env.DEMO_MODE === "true";
    const skipAuth = process.env.SKIP_AUTH === "true";

    if (!userId && !demoMode && !skipAuth) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    const product = await Product.findById(params.productId);

    if (!product) {
      return new NextResponse(
        JSON.stringify({ message: "Product not found" }),
        { status: 404 }
      );
    }

    await Product.findByIdAndDelete(product._id);

    // Update collections
    await Promise.all(
      product.collections.map((collectionId: string) =>
        Collection.findByIdAndUpdate(collectionId, {
          $pull: { products: product._id },
        })
      )
    );

    return new NextResponse(JSON.stringify({ message: "Product deleted" }), {
      status: 200,
    });
  } catch (err) {
    console.log("[productId_DELETE]", err);
    if (process.env.DEMO_MODE === "true") {
      const index = demoProducts.findIndex((item) => item._id === params.productId);
      if (index === -1) {
        return new NextResponse(
          JSON.stringify({ message: "Product not found" }),
          { status: 404 }
        );
      }
      demoProducts.splice(index, 1);
      for (const collection of demoCollections) {
        collection.products = collection.products.filter(
          (productId) => productId !== params.productId
        );
      }
      return new NextResponse(JSON.stringify({ message: "Product deleted" }), {
        status: 200,
      });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return new NextResponse(message, { status: 500 });
  }
};

export const dynamic = "force-dynamic";
