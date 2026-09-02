import { prisma } from "../lib/prisma.js";
import { supportResourceCatalog } from "../modules/professionals/support-resource.catalog.js";

async function main() {
  for (const resource of supportResourceCatalog) {
    await prisma.supportResource.upsert({
      where: { slug: resource.slug },
      create: resource,
      update: resource,
    });
  }

  await prisma.supportResource.deleteMany({
    where: { slug: { notIn: supportResourceCatalog.map((resource) => resource.slug) } },
  });
  console.log(`Synced ${supportResourceCatalog.length} support resources.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
