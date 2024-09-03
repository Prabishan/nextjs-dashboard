import { prisma } from '@utils/db';
import { add, format } from 'date-fns';

// const prisma = new PrismaClient();

async function generateMockData() {
  const startDate = new Date('2024-07-01');
  const endDate = new Date('2024-08-31');

  for (
    let currentDate = startDate;
    currentDate <= endDate;
    currentDate = add(currentDate, { days: 1 })
  ) {
    const reportDate = new Date(currentDate.toISOString().split('T')[0]);

    // Check if the date already exists
    const existingReport = await prisma.dailyReport.findUnique({
      where: { reportDate },
    });

    if (!existingReport) {
      // Generate random data
      const netSales = Math.random() * 10000;
      const salesTax = netSales * 0.08;
      const grossSale = netSales + salesTax;
      const gasSale = Math.random() * 5000;
      const creditCardAmount = Math.random() * (grossSale * 0.7);
      const cashAmount = grossSale - creditCardAmount;
      const totalSales = grossSale + gasSale;
      const totalCollectedAmount = totalSales;
      const amountDifference = 0; // Assuming no difference for mock data

      // Create the daily report
      await prisma.dailyReport.create({
        data: {
          reportDate,
          netSales,
          salesTax,
          grossSale,
          gasSale,
          creditCardAmount,
          cashAmount,
          totalSales,
          totalCollectedAmount,
          amountDifference,
        },
      });

      console.log(`Created report for ${reportDate}`);
    } else {
      console.log(`Report for ${reportDate} already exists, skipping`);
    }
  }
}

generateMockData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
