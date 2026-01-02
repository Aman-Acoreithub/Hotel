import React, { useEffect, useState } from "react";
import { showSuccess, showError, showInfo, showWarning } from "../utils/Toast";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./UpdateForm.css";

const API_CONFIG = {
  baseUrl: "https://hotel-banquet.nearprop.in",
};

const UpdateForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const type = location.state?.type || "Hotel";
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Common + hotel + banquet fields
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    city: "",
    state: "",
    districtId: "",
    pincode: "",
    latitude: "",
    longitude: "",
    contactNumber: "",
    alternateContact: "",
    email: "",
    website: "",
    address: "",
    registrationNumber: "",
    gst: "",
    gstNumber: "",
    amenities: [],
    capacity: "",
    pricePerEvent: "",
    pricePerPlate: "",
    eventTypes: [],
    cateringOptions: [],
    hallType: "",
    cateringAvailable: false,
    decorationAvailable: false,
    parkingCapacity: "",
  });

  // files
  const [existingImages, setExistingImages] = useState([]); // from API
  const [newImages, setNewImages] = useState([]); // new files user uploads
  const [deletedImages, setDeletedImages] = useState([]);

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

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data.data || response.data;
        setFormData({
          ...data,
          cateringOptions: Array.isArray(data.cateringOptions)
            ? data.cateringOptions
            : JSON.parse(data.cateringOptions || "[]"),
          eventTypes: Array.isArray(data.eventTypes)
            ? data.eventTypes
            : JSON.parse(data.eventTypes || "[]"),
          amenities: Array.isArray(data.amenities)
            ? data.amenities
            : JSON.parse(data.amenities || "[]"),
        });

        if (data.images) {
          setExistingImages(data.images);
        }
      } catch (err) {
        console.error("Failed to fetch property:", err);
      }
    };

    fetchData();
  }, [id, type, token, navigate]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;

    setFormData((prev) => {
      let newValue = value;
      if (inputType === "checkbox") {
        newValue = checked;
      }
      return { ...prev, [name]: newValue };
    });
  };

  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => {
      const current = Array.isArray(prev[field])
        ? prev[field]
        : JSON.parse(prev[field] || "[]");

      return current.includes(value)
        ? { ...prev, [field]: current.filter((v) => v !== value) }
        : { ...prev, [field]: [...current, value] };
    });
  };

  // Handle new images
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url =
        type === "Hotel"
          ? `${API_CONFIG.baseUrl}/api/hotels/${id}`
          : `${API_CONFIG.baseUrl}/api/banquet-halls/${id}`;

      const form = new FormData();

      // Add form data (excluding image-related fields and system fields)
      Object.keys(formData).forEach((key) => {
        if (["userId", "_id", "createdAt", "updatedAt", "images"].includes(key)) return;

        let value = formData[key];

        if (typeof value === "object" && value !== null) {
          value = JSON.stringify(value);
        }
        if (typeof value === "boolean") {
          value = value ? "true" : "false";
        }

        if (value !== "" && value !== null && value !== undefined) {
          form.append(key, value);
        }
      });

      // Handle images separately (outside the forEach loop)
      // Send remaining existing images
      form.append("existingImages", JSON.stringify(existingImages));

      // Send deleted images so backend can remove them
      if (deletedImages.length > 0) {
        form.append("deletedImages", JSON.stringify(deletedImages));
      }

      // Add new images
      if (newImages.length > 0) {
        newImages.forEach((img) => form.append("images", img));
      }

      console.log("Submitting data:");
      console.log("Existing images:", existingImages);
      console.log("Deleted images:", deletedImages);
      console.log("New images count:", newImages.length);

      await axios.put(url, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showSuccess(`${type} updated successfully!`);
      setDeletedImages([]);
      navigate(`/HotelAndBanquetDetails/${id}`, { state: { type } });
    } catch (err) {

      const message = err.response?.data?.message || "Something went wrong!";
      showError(`❌ ${message}`);
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="update-form-container">
      <h2 className="update-form-title">Update {type}</h2>
      <form className="update-form" onSubmit={handleSubmit}>
        <input
          className="update-input"
          type="text"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          placeholder="Name"
        />
        <textarea
          className="update-textarea"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="Description"
        />

        {/* Common fields */}
        <input
          className="update-input"
          type="text"
          name="city"
          value={formData.city || ""}
          onChange={handleChange}
          placeholder="City"
        />
        <input
          className="update-input"
          type="text"
          name="state"
          value={formData.state || ""}
          onChange={handleChange}
          placeholder="State"
        />
        <input
          className="update-input"
          type="text"
          name="pincode"
          value={formData.pincode || ""}
          onChange={handleChange}
          placeholder="Pincode"
        />
        <input
          className="update-input"
          type="text"
          name="contactNumber"
          value={formData.contactNumber || ""}
          onChange={handleChange}
          placeholder="Contact Number"
        />
        <input
          className="update-input"
          type="text"
          name="alternateContact"
          value={formData.alternateContact || ""}
          onChange={handleChange}
          placeholder="Alternate Contact"
        />
        <input
          className="update-input"
          type="email"
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          className="update-input"
          type="text"
          name="website"
          value={formData.website || ""}
          onChange={handleChange}
          placeholder="Website"
        />

        {/* Hotel only */}
        {type === "Hotel" && (
          <>
            <input
              className="update-input"
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              placeholder="Address"
            />
            <input
              className="update-input"
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber || ""}
              onChange={handleChange}
              placeholder="Registration Number"
            />
            <input
              className="update-input"
              type="text"
              name="gst"
              value={formData.gst || ""}
              onChange={handleChange}
              placeholder="GST"
            />
            <div className="update-field">
              <label>Amenities</label>
              <div>
                {["AC", "Swimming", "Gym"].map((amenity) => (
                  <label key={amenity} style={{ marginRight: "10px" }}>
                    <input
                      type="checkbox"
                      checked={formData.amenities?.includes(amenity)}
                      onChange={() => handleCheckboxChange("amenities", amenity)}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Banquet only */}
        {type === "Banquet" && (
          <>
            <input
              className="update-input"
              type="text"
              name="gstNumber"
              value={formData.gstNumber || ""}
              onChange={handleChange}
              placeholder="GST Number"
            />
            <input
              className="update-input"
              type="number"
              name="capacity"
              value={formData.capacity || ""}
              onChange={handleChange}
              placeholder="Capacity"
            />
            <input
              className="update-input"
              type="number"
              name="pricePerEvent"
              value={formData.pricePerEvent || ""}
              onChange={handleChange}
              placeholder="Price per Event"
            />
            <input
              className="update-input"
              type="number"
              name="pricePerPlate"
              value={formData.pricePerPlate || ""}
              onChange={handleChange}
              placeholder="Price per Plate"
            />

            <div className="update-field">
              <label>Event Types</label>
              <div>
                {["wedding", "conference", "birthday"].map((et) => (
                  <label key={et} style={{ marginRight: "10px" }}>
                    <input
                      type="checkbox"
                      checked={formData.eventTypes?.includes(et)}
                      onChange={() => handleCheckboxChange("eventTypes", et)}
                    />
                    {et}
                  </label>
                ))}
              </div>
            </div>

            <div className="update-field">
              <label>Hall Type</label>
              <div>
                {["indoor", "outdoor", "both"].map((option) => (
                  <label key={option} style={{ marginRight: "10px" }}>
                    <input
                      type="radio"
                      name="hallType"
                      value={option}
                      checked={formData.hallType === option}
                      onChange={handleChange}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="update-field">
              <label>Catering Options</label>
              <div>
                {["veg", "non-veg"].map((option) => (
                  <label key={option} style={{ marginRight: "10px" }}>
                    <input
                      type="checkbox"
                      checked={formData.cateringOptions?.includes(option)}
                      onChange={() =>
                        handleCheckboxChange("cateringOptions", option)
                      }
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="update-field">
              <label>
                <input
                  type="checkbox"
                  name="decorationAvailable"
                  checked={formData.decorationAvailable || false}
                  onChange={handleChange}
                />
                Decoration Available
              </label>
            </div>

            <input
              className="update-input"
              type="number"
              name="parkingCapacity"
              value={formData.parkingCapacity || ""}
              onChange={handleChange}
              placeholder="Parking Capacity"
            />

            <div className="update-field">
              <label>Amenities</label>
              <div>
                {["AC",
                  "Stage",
                  "Lights",
                  "DJ",
                  "Parking",
                  "WiFi",
                  "Swimming Pool",
                  "Room Service",
                  "Spa",
                  "Balcony",
                  "Security",
                  "Bar",
                  "Laundry",
                  "Restaurant",
                  "Conference Room",
                  "Elevator",
                  "Kitchen"].map((amenity) => (
                    <label key={amenity} style={{ marginRight: "10px" }}>
                      <input
                        type="checkbox"
                        checked={formData.amenities?.includes(amenity)}
                        onChange={() =>
                          handleCheckboxChange("amenities", amenity)
                        }
                      />
                      {amenity}
                    </label>
                  ))}
              </div>
            </div>


            <div className="update-field">
              <label>Event Types</label>
              <div>
                {["wedding", "conference", "birthday", "engagement", "corporate"].map(
                  (event) => (
                    <label key={event} style={{ marginRight: "10px" }}>
                      <input
                        type="checkbox"
                        checked={formData.eventTypes?.includes(event)}
                        onChange={() => handleCheckboxChange("eventTypes", event)}
                      />
                      {event}
                    </label>
                  )
                )}
              </div>
            </div>

          </>
        )}

        {/* Existing Images */}
        <div className="update-field">
          <label>Existing Images</label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {existingImages.map((img, index) => (
              <div key={index} style={{ position: "relative" }}>
                <img
                  src={img}
                  alt="uploaded"
                  style={{ width: "100px", height: "80px", objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={() => handleDeleteExistingImage(img)}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "red",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "0 0 0 4px"
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* New Images Preview */}
        <div className="update-field">
          <label>Upload New Images</label>
          <input type="file" multiple onChange={handleImagesChange} />
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "10px",
            }}
          >
            {newImages.map((file, index) => (
              <div key={index} style={{ position: "relative" }}>
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  style={{ width: "100px", height: "80px", objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={() => handleDeleteNewImage(index)}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "red",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "0 0 0 4px"
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <button className="update-btn" type="submit">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default UpdateForm;