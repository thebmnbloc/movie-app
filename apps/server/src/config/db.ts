import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({ adapter });

const connectToDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connection established");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};

const disconnectFromDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Database disconnection failed:", error);
  }
};

export { connectToDatabase, disconnectFromDatabase };