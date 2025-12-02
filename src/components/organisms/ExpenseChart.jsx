import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import { formatCurrency } from "@/utils/formatters";

const ExpenseChart = ({ data = [], title = "Expense Breakdown" }) => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: "pie",
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800
        }
      },
      labels: [],
      colors: [
        "#0D9488", "#14B8A6", "#06B6D4", "#3B82F6", "#6366F1", 
        "#8B5CF6", "#A855F7", "#EC4899", "#F43F5E", "#EF4444"
      ],
      legend: {
        position: "bottom",
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        fontWeight: 500
      },
      plotOptions: {
        pie: {
          donut: {
            size: "45%",
            labels: {
              show: true,
              total: {
                show: true,
                fontSize: "18px",
                fontWeight: 600,
                color: "#1F2937",
                formatter: function (w) {
                  const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                  return formatCurrency(total);
                }
              }
            }
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val.toFixed(1) + "%";
        },
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          colors: ["#FFFFFF"]
        },
        dropShadow: {
          enabled: true,
          color: "#000",
          top: 1,
          left: 1,
          blur: 1,
          opacity: 0.45
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
      const amounts = data.map(item => item.amount);
      const labels = data.map(item => item.category);

      setChartData(prev => ({
        ...prev,
        series: amounts,
        options: {
          ...prev.options,
          labels: labels
        }
      }));
    }
  }, [data]);

  if (!data.length) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No expense data available</p>
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
          type="pie"
          height="100%"
        />
      </div>
    </Card>
  );
};

export default ExpenseChart;