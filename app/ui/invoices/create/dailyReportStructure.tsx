'use client';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import CreateInvoiceForm from './createInvoiceForm';
import { DatePicker } from './datePicker';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, set } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { PopoverClose } from '@radix-ui/react-popover';
import Link from 'next/link';
import { prisma } from '@/utils/db';
import { addDailyReport, updateDailyReport } from '@/actions/actions';
import { useFormState, useFormStatus } from 'react-dom';
import { redirect, useSearchParams, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { SelectSingleEventHandler } from 'react-day-picker';

const FormSchema = z.object({
  reportDate: z.date({ required_error: 'Date is required' }),
  netSales: z.coerce.number(),
  salesTax: z.coerce.number(),
  grossSale: z.coerce.number(),
  gasSale: z.coerce.number(),
  creditCardAmount: z.coerce.number(),
  cashAmount: z.coerce.number(),
});
const initialState = {
  message: null,
  status: null,
};
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </Button>
  );
}

export default function DailyReportStructurePage() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [isPopperOpen, setIsPopperOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalCollectedAmount, setTotalCollectedAmount] = useState<number>(0);
  const [amountDifference, setamountDifference] = useState<number>(0);
  const onSubmit = async (data: any) => {
    setPending(true);
    console.log(data);
    console.log(invoiceData, 'invoiceData');

    const extendedData = {
      ...data,
      totalSales,
      totalCollectedAmount,
      amountDifference,
    };
    let response;
    if (!editMode) {
      response = await addDailyReport(initialState, extendedData);
    } else {
      response = await updateDailyReport(invoiceData.id, extendedData);
    }
    if (response.status === 'success') {
      router.push('/dashboard/invoices');
    } else {
      console.log(response);
    }
  };
  const editMode = searchParams.get('edit') === 'true' || false;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const closePopover = () => setIsPopperOpen(false);
  const handleDaySelect: SelectSingleEventHandler = (date) => {
    if (date) {
      form.setValue('reportDate', date);
      closePopover();
    }
  };

  useEffect(() => {
    if (editMode) {
      const invoiceData = searchParams.get('invoiceData') as string;
      const parsedInvoiceData = JSON.parse(invoiceData);
      console.log(parsedInvoiceData);
      setInvoiceData(parsedInvoiceData);
      if (parsedInvoiceData) {
        Object.keys(parsedInvoiceData).forEach((key: any) => {
          let value = parsedInvoiceData[key];
          if (key === 'reportDate') {
            value = new Date(value);
          }
          form.setValue(key, value);
        });

        calculateTotals(parsedInvoiceData);
      }
    }
  }, [editMode, searchParams, form]);
  useEffect(() => {
    const subscription = form.watch((values) => {
      calculateTotals(values);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [form, searchParams, editMode]);

  const calculateTotals = (values: any) => {
    const totalSales =
      Number(values.netSales || 0) +
      Number(values.salesTax || 0) +
      Number(values.grossSale || 0) +
      Number(values.gasSale || 0);
    setTotalSales(totalSales);

    const totalCollectedAmount =
      Number(values.creditCardAmount || 0) + Number(values.cashAmount || 0);
    setTotalCollectedAmount(totalCollectedAmount);

    const amountDifference = totalCollectedAmount - totalSales;
    setamountDifference(amountDifference);
  };
  console.log(typeof totalSales, 'totalSales format');
  console.log(totalSales, 'totalSales');
  // const totalSaless =
  //   form.getValues('netSales') +
  //     form.getValues('salesTax') +
  //     form.getValues('netSales') +
  //     form.getValues('grossSale') +
  //     form.getValues('gasSale') || 0;
  return (
    <div className="w-full flex-col items-center justify-between gap-10 md:w-[90%] lg:w-[80%] xl:w-[70%] 2xl:w-[60%] ">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="reportDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <div className="flex flex-col justify-between gap-3 md:flex-row">
                  <FormLabel>Date</FormLabel>
                  <Popover open={isPopperOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          onClick={() => setIsPopperOpen(true)}
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal md:w-[240px]',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={handleDaySelect}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <FormMessage className="text-end" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="netSales"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <div className="flex flex-col justify-between gap-3 md:flex-row">
                  <FormLabel>Net Sales ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      className="w-full md:w-[242px]"
                    />
                  </FormControl>
                </div>

                <FormMessage className="text-end" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salesTax"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <div className="flex flex-col justify-between gap-3 md:flex-row">
                  <FormLabel>Sales Tax ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      className="w-full md:w-[242px]"
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-end" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="grossSale"
            render={({ field }) => (
              <FormItem className="flex flex-col ">
                <div className="flex flex-col justify-between gap-3 md:flex-row">
                  <FormLabel>Gross Sale ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      className="w-full md:w-[242px]"
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-end" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gasSale"
            render={({ field }) => (
              <FormItem className="flex flex-col ">
                <div className="flex flex-col justify-between gap-3 md:flex-row">
                  <FormLabel>Gas Sale ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      className="w-full md:w-[242px]"
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-end" />
              </FormItem>
            )}
          />
          <div className="flex flex-col justify-between gap-3 md:flex-row">
            <FormLabel>Total Sales ($)</FormLabel>
            <div className="w-full md:w-[242px]">
              <p className="text-2xl font-bold">
                {typeof totalSales === 'number'
                  ? totalSales.toFixed(2)
                  : '0.00'}
              </p>
            </div>
          </div>
          <FormField
            control={form.control}
            name="creditCardAmount"
            render={({ field }) => (
              <FormItem className="flex flex-col ">
                <div className="flex flex-col justify-between gap-3 md:flex-row">
                  <FormLabel>Credit Card ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      className="w-full md:w-[242px]"
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-end" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cashAmount"
            render={({ field }) => (
              <FormItem className="flex flex-col ">
                <div className="flex flex-col justify-between gap-3 md:flex-row">
                  <FormLabel>Cash ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      className="w-full md:w-[242px]"
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-end" />
              </FormItem>
            )}
          />
          <div className="flex flex-col justify-between gap-3 md:flex-row">
            <FormLabel>Total Amount Collected ($)</FormLabel>
            <div className="w-full md:w-[242px]">
              <p className="text-2xl font-bold">
                {typeof totalCollectedAmount === 'number'
                  ? totalCollectedAmount.toFixed(2)
                  : '0.00'}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 md:flex-row">
            <FormLabel>Cash Difference ($)</FormLabel>
            <div className="w-full md:w-[242px]">
              <p className="text-2xl font-bold">
                {typeof amountDifference === 'number' ? (
                  <span
                    className={`inline-block rounded-sm px-2 py-1 text-2xl font-semibold ${
                      amountDifference == 0
                        ? 'bg-gray-200 text-gray-800'
                        : amountDifference > 0
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {amountDifference == 0
                      ? '0.00'
                      : amountDifference > 0
                      ? `+ ${amountDifference.toFixed(2)}`
                      : amountDifference.toFixed(2)}
                  </span>
                ) : (
                  '0.00'
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-5">
            <Button type="submit" disabled={pending}>
              {pending
                ? editMode
                  ? 'Updating...'
                  : 'Submitting...'
                : editMode
                ? 'Update'
                : 'Submit'}
            </Button>
            <Link href="/dashboard/invoices">
              <Button variant="destructive">Cancel</Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
