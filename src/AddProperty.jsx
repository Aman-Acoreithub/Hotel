import React, { useState, useCallback, useEffect, useRef } from "react";
import { showSuccess } from "../src/utils/Toast";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // सिर्फ redirect के लिए
import "./AddProperty.css";

const baseurl = "https://hotel-banquet.nearprop.in";
const GOOGLE_MAPS_API_KEY = "AIzaSyAepBinSy2JxyEvbidFz_AnFYFsFlFqQo4";

// Google Maps Location Picker Component (बिल्कुल वैसा ही)
const GoogleMapLocationPicker = ({
  latitude,
  longitude,
  onLocationChange,
  isVisible = true,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoading(false);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoading(false);
    };

    script.onerror = () => {
      setError("Failed to load Google Maps");
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoading || error || !window.google || !mapRef.current || !isVisible)
      return;

    const defaultLat = parseFloat(latitude) || 22.7196;
    const defaultLng = parseFloat(longitude) || 75.8577;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: defaultLat, lng: defaultLng },
      zoom: 13,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;

    const marker = new window.google.maps.Marker({
      position: { lat: defaultLat, lng: defaultLng },
      map: map,
      draggable: true,
      title: "Property Location",
    });

    markerRef.current = marker;

    marker.addListener("dragend", () => {
      const position = marker.getPosition();
      const lat = position.lat();
      const lng = position.lng();
      onLocationChange(lat.toFixed(6), lng.toFixed(6));
    });

    map.addListener("click", (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      marker.setPosition({ lat, lng });
      onLocationChange(lat.toFixed(6), lng.toFixed(6));
    });

    const searchInput = document.getElementById("map-search-input");
    if (searchInput) {
      const searchBox = new window.google.maps.places.SearchBox(searchInput);

      map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
      });

      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;

        const place = places[0];
        if (!place.geometry || !place.geometry.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        map.setCenter({ lat, lng });
        map.setZoom(15);
        marker.setPosition({ lat, lng });
        onLocationChange(lat.toFixed(6), lng.toFixed(6));
      });
    }
  }, [isLoading, error, latitude, longitude, onLocationChange, isVisible]);

  useEffect(() => {
    if (!markerRef.current || !mapInstanceRef.current) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      const newPosition = { lat, lng };
      markerRef.current.setPosition(newPosition);
      mapInstanceRef.current.setCenter(newPosition);
    }
  }, [latitude, longitude]);

  if (!isVisible) return null;

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          border: "1px solid #dc3545",
          borderRadius: "8px",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          textAlign: "center",
        }}
      >
        <strong>Map Error:</strong> {error}
      </div>
    );
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <label
          style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}
        >
          Search Location
        </label>
        <input
          id="map-search-input"
          type="text"
          placeholder="Search for a location..."
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            fontSize: "14px",
          }}
        />
      </div>

      {isLoading ? (
        <div
          style={{
            height: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "8px",
          }}
        >
          <div>Loading Google Maps...</div>
        </div>
      ) : (
        <div
          ref={mapRef}
          style={{
            height: "400px",
            width: "100%",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        />
      )}

      <div
        style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "#e9ecef",
          borderRadius: "5px",
          fontSize: "12px",
          color: "#495057",
        }}
      >
        <strong>Instructions:</strong> Click anywhere on the map or drag the red
        marker to set the location. You can also search for a specific address
        using the search box above.
      </div>
    </div>
  );
};

