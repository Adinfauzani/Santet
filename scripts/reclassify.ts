import { prisma } from "@/lib/db";
import { classifyArticle } from "@/lib/classifier";

async function main() {
  const articles = await prisma.article.findMany({ orderBy: { publishedAt: "desc" } });
  console.log(`Re-classifying ${articles.length} articles...`);

  let changed = 0;
  for (const art of articles) {
    const { primary, sub } = classifyArticle(art.title, art.description);
    const newCategory = sub || primary;
    if (newCategory !== art.category) {
      await prisma.article.update({
        where: { id: art.id },
        data: { category: newCategory },
      });
      changed++;
      console.log(`  ${art.category?.padEnd(20)} → ${newCategory.padEnd(20)} ${art.title.slice(0, 40)}`);
    }
  }

  console.log(`\nDone: ${changed}/${articles.length} categories changed`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
