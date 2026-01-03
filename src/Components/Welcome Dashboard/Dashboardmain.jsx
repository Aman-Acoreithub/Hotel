import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./dashboardmain.css";
import TimeGuide from "../Welcome Dashboard/TimeGuide";
import GraphData from "./Graphdata";
import MonthChart from "./MonthChart";
import dashboard from "../../assets/dashboard.jpg";

const API_BASE = "https://hotel-banquet.nearprop.in";

function Dashboardmain() {
  const navigate = useNavigate();

  const [hotelsData, setHotelsData] = useState([]);
  const [banquetHallsData, setBanquetHallsData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [totalVisits, setTotalVisits] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setShowPopup(true);
        return;
      }

      try {
        // ================= HOTELS =================
        const hotelsRes = await fetch(`${API_BASE}/api/hotels/owner`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const hotelsJson = await hotelsRes.json();
        if (hotelsJson.success) {
          setHotelsData(hotelsJson.data.hotels || []);
        }

        // ================= BANQUETS =================
        const banquetRes = await fetch(`${API_BASE}/api/banquet-halls/owner`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const banquetJson = await banquetRes.json();
        if (banquetJson.success) {
          setBanquetHallsData(banquetJson.data.banquetHalls || []);
        }

        // ================= TOTAL VISITS =================
        // ================= TOTAL VISITS =================
        const visitRes = await fetch(`${API_BASE}/api/property-click/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const visitJson = await visitRes.json();
        console.log("VISIT API RESPONSE 👉", visitJson);

        const visitArray = visitJson.data; // ← THIS IS CORRECT FROM YOUR LOG

        let total = 0;
        if (Array.isArray(visitArray)) {
          visitArray.forEach((item) => {
            total += Number(item.clickCount || 0);
          });
        }

        console.log("TOTAL VISITS 👉", total); // 🔥 MUST LOG NUMBER
        setTotalVisits(total);
      } catch (error) {
        console.error("Dashboard error:", error);
      }
    };

    fetchDashboardData();

    let timer;
    if (showPopup) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            navigate("/login");
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [showPopup, navigate]);

  const totalProperties = hotelsData.length + banquetHallsData.length;

  return (
    <>
      {/* LOGIN POPUP */}
      {showPopup && (
        <div className="popup-modal">
          <div className="popup-content">
            <p className="text-lg text-gray-100 mb-2">
              Please login to access your dashboard
            </p>
            <p className="text-gray-600 mb-4">
              Redirecting in <b className="text-red-500">{countdown}</b>{" "}
              seconds...
            </p>
            <Link to="/login">
              <button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        {/* WELCOME BANNER */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl mb-8">
          <div className="w-full h-[65vh]">
            {" "}
            {/* Half viewport height on mobile, slightly more on desktop */}
            <img
              src={dashboard}
              className="w-full h-full object-cover opacity-90"
              alt="dashboard"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/70 to-teal-700/50 flex items-center p-6 md:p-8">
            <div className="flex items-center justify-center w-full text-white text-xl font-semibold">
              <div className=" text-3xl font-bold">
                <h1 className="font-bold">{TimeGuide()}</h1>
                Welcome Back to Your Dashboard
              </div>
            </div>
          </div>
        </div>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* My Properties Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-br hover:from-teal-600 hover:to-teal-800 group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-700 text-xl font-bold group-hover:text-white transition-colors duration-300">
                My Properties
              </p>
              <div className="bg-teal-100 p-2 rounded-lg group-hover:bg-teal-500/30 transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl text-gray-700 font-bold mb-2 group-hover:text-white transition-colors duration-300">
              {totalProperties}
            </h2>
            <p className="text-gray-900 text-sm group-hover:text-teal-100 transition-colors duration-300">
              Total listed properties
            </p>
          </div>

          {/* Active Hotels Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-br hover:from-teal-600 hover:to-teal-800 group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-700 text-xl font-bold group-hover:text-white transition-colors duration-300">
                Active Hotels
              </p>
              <div className="bg-teal-100 p-2 rounded-lg group-hover:bg-teal-500/30 transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl text-gray-700 font-bold mb-2 group-hover:text-white transition-colors duration-300">
              {hotelsData.length}
            </h2>
            <p className="text-gray-900 text-sm group-hover:text-teal-100 transition-colors duration-300">
              Currently active hotels
            </p>
          </div>

          {/* Active Banquets Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-br hover:from-teal-600 hover:to-teal-800 group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-700 text-xl font-bold group-hover:text-white transition-colors duration-300">
                Active Banquets
              </p>
              <div className="bg-teal-100 p-2 rounded-lg group-hover:bg-teal-500/30 transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl text-gray-700 font-bold mb-2 group-hover:text-white transition-colors duration-300">
              {banquetHallsData.length}
            </h2>
            <p className="text-gray-900 text-sm group-hover:text-teal-100 transition-colors duration-300">
              Currently active banquets
            </p>
          </div>

          {/* Property 1
Property 2
hotel
Hotelts Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-br hover:from-teal-600 hover:to-teal-800 group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-700 text-xl font-bold group-hover:text-white transition-colors duration-300">
                Total Visits
              </p>
              <div className="bg-teal-100 p-2 rounded-lg group-hover:bg-teal-500/30 transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl text-gray-700 font-bold mb-2 group-hover:text-white transition-colors duration-300">
              {totalVisits}
            </h2>

            <p className="text-gray-900 text-sm group-hover:text-teal-100 transition-colors duration-300">
              All-time property visits
            </p>
          </div>
        </div>

        {/* ANALYTICS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <svg
                  className="w-5 h-5 text-teal-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Popular Property
              </h3>
            </div>
            <div className="p-6">
              <GraphData />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <svg
                  className="w-5 h-5 text-teal-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                  />
                </svg>
                Week Visit Trend
              </h3>
            </div>
            <div className="p-6">
              <MonthChart />
            </div>
          </div>
        </div>

        {/* PLAN DETAILS */}
        {/* <div className="bg-gradient-to-r from-teal-50 to-white rounded-2xl shadow-lg p-6 mb-8 border border-teal-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Plan Details
              </h3>
              <p className="text-gray-600">
                Manage your subscription and billing
              </p>
            </div>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-teal-100 text-teal-800 mt-4 md:mt-0">
              <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
              Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm font-medium mb-1">Plan</p>
              <p className="text-2xl font-bold text-gray-800">Basic</p>
              <div className="mt-3 inline-block px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
                Free Tier
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm font-medium mb-1">
                Start Date
              </p>
              <p className="text-2xl font-bold text-gray-800">01/01/2026</p>
              <p className="text-gray-400 text-sm mt-2">Your plan started on</p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm font-medium mb-1">End Date</p>
              <p className="text-2xl font-bold text-gray-800">31/01/2026</p>
              <p className="text-gray-400 text-sm mt-2">Your plan expires on</p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm font-medium mb-1">
                Days Remaining
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-gray-800 mr-2">29</p>
                <p className="text-gray-600">days</p>
              </div>
              <div className="mt-3 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link Link to="/subscription">
              <button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center">
                Upgrade Plan
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </Link>
          </div>
        </div> */}
      </div>
    </>
  );
}

export default Dashboardmain;
