// import React, { useEffect, useState } from "react";
// import { showError, showSuccess } from "../utils/Toast";
// import { useParams, useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./Updateroom.css";
// const API_CONFIG = {
//   baseUrl: "https://hotel-banquet.nearprop.in",
// };

// // Shared options
// const amenityOptions = [
//   "WiFi", "Parking", "AC", "Swimming Pool", "Gym", "Restaurant", "Room Service",
//   "Laundry", "Conference Room", "Spa", "Bar", "Garden", "Balcony", "Kitchen",
//   "Elevator", "Security"
// ];

// const eventTypeOptions = [
//   "wedding", "conference", "birthday", "anniversary", "corporate", "other"
// ];

// const cateringOptionsList = ["veg", "non-veg", "both"];
// const hallTypeOptions = ["indoor", "outdoor", "both"];

// // Room-specific amenities
// const roomAmenityOptions = ["AC", "WiFi", "TV", "Mini Bar", "Balcony", "Safe", "Work Desk", "Bathtub"];

// const UpdateForm = () => {
//   const { id } = useParams();
//   const location = useLocation();
//   const type = location.state?.type || "Hotel";
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     address: "",
//     city: "",
//     state: "",
//     pincode: "",
//     contactNumber: "",
//     alternateContact: "",
//     email: "",
//     website: "",
//     registrationNumber: "",
//     gst: "",
//     gstNumber: "",
//     hallType: "",
//     capacity: "",
//     pricePerEvent: "",
//     pricePerPlate: "",
//     amenities: [],
//     eventTypes: [],
//     cateringOptions: [],
//     decorationAvailable: false,
//     cateringAvailable: false,
//     parkingCapacity: "",
//   });

//   const [roomTypes, setRoomTypes] = useState([
//     { name: "", pricePerNight: "", capacity: "", description: "", amenities: [] }
//   ]);

//   const [existingImages, setExistingImages] = useState([]);
//   const [newImages, setNewImages] = useState([]);
//   const [deletedImages, setDeletedImages] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     const fetchData = async () => {
//       try {
//         const url =
//           type === "Hotel"
//             ? `${API_CONFIG.baseUrl}/api/hotels/${id}`
//             : `${API_CONFIG.baseUrl}/api/banquet-halls/${id}`;

//         const res = await axios.get(url, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const data = res.data.data || res.data;

//         const normalizeArray = (field) =>
//           Array.isArray(data[field])
//             ? data[field]
//             : typeof data[field] === "string"
//             ? JSON.parse(data[field] || "[]")
//             : [];

//         setFormData({
//           name: data.name || "",
//           description: data.description || "",
//           address: data.address || "",
//           city: data.city || "",
//           state: data.state || "",
//           pincode: data.pincode || "",
//           contactNumber: data.contactNumber || "",
//           alternateContact: data.alternateContact || "",
//           email: data.email || "",
//           website: data.website || "",
//           registrationTime: data.registrationTime,
//           registrationNumber: data.registrationNumber || "",
//           gst: data.gst || "",
//           gstNumber: data.gstNumber || "",
//           hallType: data.hallType || "",
//           capacity: data.capacity?.toString() || "",
//           pricePerEvent: data.pricePerEvent?.toString() || "",
//           pricePerPlate: data.pricePerPlate?.toString() || "",
//           amenities: normalizeArray("amenities"),
//           eventTypes: normalizeArray("eventTypes"),
//           cateringOptions: normalizeArray("cateringOptions"),
//           decorationAvailable: !!data.decorationAvailable,
//           cateringAvailable: !!data.cateringAvailable,
//           parkingCapacity: data.parkingCapacity?.toString() || "",
//         });

//         setExistingImages(data.images || []);

//         // Load room types for Hotel
//         if (type === "Hotel" && data.roomTypes) {
//           const rooms = (Array.isArray(data.roomTypes) ? data.roomTypes : JSON.parse(data.roomTypes || "[]"))
//             .map((room) => ({
//               name: room.name || "",
//               pricePerNight: room.pricePerNight?.toString() || "",
//               capacity: room.capacity?.toString() || "",
//               description: room.description || "",
//               amenities: Array.isArray(room.amenities)
//                 ? room.amenities
//                 : typeof room.amenities === "string"
//                 ? JSON.parse(room.amenities || "[]")
//                 : [],
//             }));
//           setRoomTypes(rooms.length > 0 ? rooms : [{ name: "", pricePerNight: "", capacity: "", description: "", amenities: [] }]);
//         }
//       } catch (err) {
//         console.error("Fetch error:", err);
//         showError("Failed to load property data.");
//       }
//     };

