// import React, { useEffect, useState } from "react";
// import { showSuccess, showError, showInfo, showWarning } from "../utils/Toast";
// import axios from "axios";
// import "./createroom.css";

// const Createroom = () => {
//   const [selecthotel, setSelecthotel] = useState([]);
//   const [formData, setFormData] = useState({
//     hotelId: "",
//     roomNumber: "",
//     type: "",
//     price: "",
//     features: [],
//     services: [],
//     summerPrice: "",
//     winterPrice: "",
//     images: [], // Multiple images
//     videos: [], // Multiple videos
//   });
//   const [loading, setLoading] = useState(false);

//   const token = localStorage.getItem("token"); // 🔑 Auth token
//   console.log(token)

//   // Fetch hotels
//   useEffect(() => {
//     const fetchHotels = async () => {
//       try {
//         const res = await axios.get(
//           "https://hotel-banquet.nearprop.in/api/hotels/owner",
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         setSelecthotel(res.data.data.hotels);
//       } catch (err) {
//         console.error("Error fetching hotels:", err);
//         showError("Failed to fetch hotels.");
//       }
//     };

//     if (token) {
//       fetchHotels();
//     } else {
//       showWarning("User not authenticated.");
//     }
//   }, [token]);

//   // Handle hotel selection and save in localStorage
//   const handleHotelChange = (e) => {
//     const selectedId = e.target.value;
//     console.log(selectedId)
//     setFormData((prev) => ({ ...prev, hotelId: selectedId }));

//     const localhotel = localStorage.setItem("hotelId", selectedId);
//     console.log(localhotel)
//   };

//   // Handle text/number inputs
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Handle checkbox arrays (features/services)
//   const handleArrayChange = (name, value) => {
//     setFormData((prev) => {
//       const updated = prev[name].includes(value)
//         ? prev[name].filter((item) => item !== value)
//         : [...prev[name], value];
//       return { ...prev, [name]: updated };
//     });
//   };

//   // Handle multiple file inputs
//   const handleFileChange = (e) => {
//     const { name, files } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: Array.from(files) }));
//   };

//   // Submit form old --->
//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();

//   //   if (!formData.hotelId) {
//   //     alert("Please select a hotel.");
//   //     return;
//   //   }

//   //   setLoading(true);

//   //   try {
//   //     const payload = {
//   //       hotelId: formData.hotelId,
//   //       roomNumber: formData.roomNumber,
//   //       type: formData.type,
//   //       price: formData.price,
//   //       features: JSON.stringify(formData.features || []),   // ✅ always valid
//   //       services: JSON.stringify(formData.services || []),   // ✅ always valid
//   //       seasonalPrice: JSON.stringify({
//   //         summer: formData.summerPrice || 0,
//   //         winter: formData.winterPrice || 0,
//   //       }), // ✅ always valid
//   //     };

//   //     console.log("➡️ Creating room with hotelId:", formData.hotelId);
//   //     console.log("📦 Payload:", payload);

//   //     const res = await axios.post(
//   //       "https://hotel-banquet.nearprop.in/api/rooms",
//   //       payload,
//   //       {
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //           "Content-Type": "application/json",
//   //         },
//   //       }
//   //     );

//   //     alert("✅ Room created successfully!");
//   //     console.log("✅ Response:", res.data);

//   //     setFormData({
//   //       hotelId: formData.hotelId,
//   //       roomNumber: "",
//   //       type: "",
//   //       price: "",
//   //       features: [],
//   //       services: [],
//   //       summerPrice: "",
//   //       winterPrice: "",
//   //       images: [],
//   //       videos: [],
//   //     });
//   //   } catch (error) {
//   //     console.error("❌ Error creating room:", error.response?.data || error);
//   //     alert("Failed to create room.");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };


