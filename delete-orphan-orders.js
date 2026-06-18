const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Delete OrderItem first (foreign key constraints)
    await prisma.orderItem.deleteMany({
      where: {
        orderId: {
          in: [8, 9]
        }
      }
    });

    // Delete Order
    await prisma.order.deleteMany({
      where: {
        id: {
          in: [8, 9]
        }
      }
    });

    console.log('Successfully deleted orders 8 and 9.');
  } catch (error) {
    console.error('Error deleting orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