//     fetchData();
//   }, [id, type, token, navigate]);

//   const handleChange = (e) => {
//     const { name, value, type: inputType, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: inputType === "checkbox" ? checked : value,
//     }));
//   };

//   const handleCheckboxArrayChange = (field, value) => {
//     setFormData((prev) => {
//       const current = Array.isArray(prev[field]) ? prev[field] : [];
//       return { ...prev, [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] };
//     });
//   };

//   // Room handlers
//   const handleRoomChange = (index, field, value) => {
//     const updated = [...roomTypes];
//     updated[index][field] = value;
//     setRoomTypes(updated);
//   };

//   const handleRoomAmenityChange = (roomIndex, amenity) => {
//     const updated = [...roomTypes];
//     const amenities = updated[roomIndex].amenities;
//     if (amenities.includes(amenity)) {
//       updated[roomIndex].amenities = amenities.filter((a) => a !== amenity);
//     } else {
//       updated[roomIndex].amenities = [...amenities, amenity];
//     }
//     setRoomTypes(updated);
//   };

//   const addRoomType = () => {
//     setRoomTypes([...roomTypes, { name: "", pricePerNight: "", capacity: "", description: "", amenities: [] }]);
//   };

//   const removeRoomType = (index) => {
//     if (roomTypes.length > 1) {
//       setRoomTypes(roomTypes.filter((_, i) => i !== index));
//     }
//   };

//   // Image handlers
//   const handleImagesChange = (e) => {
//     setNewImages(Array.from(e.target.files));
//   };

//   const handleDeleteExistingImage = (imgUrl) => {
//     setExistingImages((prev) => prev.filter((img) => img !== imgUrl));
//     setDeletedImages((prev) => [...prev, imgUrl]);
//   };

//   const handleDeleteNewImage = (index) => {
//     setNewImages((prev) => prev.filter((_, i) => i !== index));
//   };

//   // Submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const url =
//         type === "Hotel"
//           ? `${API_CONFIG.baseUrl}/api/hotels/${id}`
//           : `${API_CONFIG.baseUrl}/api/banquet-halls/${id}`;

//       const form = new FormData();

//       // Append form data
//       Object.entries(formData).forEach(([key, value]) => {
//         if (["userId", "_id", "createdAt", "updatedAt", "images", "registrationTime"].includes(key)) return;

//         if (["amenities", "eventTypes", "cateringOptions"].includes(key)) {
//           form.append(key, JSON.stringify(value));
//         } else if (typeof value === "boolean") {
//           form.append(key, value ? "true" : "false");
//         } else if (value !== "" && value != null) {
//           form.append(key, value);
//         }
//       });

//       // Append roomTypes for Hotel
//       if (type === "Hotel") {
//         const validRooms = roomTypes.filter(
//           (r) => r.name.trim() || r.pricePerNight || r.capacity || r.description || r.amenities.length > 0
//         );
//         form.append("roomTypes", JSON.stringify(validRooms));
//       }

//       // Images
//       form.append("existingImages", JSON.stringify(existingImages));
//       if (deletedImages.length > 0) {
//         form.append("deletedImages", JSON.stringify(deletedImages));
//       }
//       newImages.forEach((file) => form.append("images", file));

//       await axios.put(url, form, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       showSuccess(`${type} updated successfully!`);
//       navigate(`/HotelAndBanquetDetails/${id}`, { state: { type } });
//     } catch (err) {
//       const msg = err.response?.data?.message || "Update failed. Please try again.";
//       showError(msg);
//       console.error("Update error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className=" p-6 bg-white rounded-xl shadow-lg mt-6">
//       <h2 className="text-2xl font-bold text-gray-800 mb-6">Update {type}</h2>

