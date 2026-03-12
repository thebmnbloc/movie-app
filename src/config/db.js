import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV = "development"? ["query", "error", "warn"] 
  : ["error"],
});

const connectDB = async ()=> {
  try {
    await prisma.$connect();
    console.log("Database connected via prisma");
  } catch (err) {
    console.err("Database connection error:" `${err.message}`);
    process.exit(1);
  }
};

const disconnectDB = async ()=> {
  await prisma.$disconnect();
}

export { prisma, connectDB, disconnectDB }