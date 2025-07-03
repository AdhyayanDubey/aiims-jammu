"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface StatsChartsProps {
  data: {
    statusCounts: {
      pending: number;
      confirmed: number;
      cancelled: number;
    };
    departmentCounts: Array<{
      department: string;
      count: number;
    }>;
    dailyData: Array<{
      date: string;
      count: number;
    }>;
  } | null;
  isDarkMode?: boolean;
}

export default function StatsCharts({ data, isDarkMode }: StatsChartsProps) {
  // Only check if data exists
  if (!data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Loading cards */}
        {[1, 2, 3].map((i) => (
          <Card key={i} className={i === 3 ? "lg:col-span-2" : ""}>
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Status Pie Chart
  const statusChartData = {
    labels: ['Pending', 'Confirmed', 'Cancelled'],
    datasets: [
      {
        data: [
          data.statusCounts?.pending || 0,
          data.statusCounts?.confirmed || 0,
          data.statusCounts?.cancelled || 0,
        ],
        backgroundColor: [
          'rgba(255, 206, 84, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(255, 206, 84, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Department Bar Chart
  const departmentChartData = {
    labels: data.departmentCounts?.map(d => d.department) || [],
    datasets: [
      {
        label: 'Appointments',
        data: data.departmentCounts?.map(d => d.count) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Daily Trend Line Chart
  const dailyChartData = {
    labels: data.dailyData?.map(d => d.date) || [],
    datasets: [
      {
        label: 'Daily Appointments',
        data: data.dailyData?.map(d => d.count) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#fff' : '#000',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDarkMode ? '#fff' : '#000',
        },
      },
      y: {
        ticks: {
          color: isDarkMode ? '#fff' : '#000',
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Pie data={statusChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Department Popularity */}
      <Card>
        <CardHeader>
          <CardTitle>Most Requested Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={departmentChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Daily Trend */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Daily Appointments (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={dailyChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}