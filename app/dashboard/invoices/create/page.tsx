import DailyReportStructurePage from '@/app/ui/invoices/create/dailyReportStructure';

export default function Page() {
  return (
    <div className="h-screen">
      <h2 className="mb-5 text-4xl">Create Invoice</h2>
      <div className="h-screen w-[95%] ">
        <DailyReportStructurePage />
      </div>
    </div>
  );
}
