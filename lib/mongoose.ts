import { Console } from "console";
import mongoose from "mongoose";

let isConnected = false;

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    console.log("=> using existing database connection");
    return;
  }

  if (!process.env.MONGODB_URI)
    return console.error("=> no database uri provided");

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    isConnected = true;
    console.log("=> new database connected");
  } catch (error) {
    console.error("=> error connecting to database:", error);
  }
};
