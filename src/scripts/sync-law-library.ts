import { prisma } from "../lib/prisma.js";
import { lawCatalog } from "../modules/laws/law.catalog.js";

async function main() {
  for (const law of lawCatalog) {
    await prisma.law.upsert({
      where: { slug: law.slug },
      create: law,
      update: law,
    });
  }

  // Remove legacy placeholders that are not part of the maintained catalog.
  await prisma.law.deleteMany({ where: { slug: { notIn: lawCatalog.map((law) => law.slug) } } });
  console.log(`Synced ${lawCatalog.length} legal-library records.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
