'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { LineChart, Line } from 'recharts';
import { prisma } from '@/utils/db';
import { getReportDateRange } from '@/actions/actions';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  addDays,
  addWeeks,
  addYears,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  isSameDay,
  isSameWeek,
  isSameYear,
  isAfter,
  getMonth,
} from 'date-fns';
import { get } from 'http';

// Mock data (replace with actual data fetching logic)
const mockData = [
  {
    date: '2023-06-01',
    netSales: 5000,
    salesTax: 400,
    grossSale: 5400,
    gasSale: 2000,
    totalSales: 7400,
    creditCardAmount: 6000,
    cashAmount: 1400,
  },
  {
    date: '2023-06-02',
    netSales: 5500,
    salesTax: 440,
    grossSale: 5940,
    gasSale: 2200,
    totalSales: 8140,
    creditCardAmount: 6500,
    cashAmount: 1640,
  },
  // ... more data
];

export default function DailyReportDashboard({ invoiceData }: any) {
  const [timeFrame, setTimeFrame] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const date = new Date(invoiceData[0].reportDate);
  const [data, setData] = useState<any>([]);
  const [dateRange, setDateRange] = useState({
    from: new Date(2023, 5, 1),
    to: new Date(2023, 5, 30),
  });

  const getDataBasedOnTimeFrame = async (startDate: any, endDate: any) => {
    const response = await getReportDateRange(startDate, endDate);
    if (response.status === 'success') {
      console.log(response, 'lastWeekData');
      return response.message;
    } else {
      console.log(response, 'error');
      return [];
    }
  };
  const updateData = async () => {
    let startDate, endDate;
    switch (timeFrame) {
      case 'day':
        startDate = currentDate;
        endDate = currentDate;
        break;
      case 'week':
        startDate = startOfWeek(currentDate);
        endDate = endOfWeek(currentDate);
        break;
      case 'year':
        startDate = startOfYear(currentDate);
        endDate = endOfYear(currentDate);
        break;
    }
    console.log(startDate, endDate, 'startEnd');
    // setData(generateMockData(startDate, endDate))
    const fetchedData = await getDataBasedOnTimeFrame(startDate, endDate);
    setData(fetchedData);
  };

  console.log(data, 'data');
  useEffect(() => {
    updateData();
  }, [timeFrame, currentDate]);

  const handleDateRangeChange = (range: any) => {
    setDateRange(range);
    // Fetch new data based on the selected range
  };
  const navigate = (direction: any) => {
    switch (timeFrame) {
      case 'day':
        setCurrentDate((prev) =>
          direction === 'next' ? addDays(prev, 1) : addDays(prev, -1),
        );
        break;
      case 'week':
        setCurrentDate((prev) =>
          direction === 'next' ? addWeeks(prev, 1) : addWeeks(prev, -1),
        );
        break;
      case 'year':
        setCurrentDate((prev) =>
          direction === 'next' ? addYears(prev, 1) : addYears(prev, -1),
        );
        break;
    }
  };

  const getLabel = () => {
    switch (timeFrame) {
      case 'day':
        return format(currentDate, 'MMMM d, yyyy');
      case 'week':
        return `Week of ${format(startOfWeek(currentDate), 'MMMM d, yyyy')}`;
      case 'year':
        return format(currentDate, 'yyyy');
    }
  };
  const handleLastWeekClick = async () => {
    const today = new Date();
    const lastWeekStart = new Date();
    lastWeekStart.setDate(today.getDate() - 7);
    setDateRange({ from: lastWeekStart, to: today });
  };
  const isNextDisabled = () => {
    const today = new Date();
    switch (timeFrame) {
      case 'day':
        return isSameDay(currentDate, today) || isAfter(currentDate, today);
      case 'week':
        return (
          isSameWeek(currentDate, today) ||
          isAfter(startOfWeek(currentDate), today)
        );
      case 'year':
        return (
          isSameYear(currentDate, today) ||
          isAfter(startOfYear(currentDate), today)
        );
    }
  };

  //   const todayData = mockData[mockData.length - 1]; // Assuming the last item is today's data
  const todayData = data[data.length - 1]; // Assuming the last item is today's data
  const aggregateMonthlyData = (data: any) => {
    const monthlyData = Array(12)
      .fill(0)
      .map((_, index) => ({
        month: format(new Date(currentDate.getFullYear(), index, 1), 'MMM'),
        totalSales: 0,
      }));

    console.log(monthlyData, 'monthlyData');
    data.forEach((day: any) => {
      const month = getMonth(new Date(day.reportDate));
      monthlyData[month].totalSales += day.totalSales;
    });

    return monthlyData;
  };

  const chartData = timeFrame === 'year' ? aggregateMonthlyData(data) : data;
  return (
    <div className="container mx-auto p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Company Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant={timeFrame === 'day' ? 'default' : 'outline'}
            onClick={() => setTimeFrame('day')}
          >
            Day
          </Button>
          <Button
            variant={timeFrame === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeFrame('week')}
          >
            Week
          </Button>
          <Button
            variant={timeFrame === 'year' ? 'default' : 'outline'}
            onClick={() => setTimeFrame('year')}
          >
            Year
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, 'MMM dd, yyyy')} -{' '}
                {format(dateRange.to, 'MMM dd, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium">{getLabel()}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('next')}
              disabled={isNextDisabled()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&rsquo;s Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${todayData?.totalSales.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&rsquo;s Net Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${todayData?.netSales.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&rsquo;s Gas Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${todayData?.gasSale.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&rsquo;s Amount Difference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+$200.00</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="netSales"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
                <Area
                  type="monotone"
                  dataKey="salesTax"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                />
                <Area
                  type="monotone"
                  dataKey="grossSale"
                  stackId="1"
                  stroke="#ffc658"
                  fill="#ffc658"
                />
                <Area
                  type="monotone"
                  dataKey="gasSale"
                  stackId="1"
                  stroke="#ff7300"
                  fill="#ff7300"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Credit Card', value: todayData?.creditCardAmount },
                    { name: 'Cash', value: todayData?.cashAmount },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#0088FE" />
                  <Cell fill="#00C49F" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Daily Total Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={timeFrame === 'year' ? 'month' : 'date'} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalSales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
