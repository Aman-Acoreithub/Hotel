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

        // ✅ Initialize weekly structure
        const weeklyData = {
          Sun: { hotel: 0, banquet: 0 },
          Mon: { hotel: 0, banquet: 0 },
          Tue: { hotel: 0, banquet: 0 },
          Wed: { hotel: 0, banquet: 0 },
          Thu: { hotel: 0, banquet: 0 },
          Fri: { hotel: 0, banquet: 0 },
          Sat: { hotel: 0, banquet: 0 },
        };

        let hasDate = false;

        records.forEach(function (item, index) {
          const dateValue =
            item.createdAt || item.created_at || item.date;

          const count =
            Number(item.clickCount || item.clicks || 1);

          const type =
            (item.type || item.propertyType || "")
              .toLowerCase();

          let dayName;

          if (dateValue) {
            const dayIndex = new Date(dateValue).getDay();
            if (!isNaN(dayIndex)) {
              dayName = DAYS[dayIndex];
              hasDate = true;
            }
          }

          // ⚠️ fallback if no date
          if (!dayName) {
            dayName = DAYS[index % 7];
          }

          if (type === "hotel") {
            weeklyData[dayName].hotel += count;
          } else if (type === "banquethall") {
            weeklyData[dayName].banquet += count;
          }
        });

        // ✅ Format for recharts
        const formattedData = DAYS.map(function (day) {
          return {
            day,
            hotel: weeklyData[day].hotel,
            banquet: weeklyData[day].banquet,
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
    return (
      <div className="text-center text-red-500 py-6">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Weekly Visits (Hotel vs Banquet)
      </h3>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />

            {/* 🏨 HOTEL */}
            <Line
              type="monotone"
              dataKey="hotel"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 4 }}
              name="Hotel"
            />

            {/* 🏛️ BANQUET */}
            <Line
              type="monotone"
              dataKey="banquet"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4 }}
              name="Banquet"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default VisitChart;
