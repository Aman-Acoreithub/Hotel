import React, { useEffect, useState } from "react";
import { showError, showSuccess } from "../utils/Toast";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Updateroom.css";
const API_CONFIG = {
  baseUrl: "https://hotel-banquet.nearprop.in",
};

// Shared options
const amenityOptions = [
  "WiFi", "Parking", "AC", "Swimming Pool", "Gym", "Restaurant", "Room Service",
  "Laundry", "Conference Room", "Spa", "Bar", "Garden", "Balcony", "Kitchen",
  "Elevator", "Security"
];

const eventTypeOptions = [
  "wedding", "conference", "birthday", "anniversary", "corporate", "other"
];

const cateringOptionsList = ["veg", "non-veg", "both"];
const hallTypeOptions = ["indoor", "outdoor", "both"];

// Room-specific amenities
const roomAmenityOptions = ["AC", "WiFi", "TV", "Mini Bar", "Balcony", "Safe", "Work Desk", "Bathtub"];

const UpdateForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const type = location.state?.type || "Hotel";
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    contactNumber: "",
    alternateContact: "",
    email: "",
    website: "",
    registrationNumber: "",
    gst: "",
    gstNumber: "",
    hallType: "",
    capacity: "",
    pricePerEvent: "",
    pricePerPlate: "",
    amenities: [],
    eventTypes: [],
    cateringOptions: [],
    decorationAvailable: false,
    cateringAvailable: false,
    parkingCapacity: "",
  });

  const [roomTypes, setRoomTypes] = useState([
    { name: "", pricePerNight: "", capacity: "", description: "", amenities: [] }
  ]);

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const url =
          type === "Hotel"
            ? `${API_CONFIG.baseUrl}/api/hotels/${id}`
            : `${API_CONFIG.baseUrl}/api/banquet-halls/${id}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data.data || res.data;

        const normalizeArray = (field) =>
          Array.isArray(data[field])
            ? data[field]
            : typeof data[field] === "string"
            ? JSON.parse(data[field] || "[]")
            : [];

        setFormData({
          name: data.name || "",
          description: data.description || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          contactNumber: data.contactNumber || "",
          alternateContact: data.alternateContact || "",
          email: data.email || "",
          website: data.website || "",
          registrationTime: data.registrationTime,
          registrationNumber: data.registrationNumber || "",
          gst: data.gst || "",
          gstNumber: data.gstNumber || "",
          hallType: data.hallType || "",
          capacity: data.capacity?.toString() || "",
          pricePerEvent: data.pricePerEvent?.toString() || "",
          pricePerPlate: data.pricePerPlate?.toString() || "",
          amenities: normalizeArray("amenities"),
          eventTypes: normalizeArray("eventTypes"),
          cateringOptions: normalizeArray("cateringOptions"),
          decorationAvailable: !!data.decorationAvailable,
          cateringAvailable: !!data.cateringAvailable,
          parkingCapacity: data.parkingCapacity?.toString() || "",
        });

        setExistingImages(data.images || []);

        // Load room types for Hotel
        if (type === "Hotel" && data.roomTypes) {
          const rooms = (Array.isArray(data.roomTypes) ? data.roomTypes : JSON.parse(data.roomTypes || "[]"))
            .map((room) => ({
              name: room.name || "",
              pricePerNight: room.pricePerNight?.toString() || "",
              capacity: room.capacity?.toString() || "",
              description: room.description || "",
              amenities: Array.isArray(room.amenities)
                ? room.amenities
                : typeof room.amenities === "string"
                ? JSON.parse(room.amenities || "[]")
                : [],
            }));
          setRoomTypes(rooms.length > 0 ? rooms : [{ name: "", pricePerNight: "", capacity: "", description: "", amenities: [] }]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        showError("Failed to load property data.");
      }
    };

    fetchData();
  }, [id, type, token, navigate]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value,
    }));
  };

  const handleCheckboxArrayChange = (field, value) => {
    setFormData((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];
      return { ...prev, [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] };
    });
  };

  // Room handlers
  const handleRoomChange = (index, field, value) => {
    const updated = [...roomTypes];
    updated[index][field] = value;
    setRoomTypes(updated);
  };

  const handleRoomAmenityChange = (roomIndex, amenity) => {
    const updated = [...roomTypes];
    const amenities = updated[roomIndex].amenities;
    if (amenities.includes(amenity)) {
      updated[roomIndex].amenities = amenities.filter((a) => a !== amenity);
    } else {
      updated[roomIndex].amenities = [...amenities, amenity];
    }
    setRoomTypes(updated);
  };

  const addRoomType = () => {
    setRoomTypes([...roomTypes, { name: "", pricePerNight: "", capacity: "", description: "", amenities: [] }]);
  };

  const removeRoomType = (index) => {
    if (roomTypes.length > 1) {
      setRoomTypes(roomTypes.filter((_, i) => i !== index));
    }
  };

  // Image handlers
  const handleImagesChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  const handleDeleteExistingImage = (imgUrl) => {
    setExistingImages((prev) => prev.filter((img) => img !== imgUrl));
    setDeletedImages((prev) => [...prev, imgUrl]);
  };

  const handleDeleteNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url =
        type === "Hotel"
          ? `${API_CONFIG.baseUrl}/api/hotels/${id}`
          : `${API_CONFIG.baseUrl}/api/banquet-halls/${id}`;

      const form = new FormData();

      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (["userId", "_id", "createdAt", "updatedAt", "images", "registrationTime"].includes(key)) return;

        if (["amenities", "eventTypes", "cateringOptions"].includes(key)) {
          form.append(key, JSON.stringify(value));
        } else if (typeof value === "boolean") {
          form.append(key, value ? "true" : "false");
        } else if (value !== "" && value != null) {
          form.append(key, value);
        }
      });

      // Append roomTypes for Hotel
      if (type === "Hotel") {
        const validRooms = roomTypes.filter(
          (r) => r.name.trim() || r.pricePerNight || r.capacity || r.description || r.amenities.length > 0
        );
        form.append("roomTypes", JSON.stringify(validRooms));
      }

      // Images
      form.append("existingImages", JSON.stringify(existingImages));
      if (deletedImages.length > 0) {
        form.append("deletedImages", JSON.stringify(deletedImages));
      }
      newImages.forEach((file) => form.append("images", file));

      await axios.put(url, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showSuccess(`${type} updated successfully!`);
      navigate(`/HotelAndBanquetDetails/${id}`, { state: { type } });
    } catch (err) {
      const msg = err.response?.data?.message || "Update failed. Please try again.";
      showError(msg);
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" p-6 bg-white rounded-xl shadow-lg mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Update {type}</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Contact</label>
            <input
              type="tel"
              name="alternateContact"
              value={formData.alternateContact}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City/District</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="2"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {/* Type-Specific Fields */}
        {type === "Hotel" && (
          <div className="space-y-6 p-5 bg-gray-50 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-800">Hotel Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST</label>
                <input
                  type="text"
                  name="gst"
                  value={formData.gst}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Room Types */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">Room Types</label>
                <button
                  type="button"
                  onClick={addRoomType}
                  className="text-sm bg-teal-100 text-teal-700 px-3 py-1 rounded-lg hover:bg-teal-200"
                >
                  + Add Room
                </button>
              </div>

              <div className="space-y-4">
                {roomTypes.map((room, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-800 mb-3">Room {index + 1}</h4>
                      {roomTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoomType(index)}
                          className="text-red-500 hover:text-red-700 text-lg"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Room Name (e.g., Deluxe)"
                        value={room.name}
                        onChange={(e) => handleRoomChange(index, "name", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Price per Night (₹)"
                        value={room.pricePerNight}
                        onChange={(e) => handleRoomChange(index, "pricePerNight", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Max Guests"
                        value={room.capacity}
                        onChange={(e) => handleRoomChange(index, "capacity", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <textarea
                        placeholder="Description"
                        value={room.description}
                        onChange={(e) => handleRoomChange(index, "description", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                        rows="2"
                      />
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Room Amenities</label>
                      <div className="flex flex-wrap gap-2">
                        {roomAmenityOptions.map((amenity) => (
                          <label key={amenity} className="flex items-center space-x-1">
                            <input
                              type="checkbox"
                              checked={room.amenities.includes(amenity)}
                              onChange={() => handleRoomAmenityChange(index, amenity)}
                              className="h-4 w-4 text-teal-600 rounded"
                            />
                            <span className="text-sm">{amenity}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotel Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {amenityOptions.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleCheckboxArrayChange("amenities", amenity)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {type === "Banquet" && (
          <div className="space-y-6 p-5 bg-gray-50 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-800">Banquet Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hall Type</label>
                <select
                  name="hallType"
                  value={formData.hallType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="">Select</option>
                  {hallTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Event (₹)</label>
                <input
                  type="number"
                  name="pricePerEvent"
                  value={formData.pricePerEvent}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Plate (₹)</label>
                <input
                  type="number"
                  name="pricePerPlate"
                  value={formData.pricePerPlate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parking Capacity</label>
                <input
                  type="number"
                  name="parkingCapacity"
                  value={formData.parkingCapacity}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Types</label>
              <div className="flex flex-wrap gap-3">
                {eventTypeOptions.map((et) => (
                  <label key={et} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.eventTypes.includes(et)}
                      onChange={() => handleCheckboxArrayChange("eventTypes", et)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                    <span className="text-sm capitalize">{et}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catering Options</label>
              <div className="flex flex-wrap gap-3">
                {cateringOptionsList.map((opt) => (
                  <label key={opt} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.cateringOptions.includes(opt)}
                      onChange={() => handleCheckboxArrayChange("cateringOptions", opt)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                    <span className="text-sm capitalize">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="decorationAvailable"
                  checked={formData.decorationAvailable}
                  onChange={handleChange}
                  className="h-4 w-4 text-teal-600 rounded"
                />
                <span className="text-sm text-gray-700">Decoration Available</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="cateringAvailable"
                  checked={formData.cateringAvailable}
                  onChange={handleChange}
                  className="h-4 w-4 text-teal-600 rounded"
                />
                <span className="text-sm text-gray-700">Catering Available</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {amenityOptions.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleCheckboxArrayChange("amenities", amenity)}
                      className="h-4 w-4 text-teal-600 rounded"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Attractive Image Gallery */}
        <div className="space-y-5">
          <h3 className="text-xl font-semibold text-gray-800">Property Images</h3>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Existing Images</label>
              <div className="flex flex-wrap gap-4">
                {existingImages.map((img, i) => (
                  <div key={i} className="relative group w-32 h-32 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <img
                      src={img}
                      alt={`existing-${i}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-600 file:text-white hover:file:bg-teal-700"
            />
            {newImages.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {newImages.map((file, i) => (
                  <div key={i} className="relative group w-32 h-32 rounded-xl overflow-hidden shadow-md">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`new-${i}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteNewImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-7 py-3 rounded-xl font-semibold text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg transition"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateForm;