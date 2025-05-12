import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { format } from 'date-fns';

interface SalesChartProps {
  data: { date: string; total: number }[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const xAxisData = data.map(item => new Date(item.date)); 

  
  const seriesData = data.map(item => item.total);

  console.log('xAxisData:', xAxisData);
  console.log('seriesData:', seriesData);

  return (
    <LineChart
      xAxis={[
        { 
          data: xAxisData, 
          scaleType: 'time',
          label: 'Date',
          valueFormatter: (date) => format(date, 'MM/dd'), 
        },
      ]}
      series={[
        {
          data: seriesData,
          label: 'Total Sales',
        },
      ]}
      width={540}
      height={400}
    />
  );
}