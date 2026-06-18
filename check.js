const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const products = await prisma.product.findMany({ include: { variants: true } });
  const griving = products.find(x => x.name.includes('GRIVING'));
  console.log(JSON.stringify(griving, null, 2));
  await prisma.$disconnect();
}
check();
