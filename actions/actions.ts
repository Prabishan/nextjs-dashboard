'use server';

import { prisma } from '@/utils/db';
import { add } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export const addDailyReport = async (state: any, formData: any) => {
  const {
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
  } = formData;
  console.log(formData, 'formData');
  try {
    const newDailyReport = await prisma.dailyReport.create({
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
    console.log(newDailyReport, 'Created');
    revalidatePath('/dashboard/invoices');
    return { message: 'Daily report added successfully', status: 'success' };
  } catch (error: any) {
    return { message: error.message, status: 'error' };
  }
};

export const updateDailyReport = async (id: any, formData: any) => {
  const {
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
  } = formData;

  try {
    const updatedDailyReport = await prisma.dailyReport.update({
      where: { id: id },
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
    console.log(updatedDailyReport, 'Updated');
    revalidatePath('/dashboard/invoices');
    return { message: 'Daily report updated successfully', status: 'success' };
  } catch (error: any) {
    console.log(error);
    return { message: error.message, status: 'error' };
  }
};
export const deleteDailyReport = async (id: any) => {
  try {
    const deletedDailyReport = await prisma.dailyReport.delete({
      where: { id: id },
    });
    console.log(deletedDailyReport, 'Deleted');
    revalidatePath('/dashboard/invoices');
    return { message: 'Daily report deleted successfully', status: 'success' };
  } catch (error: any) {
    return { message: error.message, status: 'error' };
  }
};

export const getReportDateRange = async (from: Date, to: Date) => {
  try {
    const dailyReportData = await prisma.dailyReport.findMany({
      where: {
        reportDate: {
          gte: from,
          lte: to,
        },
      },
    });
    return { message: dailyReportData, status: 'success' };
  } catch (error: any) {
    return { message: error.message, status: 'error' };
  }
};
