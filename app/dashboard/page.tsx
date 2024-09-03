import { prisma } from '@/utils/db';
import DailyReportDashboard from '../ui/dashboard/dailyReportDashboard';
export default async function Page() {
  const dailyReportData = await prisma.dailyReport.findMany();

  return <DailyReportDashboard invoiceData={dailyReportData} />;
}
