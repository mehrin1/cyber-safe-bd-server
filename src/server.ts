import "dotenv/config";
import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = Number(process.env.PORT || 5000);

async function main() {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`Cyber Safe BD server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

void main();