//       <form onSubmit={handleSubmit} className="space-y-8">
//         {/* Basic Info */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
//             <input
//               type="tel"
//               name="contactNumber"
//               value={formData.contactNumber}
//               onChange={handleChange}
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Contact</label>
//             <input
//               type="tel"
//               name="alternateContact"
//               value={formData.alternateContact}
//               onChange={handleChange}
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
//             <input
//               type="text"
//               name="state"
//               value={formData.state}
//               onChange={handleChange}
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">City/District</label>
//             <input
//               type="text"
//               name="city"
//               value={formData.city}
//               onChange={handleChange}
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
//             <input
//               type="text"
//               name="pincode"
//               value={formData.pincode}
//               onChange={handleChange}
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
//             <input
//               type="url"
//               name="website"
//               value={formData.website}
//               onChange={handleChange}
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//             />
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
//           <textarea
//             name="address"
//             value={formData.address}
//             onChange={handleChange}
//             rows="2"
//             className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//           <textarea
//             name="description"
//             value={formData.description}
//             onChange={handleChange}
//             rows="3"
//             className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//           />
//         </div>

//         {/* Type-Specific Fields */}
//         {type === "Hotel" && (
//           <div className="space-y-6 p-5 bg-gray-50 rounded-xl">
//             <h3 className="text-xl font-semibold text-gray-800">Hotel Details</h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
//                 <input
//                   type="text"
//                   name="registrationNumber"
//                   value={formData.registrationNumber}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">GST</label>
//                 <input
//                   type="text"
//                   name="gst"
//                   value={formData.gst}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//                 />
//               </div>
//             </div>

