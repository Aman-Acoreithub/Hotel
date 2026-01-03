// import React, { useState, useEffect } from "react";
// import { useNavigate, Navigate } from "react-router-dom";
// import { showSuccess, showError, showInfo, showWarning } from "../utils/Toast";

// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./Login.css";

// const Login = () => {
//   const [mobile, setMobile] = useState("");
//   const [otp, setOtp] = useState("");
//   const [timer, setTimer] = useState(0);
//   const [loadingSend, setLoadingSend] = useState(false);
//   const [loadingLogin, setLoadingLogin] = useState(false);
//   const navigate = useNavigate();

//   const baseUrl = "https://hotel-banquet.nearprop.in";

//   // Check if user is already logged in
//   const token = localStorage.getItem("token");
//   if (token) {
//     return <Navigate to="/" />; 
//   }

//   // Send OTP
//   const handleSendOtp = async () => {
//     if (!mobile || mobile.length !== 10) {
//       toast.error("Please enter a valid 10-digit mobile number");
//       return;
//     }

//     setLoadingSend(true);
//     try {
//       const res = await fetch(`${baseUrl}/api/auth/login/send-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ mobile }),
//         withCredentials: true,
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Failed to send OTP");
//       }

//       toast.success(data.message || "OTP sent successfully");
//       setTimer(30);
//     } catch (err) {
//       console.log(err)
//     } finally {
//       setLoadingSend(false);
//     }
//   };

//   // Login (Verify OTP + Redirect)
//   const handleLogin = async () => {
//     if (otp.length !== 6) {
//       toast.error("Please enter a valid 6-digit OTP");
//       return;
//     }

//     setLoadingLogin(true);
//     try {
//       const res = await fetch(`${baseUrl}/api/auth/login/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ mobile, otp }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "OTP verification failed");
//       }

//       toast.success(data.message || "Login successful");
//       alert("Login sucessfully.");
//       window.location.reload()

//       // Save token
//       localStorage.setItem("token", data.data.token);

//       // Redirect to dashboard
//       setTimeout(() => {
//         navigate("/");
//       }, 1000);
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setLoadingLogin(false);
//     }
//   };

//   // Timer countdown
//   useEffect(() => {
//     let countdown;
//     if (timer > 0) {
//       countdown = setTimeout(() => setTimer(timer - 1), 1000);
//     }
//     return () => clearTimeout(countdown);
//   }, [timer]);

//   return (
//     <div className="login-page">
//       <div className="overlay"></div>
//       <div className="login-card">
//         <h2 className="title">Welcome Back</h2>
//         <p className="subtitle">Login with your mobile number</p>

//         {/* Mobile Number */}
//         <div className="input-group">
//           <input
//             type="tel"
//             placeholder="Enter Mobile Number"
//             value={mobile}
//             onChange={(e) => setMobile(e.target.value)}
//             maxLength="10"
//           />
//           <button
//             className="send-btn"
//             onClick={handleSendOtp}
//             disabled={timer > 0 || loadingSend}
//           >
//             {loadingSend
//               ? "Sending..."
//               : timer > 0
//                 ? `Resend in ${timer}s`
//                 : "Send OTP"}
//           </button>
//         </div>

//         {/* OTP Field */}
//         <div className="input-group">
//           <input
//             type="tel"
//             placeholder="Enter 6-digit OTP"
//             value={otp}
//             onChange={(e) => setOtp(e.target.value)}
//             maxLength="6"
//           />
//         </div>

//         {/* Login Button */}
//         <button
//           className="verify-btn"
//           onClick={handleLogin}
//           disabled={loadingLogin}
//         >
//           {loadingLogin ? "Logging in..." : "Login"}
//         </button>

//         {/* Toggle Link */}
//         <p className="toggle-text">
//           Don't have an account?{" "}
//           <span onClick={() => navigate("/register")}>Sign Up</span>
//         </p>
//       </div>

//       <ToastContainer position="top-right" autoClose={3000} />
//     </div>
//   );
// };

// export default Login;

import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const navigate = useNavigate();

  const baseUrl = "https://hotel-banquet.nearprop.in";
  // const baseUrl = import.meta.env.VITE_URL;

  // Already logged in → Dashboard
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/" />;
  }

  // ================= SEND OTP =================
  const handleSendOtp = async () => {
    if (!mobile || mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoadingSend(true);
    try {
      const res = await fetch(`${baseUrl}/api/auth/login/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.info("You don't have an account, please register");
        setTimeout(() => {
          navigate("/register");
        }, 1500);
        return;
      }

      toast.success(data.message || "OTP sent successfully");
      setTimer(30);
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoadingSend(false);
    }
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoadingLogin(true);
    try {
      const res = await fetch(`${baseUrl}/api/auth/login/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error("OTP verification failed");
      }

      toast.success(data.message || "Login successful");
      localStorage.setItem("token", data.data.token);

      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1200);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  // Timer
  useEffect(() => {
    let countdown;
    if (timer > 0) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => clearTimeout(countdown);
  }, [timer]);

  return (
    <div className="login-page">
      <div className="overlay"></div>
      <div className="login-card">
        <h2 className="title">Welcome Back</h2>
        <p className="subtitle">Login with your mobile number</p>

        <div className="input-group">
          <input
            type="tel"
            placeholder="Enter 10-digit Mobile Number"
            value={mobile}
            maxLength={10}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setMobile(value);
              }
            }}
          />
          <button
            className="send-btn"
            onClick={handleSendOtp}
            disabled={timer > 0 || loadingSend}
          >
            {loadingSend
              ? "Sending..."
              : timer > 0
              ? `Resend in ${timer}s`
              : "Send OTP"}
          </button>
        </div>

        <div className="input-group">
          <input
            type="tel"
            placeholder="Enter 6-digit OTP"
            value={otp}
            maxLength={6}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        <button
          className="verify-btn"
          onClick={handleLogin}
          disabled={loadingLogin}
        >
          {loadingLogin ? "Logging in..." : "Login"}
        </button>

        <p className="toggle-text">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>Sign Up</span>
        </p>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Login;
