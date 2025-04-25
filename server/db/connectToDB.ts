import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.DATABASE_URI!);
    console.log(`Successfully connected to DB (${connection.host})`);
  } catch (err) {
    console.log("Error While connecting to DB");
  }
};

export default connectToDB;