const AddProperty = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [propertyType, setPropertyType] = useState("Hotel");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [showStates, setShowStates] = useState(false);
  const [searchState, setSearchState] = useState("");
  const [cities, setCities] = useState([]); // ✅ MUST be []
  const [showCities, setShowCities] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  // Hotel
  const [hotelRooms, setHotelRooms] = useState([]);
  const [selectedHotelRoomType, setSelectedHotelRoomType] = useState("");

  // Banquet
  const [banquetEvents, setBanquetEvents] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState("");

  const fetchCitiesByState = async (selectedState) => {
    try {
      const res = await fetch(
        "https://api.nearprop.com/api/property-districts"
      );
      const data = await res.json();

      const filteredCities = Array.isArray(data)
        ? data.filter(
            (item) =>
              item?.state?.trim().toLowerCase() ===
              selectedState.trim().toLowerCase()
          )
        : [];

      setCities(filteredCities); // ✅ KEEP FULL OBJECT
      setShowCities(true);
    } catch (error) {
      console.error("City fetch error:", error);
      setCities([]);
      setShowCities(false);
    }
  };

  const addBanquetEvent = () => {
    if (!selectedEventType) return;

    const exists = banquetEvents.some((e) => e.eventType === selectedEventType);
    if (exists) return;

    setBanquetEvents([
      ...banquetEvents,
      {
        eventType: selectedEventType,
        images: [],
      },
    ]);

    setSelectedEventType("");
  };

  const handleBanquetImages = (index, files) => {
    setBanquetEvents((prev) =>
      prev.map((event, i) =>
        i === index ? { ...event, images: Array.from(files) } : event
      )
    );
  };

  useEffect(() => {
    if (propertyType === "Hotel") {
      setBanquetEvents([]);
      setSelectedEventType("");
    } else {
      setHotelRooms([]);
      setSelectedHotelRoomType("");
    }
  }, [propertyType]);
  const removeBanquetEvent = (index) => {
    setBanquetEvents(banquetEvents.filter((_, i) => i !== index));
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    state: "",
    city: "",
    pinCode: "",
    latitude: "",
    longitude: "",
    contactNumber: "",
    alternateContact: "",
    email: "",
    website: "",
    amenities: [],

    // Hotel
    type: "Hotel",
    registrationNumber: "",
    gst: "",

    // Banquet
    gstNumber: "",
    hallType: "",
    capacity: "",
    pricePerEvent: "",
    pricePerPlate: "",

    // Files
    images: [],
    businessLicense: [],
  });

  const addHotelRoom = () => {
    if (!selectedHotelRoomType) return;

    const exists = hotelRooms.some(
      (room) => room.roomType === selectedHotelRoomType
    );
    if (exists) return;

    setHotelRooms([
      ...hotelRooms,
      {
        roomType: selectedHotelRoomType,
        images: [],
      },
    ]);

    setSelectedHotelRoomType("");
  };

  const handleHotelImages = (index, files) => {
    setHotelRooms((prev) =>
      prev.map((room, i) =>
        i === index ? { ...room, images: Array.from(files) } : room
      )
    );
  };

  const removeHotelRoom = (index) => {
    setHotelRooms(hotelRooms.filter((_, i) => i !== index));
  };

  const amenityOptions = [
    "WiFi",
    "Parking",
    "AC",
    "Swimming Pool",
    "Gym",
    "Restaurant",
    "Room Service",
    "Laundry",
    "Conference Room",
    "Spa",
    "Bar",
    "Garden",
    "Balcony",
    "Kitchen",
    "Elevator",
    "Security",
  ];

  const eventTypeOptions = [
    "wedding",
    "conference",
    "birthday",
    "anniversary",
    "corporate",
    "other",
  ];
  const cateringOptionsList = ["veg", "non-veg", "both"];

  const handleLocationChange = useCallback((lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
    setErrors((prev) => ({
      ...prev,
      latitude: undefined,
      longitude: undefined,
    }));
  }, []);

  // Validation - सिर्फ required fields check
  const validateCurrentStep = () => {
    const newErrors = {};

    // STEP 1 – BASIC INFO
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.city.trim()) newErrors.city = "District is required";
      if (!formData.pinCode.trim()) newErrors.pinCode = "Pin Code is required";
      if (!formData.latitude.trim())
        newErrors.latitude = "Latitude is required";
      if (!formData.longitude.trim())
        newErrors.longitude = "Longitude is required";
      if (!formData.contactNumber.trim())
        newErrors.contactNumber = "Contact number is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";

      if (propertyType === "Hotel" && !formData.registrationNumber.trim()) {
        newErrors.registrationNumber = "Registration number is required";
      }

      if (propertyType === "Banquet" && !formData.gstNumber.trim()) {
        newErrors.gstNumber = "GST number is required";
      }
    }

    // STEP 2 – FINAL STEP
    if (currentStep === 2) {
      if (propertyType === "Hotel") {
        if (hotelRooms.length === 0) {
          newErrors.rooms = "Please add at least one room type";
        }

        if (!formData.images || formData.images.length === 0) {
          newErrors.images = "Property images are required";
        }
      }

      if (propertyType === "Banquet") {
        if (banquetEvents.length === 0) {
          newErrors.events = "Please add at least one event type";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleChange = useCallback(
  //   (e) => {
  //     const { name, value, files, type, checked } = e.target;

  //     setFormData((prev) => {
  //       if (name === "images" || name === "businessLicense") {
  //         return { ...prev, [name]: files };
  //       } else if (type === "checkbox") {
  //         if (
  //           name === "amenities" ||
  //           name === "eventTypes" ||
  //           name === "cateringOptions"
  //         ) {
  //           const updatedArray = checked
  //             ? [...prev[name], value]
  //             : prev[name].filter((item) => item !== value);
  //           return { ...prev, [name]: updatedArray };
  //         } else {
  //           return { ...prev, [name]: checked };
  //         }
  //       } else {
  //         return { ...prev, [name]: value };
  //       }
  //     });

  //     // Clear error when user types
  //     if (errors[name]) {
  //       setErrors((prev) => ({ ...prev, [name]: undefined }));
  //     }
  //     if (name === "eventTypes")
  //       setErrors((prev) => ({ ...prev, eventTypes: undefined }));
  //     if (name === "cateringOptions")
  //       setErrors((prev) => ({ ...prev, cateringOptions: undefined }));
  //   },
  //   [errors]
  // );
  const handleChange = useCallback(
    (e) => {
      const { name, value, files, type, checked } = e.target;

      setFormData((prev) => {
        if (name === "images" || name === "businessLicense") {
          return { ...prev, [name]: files };
        }

        if (name === "amenities" && type === "checkbox") {
          const updated = checked
            ? [...prev.amenities, value]
            : prev.amenities.filter((a) => a !== value);
          return { ...prev, amenities: updated };
        }

        return { ...prev, [name]: value };
      });

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  const nextStep = useCallback(
    (e) => {
      e.preventDefault();
      if (validateCurrentStep()) {
        setCurrentStep((prev) => Math.min(prev + 1, 2));
      }
    },
    [currentStep, formData, propertyType]
  );

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      hotelType: "Hotel",
      city: "",
      state: "",
      district: "",
      pincode: "",
      latitude: "",
      longitude: "",
      contactNumber: "",
      alternateContact: "",
      email: "",
      website: "",
      address: "",
      registrationNumber: "",
      gstNumber: "",
      amenities: [],
      rooms: [],
      images: null,
      videos: null,
      gst: null,
      businessLicense: null,
    });
    // setRooms([]);
    // setSelectedRoomType("");
    setCurrentStep(1);
    setErrors({});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation on submit
    if (!validateCurrentStep()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Token not found. Please login again.");
        setLoading(false);
        return;
      }

      const hasFiles =
        propertyType === "Banquet" || // ✅ FORCE FormData
        (formData.images && formData.images.length > 0) ||
        (propertyType === "Hotel" &&
          formData.businessLicense &&
          formData.businessLicense.length > 0);

      let requestData;
      let headers = {
        Authorization: `Bearer ${token}`,
      };

      if (hasFiles) {
        requestData = new FormData();

        const commonFields = {
          name: formData.name,
          description: formData.description,
          city: formData.city,
          state: formData.state,
          // districtId: formData.districtId,
          pincode: formData.pinCode,
          address: formData.address,
          contactNumber: formData.contactNumber,
          alternateContact: formData.alternateContact,
          email: formData.email,
          website: formData.website,
        };

        Object.entries(commonFields).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            requestData.append(key, value);
          }
        });

        if (
          formData.latitude.trim() !== "" &&
          formData.longitude.trim() !== ""
        ) {
          requestData.append("latitude", parseFloat(formData.latitude));
          requestData.append("longitude", parseFloat(formData.longitude));

          if (propertyType === "Banquet") {
            const location = {
              type: "Point",
              coordinates: [
                parseFloat(formData.longitude),
                parseFloat(formData.latitude),
              ],
            };
            requestData.append("location", JSON.stringify(location));
          }
        }

        if (propertyType === "Hotel") {
          // ===============================
          // BASIC HOTEL FIELDS
          // ===============================
          const hotelFields = {
            type: formData.type,
            registrationNumber: formData.registrationNumber,
            gst: formData.gst,
          };

          Object.entries(hotelFields).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
              requestData.append(key, value);
            }
          });

          // ===============================
          // ✅ HOTEL ROOMS (ROOM TYPES)
          // ===============================
          if (hotelRooms && hotelRooms.length > 0) {
            const roomsPayload = hotelRooms.map((room) => ({
              roomType: room.roomType,
            }));

            requestData.append("rooms", JSON.stringify(roomsPayload));
          }

          // ===============================
          // ✅ ROOM IMAGES (PER ROOM)
          // ===============================
          hotelRooms.forEach((room, index) => {
            if (room.images && room.images.length > 0) {
              room.images.forEach((file) => {
                requestData.append(`roomImages[${index}]`, file);
              });
            }
          });

          // ===============================
          // BUSINESS LICENSE FILES
          // ===============================
          if (formData.businessLicense && formData.businessLicense.length > 0) {
            Array.from(formData.businessLicense).forEach((file) => {
              requestData.append("businessLicense", file);
            });
          }
        } else if (propertyType === "Banquet") {
          const banquetFields = {
            gstNumber: formData.gstNumber,
            hallType: formData.hallType || "indoor",
          };

          Object.entries(banquetFields).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
              requestData.append(key, value);
            }
          });

          //   if (propertyType === "Banquet") {
          //     requestData.append("events", JSON.stringify(formData.eventTypes));
          //   }
        }
        // ===============================
        // ✅ BANQUET EVENTS (FIXED)
        // ===============================
        if (propertyType === "Banquet") {
          if (!Array.isArray(banquetEvents) || banquetEvents.length === 0) {
            throw new Error("At least one event is required for Banquet");
          }

          const eventsPayload = banquetEvents.map((event) => ({
            eventType: event.eventType,
          }));

          // ✅ THIS LINE WAS MISSING
          requestData.append("events", JSON.stringify(eventsPayload));
        }

        if (formData.amenities.length > 0) {
          requestData.append("amenities", JSON.stringify(formData.amenities));
        }

        if (formData.images && formData.images.length > 0) {
          Array.from(formData.images).forEach((file) => {
            requestData.append("images", file);
          });
        }
      } else {
        headers["Content-Type"] = "application/json";

        requestData = {
          name: formData.name,
          description: formData.description,
          city: formData.city,
          state: formData.state,
          // districtId: formData.districtId,
          pincode: formData.pinCode,
          address: formData.address,
          contactNumber: formData.contactNumber,
          alternateContact: formData.alternateContact,
          email: formData.email,
          website: formData.website,
          amenities: formData.amenities,
        };

        if (
          formData.latitude.trim() !== "" &&
          formData.longitude.trim() !== ""
        ) {
          requestData.latitude = parseFloat(formData.latitude);
          requestData.longitude = parseFloat(formData.longitude);

          if (propertyType === "Banquet") {
            requestData.location = {
              type: "Point",
              coordinates: [
                parseFloat(formData.longitude),
                parseFloat(formData.latitude),
              ],
            };
          }
        }

        if (propertyType === "Hotel") {
          requestData = {
            ...requestData,
            type: formData.type,
            registrationNumber: formData.registrationNumber,
            gst: formData.gst,
          };
        } else if (propertyType === "Banquet") {
          requestData = {
            ...requestData,

            hallType: formData.hallType || "indoor",

            // eventTypes: formData.eventTypes,
          };
        }
      }

      const url =
        propertyType === "Hotel"
          ? `${baseurl}/api/hotels`
          : `${baseurl}/api/banquet-halls`;

      const config = {
        method: "post",
        url,
        data: requestData,
        headers,
        timeout: 30000,
      };

      if (hasFiles) {
        config.headers["Content-Type"] = "multipart/form-data";
      }

      const res = await axios(config);

      showSuccess(res.data.message || `${propertyType} created successfully!`);

      navigate("/hb"); // Success पर redirect
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Failed to save property. ";

      if (error.code === "ECONNABORTED") {
        errorMessage =
          "Request timeout. Please check your internet connection and try again.";
      } else if (error.response?.status === 0 || !error.response) {
        errorMessage =
          "Network error. Please check if the server is running and accessible.";
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response?.data?.message ||
          "Invalid data provided. Please check your inputs.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.status === 403) {
        errorMessage =
          "Access denied. You may not have permission to perform this action.";
      } else if (error.response?.status === 500) {
        errorMessage =
          "Server error. Please try again later or contact support.";
      } else {
        errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          errorMessage;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
  ];

  const EventsTypes = [
    "Wedding",
    "Reception",
    "Engagement",
    "Ring Ceremony",
    "Birthday Party",
    "Cocktail Party",
    "Anniversary",
    "Corporate Event",
    "Conference / Seminar",
    "Get-together",
  ];

  const roomTypes = [
    "Standard",
    "Deluxe",
    "Premium",
    "Executive",
    "Royal",
    "Grand",
    "Luxury",
    "Platinum",
    "Elite",
    "Presidential",
  ];

  // const addRoom = () => {
  //   if (!selectedRoomType) return;

  //   const exists = rooms.some((room) => room.roomType === selectedRoomType);
  //   if (exists) return;

  //   setRooms([
  //     ...rooms,
  //     {
  //       roomType: selectedRoomType,
  //       images: [],
  //     },
  //   ]);

  //   setSelectedRoomType("");
  // };

  // const handleImages = (index, files) => {
  //   const updatedRooms = [...rooms];
  //   updatedRooms[index].images = Array.from(files);
  //   setRooms(updatedRooms);
  // };

  // const removeRoom = (index) => {
  //   setRooms(rooms.filter((_, i) => i !== index));
  // };

  const renderFormError = (fieldName) => {
    return errors[fieldName] ? (
      <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
        {errors[fieldName]}
      </div>
    ) : null;
  };

  return (
    <>
      <div className="add-properties">
        <h1 className="my-title">Add Properties</h1>
      </div>
      <div className="propertybody">
        <div className="property-container">
          <div className="form-tabs">
            <div className="tab-buttons">
              <button
                type="button"
                className="tab-button"
                onClick={() => setPropertyType("Hotel")}
                style={{
                  background: propertyType === "Hotel" ? "darkcyan" : "#f0f0f0",
                  color: propertyType === "Hotel" ? "#fff" : "#1e2a44",
                  padding: "10px 20px",
                  borderRadius: "10px 0 0 10px",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                Hotel
              </button>
              <button
                type="button"
                className="tab-button"
                onClick={() => setPropertyType("Banquet")}
                style={{
                  background:
                    propertyType === "Banquet" ? "darkcyan" : "#f0f0f0",
                  color: propertyType === "Banquet" ? "#fff" : "#1e2a44",
                  padding: "10px 20px",
                  borderRadius: "0 10px 10px 0",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                Banquet
              </button>
            </div>

            <div className="chain-container">
              <div className="chain-link">
                <div
                  className={`circle ${currentStep === 1 ? "active" : ""}`}
                  onClick={() => goToStep(1)}
                  style={{ cursor: "pointer" }}
                >
                  1
                </div>
                <div
                  className={`chain chain-1 ${currentStep > 1 ? "active" : ""}`}
                ></div>
              </div>
              <div className="chain-link">
                <div
                  className={`circle ${currentStep === 2 ? "active" : ""}`}
                  onClick={() => goToStep(2)}
                  style={{ cursor: "pointer" }}
                >
                  2
                </div>
              </div>
            </div>
          </div>

          <form className="property-form" onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="form-section">
                <h2>{propertyType} Basic Information</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter name"
                    />
                    {renderFormError("name")}
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete address"
                    rows="2"
                  />
                  {renderFormError("address")}
                </div>

                <div className="form-row">
                  <div className="form-group state-select">
                    <label>State *</label>

                    <input
                      type="text"
                      value={formData.state}
                      placeholder="Select state"
                      className="state-input"
                      onClick={() => setShowStates(true)}
                      onChange={(e) => {
                        setSearchState(e.target.value);
                        setFormData({
                          ...formData,
                          state: e.target.value,
                          city: "",
                        });
                        setShowStates(true);
                      }}
                    />

                    {showStates && (
                      <div className="state-dropdown">
                        {states
                          .filter((s) =>
                            s.toLowerCase().includes(searchState.toLowerCase())
                          )
                          .map((state, index) => (
                            <div
                              key={index}
                              className="state-option"
                              onClick={() => {
                                setFormData({ ...formData, state, city: "" });
                                setSearchState(""); // ✅ RESET
                                setShowStates(false); // ✅ CLOSE
                                fetchCitiesByState(state); // ✅ API CALL
                              }}
                            >
                              {state}
                            </div>
                          ))}
                      </div>
                    )}
                    {renderFormError("state")}
                  </div>
                  <div>
                    <div className="form-group state-select">
                      <label>District *</label>

                      <input
                        type="text"
                        value={formData.city || ""}
                        placeholder={
                          formData.state
                            ? "Select district"
                            : "Select state first"
                        }
                        className="state-input"
                        disabled={!formData.state}
                        onClick={() => {
                          if (Array.isArray(cities) && cities.length > 0) {
                            setShowCities(true);
                          }
                        }}
                        onChange={(e) => {
                          setSearchCity(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            city: e.target.value,
                            pinCode: "", // reset pin while typing
                          }));
                          setShowCities(true);
                        }}
                      />

                      {showCities && cities.length > 0 && (
                        <div className="state-dropdown">
                          {cities
                            .filter((item) =>
                              item.city
                                .toLowerCase()
                                .includes(searchCity.toLowerCase())
                            )
                            .map((item, index) => (
                              <div
                                key={index}
                                className="state-option"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    city: item.city,
                                    pinCode: String(item.pincode), // ✅ AUTO PIN CODE
                                  }));
                                  setSearchCity("");
                                  setShowCities(false);
                                }}
                              >
                                {item.city}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    {renderFormError("city")}
                  </div>

                  <div className="form-group">
                    <label>Pin Code *</label>
                    <input
                      type="text"
                      name="pinCode"
                      value={formData.pinCode}
                      placeholder="Auto selected"
                      onChange={handleChange}
                    />
                    {renderFormError("pinCode")}
                  </div>
                  {/* <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="districtId"
                        value={formData.districtId}
                        onChange={handleChange}
                        placeholder="Enter district ID"
                      />
                      {renderFormError("districtId")}
                    </div>
                  </div> */}
                </div>

                <div className="form-group" style={{ marginTop: "20px" }}>
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: showMap ? "#dc3545" : "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      marginBottom: "15px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>
                      {showMap ? "🗺️ Hide Map" : "📍 Select Location on Map"}
                    </span>
                  </button>

                  <GoogleMapLocationPicker
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onLocationChange={handleLocationChange}
                    isVisible={showMap}
                  />

                  {formData.latitude && formData.longitude && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "12px",
                        backgroundColor: "#d1ecf1",
                        border: "1px solid #bee5eb",
                        borderRadius: "6px",
                        fontSize: "13px",
                        color: "#0c5460",
                      }}
                    >
                      <strong>Selected Coordinates:</strong>
                      <br />
                      Latitude: {formData.latitude}
                      <br />
                      Longitude: {formData.longitude}
                    </div>
                  )}

                  <div className="form-group">
                    <label>Latitude *</label>
                    <input
                      type="number"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="Enter latitude"
                      step="any"
                    />
                    {renderFormError("latitude")}
                  </div>
                  <div className="form-group">
                    <label>Longitude *</label>
                    <input
                      type="number"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="Enter longitude"
                      step="any"
                    />
                    {renderFormError("longitude")}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Number *</label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="Enter contact number"
                    />
                    {renderFormError("contactNumber")}
                  </div>
                  <div className="form-group">
                    <label>Alternate Contact</label>
                    <input
                      type="tel"
                      name="alternateContact"
                      value={formData.alternateContact}
                      onChange={handleChange}
                      placeholder="Enter alternate contact"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      className="text-gray-500"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                    />
                    {renderFormError("email")}
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="Enter website URL"
                    />
                  </div>
                </div>
                {propertyType === "Hotel" && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                      >
                        <option value="Hotel">Hotel</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Registration Number *</label>
                      <input
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        placeholder="Enter registration number"
                      />
                      {renderFormError("registrationNumber")}
                    </div>
                    <div className="form-group">
                      <label>GST Number</label>
                      <input
                        type="text"
                        name="gst"
                        value={formData.gst}
                        onChange={handleChange}
                        placeholder="Enter GST number"
                      />
                    </div>
                  </div>
                )}
                {propertyType === "Banquet" && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>GST Number *</label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        placeholder="Enter GST number"
                      />
                      {renderFormError("gstNumber")}
                    </div>
                    <div className="form-group">
                      <label>Hall Type</label>
                      <select
                        name="hallType"
                        value={formData.hallType}
                        onChange={handleChange}
                      >
                        <option value="">Select type</option>
                        <option value="indoor">Indoor</option>
                        <option value="outdoor">Outdoor</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Amenities</label>
                  <div
                    className="checkbox-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    {amenityOptions.map((amenity) => (
                      <label
                        key={amenity}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="checkbox"
                          name="amenities"
                          value={amenity}
                          checked={formData.amenities.includes(amenity)}
                          onChange={handleChange}
                        />
                        <span>{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && propertyType === "Hotel" && (
              <div className="form-section">
                <h2>Hotel Capacity & Details</h2>
                <div className="room-types-wrapper gap-2">
                  <label>Room Types *</label>

                 <div className="form-section">
 

  {/* Select Room */}
  <div className="flex items-center gap-3 mb-6">
    <select
      value={selectedHotelRoomType}
      onChange={(e) => setSelectedHotelRoomType(e.target.value)}
      className="w-1/2 rounded-xl text-[#008b8b] font-semibold border mt-2 border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500"
    >
      <option value="">Select room type</option>
      {roomTypes.map((type) => (
        <option key={type} value={type}>
          {type}
        </option>
      ))}
    </select>

    <button
      type="button"
      onClick={addHotelRoom}
      className="rounded-xl bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700"
    >
      + Add Room
    </button>
  </div>

  {/* Room Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {hotelRooms.map((room, index) => (
      <div
        key={index}
        className="relative rounded-2xl mb-5 w-70 bg-white shadow-md  transition overflow-hidden"
      >
        {/* Remove Button */}
        <button
          type="button"
          onClick={() => removeHotelRoom(index)}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 text-white font-bold hover:bg-red-600"
        >
          ×
        </button>

        {/* Image Preview */}
        <div className="h-30  bg-gray-100 flex items-center justify-center">
          {room.images?.length > 0 ? (
            <img
              src={URL.createObjectURL(room.images[0])}
              alt={room.roomType}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-sm">
              No Room Image
            </span>
          )}
        </div>

        {/* Card Content */}
        <div className=" text-center">
          <h3 className="text-lg font-bold text-gray-800 ">
            {room.roomType}
          </h3>

          <label className="block">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                handleHotelImages(index, e.target.files)
              }
              className="
                w-full  rounded-lg border border-gray-300
                bg-white  text-sm text-gray-600
                file:mr-3 file:rounded-lg file:border-0
                file:bg-teal-600 file:px-4 file:py-2
                file:text-sm file:font-semibold file:text-white
                hover:file:bg-teal-700
              "
            />
          </label>

          {room.images?.length > 0 && (
            <p className="mb-2 text-xs text-gray-500">
              {room.images.length} image(s) selected
            </p>
          )}
        </div>
      </div>
    ))}
  </div>
