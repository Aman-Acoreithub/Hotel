import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError, showInfo, showWarning } from "../utils/Toast";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

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
  const [gstAmount, setGstAmount] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
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

  const location = useLocation();
  const { id: preSelectedId, type: preSelectedType } = location.state || {};

  // Generic fetch function
  const fetchData = async (url, setData, setLoading, setError, isHotel = false) => {
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
      setError(err.response?.data?.message || err.message || "Failed to fetch data");
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
        const plansRes = await axios.get("https://hotel-banquet.nearprop.in/api/subscriptions/plans");
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

  // Handle pre-selected hotel or banquet
  useEffect(() => {
    if (preSelectedId && preSelectedType && plans.length > 0) {
      const plan = plans.find((p) => p.planFor === preSelectedType.toLowerCase());
      if (plan) {
        setSelectedPlan(plan);

        // Calculate discounted price (same as plan price if no coupon)
        const discountedPrice = plan.price;

        // Round to 2 decimal places for UI and payment consistency
        const roundedDiscountedPrice = Math.round(discountedPrice * 100) / 100;
        setFinalPrice(roundedDiscountedPrice);

        // Calculate GST on the rounded discounted price
        const gst = Math.round(roundedDiscountedPrice * 0.18 * 100) / 100;
        setGstAmount(gst);

        // Calculate total (rounded, discounted price + rounded GST)
        const totalAmount = Math.round((roundedDiscountedPrice + gst) * 100) / 100;
        setTotalAmount(totalAmount);

        // Set preselected hotel or banquet
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

    setFinalPrice(plan.price);
    const gst = plan.price * 0.18; // ✅ GST 18%
    setGstAmount(gst);
    setTotalAmount(plan.price + gst); // ✅ Base + GST
    setCouponCode("");
    setCouponInfo(null);
    setCouponError(null);
    setSelectedHotel(preSelectedId && preSelectedType === "Hotel" ? preSelectedId : "");
    setSelectedBanquet(preSelectedId && preSelectedType === "Banquet" ? preSelectedId : "");
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
    setGstAmount(null);
    setTotalAmount(null);
    setSelectedHotel("");
    setSelectedBanquet("");
  };

  // Validate coupon code
  const validateCoupon = async () => {
    if (!couponCode || (selectedPlan?.planFor === "hotel" && !selectedHotel) || (selectedPlan?.planFor === "banquet" && !selectedBanquet)) {
      setCouponInfo(null);
      setCouponError(null);
      setFinalPrice(selectedPlan?.price);
      const gst = selectedPlan.price * 0.18; // ✅ GST
      setGstAmount(gst);
      setTotalAmount(selectedPlan.price + gst);
      return;
    }
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await axios.get(`https://hotel-banquet.nearprop.in/api/coupons/${couponCode}`);
      if (!res.data.data.planFor || res.data.data.planFor === selectedPlan.planFor) {
        setCouponInfo(res.data.data);

        const discount = res.data.data.discountType === "percentage"
          ? selectedPlan.price * (res.data.data.discountValue / 100)
          : res.data.data.discountValue;

        // Guarantee discountedPrice is never negative
        const discountedPrice = Math.max(0, selectedPlan.price - discount);

        // Round to 2 decimal places for display and payment consistency
        const roundedDiscountedPrice = Math.round(discountedPrice * 100) / 100;
        setFinalPrice(roundedDiscountedPrice);

        // GST is 18% of the discounted price, also rounded
        const gst = Math.round(roundedDiscountedPrice * 0.18 * 100) / 100;
        setGstAmount(gst);

        // Total = discounted price + GST, rounded
        const totalAmount = Math.round((roundedDiscountedPrice + gst) * 100) / 100;
        setTotalAmount(totalAmount);
      }
      else {
        setCouponInfo(null);
        if (res.data.data?.planFor && res.data.data.planFor !== selectedPlan.planFor) {
          setCouponError("Coupon not applicable to this plan type");
        } else {
          setCouponError("Coupon is invalid or inactive");
        }
        setFinalPrice(selectedPlan.price);
        const gst = selectedPlan.price * 0.18;
        setGstAmount(gst);
        setTotalAmount(selectedPlan.price + gst);
      }

    } catch (err) {
      setCouponInfo(null);
      setCouponError(err.response?.data?.message || "Failed to validate coupon");
      setFinalPrice(selectedPlan.price);
      setGstAmount(selectedPlan.price * 1);
      setTotalAmount(selectedPlan.price * 1);
    } finally {
      setCouponLoading(false);
    }
  };

  // Handle coupon code input change
  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
  };

  // Apply coupon on button click
  const handleApplyCoupon = () => {
    if (couponCode) {
      validateCoupon();
    } else {
      setCouponInfo(null);
      setCouponError("Please enter a coupon code");
      setFinalPrice(selectedPlan?.price);

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

  // Handle purchase
  const handlePurchase = async () => {
    if (!selectedPlan) {
      showWarning("Please select a plan to purchase.");
      return;
    }
    if (selectedPlan.planFor === "hotel" && !selectedHotel) {
      showWarning("Please select a hotel.");
      return;
    }
    if (selectedPlan.planFor === "banquet" && !selectedBanquet) {
      showWarning("Please select a banquet hall.");
      return;
    }
    if (couponCode && !couponInfo) {
      showWarning("Please apply a valid coupon or remove the coupon code.");
      return;
    }
    setPurchaseLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showWarning("You must be logged in to purchase a plan.");
        setPurchaseLoading(false);
        return;
      }
      const payload = {
        hotelId: selectedPlan.planFor === "hotel" ? selectedHotel : undefined,
        banquetHallId: selectedPlan.planFor === "banquet" ? selectedBanquet : undefined,
        planId: selectedPlan._id,
        couponCode: couponInfo ? couponCode : undefined,
        amount: totalAmount, // <-- Send rupees with decimals, NOT paise as integer
        paymentId: "xyz123", // <-- Replace with the actual Razorpay payment ID after payment
      };


      console.log("Purchase payload:", payload);
      // const res = await axios.post(
      //   "https://hotel-banquet.nearprop.in/api/subscriptions/plans/purchase",
      //   payload,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );
      // if (!res.data.success) {
      //   alert("Failed to create order: " + res.data.message);
      //   setPurchaseLoading(false);
      //   return;
      // }
      // const { order } = res.data;
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showError("Failed to load Razorpay SDK.");
        setPurchaseLoading(false);
        return;
      }
      const options = {
        key: "rzp_live_RydWSyrJc8vjYO",  // ← Updated to live key
        amount: Math.floor(totalAmount * 100), // Convert rupees to paise
        currency: 'INR',
        name: "Hotel Banquet",
        description: `Subscription for ${selectedPlan.name}`,

        handler: async function (response) {
          try {
            const purchaseRes = await axios.post(
              "https://hotel-banquet.nearprop.in/api/subscriptions/plans/purchase",
              payload,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (purchaseRes.data.success) {
              toast.success("✅ Payment successful! Subscription activated.");
              closeModal();
            } else {
              showError("❌ Subscription activation failed: " + purchaseRes.data.message);
            }
          } catch (err) {
            showError("⚠️ Error activating subscription: " + (err.response?.data?.message || err.message));
          } finally {
            setPurchaseLoading(false);
          }
        },
        prefill: {
          name: "User Name",
          email: "xyz@example.com",
        },
        theme: {
          color: "#0d89c7ff",
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      showError("Error creating order: " + (err.response?.data?.message || err.message));
      setPurchaseLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    window.location.href = "/login";
    setIsAuthenticated(true);
  };

  if (!authChecked) {
    return <div className="subscription-loading">Checking authentication...</div>;
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

  if (loading) return <div className="subscription-loading">Loading plans...</div>;
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
                className={`subscription-card ${plan.planType === "monthly" ? "subscription-card--featured" : ""}`}
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
          <h2 className="subscription-subtitle">🎉 Banquet Subscription Plans</h2>
          <div className="subscription-cards">
            {banquetPlans.length === 0 && (
              <p className="subscription-empty">No banquet plans available</p>
            )}
            {banquetPlans.map((plan, idx) => (
              <motion.div
                key={plan._id}
                className={`subscription-card ${plan.planType === "monthly" ? "subscription-card--featured" : ""}`}
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
              <button className="modal-close-button" onClick={closeModal} aria-label="Close modal">
                ×
              </button>
              <h2 className="subscription-modal__title">Purchase {selectedPlan?.name}</h2>
              <div className="subscription-modal__section">
                {selectedPlan?.planFor === "hotel" && (
                  <>
                    <label htmlFor="hotelSelect" className="subscription-modal__label">
                      Select Hotel
                    </label>
                    {hotelsLoading ? (
                      <p className="subscription-modal__loading">Loading hotels...</p>
                    ) : hotelsError ? (
                      <p className="subscription-modal__error">{hotelsError}</p>
                    ) : hotels.length === 0 ? (
                      <p className="subscription-modal__info">No hotels found. Please add a hotel first.</p>
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
                          .filter((hotels) => hotels.subscriptions.length === 0)

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
                    <label htmlFor="banquetSelect" className="subscription-modal__label">
                      Select Banquet Hall
                    </label>
                    {banquetsLoading ? (
                      <p className="subscription-modal__loading">Loading banquet halls...</p>
                    ) : banquetsError ? (
                      <p className="subscription-modal__error">{banquetsError}</p>
                    ) : banquets.length === 0 ? (
                      <p className="subscription-modal__info">No banquet halls found. Please add a banquet hall first.</p>
                    ) : (
                      <select
                        id="banquetSelect"
                        value={selectedBanquet}
                        onChange={(e) => setSelectedBanquet(e.target.value)}
                        className="subscription-modal__select"
                        disabled={preSelectedType === "Banquet" && preSelectedId}
                      >
                        <option value="">-- Select Banquet Hall --</option>
                        {banquets
                          .filter((banquet) => banquet.isAvailable === false)
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
                      {couponLoading ? "Applying..." : "Apply Coupon"}
                    </motion.button>
                  </div>
                  {couponLoading && (
                    <p className="subscription-modal__coupon-status">Validating coupon...</p>
                  )}
                  {couponInfo && (
                    <p className="subscription-modal__coupon-valid">
                      Coupon "{couponInfo.code}" applied! {couponInfo.discountType === "percentage"
                        ? `${couponInfo.discountValue}% off`
                        : `₹${couponInfo.discountValue} off`}
                    </p>
                  )}
                  {couponError && (
                    <p className="subscription-modal__coupon-error">{couponError}</p>
                  )}
                </div>
                <div className="subscription-modal__price-section">
                  <p>Original Price: ₹{selectedPlan?.price}</p>
                  {couponInfo && finalPrice !== selectedPlan?.price && (
                    <p>Discounted Price: ₹{finalPrice}</p>
                  )}
                  <p>GST (18%): ₹{gstAmount?.toFixed(2)}</p>
                  <p><strong>Total Amount: ₹{totalAmount?.toFixed(2)}</strong></p>
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