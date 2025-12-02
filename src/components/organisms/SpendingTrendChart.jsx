import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import { formatCurrency } from "@/utils/formatters";

const SpendingTrendChart = ({ data = [], title = "Spending Trends" }) => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: "area",
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800
        }
      },
      stroke: {
        curve: "smooth",
        width: 3
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [0, 90, 100]
        }
      },
      grid: {
        borderColor: "#E5E7EB",
        strokeDashArray: 5
      },
      xaxis: {
        categories: [],
        labels: {
          style: {
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
            colors: "#6B7280"
          }
        }
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return formatCurrency(val);
          },
          style: {
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
            colors: "#6B7280"
          }
        }
      },
      tooltip: {
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif"
        },
        y: {
          formatter: function (val) {
            return formatCurrency(val);
          }
        }
      },
      legend: {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        fontWeight: 500
      },
      colors: ["#10B981", "#EF4444", "#0D9488"],
      responsive: [{
        breakpoint: 640,
        options: {
          legend: {
            position: "bottom"
          }
        }
      }]
    }
  });

  useEffect(() => {
    if (data.length > 0) {
      const categories = data.map(item => item.month);
      const incomeData = data.map(item => item.income);
      const expenseData = data.map(item => item.expenses);
      const balanceData = data.map(item => item.balance);

      setChartData(prev => ({
        ...prev,
        series: [
          {
            name: "Income",
            data: incomeData
          },
          {
            name: "Expenses",
            data: expenseData
          },
          {
            name: "Balance",
            data: balanceData
          }
        ],
        options: {
          ...prev.options,
          xaxis: {
            ...prev.options.xaxis,
            categories: categories
          }
        }
      }));
    }
  }, [data]);

  if (!data.length) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No trend data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        <Chart
          options={chartData.options}
          series={chartData.series}
          type="area"
          height="100%"
        />
      </div>
    </Card>
  );
};

export default SpendingTrendChart;