</div>



                </div>

                <div className="form-section">
                  {/* <h2>Upload Documents & Images</h2> */}
                  <div className="form-group">
                    <label>Property Images</label>
                    <input
                      type="file"
                      name="images"
                      onChange={handleChange}
                      className="  w-full mt-2  rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 
   focus:outline-none focus:ring-2 focus:ring-teal-500 file:mr-4 file:rounded-lg  file:border-0 file:bg-teal-600 file:px-4 file:py-2
 file:text-sm file:font-semibold file:text-white "
                      multiple
                      accept="image/*"
                    />
                    <small style={{ color: "#666", fontSize: "12px" }}>
                      You can select multiple images. Supported formats: JPG,
                      PNG, WebP
                    </small>
                    {formData.images && formData.images.length > 0 && (
                      <div style={{ marginTop: "8px", color: "#007bff" }}>
                        {formData.images.length} file(s) selected
                      </div>
                    )}
                  </div>
                  {propertyType === "Hotel" && (
                    <div className="form-group">
                      <label>Business License Documents</label>
                      <input
                        type="file"
                        name="businessLicense"
                        onChange={handleChange}
                        multiple
                        className=" w-full  rounded-lg border border-gray-300
                bg-white  text-sm text-gray-600
                file:mr-3 file:rounded-lg file:border-0
                file:bg-teal-600 file:px-4 file:py-2
                file:text-sm file:font-semibold file:text-white
                hover:file:bg-teal-700 "
                        accept=".pdf,image/*"
                      />
                      <small style={{ color: "#666", fontSize: "12px" }}>
                        Upload business license, registration documents, etc.
                        Supported formats: PDF, JPG, PNG
                      </small>
                      {formData.businessLicense &&
                        formData.businessLicense.length > 0 && (
                          <div style={{ marginTop: "8px", color: "#007bff" }}>
                            {formData.businessLicense.length} file(s) selected
                          </div>
                        )}
                    </div>
                  )}
                  <div
                    className="form-summary"
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "20px",
                      borderRadius: "8px",
                      marginTop: "20px",
                    }}
                  >
                    <h3>Property Summary</h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            color: "#008b8b",
                            fontSize: "18px",
                            textTransform: "uppercase",
                            fontFamily: "Courier, monospace",
                          }}
                        >
                          Name:
                        </strong>{" "}
                        {formData.name || "Not provided"}
                      </div>
                      <div>
                        <strong
                          style={{
                            color: "#008b8b",
                            fontSize: "18px",
                            textTransform: "uppercase",
                            fontFamily: "Courier, monospace",
                          }}
                        >
                          Type:
                        </strong>{" "}
                        {propertyType}{" "}
                        {propertyType === "Hotel" ? `(${formData.type})` : ""}
                      </div>
                      <div>
                        <strong
                          style={{
                            color: "#008b8b",
                            fontSize: "18px",
                            textTransform: "uppercase",
                            fontFamily: "Courier, monospace",
                          }}
                        >
                          City:
                        </strong>{" "}
                        {formData.city || "Not provided"}
                      </div>
                      <div>
                        <strong
                          style={{
                            color: "#008b8b",
                            fontSize: "18px",
                            textTransform: "uppercase",
                            fontFamily: "Courier, monospace",
                          }}
                        >
                          Contact:
                        </strong>{" "}
                        {formData.contactNumber || "Not provided"}
                      </div>
                      {propertyType === "Hotel" && (
                        <>
                          {/* <div>
                          <strong
                            style={{
                              color: "#008b8b",
                              fontSize: "18px",
                              textTransform: "uppercase",
                              fontFamily: "Courier, monospace",
                            }}
                          >
                            Total Rooms:
                          </strong>{" "}
                          {formData.totalRooms || "Not provided"}
                        </div> */}
                          {/* <div>
                          <strong
                            style={{
                              color: "#008b8b",
                              fontSize: "18px",
                              textTransform: "uppercase",
                              fontFamily: "Courier, monospace",
                            }}
                          >
                            Total Beds:
                          </strong>{" "}
                          {formData.totalBeds || "Not provided"}
                        </div> */}
                        </>
                      )}
                      {propertyType === "Banquet" && (
                        <>
                          <div>
                            <strong
                              style={{
                                color: "#008b8b",
                                fontSize: "18px",
                                textTransform: "uppercase",
                                fontFamily: "Courier, monospace",
                              }}
                            >
                              Capacity:
                            </strong>{" "}
                            {formData.capacity || "Not provided"}
                          </div>
                          <div>
                            <strong
                              style={{
                                color: "#008b8b",
                                fontSize: "18px",
                                textTransform: "uppercase",
                                fontFamily: "Courier, monospace",
                              }}
                            >
                              Price Per Event:
                            </strong>{" "}
                            ₹{formData.pricePerEvent || "Not provided"}
                          </div>
                        </>
                      )}
                      {/* <div>
                      <strong
                        style={{
                          color: "#008b8b",
                          fontSize: "18px",
                          textTransform: "uppercase",
                          fontFamily: "Courier, monospace",
                        }}
                      >
                        Amenities:
                      </strong>{" "}
                      {formData.amenities.length} selected
                    </div> */}
                      <div>
                        <strong
                          style={{
                            color: "#008b8b",
                            fontSize: "18px",
                            textTransform: "uppercase",
                            fontFamily: "Courier, monospace",
                          }}
                        >
                          Location:
                        </strong>{" "}
                        {formData.latitude && formData.longitude
                          ? `${formData.latitude}, ${formData.longitude}`
                          : "Not provided"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && propertyType === "Banquet" && (
              <div className="form-section ">
                <div className="room-types-wrapper">
                  <div className="form-section">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      Banquet Event Types
                    </h2>

                    {/* Select Event */}
                    <div className="flex items-center gap-3 mb-6">
                      <select
                        value={selectedEventType}
                        onChange={(e) => setSelectedEventType(e.target.value)}
                        className="w-1/2 rounded-xl border text-[#008b8b] font-semibold border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select event type</option>
                        {EventsTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={addBanquetEvent}
                        className="rounded-xl bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                      >
                        + Add Event
                      </button>
                    </div>

                    {/* Event Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {banquetEvents.map((event, index) => (
                        <div
                          key={index}
                          className="relative rounded-2xl bg-white shadow-md hover:shadow-xl transition overflow-hidden"
                        >
                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeBanquetEvent(index)}
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 text-white font-bold hover:bg-red-600"
                          >
                            ×
                          </button>

                          {/* Image Preview */}
                          <div className="h-30 bg-gray-100 flex items-center justify-center">
                            {event.images?.length > 0 ? (
                              <img
                                src={URL.createObjectURL(event.images[0])}
                                alt={event.eventType}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-400 text-sm">
                                No Image Selected
                              </span>
                            )}
                          </div>

                          {/* Card Content */}
                          <div className=" text-center">
                            <h3 className="text-lg font-bold text-gray-800 ">
                              {event.eventType}
                            </h3>

                            <label className="block">
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) =>
                                  handleBanquetImages(index, e.target.files)
                                }
                                className="
                w-full cursor-pointer rounded-lg border border-gray-300
                bg-white px-3 py-2 text-sm text-gray-600
                file:mr-3 file:rounded-lg file:border-0
                file:bg-teal-600 file:px-4 file:py-2
                file:text-sm file:font-semibold file:text-white
                hover:file:bg-teal-700
              "
                              />
                            </label>

                            {event.images?.length > 0 && (
                              <p className="p-1 text-xs text-gray-500">
                                {event.images.length} image(s) selected
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-section mt-5">
                  {/* <h2>Upload Documents & Images</h2> */}
                  <div className="form-group">
                    <label className="text-lg">Banquet Images</label>
                    <input
                      type="file"
                      name="images" // ✅ THIS LINE WAS MISSING
                      multiple
                      accept="image/*"
                      onChange={handleChange}
                      className="
    w-full  cursor-pointer rounded-xl
    border border-gray-300 bg-white
    px-3 py-2 text-sm text-gray-600
    shadow-sm transition
    hover:border-teal-500 hover:shadow-md
    focus:outline-none focus:ring-2 focus:ring-teal-500

    file:mr-4
    file:rounded-lg
    file:border-0
    file:bg-teal-600
    file:px-4 file:py-2
    file:text-sm file:font-semibold
    file:text-white
    hover:file:bg-teal-700
  "
                    />
                    <small style={{ color: "#666", fontSize: "12px" }}>
                      You can select multiple images. Supported formats: JPG,
                      PNG, WebP
                    </small>
                    {formData.images && formData.images.length > 0 && (
                      <div style={{ marginTop: "8px", color: "#007bff" }}>
                        {formData.images.length} file(s) selected
                      </div>
                    )}
                  </div>
                  {propertyType === "Hotel" && (
                    <div className="form-group">
                      <label>Business License Documents</label>
                      <input
                        type="file"
                        name="businessLicense"
                        onChange={handleChange}
                        multiple
                        accept=".pdf,image/*"
                      />
                      <small style={{ color: "#666", fontSize: "12px" }}>
                        Upload business license, registration documents, etc.
                        Supported formats: PDF, JPG, PNG
                      </small>
                      {formData.businessLicense &&
                        formData.businessLicense.length > 0 && (
                          <div style={{ marginTop: "8px", color: "#007bff" }}>
                            {formData.businessLicense.length} file(s) selected
                          </div>
                        )}
                    </div>
                  )}
                  <div
                    className="form-summary"
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "20px",
                      borderRadius: "8px",
                      marginTop: "20px",
                    }}
                  >
                    <h3>Property Summary</h3>
                    <div
                      // style={{
                      //   display: "",
                      //   gridTemplateColumns:
                      //     "repeat(auto-fit, minmax(200px, 1fr))",
                      //   gap: "10px",
                      // }}
                      className="grid grid-cols-5"
                    >
                      <div>
                        <strong
                          style={{
                            color: "#008b8b",
                            fontSize: "18px",
                            textTransform: "uppercase",
                            fontFamily: "Courier, monospace",
                          }}
                        >
                          Name:
                        </strong>{" "}
                        {formData.name || "Not provided"}
                      </div>
                      <div>
                        <strong
                          style={{
                            color: "#008b8b",
                            fontSize: "18px",
                            textTransform: "uppercase",
                            fontFamily: "Courier, monospace",
                          }}
                        >
                          Type:
                        </strong>{" "}
                        {propertyType}{" "}
                        {propertyType === "Hotel" ? `(${formData.type})` : ""}
                      </div>
                      <div>
                        <strong
                          style={{
                            color: "#008b8b",
                            fontSize: "18px",
                            textTransform: "uppercase",
                            fontFamily: "Courier, monospace",
                          }}
                        >
                          City:
                        </strong>{" "}
                        {formData.city || "Not provided"}
                      </div>
                      <div>
                        <strong
                          style={{
                            color: "#008b8b",
                            fontSize: "18px",
                            textTransform: "uppercase",
                            fontFamily: "Courier, monospace",
                          }}
                        >
                          Contact:
                        </strong>{" "}
                        {formData.contactNumber || "Not provided"}
                      </div>
                      {propertyType === "Hotel" && (
                        <>
                          {/* <div>
                          <strong
                            style={{
                              color: "#008b8b",
                              fontSize: "18px",
                              textTransform: "uppercase",
                              fontFamily: "Courier, monospace",
                            }}
                          >
                            Total Rooms:
                          </strong>{" "}
                          {formData.totalRooms || "Not provided"}
                        </div> */}
                          {/* <div>
                          <strong
                            style={{
                              color: "#008b8b",
                              fontSize: "18px",
                              textTransform: "uppercase",
                              fontFamily: "Courier, monospace",
                            }}
                          >
                            Total Beds:
                          </strong>{" "}
                          {formData.totalBeds || "Not provided"}
                        </div> */}
                        </>
                      )}
                     
                      {/* <div>
                      <strong
                        style={{
                          color: "#008b8b",
                          fontSize: "18px",
                          textTransform: "uppercase",
                          fontFamily: "Courier, monospace",
                        }}
                      >
                        Amenities:
                      </strong>{" "}
                      {formData.amenities.length} selected
                    </div> */}
                      <div>
                        <strong
                          style={{
                            color: "#008b8b",
                            fontSize: "18px",
                            textTransform: "uppercase",
                            fontFamily: "Courier, monospace",
                          }}
                        >
                          Location:
                        </strong>{" "}
                        {formData.latitude && formData.longitude
                          ? `${formData.latitude}, ${formData.longitude}`
                          : "Not provided"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div
              className="form-navigation"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "30px",
                padding: "20px 0",
                borderTop: "1px solid #eee",
              }}
            >
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    ← Back
                  </button>
                )}
              </div>
              <div>
                {currentStep < 2 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "darkcyan",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: "12px 30px",
                      backgroundColor: loading ? "#6c757d" : "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    {loading
                      ? "Saving..."
                      : propertyType === "Hotel"
                      ? "Create Hotel"
                      : "Create Banquet Hall"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddProperty;
