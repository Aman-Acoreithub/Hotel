import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError, showInfo, showWarning } from "../utils/Toast";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

import Modal from "react-modal";
import { motion, AnimatePresence } from "framer-motion";
import "./Subscription.css";

Modal.setAppElement("#root");

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [banquets, setBanquets] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponInfo, setCouponInfo] = useState(null);
  const [finalPrice, setFinalPrice] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedHotel, setSelectedHotel] = useState("");
  const [selectedBanquet, setSelectedBanquet] = useState("");
  const [loading, setLoading] = useState(false);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [banquetsLoading, setBanquetsLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hotelsError, setHotelsError] = useState(null);
  const [banquetsError, setBanquetsError] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authorizedAmount, setAuthorizedAmount] = useState(null);
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);

  const location = useLocation();
  const { id: preSelectedId, type: preSelectedType } = location.state || {};

  // Generic fetch function
  const fetchData = async (
    url,
    setData,
    setLoading,
    setError,
    isHotel = false
  ) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        setIsAuthenticated(false);
        return;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        let data = isHotel ? res.data.data?.hotels : res.data.data;
        if (!isHotel && res.data.data?.banquetHalls) {
          data = res.data.data.banquetHalls;
        }
        if (Array.isArray(data)) {
          setData(data);
        } else {
          setData([]);
          setError("Invalid data format received");
        }
      } else {
        setError(res.data.message || "Failed to fetch data");
        setData([]);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
      }
      setError(
        err.response?.data?.message || err.message || "Failed to fetch data"
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setAuthChecked(true);
  }, []);

  // Fetch plans, hotels, and banquets
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const plansRes = await axios.get(
          "https://hotel-banquet.nearprop.in/api/subscriptions/plans"
        );
        if (plansRes.data.success) {
          setPlans(plansRes.data.data);
        } else {
          setError("Failed to fetch plans");
        }
      } catch (err) {
        setError("Error fetching plans");
      } finally {
        setLoading(false);
      }
      fetchData(
        "https://hotel-banquet.nearprop.in/api/hotels/owner",
        setHotels,
        setHotelsLoading,
        setHotelsError,
        true
      );
      fetchData(
        "https://hotel-banquet.nearprop.in/api/banquet-halls/owner",
        setBanquets,
        setBanquetsLoading,
        setBanquetsError,
        false
      );
    };
    fetchAllData();
  }, [isAuthenticated]);
  //  add plan purches api
  // New API: Fetch user's current subscription status
  const fetchUserSubscriptionStatus = async () => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatusError("Authentication token not found");
        return;
      }

      const res = await axios.get(
        "https://hotel-banquet.nearprop.in/api/subscriptions/user-status",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setUserSubscriptionStatus(res.data.data);
      } else {
        setStatusError(
          res.data.message || "Failed to fetch subscription status"
        );
      }
    } catch (err) {
      setStatusError(
        err.response?.data?.message || "Error fetching subscription status"
      );
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle pre-selected hotel or banquet
  useEffect(() => {
    if (preSelectedId && preSelectedType && plans.length > 0) {
      const plan = plans.find(
        (p) => p.planFor === preSelectedType.toLowerCase()
      );
      if (plan) {
        setSelectedPlan(plan);

        const discountedPrice = plan.price;
        const roundedPrice = Math.round(discountedPrice * 100) / 100;
        setFinalPrice(roundedPrice);
        setTotalAmount(roundedPrice);

        if (preSelectedType === "Hotel") {
          setSelectedHotel(preSelectedId);
        } else if (preSelectedType === "Banquet") {
          setSelectedBanquet(preSelectedId);
        }

        setModalIsOpen(true);
      }
    }
  }, [preSelectedId, preSelectedType, plans]);

  // Open modal
  const openModal = (plan) => {
    if (!isAuthenticated) {
      showInfo("Please login to purchase a subscription plan.");
      return;
    }
    setSelectedPlan(plan);
    const roundedPrice = Math.round(plan.price * 100) / 100;
    setFinalPrice(roundedPrice);
    setTotalAmount(roundedPrice);
    setCouponCode("");
    setCouponInfo(null);
    setCouponError(null);
    setSelectedHotel(
      preSelectedId && preSelectedType === "Hotel" ? preSelectedId : ""
    );
    setSelectedBanquet(
      preSelectedId && preSelectedType === "Banquet" ? preSelectedId : ""
    );
    setModalIsOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalIsOpen(false);
    setPurchaseLoading(false);
    setSelectedPlan(null);
    setCouponCode("");
    setCouponInfo(null);
    setFinalPrice(null);
    setTotalAmount(null);
    setSelectedHotel("");
    setSelectedBanquet("");
  };

  // Validate coupon code
  const validateCoupon = async () => {
    if (
      !couponCode ||
      (selectedPlan?.planFor === "hotel" && !selectedHotel) ||
      (selectedPlan?.planFor === "banquet" && !selectedBanquet)
    ) {
      setCouponInfo(null);
      setCouponError(null);
      const roundedPrice = Math.round(selectedPlan?.price * 100) / 100;
      setFinalPrice(roundedPrice);
      setTotalAmount(roundedPrice);
      return;
    }

    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await axios.get(
        `https://hotel-banquet.nearprop.in/api/subscriptions/validate-coupon/${couponCode}`
      );
      if (
        !res.data.data.planFor ||
        res.data.data.planFor === selectedPlan.planFor
      ) {
        setCouponInfo(res.data.data);

        const discount =
          res.data.data.discountType === "percentage"
            ? selectedPlan.price * (res.data.data.discountValue / 100)
            : res.data.data.discountValue;

        const discountedPrice = Math.max(0, selectedPlan.price - discount);
        const roundedPrice = Math.round(discountedPrice * 100) / 100;

        setFinalPrice(roundedPrice);
        setTotalAmount(roundedPrice);
      } else {
        setCouponInfo(null);
        if (
          res.data.data?.planFor &&
          res.data.data.planFor !== selectedPlan.planFor
        ) {
          setCouponError("Coupon not applicable to this plan type");
        } else {
          setCouponError("Coupon is invalid or inactive");
        }
        const roundedPrice = Math.round(selectedPlan.price * 100) / 100;
        setFinalPrice(roundedPrice);
        setTotalAmount(roundedPrice);
      }
    } catch (err) {
      setCouponInfo(null);
      setCouponError(
        err.response?.data?.message || "Failed to validate coupon"
      );
      const roundedPrice = Math.round(selectedPlan.price * 100) / 100;
      setFinalPrice(roundedPrice);
      setTotalAmount(roundedPrice);
    } finally {
      setCouponLoading(false);
    }
  };

  // Handle coupon input
  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
  };

  // Apply coupon
  const handleApplyCoupon = () => {
    if (couponCode) {
      validateCoupon();
    } else {
      setCouponInfo(null);
      setCouponError("Please enter a coupon code");
      const roundedPrice = Math.round(selectedPlan?.price * 100) / 100;
      setFinalPrice(roundedPrice);
      setTotalAmount(roundedPrice);
    }
  };

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // const handlePurchase = async () => {
  //   if (!selectedPlan) {
  //     showWarning("Please select a plan");
  //     return;
  //   }

  //   if (selectedPlan.planFor === "hotel" && !selectedHotel) {
  //     showWarning("Please select a hotel");
  //     return;
  //   }
  //   if (selectedPlan.planFor === "banquet" && !selectedBanquet) {
  //     showWarning("Please select a banquet hall");
  //     return;
  //   }

  //   setPurchaseLoading(true);

  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     showWarning("Login required");
  //     setPurchaseLoading(false);
  //     return;
  //   }

  //   const payableAmount = Number(totalAmount) || 0;

  //   // ========= CASE: FREE PLAN (₹0) =========
  //   if (payableAmount <= 0) {
  //     try {
  //       // Directly activate subscription without payment
  //       const res = await axios.post(
  //         "https://hotel-banquet.nearprop.in/api/payment/capture-payment", // ← CHANGE THIS TO YOUR ACTUAL SUBSCRIPTION PURCHASE ENDPOINT
  //         {
  //           // planId: selectedPlan._id,
  //           // hotelId: selectedPlan.planFor === "hotel" ? selectedHotel : null,
  //           // banquetId:
  //           //   selectedPlan.planFor === "banquet" ? selectedBanquet : null,
  //           // couponCode: couponInfo?.code || null,
  //           // amount: 0,
  //           // paymentStatus: "free", // optional flag
  //           // razorpay_payment_id: null,
  //         },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );

  //       if (res.data.success) {
  //         toast.success("🎉 Free subscription activated successfully!");
  //         closeModal();
  //       } else {
  //         showError(res.data.message || "Failed to activate subscription");
  //       }
  //     } catch (err) {
  //       showError(err.response?.data?.message || "Activation failed");
  //     } finally {
  //       setPurchaseLoading(false);
  //     }
  //     return;
  //   }

  //   // ========= CASE: PAID PLAN → Razorpay =========
  //   try {
  //     const loaded = await loadRazorpayScript();
  //     if (!loaded) {
  //       showError("Razorpay SDK failed to load");
  //       setPurchaseLoading(false);
  //       return;
  //     }

  //     const amountInPaise = Math.round(payableAmount * 100);

  //     const options = {
  //       key: "rzp_live_RydWSyrJc8vjYO",
  //       amount: amountInPaise,
  //       currency: "INR",
  //       name: "Hotel Banquet",
  //       description: `Subscription for ${selectedPlan.name}`,
  //       handler: async (response) => {
  //         try {
  //           const captureRes = await axios.post(
  //             "https://hotel-banquet.nearprop.in/api/payment/capture-payment",
  //             {
  //               razorpay_payment_id: response.razorpay_payment_id,
  //               amount: payableAmount.toFixed(2),
  //               planId: selectedPlan._id,
  //               hotelId:
  //                 selectedPlan.planFor === "hotel" ? selectedHotel : null,
  //               banquetId:
  //                 selectedPlan.planFor === "banquet" ? selectedBanquet : null,
  //               couponCode: couponInfo?.code || null,
  //             },
  //             {
  //               headers: {
  //                 Authorization: `Bearer ${token}`,
  //                 "Content-Type": "application/json",
  //               },
  //             }
  //           );

  //           if (captureRes.data.success) {
  //             toast.success("✅ Payment successful! Subscription activated.");
  //             closeModal();
  //           } else {
  //             showError(captureRes.data.message || "Payment failed");
  //           }
  //         } catch (err) {
  //           showError(
  //             err.response?.data?.message || "Payment processing failed"
  //           );
  //         } finally {
  //           setPurchaseLoading(false);
  //         }
  //       },
  //       theme: { color: "#0d89c7ff" },
  //       modal: {
  //         ondismiss: () => setPurchaseLoading(false),
  //       },
  //     };

  //     new window.Razorpay(options).open();
  //   } catch (err) {
  //     showError("Payment initiation failed");
  //     setPurchaseLoading(false);
  //   }
  // };

  const handlePurchase = async () => {
    if (!selectedPlan) {
      showWarning("Please select a plan");
      return;
    }

    if (selectedPlan.planFor === "hotel" && !selectedHotel) {
      showWarning("Please select a hotel");
      return;
    }
    if (selectedPlan.planFor === "banquet" && !selectedBanquet) {
      showWarning("Please select a banquet hall");
      return;
    }

    setPurchaseLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      showWarning("Login required");
      setPurchaseLoading(false);
      return;
    }

    const payableAmount = Number(totalAmount) || 0;

    // if (payableAmount <= 0) {
    //   try {
    //     // Directly activate subscription without payment
    //     const res = await axios.post(
    //       "https://hotel-banquet.nearprop.in/api/payment/capture-payment", // ← CHANGE THIS TO YOUR ACTUAL SUBSCRIPTION PURCHASE ENDPOINT
    //       {
    //         planId: selectedPlan._id,
    //         hotelId: selectedPlan.planFor === "hotel" ? selectedHotel : null,
    //         banquetId:
    //           selectedPlan.planFor === "banquet" ? selectedBanquet : null,
    //         couponCode: couponInfo?.code || null,
    //         amount: 0,
    //         paymentStatus: "free", // optional flag
    //         razorpay_payment_id: null,
    //       },
    //       {
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //           "Content-Type": "application/json",
    //         },
    //       }
    //     );

    //     if (res.data.success) {
    //       toast.success("🎉 Free subscription activated successfully!");
    //       closeModal();
    //     }
        
        
    //     else {
    //       showError(res.data.message || "Failed to activate subscription");
    //     }
    //      if (captureRes.data.success) {
    //           // STEP 2: After successful capture, run purchase API
    //           const purchaseRes = await axios.post(
    //             "https://hotel-banquet.nearprop.in/api/subscriptions/plans/purchase",
    //             {
    //               planId: selectedPlan._id,
    //               hotelId:
    //                 selectedPlan.planFor === "hotel" ? selectedHotel : null,
    //               banquetHallId:
    //                 selectedPlan.planFor === "banquet" ? selectedBanquet : null,
    //               couponCode: couponInfo?.code || null,
    //               razorpay_payment_id: response.razorpay_payment_id,
    //               paymentId:
    //                 captureRes.data.data?.paymentId ||
    //                 response.razorpay_payment_id,
    //               amount:
    //                 captureRes.data.data?.amount ||
    //                 response.razorpay_payment_id,
    //               transactionId:
    //                 captureRes.data.data?.transactionId ||
    //                 response.razorpay_payment_id,
    //             },
    //             {
    //               headers: {
    //                 Authorization: `Bearer ${token}`,
    //                 "Content-Type": "application/json",
    //               },
    //             }
    //           );

    //           if (purchaseRes.data.success) {
    //             toast.success("✅ Payment successful! Subscription activated.");
    //             // Show plan ID
    //             if (purchaseRes.data.data?.planId) {
    //               toast.info(`Plan ID: ${purchaseRes.data.data.planId}`);
    //             }
    //             closeModal();
    //           } else {
    //             showError(
    //               purchaseRes.data.message ||
    //                 "Payment captured but subscription activation failed"
    //             );
    //           }
    //         } else {
    //           showError(
    //             captureRes.data.message || "Payment verification failed"
    //           );
    //         }
    //   } catch (err) {
    //     showError(err.response?.data?.message || "Activation failed");
    //   } finally {
    //     setPurchaseLoading(false);
    //   }
    //   return;
    // }

    if (payableAmount <= 0) {
  try {
    // STEP 1: Directly capture payment for free subscription
    const captureRes = await axios.post(
      "https://hotel-banquet.nearprop.in/api/payment/capture-payment",
      {
        planId: selectedPlan._id,
        hotelId: selectedPlan.planFor === "hotel" ? selectedHotel : null,
        banquetId: selectedPlan.planFor === "banquet" ? selectedBanquet : null,
        couponCode: couponInfo?.code || null,
        amount: 0,
        paymentStatus: "free",
        razorpay_payment_id: null,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // STEP 2: After successful capture, run purchase API for FREE plan
    if (captureRes.data.success) {
      const purchaseRes = await axios.post(
        "https://hotel-banquet.nearprop.in/api/subscriptions/plans/purchase",
        {
          planId: selectedPlan._id,
          hotelId: selectedPlan.planFor === "hotel" ? selectedHotel : null,
          banquetHallId: selectedPlan.planFor === "banquet" ? selectedBanquet : null,
          couponCode: couponInfo?.code || null,
          razorpay_payment_id: null,
          paymentId: captureRes.data.data?.paymentId || "FREE-" + Date.now(),
          amount: 0,
          transactionId: captureRes.data.data?.transactionId || "FREE-TXN-" + Date.now(),
          finalPrice: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (purchaseRes.data.success) {
        toast.success("🎉 Free subscription activated successfully!");
        // Show plan ID
        if (purchaseRes.data.data?.planId) {
          toast.info(`Plan ID: ${purchaseRes.data.data.planId}`);
        }
        closeModal();
      } else {
        showError(purchaseRes.data.message || "Capture succeeded but subscription activation failed");
      }
    } else {
      showError(captureRes.data.message || "Failed to activate free subscription");
    }
  } catch (err) {
    showError(err.response?.data?.message || "Activation failed");
  } finally {
    setPurchaseLoading(false);
  }
  return;
}

    // ========= CASE: PAID PLAN → Razorpay =========
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        showError("Razorpay SDK failed to load");
        setPurchaseLoading(false);
        return;
      }

      const amountInPaise = Math.round(payableAmount * 100);

      const options = {
        key: "rzp_live_RydWSyrJc8vjYO",
        amount: amountInPaise,
        currency: "INR",
        name: "Hotel Banquet",
        description: `Subscription for ${selectedPlan.name}`,
        handler: async (response) => {
          try {
            // STEP 1: First capture the payment
            const captureRes = await axios.post(
              "https://hotel-banquet.nearprop.in/api/payment/capture-payment",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: payableAmount.toFixed(2),
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (captureRes.data.success) {
              // STEP 2: After successful capture, run purchase API
              const purchaseRes = await axios.post(
                "https://hotel-banquet.nearprop.in/api/subscriptions/plans/purchase",
                {
                  planId: selectedPlan._id,
                  hotelId: selectedPlan.planFor === "hotel" ? selectedHotel : null,
                  banquetHallId:
                    selectedPlan.planFor === "banquet" ? selectedBanquet : null,
                  couponCode: couponInfo?.code || null,
                  razorpay_payment_id: response.razorpay_payment_id,
                  paymentId:
                    captureRes.data.data?.paymentId ||
                    response.razorpay_payment_id,
                  amount:
                    captureRes.data.data?.amount ||
                    response.razorpay_payment_id,
                  transactionId:
                    captureRes.data.data?.transactionId ||
                    response.razorpay_payment_id,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (purchaseRes.data.success) {
                toast.success("✅ Payment successful! Subscription activated.");
                // Show plan ID
                if (purchaseRes.data.data?.planId) {
                  toast.info(`Plan ID: ${purchaseRes.data.data.planId}`);
                }
                closeModal();
              } else {
                showError(
                  purchaseRes.data.message ||
                    "Payment captured but subscription activation failed"
                );
              }
            } else {
              showError(
                captureRes.data.message || "Payment verification failed"
              );
            }
          } catch (err) {
            showError(
              err.response?.data?.message ||
                `Payment succeeded but processing failed. Contact support with ID: ${response.razorpay_payment_id}`
            );
            console.error("Payment processing error:", err);
          } finally {
            setPurchaseLoading(false);
          }
        },
        theme: { color: "#0d89c7ff" },
        modal: {
          ondismiss: () => {
            setPurchaseLoading(false);
            showError("Payment cancelled by user.");
          },
        },
        prefill: {
          // You can add user email/phone if available
          // email: "user@example.com",
          // contact: "9876543210",
        },
      };

      // Optional: Create order first
      try {
        const orderRes = await axios.post(
          "https://hotel-banquet.nearprop.in/api/payment/create-order",
          {
            amount: amountInPaise,
            currency: "INR",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (orderRes.data.success && orderRes.data.data?.id) {
          options.order_id = orderRes.data.data.id;
        }
      } catch (err) {
        console.log("Order creation optional, proceeding with direct payment");
      }

      new window.Razorpay(options).open();
    } catch (err) {
      showError(
        "Payment initiation failed: " + (err.message || "Unknown error")
      );
      setPurchaseLoading(false);
    }
  };
  const handleLoginRedirect = () => {
    window.location.href = "/login";
  };

  if (!authChecked) {
    return (
      <div className="subscription-loading">Checking authentication...</div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="subscription-container">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to view subscription plans</p>
          <button onClick={handleLoginRedirect} className="login-button">
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (loading)
    return <div className="subscription-loading">Loading plans...</div>;
  if (error) return <div className="subscription-error">Error: {error}</div>;

  const filteredPlans = preSelectedType
    ? plans.filter((p) => p.planFor === preSelectedType.toLowerCase())
    : plans;

  const hotelPlans = filteredPlans.filter((p) => p.planFor === "hotel");
  const banquetPlans = filteredPlans.filter((p) => p.planFor === "banquet");

  return (
    <div className="subscription-container">
      <motion.h1
        className="subscription-title"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Choose Your Subscription Plan
      </motion.h1>

      {(!preSelectedType || preSelectedType === "Hotel") && (
        <>
          <h2 className="subscription-subtitle">🏨 Hotel Subscription Plans</h2>
          <div className="subscription-cards">
            {hotelPlans.length === 0 && (
              <p className="subscription-empty">No hotel plans available</p>
            )}
            {hotelPlans.map((plan, idx) => (
              <motion.div
                key={plan._id}
                className={`subscription-card ${
                  plan.planType === "monthly"
                    ? "subscription-card--featured"
                    : ""
                }`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
              >
                {plan.planType === "monthly" && (
                  <span className="subscription-card__badge">Recommended</span>
                )}
                <h2 className="subscription-card__title">{plan.name}</h2>
                <p className="subscription-card__price">
                  ₹{plan.price} <span>/ {plan.planType}</span>
                </p>
                <ul className="subscription-card__features">
                  <li>✔ Room Limit: {plan.roomLimit}</li>
                  <li>✔ Reels Limit: {plan.reelsLimit}</li>
                </ul>
                <motion.button
                  className="subscription-card__button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openModal(plan)}
                >
                  Subscribe Now
                </motion.button>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {(!preSelectedType || preSelectedType === "Banquet") && (
        <>
          <br />
          <h2 className="subscription-subtitle">
            🎉 Banquet Subscription Plans
          </h2>
          <div className="subscription-cards">
            {banquetPlans.length === 0 && (
              <p className="subscription-empty">No banquet plans available</p>
            )}
            {banquetPlans.map((plan, idx) => (
              <motion.div
                key={plan._id}
                className={`subscription-card ${
                  plan.planType === "monthly"
                    ? "subscription-card--featured"
                    : ""
                }`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
              >
                {plan.planType === "monthly" && (
                  <span className="subscription-card__badge">Recommended</span>
                )}
                <h2 className="subscription-card__title">{plan.name}</h2>
                <p className="subscription-card__price">
                  ₹{plan.price} <span>/ {plan.planType}</span>
                </p>
                <ul className="subscription-card__features">
                  <li>✔ Room Limit: {plan.roomLimit}</li>
                  <li>✔ Reels Limit: {plan.reelsLimit}</li>
                </ul>
                <motion.button
                  className="subscription-card__button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openModal(plan)}
                >
                  Subscribe Now
                </motion.button>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {modalIsOpen && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            className="subscription-modal"
            overlayClassName="subscription-modal-overlay"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <button
                className="modal-close-button"
                onClick={closeModal}
                aria-label="Close modal"
              >
                ×
              </button>
              <h2 className="subscription-modal__title">
                Purchase {selectedPlan?.name}
              </h2>

              <div className="subscription-modal__section">
                {selectedPlan?.planFor === "hotel" && (
                  <>
                    <label
                      htmlFor="hotelSelect"
                      className="subscription-modal__label"
                    >
                      Select Hotel
                    </label>
                    {hotelsLoading ? (
                      <p>Loading hotels...</p>
                    ) : hotelsError ? (
                      <p className="subscription-modal__error">{hotelsError}</p>
                    ) : hotels.length === 0 ? (
                      <p>No hotels found. Please add a hotel first.</p>
                    ) : (
                      <select
                        id="hotelSelect"
                        value={selectedHotel}
                        onChange={(e) => setSelectedHotel(e.target.value)}
                        className="subscription-modal__select"
                        disabled={preSelectedType === "Hotel" && preSelectedId}
                      >
                        <option value="">-- Select Hotel --</option>
                        {hotels
                          .filter((h) => h.subscriptions.length === 0)
                          .map((hotel) => (
                            <option key={hotel._id} value={hotel._id}>
                              {hotel.name || "Unnamed Hotel"}
                            </option>
                          ))}
                      </select>
                    )}
                  </>
                )}

                {selectedPlan?.planFor === "banquet" && (
                  <>
                    <label
                      htmlFor="banquetSelect"
                      className="subscription-modal__label"
                    >
                      Select Banquet Hall
                    </label>
                    {banquetsLoading ? (
                      <p>Loading banquet halls...</p>
                    ) : banquetsError ? (
                      <p className="subscription-modal__error">
                        {banquetsError}
                      </p>
                    ) : banquets.length === 0 ? (
                      <p>
                        No banquet halls found. Please add a banquet hall first.
                      </p>
                    ) : (
                      <select
                        id="banquetSelect"
                        value={selectedBanquet}
                        onChange={(e) => setSelectedBanquet(e.target.value)}
                        className="subscription-modal__select"
                        disabled={
                          preSelectedType === "Banquet" && preSelectedId
                        }
                      >
                        <option value="">-- Select Banquet Hall --</option>
                        {banquets
                          .filter((b) => b.isAvailable === false)
                          .map((banquet) => (
                            <option key={banquet._id} value={banquet._id}>
                              {banquet.name || "Unnamed Banquet"}
                            </option>
                          ))}
                      </select>
                    )}
                  </>
                )}

                <div className="subscription-modal__coupon-section">
                  <h3 className="subscription-modal__subtitle">Apply Coupon</h3>
                  <div className="subscription-modal__coupon-input">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={handleCouponChange}
                      placeholder="Enter coupon code"
                      className="subscription-modal__input"
                    />
                    <motion.button
                      onClick={handleApplyCoupon}
                      className="subscription-modal__apply-button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={couponLoading}
                    >
                      {couponLoading ? "Applying..." : "Apply"}
                    </motion.button>
                  </div>
                  {couponInfo && (
                    <p className="subscription-modal__coupon-valid">
                      Coupon "{couponInfo.code}" applied! (
                      {couponInfo.discountType === "percentage"
                        ? `${couponInfo.discountValue}% off`
                        : `₹${couponInfo.discountValue} off`}
                      )
                    </p>
                  )}
                  {couponError && (
                    <p className="subscription-modal__coupon-error">
                      {couponError}
                    </p>
                  )}
                </div>

                <div className="subscription-modal__price-section">
                  <p>Plan Price: ₹{selectedPlan?.price.toFixed(2)}</p>
                  {couponInfo && finalPrice < selectedPlan?.price && (
                    <p>After Discount: ₹{finalPrice.toFixed(2)}</p>
                  )}
                  <p>
                    <strong>Total Payable: ₹{totalAmount?.toFixed(2)}</strong>
                  </p>
                </div>
              </div>

              <div className="subscription-modal__button-group">
                <motion.button
                  className="subscription-modal__purchase-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePurchase}
                  disabled={
                    purchaseLoading ||
                    (selectedPlan?.planFor === "hotel" && !selectedHotel) ||
                    (selectedPlan?.planFor === "banquet" && !selectedBanquet) ||
                    (couponCode && !couponInfo)
                  }
                >
                  {purchaseLoading ? "Processing..." : "Proceed to Payment"}
                </motion.button>
                <motion.button
                  className="subscription-modal__cancel-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeModal}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Subscription;
