import mongoose from "mongoose";
import { DB_NAME } from "../../constants.js";
import { createLogger } from "../utils/logger.js";

const databaseLogger = createLogger("database");

const connectDb = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is missing from the environment.");
    }

    const connectionInstance = await mongoose.connect(`${mongoUri}/${DB_NAME}`);

    databaseLogger.info("MongoDB connected", {
      host: connectionInstance.connection.host,
      database: connectionInstance.connection.name,
    });

    return connectionInstance;
  } catch (error) {
    databaseLogger.error("MongoDB connection failed", { error: error.message });
    process.exit(1);
  }
};

export default connectDb;