//   // new handle submit form --->
//   // Submit form
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const {
//       hotelId,
//       roomNumber,
//       type,
//       price,
//       features,
//       services,
//       summerPrice,
//       winterPrice,
//       images,
//       videos,
//     } = formData;

//     if (!hotelId) {
//       showWarning("Please select a hotel.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const data = new FormData();

//       // Append text fields
//       data.append("hotelId", hotelId);
//       data.append("roomNumber", roomNumber);
//       data.append("type", type);
//       data.append("price", price);
//       data.append("features", JSON.stringify(features || []));
//       data.append("services", JSON.stringify(services || []));
//       data.append(
//         "seasonalPrice",
//         JSON.stringify({
//           summer: summerPrice || 0,
//           winter: winterPrice || 0,
//         })
//       );

//       // Append multiple images
//       images.forEach((file) => data.append("images", file));

//       // Append multiple videos
//       videos.forEach((file) => data.append("videos", file));

//       console.log("➡️ Creating room with hotelId:", hotelId);

//       const res = await axios.post(
//         "https://hotel-banquet.nearprop.in/api/rooms",
//         data,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       showSuccess("✅ Room created successfully!");
//       console.log("✅ Response:", res.data);

//       // Reset form except hotelId
//       setFormData((prev) => ({
//         ...prev,
//         roomNumber: "",
//         type: "",
//         price: "",
//         features: [],
//         services: [],
//         summerPrice: "",
//         winterPrice: "",
//         images: [],
//         videos: [],
//       }));
//     } catch (error) {
//       console.error("❌ Error creating room:", error.response?.data || error);
//       showError("Failed to create room.");
//     } finally {
//       setLoading(false);
//     }
//   };







//   return (
//     <div className="cr-container">
//       <h2 className="cr-heading">Create Room</h2>

//       <form className="cr-form" onSubmit={handleSubmit}>
//         {/* Hotel Selection */}
//         <select
//           value={formData.hotelId}
//           onChange={handleHotelChange}
//         >
//           <option value="">Select Hotel</option>
//           {selecthotel.map(h => (
//             <option key={h._id} value={h.hotelId}>{h.name} {h.hotelId}</option>
//           ))}
//         </select>


//         {/* Room Info */}
//         <input
//           type="text"
//           name="roomNumber"
//           placeholder="Room Number"
//           value={formData.roomNumber}
//           onChange={handleChange}
//           className="cr-input"
//         />
//         <input
//           type="text"
//           name="type"
//           placeholder="Room Type"
//           value={formData.type}
//           onChange={handleChange}
//           className="cr-input"
//         />
//         <input
//           type="number"
//           name="price"
//           placeholder="Price"
//           value={formData.price}
//           onChange={handleChange}
//           className="cr-input"
//         />

//         {/* Features */}
//         {/* <div className="cr-checkbox-group">
//           <label className="cr-checkbox-label">Features:</label>
//           <div className="cr-checkbox-grid">
//             {["WiFi", "AC", "Fridge", "Gyser", "Hair Dryer", "Laundry"].map(
//               (feature) => (
//                 <label key={feature} className="cr-checkbox-item">
//                   <input
//                     type="checkbox"
//                     checked={formData.features.includes(feature)}
//                     onChange={() => handleArrayChange("features", feature)}
//                   />
//                   {feature}
//                 </label>
//               )
//             )}
//           </div>
//         </div> */}

//         {/* Services */}
//         {/* <div className="cr-checkbox-group">
//           <label className="cr-checkbox-label">Services:</label>
//           <div className="cr-checkbox-grid">
//             {[
//               "Room Service",
//               "Restaurant",
//               "Candle Light Dinner",
//               "Terrace Restaurant",
//             ].map((service) => (
//               <label key={service} className="cr-checkbox-item">
//                 <input
//                   type="checkbox"
//                   checked={formData.services.includes(service)}
//                   onChange={() => handleArrayChange("services", service)}
//                 />
//                 {service}
//               </label>
//             ))}
//           </div>
//         </div> */}

//         {/* Seasonal Prices */}
//         <input
//           type="number"
//           name="summerPrice"
//           placeholder="Summer Price"
//           value={formData.summerPrice}
//           onChange={handleChange}
//           className="cr-input"
//         />
//         <input
//           type="number"
//           name="winterPrice"
//           placeholder="Winter Price"
//           value={formData.winterPrice}
//           onChange={handleChange}
//           className="cr-input"
//         />

//         {/* File Uploads */}
//         <div className="cr-file-group">
//           <label className="cr-file-label">Room Images:</label>
//           <input
//             type="file"
//             name="images"
//             onChange={handleFileChange}
//             multiple
//             className="cr-file-input"
//           />
//         </div>
//         <div className="cr-file-group">
//           <label className="cr-file-label">Room Videos:</label>
//           <input
//             type="file"
//             name="videos"
//             onChange={handleFileChange}
//             multiple
//             className="cr-file-input"
//           />
//         </div>

//         <button type="submit" className="cr-submit-btn" disabled={loading}>
//           {loading ? "Creating..." : "Create Room"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Createroom;


import React, { useEffect, useState } from "react";
import { showSuccess, showError, showWarning } from "../utils/Toast";
import axios from "axios";
import "./createroom.css";

const Createroom = () => {
  const [selecthotel, setSelecthotel] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    hotelId: "",
    roomNumber: "",
    type: "",
    price: "",
    features: [],
    services: [],
    summerPrice: "",
    winterPrice: "",
    images: [],
    videos: [],
  });

  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  /* ================= Fetch Hotels ================= */
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axios.get(
          "https://hotel-banquet.nearprop.in/api/hotels/owner",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSelecthotel(res.data.data.hotels);
      } catch {
        showError("Failed to fetch hotels");
      }
    };
    if (token) fetchHotels();
  }, [token]);

  /* ================= Handlers ================= */
  const handleHotelChange = (e) => {
    const val = e.target.value;
    setFormData((p) => ({ ...p, hotelId: val }));
    localStorage.setItem("hotelId", val);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const fileArr = Array.from(files);

    if (name === "images") {
      const invalid = fileArr.some((f) => !f.type.startsWith("image/"));
      if (invalid) {
        setErrors((p) => ({ ...p, images: "Only image files allowed" }));
        return;
      }
      setErrors((p) => ({ ...p, images: "" }));
    }

    if (name === "videos") {
      const invalid = fileArr.some((f) => !f.type.startsWith("video/"));
      if (invalid) {
        setErrors((p) => ({ ...p, videos: "Only video files allowed" }));
        return;
      }
      setErrors((p) => ({ ...p, videos: "" }));
    }

    setFormData((p) => ({ ...p, [name]: fileArr }));
  };

  /* ================= Submit ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hotelId) {
      showWarning("Please select a hotel");
      return;
    }

    if (formData.images.length === 0) {
      setErrors((p) => ({ ...p, images: "At least one image is required" }));
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("hotelId", formData.hotelId);
      data.append("roomNumber", formData.roomNumber);
      data.append("type", formData.type);
      data.append("price", formData.price);
      data.append(
        "seasonalPrice",
        JSON.stringify({
          summer: formData.summerPrice || 0,
          winter: formData.winterPrice || 0,
        })
      );

      formData.images.forEach((f) => data.append("images", f));
      formData.videos.forEach((f) => data.append("videos", f));

      await axios.post("https://hotel-banquet.nearprop.in/api/rooms", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showSuccess("Room created successfully");
      setFormData((p) => ({
        ...p,
        roomNumber: "",
        type: "",
        price: "",
        summerPrice: "",
        winterPrice: "",
        images: [],
        videos: [],
      }));
    } catch {
      showError("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cr-container">
      <h2 className="cr-heading">Create Room</h2>

      <form className="cr-form" onSubmit={handleSubmit}>
        <select value={formData.hotelId} onChange={handleHotelChange}>
          <option value="">Select Hotel</option>
          {selecthotel.map((h) => (
            <option key={h._id} value={h.hotelId}>
              {h.name}
            </option>
          ))}
        </select>

        <input className="cr-input" name="roomNumber" placeholder="Room Number" value={formData.roomNumber} onChange={handleChange} />
        <input className="cr-input" name="type" placeholder="Room Type" value={formData.type} onChange={handleChange} />
        <input className="cr-input" type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} />

        <input className="cr-input" type="number" name="summerPrice" placeholder="Summer Price" value={formData.summerPrice} onChange={handleChange} />
        <input className="cr-input" type="number" name="winterPrice" placeholder="Winter Price" value={formData.winterPrice} onChange={handleChange} />

        <div className="cr-file-group">
          <label className="cr-file-label">Room Images *</label>
          <input type="file" name="images" multiple onChange={handleFileChange} />
          {errors.images && <div className="cr-error">{errors.images}</div>}
        </div>

        <div className="cr-file-group">
          <label className="cr-file-label">Room Videos</label>
          <input type="file" name="videos" multiple onChange={handleFileChange} />
          {errors.videos && <div className="cr-error">{errors.videos}</div>}
        </div>

        <button className="cr-submit-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Room"}
        </button>
      </form>
    </div>
  );
};

export default Createroom;
