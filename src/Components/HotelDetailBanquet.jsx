import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  faMapMarkerAlt,
  faGlobe,
  faEnvelope,
  faPhone,
  faUser,
  faStar,
  faUtensils,
  faGlassCheers,
  faCalendarAlt,
  faWifi,
  faCar,
  faSwimmingPool,
  faDumbbell,
  faSpa,
  faConciergeBell,
  faParking,
  faArrowLeft,
  faShareAlt,
  faHeart,
  faEdit,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faCheck,
  faRulerCombined,
  faUsers,
  faCamera,
  faVideo,
  faBed,
  faShower,
  faTv,
  faCoffee,
  faWind,
  faQuestionCircle,
  faShoppingCart,
  faExclamationTriangle,
  faClock,
  faHourglassHalf,
  faFire,
  faPauseCircle,
  faPlayCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-toastify/dist/ReactToastify.css";

const API_CONFIG = {
  baseUrl: "https://hotel-banquet.nearprop.in",
};

const SUBSCRIPTION_GRACE_PERIOD = 48 * 60 * 60 * 1000; // 48 hours in ms

const HotelDetails = () => {
  const { HotelAndBanquetDetailsId } = useParams();
  const location = useLocation();
  const type = location.state?.type || "Hotel";
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [banquet, setBanquet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [subscriptionDaysLeft, setSubscriptionDaysLeft] = useState(null);
  const [willAutoDelete, setWillAutoDelete] = useState(false);
  const [hasActiveSub, setHasActiveSub] = useState(false);
  const [propertyStatus, setPropertyStatus] = useState(null);
  const token = localStorage.getItem("token");

  const DefaultImage =
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";

  const calculateGracePeriodTimeLeft = useCallback(
    (createdAt, activeAt, verifiedAt) => {
      const start =
        verifiedAt || activeAt || createdAt || new Date().toISOString();

      const startTime = new Date(start).getTime();
      if (isNaN(startTime)) return null;

      const now = Date.now();
      const remaining = SUBSCRIPTION_GRACE_PERIOD - (now - startTime);

      if (remaining <= 0) {
        return { expired: true, totalSeconds: 0 };
      }

      const totalSeconds = Math.floor(remaining / 1000);

      return {
        expired: false,
        totalSeconds,
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        percentage: (remaining / SUBSCRIPTION_GRACE_PERIOD) * 100,
      };
    },
    []
  );

  const calculateSubscriptionDaysLeft = (subscriptions) => {
    if (!subscriptions || subscriptions.length === 0) return null;

    const activeSub = subscriptions.find((sub) => {
      const isActive = sub.isActive === true;
      const notExpired = new Date(sub.endDate) > new Date();
      return isActive && notExpired;
    });

    if (!activeSub) return null;

    const endDate = new Date(activeSub.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      daysLeft: diffDays > 0 ? diffDays : 0,
      endDate: endDate.toLocaleDateString(),
      planName: activeSub.planId?.name || "Subscription Plan",
      isActive: true,
    };
  };

  const checkActiveSubscription = (data) => {
    if (!data?.subscriptions || data.subscriptions.length === 0) {
      return false;
    }

    const activeSub = data.subscriptions.find((sub) => {
      const isActive = sub.isActive === true;
      const notExpired = new Date(sub.endDate) > new Date();
      return isActive && notExpired;
    });

    return !!activeSub;
  };

  const autoDeleteProperty = useCallback(async () => {
    try {
      const url =
        type === "Hotel"
          ? `${API_CONFIG.baseUrl}/api/hotels/${HotelAndBanquetDetailsId}`
          : `${API_CONFIG.baseUrl}/api/banquet-halls/${HotelAndBanquetDetailsId}`;

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.error(
        `⚠️ This ${type} has been automatically deleted because no subscription was purchased within 48 hours of activation.`
      );
      navigate("/hb");
    } catch (err) {
      toast.error("Error auto-deleting property");
      console.error("Error auto-deleting property:", err);
    }
  }, [HotelAndBanquetDetailsId, token, type, navigate]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (type === "Hotel") {
        const response = await axios.get(
          `${API_CONFIG.baseUrl}/api/hotels/${HotelAndBanquetDetailsId}`,
          { headers }
        );
        const hotelData = response.data.data || response.data;
        setProperty(hotelData);
        setPropertyStatus(hotelData.verificationStatus);

        // Check active subscription
        const hasActiveSubscription = checkActiveSubscription(hotelData);
        setHasActiveSub(hasActiveSubscription);

        if (hasActiveSubscription) {
          const daysLeft = calculateSubscriptionDaysLeft(
            hotelData.subscriptions
          );
          setSubscriptionDaysLeft(daysLeft);
        } else {
          setSubscriptionDaysLeft(null);
        }

        if (
          hotelData.verificationStatus === "verified" &&
          !hasActiveSubscription
        ) {
          const timeData = calculateGracePeriodTimeLeft(
            hotelData.createdAt,
            hotelData.activeAt,
            hotelData.verifiedAt
          );
          setTimeLeft(timeData);
          setWillAutoDelete(true);
        } else {
          setTimeLeft(null);
          setWillAutoDelete(false);
        }
      } else {
        const response = await axios.get(
          `${API_CONFIG.baseUrl}/api/banquet-halls/${HotelAndBanquetDetailsId}`,
          { headers }
        );
        const banquetData = response.data.data || response.data;
        setBanquet(banquetData);
        setPropertyStatus(banquetData.verificationStatus);

        const hasActiveSubscription = checkActiveSubscription(banquetData);
        setHasActiveSub(hasActiveSubscription);

        if (hasActiveSubscription) {
          const daysLeft = calculateSubscriptionDaysLeft(
            banquetData.subscriptions
          );
          setSubscriptionDaysLeft(daysLeft);
        } else {
          setSubscriptionDaysLeft(null);
        }

        if (
          banquetData.verificationStatus === "verified" &&
          !hasActiveSubscription
        ) {
          const timeData = calculateGracePeriodTimeLeft(
            banquetData.createdAt,
            banquetData.activeAt,
            banquetData.verifiedAt
          );
          setTimeLeft(timeData);
          setWillAutoDelete(true);
        } else {
          setTimeLeft(null);
          setWillAutoDelete(false);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load property data.");
      toast.error("Failed to load property data");
      console.error("Error fetching property:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const data = type === "Hotel" ? property : banquet;
    console.log({
      verified: data?.verificationStatus,
      hasActiveSub,
      timeLeft,
    });
    if (!data || data.verificationStatus !== "verified" || hasActiveSub) return;

    const timer = setInterval(() => {
      const newTimeLeft = calculateGracePeriodTimeLeft(
        data.createdAt,
        data.activeAt,
        data.verifiedAt
      );

      setTimeLeft(newTimeLeft);

      if (newTimeLeft?.expired) {
        clearInterval(timer);
        autoDeleteProperty();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    property,
    banquet,
    type,
    hasActiveSub,
    calculateGracePeriodTimeLeft,
    autoDeleteProperty,
  ]);

  const updateProperty = () => {
    if (!token) {
      toast.error("Please login to update property");
      navigate("/login");
      return;
    }

    const data = type === "Hotel" ? property : banquet;

    if (timeLeft?.expired && !hasActiveSub) {
      toast.error(
        "Cannot update property. Grace period has expired. Please purchase a subscription."
      );
      return;
    }

    navigate(`/update/${type.toLowerCase()}/${HotelAndBanquetDetailsId}`, {
      state: { type, verificationStatus: data?.verificationStatus },
    });
  };

  const deleteProperty = async () => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`))
      return;

    try {
      const url =
        type === "Hotel"
          ? `${API_CONFIG.baseUrl}/api/hotels/${HotelAndBanquetDetailsId}`
          : `${API_CONFIG.baseUrl}/api/banquet-halls/${HotelAndBanquetDetailsId}`;

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`${type} deleted successfully!`);
      navigate("/hb");
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to delete ${type}`);
    }
  };

  const handleNextImage = () => {
    const data = type === "Hotel" ? property : banquet;
    const images = data?.images || [DefaultImage];
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    const data = type === "Hotel" ? property : banquet;
    const images = data?.images || [DefaultImage];
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews?.items?.length) return 0;
    const total = reviews.items.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.items.length).toFixed(1);
  };

  const getAmenityIcon = (amenity) => {
    const amenityMap = {
      wifi: faWifi,
      parking: faCar,
      pool: faSwimmingPool,
      gym: faDumbbell,
      spa: faSpa,
      concierge: faConciergeBell,
      "free parking": faParking,
      ac: faWind,
      breakfast: faCoffee,
      tv: faTv,
      shower: faShower,
      bed: faBed,
    };
    return amenityMap[amenity.toLowerCase()] || faCheck;
  };

  const shareProperty = () => {
    const data = type === "Hotel" ? property : banquet;
    if (!data) return;

    if (navigator.share) {
      navigator
        .share({
          title: `${data.name}`,
          text: `Check out this ${type === "Hotel" ? "hotel" : "banquet hall"}`,
          url: window.location.href,
        })
        .catch(console.warn);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info("Link copied to clipboard!");
    }
  };

  const getStartingPrice = () => {
    if (type === "Hotel" && property?.rooms && property.rooms.length > 0) {
      const prices = property.rooms
        .map((room) => parseFloat(room.price) || 0)
        .filter((price) => price > 0);
      return prices.length > 0 ? Math.min(...prices) : 0;
    } else if (type === "Banquet" && banquet?.pricePerPlate) {
      return banquet.pricePerPlate;
    }
    return 0;
  };

  const navigateToSubscription = () => {
    navigate("/subscription", {
      state: {
        id: HotelAndBanquetDetailsId,
        type: type,
        propertyName: type === "Hotel" ? property?.name : banquet?.name,
        verificationStatus:
          type === "Hotel"
            ? property?.verificationStatus
            : banquet?.verificationStatus,
      },
    });
  };

  const verifyPropertyStatus = async () => {
    try {
      const url =
        type === "Hotel"
          ? `${API_CONFIG.baseUrl}/api/hotels/verify/${HotelAndBanquetDetailsId}`
          : `${API_CONFIG.baseUrl}/api/banquet-halls/verify/${HotelAndBanquetDetailsId}`;

      await axios.put(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`${type} verificationStatus verified successfully!`);
      fetchProperty();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          `Failed to verify ${type} verificationStatus`
      );
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [HotelAndBanquetDetailsId, token, type]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const data = type === "Hotel" ? property : banquet;
  if (!data) return null;

  const images = data.images || [DefaultImage];
  const avgRating = calculateAverageRating(data.reviews);
  const displayAmenities = showAllAmenities
    ? data.amenities
    : data.amenities?.slice(0, 6) || [];
  const startingPrice = getStartingPrice();
  const isActive = data.verificationStatus === "verified";
  const isPending = data.verificationStatus === "pending";

  const formatTimeLeft = () => {
    if (!timeLeft || timeLeft.expired) return "00:00:00";
    return `${timeLeft.hours.toString().padStart(2, "0")}:${timeLeft.minutes
      .toString()
      .padStart(2, "0")}:${timeLeft.seconds.toString().padStart(2, "0")}`;
  };

  const getStatusBadge = (verificationStatus) => {
    const statusConfig = {
      active: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        icon: faPlayCircle,
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
        icon: faPauseCircle,
      },
      inactive: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-200",
        icon: faPauseCircle,
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
        icon: faPauseCircle,
      },
      verified: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        icon: faCheck,
      },
    };
    return statusConfig[verificationStatus] || statusConfig.pending;
  };

  const statusBadge = getStatusBadge(data.verificationStatus);

  const shouldShowTimer =
    data?.verificationStatus === "verified" &&
    !hasActiveSub &&
    timeLeft?.totalSeconds > 0;

  if (timeLeft?.expired && isActive && !hasActiveSub) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon
                icon={faFire}
                className="text-red-500 text-4xl"
              />
            </div>
            <h1 className="text-3xl font-bold text-red-700 mb-2">
              Property Deleted
            </h1>
            <p className="text-gray-600 mb-6">
              This {type.toLowerCase()} has been automatically deleted because
              no subscription was purchased within 48 hours of activation.
            </p>
          </div>
          <button
            onClick={() => navigate("/hb")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Browse Other Properties
          </button>
          <button
            onClick={() => navigate("/subscription")}
            className="w-full mt-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-all"
          >
            Purchase Subscription First
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Back Button Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 md:py-5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white hover:text-blue-100 transition-colors text-base md:text-lg font-semibold"
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="mr-2 md:mr-3 text-lg md:text-xl"
            />
            <span className="text-lg md:text-xl">Back to Properties</span>
          </button>
        </div>
      </div>

      {/* 48-Hour Grace Period Banner */}
      {shouldShowTimer && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center mb-2 md:mb-0">
                <FontAwesomeIcon
                  icon={faHourglassHalf}
                  className="mr-3 text-xl animate-pulse"
                />
                <div>
                  <h3 className="font-bold text-lg">
                    ⚠️ 48-Hour Subscription Grace Period
                  </h3>
                  <p className="text-sm opacity-90">
                    Purchase a subscription within {formatTimeLeft()} or this
                    property will be automatically deleted!
                  </p>
                </div>
              </div>
              <div className="w-full md:w-64">
                <div className="flex justify-between text-sm mb-1">
                  <span>Time Remaining</span>
                  <span>{formatTimeLeft()}</span>
                </div>
                <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-1000"
                    style={{ width: `${timeLeft.percentage}%` }}
                  />
                </div>
                <div className="text-xs mt-1 text-center opacity-80">
                  Activated: {timeLeft?.startTime || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Subscription Banner */}
      {hasActiveSub && subscriptionDaysLeft && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center mb-2 md:mb-0">
                <FontAwesomeIcon icon={faCheck} className="mr-3 text-xl" />
                <div>
                  <h3 className="font-bold text-lg">Active Subscription</h3>
                  <p className="text-sm opacity-90">
                    {subscriptionDaysLeft.planName} •{" "}
                    <strong>{subscriptionDaysLeft.daysLeft} days</strong>{" "}
                    remaining (until {subscriptionDaysLeft.endDate})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Image Gallery */}
      <div className="relative h-[400px] md:h-[600px] mt-5 overflow-hidden rounded-2xl">
        {/* IMAGE */}
        <img
          src={images[currentImageIndex] || DefaultImage}
          alt={data.name}
          className="w-full h-full object-center "
          onError={(e) => (e.target.src = DefaultImage)}
        />

        {/* LEFT ARROW */}
        <button
          onClick={handlePrevImage}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition-all"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {/* RIGHT ARROW */}
        <button
          onClick={handleNextImage}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition-all"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        {/* IMAGE DOTS */}
        <div className="absolute bottom-4  left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentImageIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* STATUS BADGE – TOP LEFT */}
        <div className="absolute top-3 left-3">
          <div
            className={`flex items-center px-3 py-1.5 rounded-full ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} border`}
          >
            <FontAwesomeIcon icon={statusBadge.icon} className="mr-2" />
            <span className="font-semibold text-sm capitalize">
              {data.verificationStatus}
            </span>
          </div>
        </div>

        {/* LIKE & SHARE – TOP RIGHT */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 md:p-3 rounded-full shadow-lg transition-all ${
              isFavorite ? "bg-red-500 text-white" : "bg-white text-gray-700"
            }`}
          >
            <FontAwesomeIcon icon={faHeart} />
          </button>

          <button
            onClick={shareProperty}
            className="p-2 md:p-3 rounded-full bg-white text-gray-700 shadow-lg hover:bg-gray-50 transition-all"
          >
            <FontAwesomeIcon icon={faShareAlt} />
          </button>
        </div>
      </div>

      {/* Thumbnail Images */}
      <div className="container mt-5 mx-auto px-4 relative z-10">
        <div className="flex space-x-2 overflow-x-auto pb-4">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentImageIndex
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-300"
              }`}
            >
              <img
                src={img}
                alt={`Thumb ${index}`}
                className="w-full h-full"
                onError={(e) => (e.target.src = DefaultImage)}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 py-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                        {data.name}
                      </h1>
                      <div
                        className={`flex items-center px-3 py-1 rounded-full ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} border`}
                      >
                        <FontAwesomeIcon
                          icon={statusBadge.icon}
                          className="mr-1.5 text-sm"
                        />
                        <span className="font-semibold text-sm capitalize">
                          {data.verificationStatus}
                        </span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold mb-2 ">
                   
                      {/* // price */}
                      <span className="text-gray-900">
                        Price: {  data.price} /-
                      </span>
                    </p>
                    <div className="mt-1 flex items-center text-gray-600">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-blue-500 mr-1.5 text-sm"
                      />
                      <span className="text-sm">
                        {data.city}, {data.state}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {avgRating > 0 && (
                      <div className="flex items-center bg-gradient-to-r from-amber-50 to-amber-100 px-3.5 py-2 rounded-full border border-amber-200">
                        <FontAwesomeIcon
                          icon={faStar}
                          className="text-amber-500 mr-1.5"
                        />
                        <span className="font-bold text-amber-700">
                          {avgRating}
                        </span>
                        <span className="text-amber-600 ml-1 text-sm">
                          ({data.reviews?.items?.length || 0})
                        </span>
                      </div>
                    )}
                    {startingPrice > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-2">
                        <span className="text-lg font-bold text-blue-700">
                          {type === "Hotel"
                            ? `From ₹${startingPrice}`
                            : `₹${startingPrice}/plate`}
                        </span>
                      </div>
                    )}
                    {shouldShowTimer && (
                      <div className="flex items-center px-3.5 py-2 rounded-full bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="mr-1.5 text-orange-500 animate-pulse"
                        />
                        <span className="font-bold text-orange-700">
                          {formatTimeLeft()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                    />
                    <p className="text-gray-700">
                      <span className="font-medium">{data.address}</span>,{" "}
                      {data.city}, {data.state} – {data.pincode}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    About This {type}
                  </h3>
                  <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-xl border border-gray-100">
                    {data.description ||
                      `No description available for this ${type.toLowerCase()}.`}
                  </p>
                </div>

                {isPending && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      verificationStatus: Pending Review
                    </h4>
                    <p className="text-yellow-700 text-sm mb-3">
                      This property is currently under review. Once approved,
                      the 48-hour subscription timer will start.
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:w-72 flex-shrink-0">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-6">
                  <h3 className="font-bold text-gray-800 mb-4 text-center">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={updateProperty}
                      disabled={shouldShowTimer && timeLeft?.expired}
                      className={`w-full flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-xl transition-all shadow hover:shadow-md ${
                        shouldShowTimer && timeLeft?.expired
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white"
                      }`}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      Edit {type}
                    </button>

                    <button
                      onClick={deleteProperty}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow hover:shadow-md"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Subscription verificationStatus Section */}
        <div className="mb-8">
          {hasActiveSub && subscriptionDaysLeft ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className="bg-green-100 p-3 rounded-full">
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="text-green-600 text-xl"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800">
                      Active Subscription
                    </h3>
                    <p className="text-green-700 mt-1">
                      {subscriptionDaysLeft.planName} • Valid for{" "}
                      <strong>{subscriptionDaysLeft.daysLeft} more days</strong>
                      <br />
                      Expires on: {subscriptionDaysLeft.endDate}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={navigateToSubscription}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`rounded-2xl p-6 ${
                shouldShowTimer
                  ? "bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 animate-pulse"
                  : "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div
                    className={`p-3 rounded-full ${
                      shouldShowTimer ? "bg-red-900" : "bg-blue-100"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={shouldShowTimer ? faExclamationTriangle : faClock}
                      className={`text-xl ${
                        shouldShowTimer ? "text-red-600" : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-bold ${
                        shouldShowTimer ? "text-red-700" : "text-blue-800"
                      }`}
                    >
                      {shouldShowTimer
                        ? "⚠️ Subscription Required!"
                        : isPending
                        ? "Pending Activation"
                        : "No Active Subscription"}
                    </h3>
                    <p
                      className={`mt-1 ${
                        shouldShowTimer ? "text-red-700" : "text-blue-700"
                      }`}
                    >
                      {shouldShowTimer
                        ? `Auto-delete in: ${formatTimeLeft()} - Purchase a subscription to keep this property!`
                        : isPending
                        ? "Property is pending approval. Timer will start once activated."
                        : "Purchase a subscription plan to manage this property"}
                    </p>
                    {shouldShowTimer && timeLeft?.startTime && (
                      <p className="text-sm mt-1 opacity-80">
                        Activated on: {timeLeft.startTime}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={navigateToSubscription}
                  className={`px-5 py-3 font-semibold rounded-xl transition-all shadow hover:shadow-md flex items-center gap-2 ${
                    shouldShowTimer
                      ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                      : isPending
                      ? "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  {shouldShowTimer
                    ? "Buy Now - Save Property!"
                    : isPending
                    ? "Activate First"
                    : "Buy Subscription"}
                </button>
              </div>
              {shouldShowTimer && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-700">
                      <FontAwesomeIcon icon={faClock} className="mr-2" />
                      Time Remaining
                    </span>
                    <span className="font-bold text-red-800">
                      {formatTimeLeft()}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000"
                      style={{ width: `${timeLeft.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {type === "Hotel" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Room Types ({property?.rooms?.length || 0})
              </h2>
            </div>

            {(() => {
              const rooms = property?.rooms || [];

              if (rooms.length === 0) {
                return (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon
                        icon={faBed}
                        className="text-blue-600 text-xl"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No Rooms Added
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      This hotel doesn't have any rooms listed yet. Add room
                      types to showcase accommodation options.
                    </p>
                    <button
                      onClick={() =>
                        navigate(`/update/hotel/${HotelAndBanquetDetailsId}`, {
                          state: { openTab: "rooms" },
                        })
                      }
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow hover:shadow-md inline-flex items-center gap-2"
                    >
                      Add Your First Room
                    </button>
                  </div>
                );
              } else {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {property?.rooms?.map((room, index) => {
                      const roomName = room.roomType || `Room ${index + 1}`;
                      const roomImage = room.images?.[0] || DefaultImage;
                      const price = room.price
                        ? `₹${room.price}`
                        : "Price on request";
                      const capacity = room.capacity || "N/A";
                      const amenities = room.amenities?.slice(0, 3) || [];

                      return (
                        <div
                          key={room._id || index}
                          className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2"
                        >
                          {/* Image Container with Overlay */}
                          <div className="relative h-56 overflow-hidden">
                            <img
                              src={roomImage}
                              alt={roomName}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                              onError={(e) =>
                                (e.currentTarget.src = DefaultImage)
                              }
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                            {/* Room Type Badge */}
                            <div className="absolute top-4 left-4">
                              <span className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                                {roomName}
                              </span>
                            </div>

                            {/* Hover Indicator */}
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 animate-pulse">
                                <svg
                                  className="w-6 h-6 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                  ></path>
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Content Area */}
                          <div className="p-6">
                            {/* Title with Icon */}
                            <div className="flex items-center ">
                              <div className="p-2 bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg mr-3">
                                <FontAwesomeIcon
                                  icon={faBed}
                                  className="text-blue-600 text-lg"
                                />
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                {roomName}
                              </h3>
                            </div>
                          </div>

                          {/* Decorative Corner */}
                          <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                            <div className="absolute transform rotate-45 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-xs font-bold py-1 w-24 text-center -right-8 top-4">
                              Room
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }
            })()}
          </div>
        )}

        {/* Event Types Section (Banquet) - FIXED */}
        {type === "Banquet" && banquet?.events && banquet.events.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Event Types ({banquet.events.length})
              </h2>
              <button
                onClick={() =>
                  navigate(`/update/banquet/${HotelAndBanquetDetailsId}`, {
                    state: { openTab: "events" },
                  })
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                + Add Event
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {banquet.events.map((event, index) => {
                const eventName = event.eventType || `Event ${index + 1}`;
                const eventImage =
                  event.images && event.images.length > 0
                    ? event.images[0]
                    : DefaultImage;

                return (
                  <div
                    key={event._id || index}
                    className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                  >
                    {/* Image Container with Gradient Overlay */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={eventImage}
                        alt={eventName}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.currentTarget.src = DefaultImage;
                        }}
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      {/* Event Type Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                          {eventName}
                        </span>
                      </div>

                      {/* View More Indicator */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2"></div>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="bg-white p-6">
                      {/* Title with Icon */}
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg mr-3">
                          <svg
                            className="w-5 h-5 text-purple-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </div>
                        <div className="flex items-center gap-3  justify-between ">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                            {eventName} Event
                          </h3>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* BASE PRICE */}
                       
                        {/* SEASONAL PRICES */}
                       
                      </div>

                      {/* Description */}
                      {event.pricePerPlate && (
                        <p className="text-gray-600 mb-6 line-clamp-3">
                          {event.pricePerPlate}
                        </p>
                      )}

                      {/* Date/Time Info */}
                      {event.createdAt && (
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                          <span>
                            Added:{" "}
                            {new Date(event.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                      <div className="absolute transform rotate-45 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold py-1 w-24 text-center -right-8 top-4">
                        Event
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Contact & Amenities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faPhone} className="mr-2 text-blue-500" />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="text-gray-400 mr-3 w-5 mt-1"
                />
                <div>
                  <div className="text-sm text-gray-500">Primary Contact</div>
                  <div className="font-medium">{data.contactNumber}</div>
                </div>
              </div>
              {data.alternateContact && (
                <div className="flex items-start">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="text-gray-400 mr-3 w-5 mt-1"
                  />
                  <div>
                    <div className="text-sm text-gray-500">
                      Alternate Contact
                    </div>
                    <div className="font-medium">{data.alternateContact}</div>
                  </div>
                </div>
              )}
              <div className="flex items-start">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-gray-400 mr-3 w-5 mt-1"
                />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{data.email}</div>
                </div>
              </div>
              {data.website && (
                <div className="flex items-start">
                  <FontAwesomeIcon
                    icon={faGlobe}
                    className="text-gray-400 mr-3 w-5 mt-1"
                  />
                  <div>
                    <div className="text-sm text-gray-500">Website</div>
                    <a
                      href={
                        data.website.startsWith("http")
                          ? data.website
                          : `https://${data.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-800 break-all"
                    >
                      {data.website}
                    </a>
                  </div>
                </div>
              )}
              {type === "Banquet" && (
                <>
                  {data.capacity && (
                    <div className="flex items-start">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="text-gray-400 mr-3 w-5 mt-1"
                      />
                      <div>
                        <div className="text-sm text-gray-500">Capacity</div>
                        <div className="font-medium">
                          {data.capacity} guests
                        </div>
                      </div>
                    </div>
                  )}
                  {data.hallType && (
                    <div className="flex items-start">
                      <FontAwesomeIcon
                        icon={faRulerCombined}
                        className="text-gray-400 mr-3 w-5 mt-1"
                      />
                      <div>
                        <div className="text-sm text-gray-500">Hall Type</div>
                        <div className="font-medium">{data.hallType}</div>
                      </div>
                    </div>
                  )}
                  {data.pricePerPlate && data.pricePerPlate > 0 && (
                    <div className="flex items-start">
                      <FontAwesomeIcon
                        icon={faUtensils}
                        className="text-gray-400 mr-3 w-5 mt-1"
                      />
                      <div>
                        <div className="text-sm text-gray-500">
                          Price per Plate
                        </div>
                        <div className="font-medium text-green-600">
                          ₹{data.pricePerPlate}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon
                icon={faConciergeBell}
                className="mr-2 text-green-500"
              />
              Amenities & Facilities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {displayAmenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 bg-gray-50 rounded-lg"
                >
                  <FontAwesomeIcon
                    icon={getAmenityIcon(amenity)}
                    className="text-green-500 mr-2 text-sm"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {amenity}
                  </span>
                </div>
              ))}
            </div>
            {data.amenities?.length > 6 && (
              <button
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                {showAllAmenities
                  ? "Show Less"
                  : `Show All (${data.amenities.length})`}
              </button>
            )}
          </div>
        </div>
        {/* Location Map */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="mr-2 text-red-500"
            />
            Location
          </h2>
          <div className="rounded-lg overflow-hidden h-64 md:h-96">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${
                data.location?.coordinates?.[1] || data.latitude || 0
              },${
                data.location?.coordinates?.[0] || data.longitude || 0
              }&hl=en&z=14&output=embed`}
              title="Location Map"
            />
          </div>
        </div>
      </div>

      {/* Subscription Details Modal */}
      {showSubscriptionModal && data.subscriptions?.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
            {/* Decorative elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-50"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-r from-green-100 to-cyan-100 rounded-full opacity-50"></div>

            <div className="relative p-8">
              {/* Header with icon */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Subscription Details
                    </h3>
                    <p className="text-gray-500 mt-1">
                      Manage your current plans
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
                >
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              {/* Subscription Cards */}
              <div className="space-y-6 mb-8">
                {data.subscriptions.map((sub, index) => {
                  const isActive =
                    sub.isActive && new Date(sub.endDate) > new Date();
                  return (
                    <div
                      key={sub._id}
                      className="relative group transform transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative border-2 border-gray-100 rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                        {/* Status ribbon */}
                        <div
                          className={`absolute -top-3 -right-3 px-4 py-1.5 rounded-full shadow-lg transform rotate-3 ${
                            isActive
                              ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                              : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                          }`}
                        >
                          <span className="font-bold text-sm">
                            {isActive ? "🌟 ACTIVE" : "⏰ EXPIRED"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {/* Plan Info */}
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Plan Name
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-lg text-gray-900">
                                {sub.planId?.name || "Basic Plan"}
                              </div>
                            </div>
                          </div>

                          {/* Plan Type */}
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Type
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-gray-800">
                                {sub.planId?.planType || "Monthly"}
                              </div>
                            </div>
                          </div>

                          {/* Validity */}
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Validity
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-semibold">
                                <div className="text-gray-900">
                                  {new Date(sub.startDate).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-gray-600">
                                  to{" "}
                                  {new Date(sub.endDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Amount
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ₹{sub.finalPrice || "0"}
                                <span className="text-sm font-normal text-gray-500 block">
                                  total
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Progress bar for active subscriptions */}
                        {isActive && (
                          <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>Time remaining</span>
                              <span className="font-semibold">
                                {Math.ceil(
                                  (new Date(sub.endDate) - new Date()) /
                                    (1000 * 60 * 60 * 24)
                                )}{" "}
                                days
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((new Date() - new Date(sub.startDate)) /
                                      (new Date(sub.endDate) -
                                        new Date(sub.startDate))) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Need help? Contact our support team
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSubscriptionModal(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    Close
                  </button>
                  <button
                    onClick={navigateToSubscription}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      ></path>
                    </svg>
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetails;
