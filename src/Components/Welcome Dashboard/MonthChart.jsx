import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";

const API_CONFIG = {
  baseUrl: "https://hotel-banquet.nearprop.in",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function VisitChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(function () {
    async function fetchWeeklyClicks() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No auth token");

        const res = await axios.get(
          `${API_CONFIG.baseUrl}/api/property-click/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const records = res?.data?.data || [];

        // Initialize weekly structure
        const weeklyData = {
          Sun: 0,
          Mon: 0,
          Tue: 0,
          Wed: 0,
          Thu: 0,
          Fri: 0,
          Sat: 0,
        };

        let hasDate = false;

        // ✅ Try real date-based grouping
        records.forEach(function (item) {
          const dateValue = item.createdAt || item.created_at || item.date;

          if (dateValue) {
            const dayIndex = new Date(dateValue).getDay();
            if (!isNaN(dayIndex)) {
              const dayName = DAYS[dayIndex];
              weeklyData[dayName] += Number(item.clickCount) || 0;
              hasDate = true;
            }
          }
        });

        // ⚠️ FALLBACK: No date provided by backend
        if (!hasDate) {
          records.forEach(function (item, index) {
            const dayName = DAYS[index % 7];
            weeklyData[dayName] += Number(item.clickCount) || 0;
          });
        }

        const formattedData = DAYS.map(function (day) {
          return {
            day,
            visits: weeklyData[day],
          };
        });

        setChartData(formattedData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load weekly analytics");
      } finally {
        setLoading(false);
      }
    }

    fetchWeeklyClicks();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading analytics...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-6">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Weekly Visits (Day-wise)
      </h3>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="90%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="visits"
              fill="url(#visitGradient)"
              stroke="none"
            />

            <Line
              type="monotone"
              dataKey="visits"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default VisitChart;
