import { prisma } from "../lib/prisma.js";
import { crimeCatalog } from "../modules/crimes/crime.catalog.js";

async function main() {
  for (const crime of crimeCatalog) {
    const record = await prisma.crimeType.upsert({
      where: { slug: crime.slug },
      create: { slug: crime.slug, name: crime.name, category: crime.category, description: crime.description, subtypes: [...crime.subtypes], immediateSteps: [...crime.immediateSteps], evidenceChecklist: [...crime.evidenceChecklist] },
      update: { name: crime.name, category: crime.category, description: crime.description, subtypes: [...crime.subtypes], immediateSteps: [...crime.immediateSteps], evidenceChecklist: [...crime.evidenceChecklist] },
    });
    const laws = await prisma.law.findMany({ where: { slug: { in: [...crime.laws] } }, select: { id: true, slug: true } });
    if (laws.length !== crime.laws.length) throw new Error(`Missing linked law for ${crime.slug}.`);
    await prisma.crimeLawReference.deleteMany({ where: { crimeTypeId: record.id } });
    await prisma.crimeLawReference.createMany({ data: laws.map((law) => ({ crimeTypeId: record.id, lawId: law.id, guidance: `Review ${law.slug} against the facts and current text; this is a legal reference, not a case outcome.`, relevantProvisions: [] })) });
  }
  console.log(`Synced ${crimeCatalog.length} cybercrime types and legal references.`);
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
