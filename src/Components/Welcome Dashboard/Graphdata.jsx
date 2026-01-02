import React, { useEffect, useState } from "react";
import axios from "axios";
import "./graphdata.css";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_CONFIG = {
  baseUrl: "https://hotel-banquet.nearprop.in",
};

const COLORS = ["#0088FE", "#FF8042"];

// Custom tooltip for better UI
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#fff",
          padding: "8px 12px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <p style={{ margin: 0, fontWeight: "bold" }}>
          {payload[0].name} : {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function GraphData() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No authorization token found. Please login.");
          setError("Unauthorized. Please login.");
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Hotels
        const hotelRes = await axios.get(
          `${API_CONFIG.baseUrl}/api/hotels/owner`,
          { headers }
        );
        const hotelCount = hotelRes.data?.data?.count || 0;

        // Banquets
        const banquetRes = await axios.get(
          `${API_CONFIG.baseUrl}/api/banquet-halls/owner`,
          { headers }
        );
        const banquetCount = banquetRes.data?.data?.count || 0;

        const formattedData = [
          { name: "Hotels", value: hotelCount },
          { name: "Banquets", value: banquetCount },
        ].filter((item) => item.value > 0);

        setChartData(formattedData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  if (loading)
    return <div className="graphdata">⏳ Loading chart data...</div>;
  if (error) return <div className="graphdata">❌ {error}</div>;
  if (!chartData || chartData.length === 0)
    return <div className="graphdata"> <div className="graphdata-title">📉 No data available</div></div>;

  return (
    <div className="graphdata">
  <div style={{ width: "120%", height: 350 }}>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            label
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
    </div>
  );
}