//             {/* Room Types */}
//             <div>
//               <div className="flex justify-between items-center mb-3">
//                 <label className="block text-sm font-medium text-gray-700">Room Types</label>
//                 <button
//                   type="button"
//                   onClick={addRoomType}
//                   className="text-sm bg-teal-100 text-teal-700 px-3 py-1 rounded-lg hover:bg-teal-200"
//                 >
//                   + Add Room
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 {roomTypes.map((room, index) => (
//                   <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
//                     <div className="flex justify-between items-start">
//                       <h4 className="font-medium text-gray-800 mb-3">Room {index + 1}</h4>
//                       {roomTypes.length > 1 && (
//                         <button
//                           type="button"
//                           onClick={() => removeRoomType(index)}
//                           className="text-red-500 hover:text-red-700 text-lg"
//                         >
//                           ✕
//                         </button>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <input
//                         type="text"
//                         placeholder="Room Name (e.g., Deluxe)"
//                         value={room.name}
//                         onChange={(e) => handleRoomChange(index, "name", e.target.value)}
//                         className="px-3 py-2 border border-gray-300 rounded-lg"
//                       />
//                       <input
//                         type="number"
//                         placeholder="Price per Night (₹)"
//                         value={room.pricePerNight}
//                         onChange={(e) => handleRoomChange(index, "pricePerNight", e.target.value)}
//                         className="px-3 py-2 border border-gray-300 rounded-lg"
//                       />
//                       <input
//                         type="number"
//                         placeholder="Max Guests"
//                         value={room.capacity}
//                         onChange={(e) => handleRoomChange(index, "capacity", e.target.value)}
//                         className="px-3 py-2 border border-gray-300 rounded-lg"
//                       />
//                       <textarea
//                         placeholder="Description"
//                         value={room.description}
//                         onChange={(e) => handleRoomChange(index, "description", e.target.value)}
//                         className="px-3 py-2 border border-gray-300 rounded-lg"
//                         rows="2"
//                       />
//                     </div>

//                     <div className="mt-3">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Room Amenities</label>
//                       <div className="flex flex-wrap gap-2">
//                         {roomAmenityOptions.map((amenity) => (
//                           <label key={amenity} className="flex items-center space-x-1">
//                             <input
//                               type="checkbox"
//                               checked={room.amenities.includes(amenity)}
//                               onChange={() => handleRoomAmenityChange(index, amenity)}
//                               className="h-4 w-4 text-teal-600 rounded"
//                             />
//                             <span className="text-sm">{amenity}</span>
//                           </label>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Hotel Amenities */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Property Amenities</label>
//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
//                 {amenityOptions.map((amenity) => (
//                   <label key={amenity} className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       checked={formData.amenities.includes(amenity)}
//                       onChange={() => handleCheckboxArrayChange("amenities", amenity)}
//                       className="h-4 w-4 text-teal-600 rounded"
//                     />
//                     <span className="text-sm text-gray-700">{amenity}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {type === "Banquet" && (
//           <div className="space-y-6 p-5 bg-gray-50 rounded-xl">
//             <h3 className="text-xl font-semibold text-gray-800">Banquet Details</h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
//                 <input
//                   type="text"
//                   name="gstNumber"
//                   value={formData.gstNumber}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Hall Type</label>
//                 <select
//                   name="hallType"
//                   value={formData.hallType}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//                 >
//                   <option value="">Select</option>
//                   {hallTypeOptions.map((opt) => (
//                     <option key={opt} value={opt}>
//                       {opt.charAt(0).toUpperCase() + opt.slice(1)}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
//                 <input
//                   type="number"
//                   name="capacity"
//                   value={formData.capacity}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Price per Event (₹)</label>
//                 <input
//                   type="number"
//                   name="pricePerEvent"
//                   value={formData.pricePerEvent}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Price per Plate (₹)</label>
//                 <input
//                   type="number"
//                   name="pricePerPlate"
//                   value={formData.pricePerPlate}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Parking Capacity</label>
//                 <input
//                   type="number"
//                   name="parkingCapacity"
//                   value={formData.parkingCapacity}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Event Types</label>
//               <div className="flex flex-wrap gap-3">
//                 {eventTypeOptions.map((et) => (
//                   <label key={et} className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       checked={formData.eventTypes.includes(et)}
//                       onChange={() => handleCheckboxArrayChange("eventTypes", et)}
//                       className="h-4 w-4 text-teal-600 rounded"
//                     />
//                     <span className="text-sm capitalize">{et}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Catering Options</label>
//               <div className="flex flex-wrap gap-3">
//                 {cateringOptionsList.map((opt) => (
//                   <label key={opt} className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       checked={formData.cateringOptions.includes(opt)}
//                       onChange={() => handleCheckboxArrayChange("cateringOptions", opt)}
//                       className="h-4 w-4 text-teal-600 rounded"
//                     />
//                     <span className="text-sm capitalize">{opt}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-6">
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   name="decorationAvailable"
//                   checked={formData.decorationAvailable}
//                   onChange={handleChange}
//                   className="h-4 w-4 text-teal-600 rounded"
//                 />
//                 <span className="text-sm text-gray-700">Decoration Available</span>
//               </label>
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   name="cateringAvailable"
//                   checked={formData.cateringAvailable}
//                   onChange={handleChange}
//                   className="h-4 w-4 text-teal-600 rounded"
//                 />
//                 <span className="text-sm text-gray-700">Catering Available</span>
//               </label>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
//                 {amenityOptions.map((amenity) => (
//                   <label key={amenity} className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       checked={formData.amenities.includes(amenity)}
//                       onChange={() => handleCheckboxArrayChange("amenities", amenity)}
//                       className="h-4 w-4 text-teal-600 rounded"
//                     />
//                     <span className="text-sm text-gray-700">{amenity}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Attractive Image Gallery */}
//         <div className="space-y-5">
//           <h3 className="text-xl font-semibold text-gray-800">Property Images</h3>

//           {/* Existing Images */}
//           {existingImages.length > 0 && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-3">Existing Images</label>
//               <div className="flex flex-wrap gap-4">
//                 {existingImages.map((img, i) => (
//                   <div key={i} className="relative group w-32 h-32 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
//                     <img
//                       src={img}
//                       alt={`existing-${i}`}
//                       className="w-full h-full object-cover"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => handleDeleteExistingImage(img)}
//                       className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* New Images */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Images</label>
//             <input
//               type="file"
//               multiple
//               accept="image/*"
//               onChange={handleImagesChange}
//               className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-600 file:text-white hover:file:bg-teal-700"
//             />
//             {newImages.length > 0 && (
//               <div className="mt-4 flex flex-wrap gap-4">
//                 {newImages.map((file, i) => (
//                   <div key={i} className="relative group w-32 h-32 rounded-xl overflow-hidden shadow-md">
//                     <img
//                       src={URL.createObjectURL(file)}
//                       alt={`new-${i}`}
//                       className="w-full h-full object-cover"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => handleDeleteNewImage(i)}
//                       className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Submit */}
//         <div className="flex justify-end pt-4">
//           <button
//             type="submit"
//             disabled={loading}
//             className={`px-7 py-3 rounded-xl font-semibold text-white ${
//               loading ? "bg-gray-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg transition"
//             }`}
//           >
//             {loading ? "Saving..." : "Save Changes"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default UpdateForm;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url =
        type === "Hotel"
          ? `${API_CONFIG.baseUrl}/api/hotels/${id}`
          : `${API_CONFIG.baseUrl}/api/banquet-halls/${id}`;

      const form = new FormData();

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

      if (type === "Hotel") {
        const validRooms = roomTypes.filter(
          (r) => r.name.trim() || r.pricePerNight || r.capacity || r.description || r.amenities.length > 0
        );
        form.append("roomTypes", JSON.stringify(validRooms));
      }

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
    <div className=" min-h-screen bg-slate-50 py-8 px-10 sm:px-6">
      <div className="">
        {/* Header Section */}
        <div className="mb-8 flex px-10 items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Update Property</h1>
            <p className="text-slate-500 mt-1">Manage details for your {type}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Basic Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Form Group Helper */}
                <div className="form-group">
                  <label className="form-label">Property Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alternate Contact</label>
                  <input
                    type="tel"
                    name="alternateContact"
                    value={formData.alternateContact}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City / District</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Website URL</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="form-group">
                  <label className="form-label">Full Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Property Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="form-input"
                    placeholder="Describe the vibe, highlights, and unique features..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Specific Card */}
          {type === "Hotel" && (
            <div className="bg-white mt-5 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  Hotel Specific Details
                </h2>
              </div>
              
              <div className="p-6 space-y-8">
                {/* Legal & Tax */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Registration Number</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GSTIN</label>
                    <input
                      type="text"
                      name="gst"
                      value={formData.gst}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Room Types */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-bold text-slate-800">Room Configurations</h3>
                    <button
                      type="button"
                      onClick={addRoomType}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      Add Room Type
                    </button>
                  </div>

                  <div className="space-y-4">
                    {roomTypes.map((room, index) => (
                      <div key={index} className="p-5 border border-slate-200 rounded-xl bg-slate-50/30 relative group hover:border-teal-300 transition-colors">
                        {roomTypes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRoomType(index)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"
                            title="Remove Room"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="col-span-2 lg:col-span-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Room Name</label>
                            <input
                              type="text"
                              placeholder="e.g., Deluxe Suite"
                              value={room.name}
                              onChange={(e) => handleRoomChange(index, "name", e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Price/Night (₹)</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={room.pricePerNight}
                              onChange={(e) => handleRoomChange(index, "pricePerNight", e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Capacity</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={room.capacity}
                              onChange={(e) => handleRoomChange(index, "capacity", e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                           <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Description</label>
                           <textarea
                              placeholder="Short room description..."
                              value={room.description}
                              onChange={(e) => handleRoomChange(index, "description", e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                              rows="2"
                            />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Room Amenities</label>
                          <div className="flex  flex-wrap gap-2">
                            {roomAmenityOptions.map((amenity) => (
                              <label key={amenity} className="cursor-pointer  select-none">
                                <input
                                  type="checkbox"
                                  className="peer  sr-only"
                                  checked={room.amenities.includes(amenity)}
                                  onChange={() => handleRoomAmenityChange(index, amenity)}
                                />
                                <span className="px-4 py-1 text-xs font-medium border border-slate-200 rounded-md text-slate-600 peer-checked:bg-teal-600 peer-checked:text-white peer-checked:border-teal-600 transition-all">
                                  {amenity}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Property Amenities */}
                <div className="shadow px-5 mt-5 py-2 my-3">
                  <div className="p-2  mb-3 border border-slate-200 rounded mt-3 bg-gray-100">
                  <label className="  font-semibold text-slate-500 uppercase tracking-wide mb-6">Property Amenities</label>

                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {amenityOptions.map((amenity) => (
                      <label key={amenity} className="flex items-center space-x-2 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 transition-all checked:border-teal-500 checked:bg-teal-500"
                            checked={formData.amenities.includes(amenity)}
                            onChange={() => handleCheckboxArrayChange("amenities", amenity)}
                          />
                          <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none">
                            <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="text-sm text-slate-700 group-hover:text-teal-600 transition-colors">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Banquet Specific Card */}
          {type === "Banquet" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.5458C20.4796 16.2633 19.7488 16.8122 18.9064 17.1394C18.064 17.4666 17.1433 17.5596 16.25 17.4085V21H8V17.4085C7.10672 17.5596 6.18601 17.4666 5.34361 17.1394C4.50121 16.8122 3.77044 16.2633 3.25 15.5458V21H1V3H3V15.5458C3.575 16.4 4.575 17 5.75 17C6.925 17 7.925 16.4 8.5 15.5458V3H15.75V15.5458C16.325 16.4 17.325 17 18.5 17C19.675 17 20.675 16.4 21.25 15.5458V21H23.5V3H21.25V15.5458Z"></path></svg>
                  Banquet Specific Details
                </h2>
              </div>

              <div className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="form-group">
                    <label className="form-label">GST Number</label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hall Type</label>
                    <select
                      name="hallType"
                      value={formData.hallType}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">Select Type</option>
                      {hallTypeOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Capacity (Pax)</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price per Event (₹)</label>
                    <input
                      type="number"
                      name="pricePerEvent"
                      value={formData.pricePerEvent}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price per Plate (₹)</label>
                    <input
                      type="number"
                      name="pricePerPlate"
                      value={formData.pricePerPlate}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Parking Capacity</label>
                    <input
                      type="number"
                      name="parkingCapacity"
                      value={formData.parkingCapacity}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="form-label mb-3 block">Event Types Hosted</label>
                    <div className="flex flex-wrap gap-2">
                      {eventTypeOptions.map((et) => (
                        <label key={et} className="cursor-pointer">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={formData.eventTypes.includes(et)}
                            onChange={() => handleCheckboxArrayChange("eventTypes", et)}
                          />
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200 text-slate-600 bg-white peer-checked:bg-teal-50 peer-checked:text-teal-700 peer-checked:border-teal-200 transition-all hover:bg-slate-50">
                            {et}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="form-label mb-3 block">Catering Options</label>
                    <div className="flex flex-wrap gap-2">
                      {cateringOptionsList.map((opt) => (
                        <label key={opt} className="cursor-pointer">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={formData.cateringOptions.includes(opt)}
                            onChange={() => handleCheckboxArrayChange("cateringOptions", opt)}
                          />
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200 text-slate-600 bg-white peer-checked:bg-teal-50 peer-checked:text-teal-700 peer-checked:border-teal-200 transition-all hover:bg-slate-50">
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="decorationAvailable"
                        checked={formData.decorationAvailable}
                        onChange={handleChange}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:border-teal-500 checked:bg-teal-500 transition-all"
                      />
                      <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" viewBox="0 0 14 14" fill="none">
                        <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700">In-house Decoration Available</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="cateringAvailable"
                        checked={formData.cateringAvailable}
                        onChange={handleChange}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:border-teal-500 checked:bg-teal-500 transition-all"
                      />
                      <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" viewBox="0 0 14 14" fill="none">
                        <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700">In-house Catering Available</span>
                  </label>
                </div>

                <div>
                  <label className="form-label mb-3 block">Facilities & Amenities</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {amenityOptions.map((amenity) => (
                      <label key={amenity} className="flex items-center space-x-2 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 transition-all checked:border-teal-500 checked:bg-teal-500"
                            checked={formData.amenities.includes(amenity)}
                            onChange={() => handleCheckboxArrayChange("amenities", amenity)}
                          />
                          <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none">
                            <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="text-sm text-slate-700 group-hover:text-teal-600 transition-colors">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image Gallery Section */}
          <div className="bg-white mt-5 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Property Gallery
              </h2>
            </div>
            
            <div className="p-6">
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Current Photos ({existingImages.length})</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {existingImages.map((img, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img
                          src={img}
                          alt={`existing-${i}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteExistingImage(img)}
                            className="bg-white text-red-500 rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                            title="Delete Image"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Upload New Photos</h3>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-teal-500 hover:bg-teal-50/30 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImagesChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="pointer-events-none">
                    <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-slate-600">
                      <span className="font-medium text-teal-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>

                {newImages.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {newImages.map((file, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 border border-teal-200">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`new-${i}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteNewImage(i)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-10"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-2.5 rounded-lg text-white font-semibold shadow-lg shadow-teal-900/20 transition-all transform hover:-translate-y-0.5 ${
                loading ? "bg-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600"
              }`}
            >
              {loading ? (
                <span className="flex items-center py-1 gap-2">
                  <svg className="animate-spin h-5 w-5  text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (


    
                "Save Changes"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UpdateForm;