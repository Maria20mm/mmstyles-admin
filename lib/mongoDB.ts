import mongoose from "mongoose";

let isConnected: boolean = false;
let connectingPromise: Promise<typeof mongoose> | null = null;

export const connectToDB = async (): Promise<void> => {
  mongoose.set("strictQuery", true)

  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  if (connectingPromise) {
    await connectingPromise;
    isConnected = true;
    return;
  }

  const mongoUrl = process.env.MONGODB_URL;
  const dbName = process.env.MONGODB_DB_NAME || "MMSTYLES_ADMIN";
  if (!mongoUrl) {
    throw new Error("Missing MONGODB_URL environment variable");
  }

  try {
    connectingPromise = mongoose.connect(mongoUrl, {
      dbName,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    })

    await connectingPromise;

    isConnected = true;
  } catch (err) {
    isConnected = false;
    console.log("[mongoDB_connect]", err);
    const errorMessage =
      err instanceof Error ? err.message : "Unknown MongoDB connection error";

    if (errorMessage.includes("querySrv ECONNREFUSED")) {
      throw new Error(
        "Cannot reach MongoDB Atlas (DNS/network). Check internet, DNS, or Atlas Network Access."
      );
    }

    throw err;
  } finally {
    connectingPromise = null;
  }
}
