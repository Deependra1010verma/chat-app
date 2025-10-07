import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const { MONGO_URI } = ENV;
    if (!MONGO_URI) {
      console.warn("MONGO_URI is not set. Skipping database connection. Some features may not work.");
      return null;
    }

    const conn = await mongoose.connect(MONGO_URI);
    console.log("MONGODB CONNECTED:", conn.connection.host);
  } catch (error) {
    console.error("Error connecting to MONGODB:", error);
    // In dev, don't exit the process to allow other parts of the app to run.
    // If you want the app to fail on DB errors in production, adjust behavior based on NODE_ENV.
    if (ENV.NODE_ENV === "production") {
      process.exit(1); // fail in production
    }
    return null;
  }
};
