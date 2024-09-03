'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Pencil, Trash2 } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { deleteDailyReport } from '@/actions/actions';
import { revalidatePath } from 'next/cache';
import { FaShoppingCart, FaMoneyBillWave } from 'react-icons/fa';

// Mock data
interface initialDataType {
  id: string;
  reportDate: Date;
  netSales: number;
  salesTax: number;
  grossSale: number;
  gasSale: number;
  creditCardAmount: number;
  cashAmount: number;
  totalSales: number;
  totalCollectedAmount: number;
  amountDifference: number;
}

type SortKey = keyof initialDataType;

const useSortableData = (
  items: initialDataType[],
  config: { key: SortKey; direction: 'ascending' | 'descending' } | null = null,
) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = React.useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};
type InvoiceTableProps = {
  invoiceData: initialDataType[];
};

export default function InvoiceTable(props: InvoiceTableProps) {
  let router = useRouter();
  const { invoiceData } = props;
  const [data, setData] = useState(invoiceData);
  const { items, requestSort, sortConfig } = useSortableData(data);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  console.log('currentItems', currentItems);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (itemToDelete) {
      console.log('item ID', id);
      const response = await deleteDailyReport(id);
      if (response.status === 'success') {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        location.reload();
      } else {
        console.error(response.message);
      }
    }
  };

  console.log(items);

  const handleEdit = (id: string) => {
    // Implement edit functionality here'

    console.log('item ID', id);
    const item = data.find((item) => item.id === String(id));
    const params = new URLSearchParams();
    params.set('invoiceData', JSON.stringify(item));
    params.set('edit', 'true');
    router.push('/dashboard/invoices/create' + '?' + params.toString());
    console.log(`Edit item with id: ${id}`);
  };

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort('reportDate')}
            >
              Date{' '}
              {sortConfig?.key === 'reportDate' &&
                (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort('netSales')}
            >
              Net Sales{' '}
              {sortConfig?.key === 'netSales' &&
                (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort('salesTax')}
            >
              Sales Tax{' '}
              {sortConfig?.key === 'salesTax' &&
                (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort('grossSale')}
            >
              Gross Sale{' '}
              {sortConfig?.key === 'grossSale' &&
                (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort('gasSale')}
            >
              Gas Sale{' '}
              {sortConfig?.key === 'gasSale' &&
                (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort('totalSales')}
            >
              <span className="flex items-center">
                Total Sales
                <FaShoppingCart className="mr-2 text-blue-600" />
                {sortConfig?.key === 'totalSales' &&
                  (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </span>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort('creditCardAmount')}
            >
              Credit Card Amount{' '}
              {sortConfig?.key === 'creditCardAmount' &&
                (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort('cashAmount')}
            >
              Cash Amount{' '}
              {sortConfig?.key === 'cashAmount' &&
                (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort('totalCollectedAmount')}
            >
              <span className="flex items-center gap-1">
                Total Collected Amount
                <FaMoneyBillWave className="mr-2 text-green-600" />
                {sortConfig?.key === 'totalCollectedAmount' &&
                  (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </span>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort('amountDifference')}
            >
              Amount Difference{' '}
              {sortConfig?.key === 'amountDifference' &&
                (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((item, index) => (
            <TableRow
              key={item.id}
              className={index % 2 === 0 ? 'bg-muted/50' : ''}
            >
              <TableCell>
                {moment(item.reportDate).format('YYYY-MM-DD')}
              </TableCell>
              <TableCell>${item.netSales.toFixed(2)}</TableCell>
              <TableCell>${item.salesTax.toFixed(2)}</TableCell>
              <TableCell>${item.grossSale.toFixed(2)}</TableCell>
              <TableCell>${item.gasSale.toFixed(2)}</TableCell>
              <TableCell className="font-bold ">
                ${item.totalSales.toFixed(2)}
              </TableCell>
              <TableCell>${item.creditCardAmount.toFixed(2)}</TableCell>
              <TableCell>${item.cashAmount.toFixed(2)}</TableCell>
              <TableCell className="font-bold ">
                ${item.totalCollectedAmount.toFixed(2)}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-block rounded-sm px-2 py-1 font-semibold ${
                    item.amountDifference == 0
                      ? 'bg-gray-200 text-gray-800'
                      : item.amountDifference > 0
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  }`}
                >
                  ${item.amountDifference.toFixed(2)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(item.id)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openDeleteDialog(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex items-center justify-between">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {Math.ceil(items.length / itemsPerPage)}
        </span>
        <Button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, Math.ceil(items.length / itemsPerPage)),
            )
          }
          disabled={currentPage === Math.ceil(items.length / itemsPerPage)}
        >
          Next
        </Button>
      </div>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this item?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              item from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
