import { deleteDailyReport } from '@/actions/actions';
import InvoiceTable from '@/app/ui/invoices/InvoiceTable';
import { Button } from '@/components/ui/button';
import { prisma } from '@/utils/db';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function InvoicePage() {
  const dailyReportData = await prisma.dailyReport.findMany();
  console.log(dailyReportData);

  return (
    <div>
      <h2 className="mb-5 text-3xl">Invoice Page</h2>
      <Link href="/dashboard/invoices/create">
        <Button>Add Invoice</Button>
      </Link>
      <div className="mt-5">
        <InvoiceTable invoiceData={dailyReportData} />
        {/* <table className="w-full">
          <thead>
            <tr>
              <th>Date</th>
              <th>Net Sales</th>
              <th>Sales Tax</th>
              <th>Gross Sale</th>
              <th>Gas Sale</th>
              <th>Credit Card Amount</th>
              <th>Cash Amount</th>
            </tr>
          </thead>
          <tbody>
            {dailyReportData.map((report) => (
              <tr key={report.id}>
                <td>{report.reportDate.toString()}</td>
                <td>{report.netSales}</td>
                <td>{report.salesTax}</td>
                <td>{report.grossSale}</td>
                <td>{report.gasSale}</td>
                <td>{report.creditCardAmount}</td>
                <td>{report.cashAmount}</td>
              </tr>
            ))}
          </tbody>
        </table> */}
      </div>
    </div>
  );
}
