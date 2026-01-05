import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./updateroom.css";
import { toast } from "react-toastify";

const UpdateRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hotelId: "",
    roomNumber: "",
    type: "",
    price: "",
    features: [],
    services: [],
    summerPrice: "",
    winterPrice: "",
    images: [], // For new images to upload
    videos: [], // For new videos to upload
    isAvailable: true,
  });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(
          `https://hotel-banquet.nearprop.in/api/rooms/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const roomData = res.data.data;
        setFormData({
          hotelId: roomData.hotelId || "",
          roomNumber: roomData.roomNumber || "",
          type: roomData.type || "",
          price: roomData.price || "",
          features: Array.isArray(roomData.features) ? roomData.features : [],
          services: Array.isArray(roomData.services) ? roomData.services : [],
          summerPrice: roomData.seasonalPrice?.summer || "",
          winterPrice: roomData.seasonalPrice?.winter || "",
          images: [], // New images to upload (existing images not handled here)
          videos: [], // New videos to upload (existing videos not handled here)
          isAvailable: roomData.isAvailable ?? true,
        });
        localStorage.setItem("hotelId", roomData.hotelId || "");
      } catch (err) {
        console.error("Error fetching room details:", err);
        toast.error("Failed to load room details");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRoom();
    } else {
      toast.error("No token found. Please login again.");
      navigate("/login");
    }
  }, [id, token, navigate]);

  // Handle text/number inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox arrays (features/services)
  const handleArrayChange = (name, value) => {
    setFormData((prev) => {
      const updated = prev[name].includes(value)
        ? prev[name].filter((item) => item !== value)
        : [...prev[name], value];
      return { ...prev, [name]: updated };
    });
  };

  // Handle multiple file inputs
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Array.from(files) }));
  };

  // Handle availability change
  const handleAvailabilityChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      isAvailable: e.target.value === "true",
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hotelId) {
      toast.error("Hotel ID is missing.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("hotelId", formData.hotelId);
      data.append("roomNumber", formData.roomNumber);
      data.append("type", formData.type);
      data.append("price", formData.price);
      data.append("isAvailable", formData.isAvailable);
      data.append("features", JSON.stringify(formData.features || []));
      data.append("services", JSON.stringify(formData.services || []));
      data.append(
        "seasonalPrice",
        JSON.stringify({
          summer: formData.summerPrice || 0,
          winter: formData.winterPrice || 0,
        })
      );

      // Append new images
      formData.images.forEach((file) => {
        data.append("images", file);
      });

      // Append new videos
      formData.videos.forEach((file) => {
        data.append("videos", file);
      });

      const res = await axios.put(
        `https://hotel-banquet.nearprop.in/api/rooms/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("✅ Room updated successfully!");
      console.log("✅ Response:", res.data);
      navigate(`/rooms/${id}`);
    } catch (error) {
      console.error("❌ Error updating room:", error.response?.data || error);
      toast.error("Failed to update room.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="update-room-loading">Loading room details...</div>;
  }

  return (
    <div className="cr-container">
      <h2 className="cr-heading">Update Room</h2>

      <form className="cr-form" onSubmit={handleSubmit}>
        {/* Room Info */}
        <input
          type="text"
          name="roomNumber"
          placeholder="Room Number"
          value={formData.roomNumber}
          onChange={handleChange}
          className="cr-input"
        />
        <input
          type="text"
          name="type"
          placeholder="Room Type"
          value={formData.type}
          onChange={handleChange}
          className="cr-input"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="cr-input"
        />

        {/* Availability */}
        <select
          name="isAvailable"
          value={formData.isAvailable}
          onChange={handleAvailabilityChange}
          className="cr-input"
        >
          <option value="true">Available</option>
          <option value="false">Not Available</option>
        </select>

        {/* Features */}
        <div className="cr-checkbox-group">
          <label className="cr-checkbox-label">Features:</label>
          <div className="cr-checkbox-grid">
            {["WiFi", "AC", "Fridge", "Gyser", "Hair Dryer", "Laundry"].map(
              (feature) => (
                <label key={feature} className="cr-checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => handleArrayChange("features", feature)}
                  />
                  {feature}
                </label>
              )
            )}
          </div>
        </div>

        {/* Services */}
        <div className="cr-checkbox-group">
          <label className="cr-checkbox-label">Services:</label>
          <div className="cr-checkbox-grid">
            {[
              "Room Service",
              "Restaurant",
              "Candle Light Dinner",
              "Terrace Restaurant",
            ].map((service) => (
              <label key={service} className="cr-checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.services.includes(service)}
                  onChange={() => handleArrayChange("services", service)}
                />
                {service}
              </label>
            ))}
          </div>
        </div>

        {/* Seasonal Prices */}
        <input
          type="number"
          name="summerPrice"
          placeholder="Summer Price"
          value={formData.summerPrice}
          onChange={handleChange}
          className="cr-input"
        />
        <input
          type="number"
          name="winterPrice"
          placeholder="Winter Price"
          value={formData.winterPrice}
          onChange={handleChange}
          className="cr-input"
        />

        {/* File Uploads */}
        <div className="cr-file-group">
          <label className="cr-file-label">Room Images (New):</label>
          <input
            type="file"
            name="images"
            onChange={handleFileChange}
            multiple
            className="cr-file-input"
          />
        </div>
        <div className="cr-file-group">
          <label className="cr-file-label">Room Videos (New):</label>
          <input
            type="file"
            name="videos"
            onChange={handleFileChange}
            multiple
            className="cr-file-input"
          />
        </div>

        {/* Buttons */}
        <div className="update-room-buttons">
          <button
            type="submit"
            className="cr-submit-btn"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Room"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/rooms/${id}`)}
            className="update-room-cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateRoom;