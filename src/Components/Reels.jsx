// import React, { useEffect, useState, useRef } from "react";
// import { FaHome, FaHotel, FaInstagram } from "react-icons/fa";
// import { FaShare } from "react-icons/fa6";
// import { MdDelete } from "react-icons/md";
// import { CgProfile } from "react-icons/cg";
// import { MdMeetingRoom } from "react-icons/md";
// import { BsBuildings } from "react-icons/bs";
// import axios from "axios";
// import "./Reels.css";
// import nearprop from "../assets/nearproplogo.png"
// import { Link } from "react-router-dom";

// const Reels = () => {
//   const [reels, setReels] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchId, setSearchId] = useState("");
//   const [activeId, setActiveId] = useState("");
//   const [selectedReelId, setSelectedReelId] = useState(null);
//   const [reelComments, setReelComments] = useState({});
//   const [error, setError] = useState(null);
//   const [reelPagination, setReelPagination] = useState({});
//   const [viewedReels, setViewedReels] = useState(new Set());
//   const videoRefs = useRef({});

//   // Track upload reels states
//   const [hotelId, setHotelId] = useState("");
//   const [hotels, setHotels] = useState([]);
//   // console.log(hotels)
//   // const [rooms, setRooms] = useState([]);
//   const [title, setTitle] = useState("");
//   const [video, setVideo] = useState(null);
//   const [message, setMessage] = useState("");
//   const [showPopup, setShowPopup] = useState(false);
//   const [isOpen, setIsOpen] = useState(true);
//   const [myReels, setMyReels] = useState(reels);

//   const token = localStorage.getItem("token");
//   // console.log(token)

//   // Fetch hotels

//   useEffect(() => {
//     const fetchHotels = async () => {
//       try {
//         const res = await axios.get("https://hotel-banquet.nearprop.in/api/hotels/owner", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         console.log("Owner Hotels response:", res.data);
//         setHotels(res.data.data.hotels || []);
//       } catch (error) {
//         console.error("Error fetching hotels:", error);
//         setHotels([]);
//         setError(error.response?.data?.message || "Failed to load hotels.");
//       }
//     };
//     fetchHotels();
//   }, []);


//   // Fetch rooms for the selected hotel
//   const fetchRooms = async (hotelId) => {
//     if (!hotelId) {
//       setRooms([]);
//       return;
//     }
//     try {
//       const res = await axios.get(`https://hotel-banquet.nearprop.in/api/rooms/${hotelId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       console.log("Rooms API response:", res.data); // Debug API response
//       if (res.data.success) {
//         setRooms(res.data.data || []);
//       } else {
//         setRooms([]);
//         setError(res.data.message || "No rooms found for this hotel.");
//       }
//     } catch (error) {
//       console.error("Error fetching rooms:", error);
//       setRooms([]);
//       setError(error.response?.data?.message || "Failed to load rooms.");
//     }
//   };

//   // Update progress
//   const updateProgress = (id, e) => {
//     const video = e.target;
//     const progress = (video.currentTime / video.duration) * 100;
//     setReels((prev) =>
//       prev.map((r) => (r._id === id ? { ...r, progress } : r))
//     );
//   };

//   // Reset progress when video ends
//   const resetProgress = (id) => {
//     setReels((prev) =>
//       prev.map((r) => (r._id === id ? { ...r, progress: 0 } : r))
//     );
//   };

//   // Fetch reels
//   const fetchReels = async (hotelId = "") => {
//     setLoading(true);
//     setError(null);
//     try {
//       const url = hotelId
//         ? `https://hotel-banquet.nearprop.in/api/reels/${hotelId}/`
//         : "https://hotel-banquet.nearprop.in/api/reels/all";

//       const res = await axios.get(url);
//       console.log("Reels API response:", res.data);

//       if (res.data.success) {
//         const reelsData = res.data.data?.reels || res.data.data || [];
//         setReels(
//           reelsData.map((reel) => ({
//             ...reel,
//             newComment: "",
//             isLiked: reel.likedByUser || false,
//             comments: (reel.comments || []).map((comment, index) => ({
//               _id: comment._id || `temp-${Date.now()}-${index}`,
//               comment: comment.comment || "No comment text",
//               user: {
//                 name: comment.userId?.name || "Anonymous",
//                 profileImage: comment.userId?.profileImage || null,
//               },
//               createdAt: comment.createdAt || new Date().toISOString(),
//             })),
//           }))
//         );
//         setReelComments((prev) => ({
//           ...prev,
//           ...reelsData.reduce((acc, reel) => {
//             if (reel.comments && reel.comments.length > 0) {
//               acc[reel._id] = reel.comments.map((comment, index) => ({
//                 _id: comment._id || `temp-${Date.now()}-${index}`,
//                 comment: comment.comment || "No comment text",
//                 user: {
//                   name: comment.userId?.name || "Anonymous",
//                   profileImage: comment.userId?.profileImage || null,
//                 },
//                 createdAt: comment.createdAt || new Date().toISOString(),
//               }));
//             }
//             return acc;
//           }, {}),
//         }));
//         setHotels(res.data.data || []);
//       } else {
//         setReels([]);
//         setError(res.data.message || "No reels found.");
//       }
//     } catch (error) {
//       console.error("Error fetching reels:", error);
//       setReels([]);
//       setError(error.response?.data?.message || "Failed to load reels.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch comments for a specific reel
//   const fetchComments = async (reelId, page = 1, append = false) => {
//     setError(null);
//     try {
//       const res = await axios.get(
//         `https://hotel-banquet.nearprop.in/api/reels/${reelId}/comments?page=${page}&limit=10`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log(`Comments API response for reel ${reelId}:`, res.data);

//       if (res.data.success) {
//         let commentsData = [];
//         if (Array.isArray(res.data.data)) {
//           commentsData = res.data.data;
//         } else if (Array.isArray(res.data.data?.comments)) {
//           commentsData = res.data.data.comments;
//         } else if (res.data.data && typeof res.data.data === "object") {
//           const keys = Object.keys(res.data.data);
//           const commentsKey = keys.find((key) => Array.isArray(res.data.data[key]));
//           if (commentsKey) {
//             commentsData = res.data.data[commentsKey];
//           }
//         }

//         const sanitizedComments = commentsData.map((comment, index) => ({
//           _id: comment._id || `temp-${Date.now()}-${index}`,
//           comment: comment.comment || "No comment text",
//           user: {
//             name: comment.userId?.name || comment.username || "Anonymous",
//             profileImage: comment.userId?.profileImage || comment.user?.avatar || null,
//           },
//           createdAt: comment.createdAt || comment.timestamp || new Date().toISOString(),
//         }));

//         setReelComments((prev) => ({
//           ...prev,
//           [reelId]: append ? [...(prev[reelId] || []), ...sanitizedComments] : sanitizedComments,
//         }));

//         const total = res.data.data?.total || res.data.total || commentsData.length;
//         const perPage = res.data.data?.limit || res.data.limit || 10;
//         const current = res.data.data?.page || res.data.page || page;

//         setReelPagination((prev) => ({
//           ...prev,
//           [reelId]: {
//             page: current,
//             hasMore: total > current * perPage,
//             total,
//           },
//         }));
//       } else {
//         setReelComments((prev) => ({ ...prev, [reelId]: [] }));
//         setError(res.data.message || "No comments available.");
//       }
//     } catch (error) {
//       console.error("Error fetching comments:", error);
//       setReelComments((prev) => ({ ...prev, [reelId]: [] }));
//       setError(error.response?.data?.message || "Failed to load comments.");
//     }
//   };

//   // Track reel view
//   // const trackReelView = async (reelId) => {
//   //   if (viewedReels.has(reelId)) {
//   //     console.log(`Reel ${reelId} already viewed in this session. Skipping request.`);
//   //     return;
//   //   }

//   //   const token = localStorage.getItem("token");
//   //   if (!token) {
//   //     console.error("No authentication token found in localStorage.");
//   //     setError("Authentication token missing. Please log in.");
//   //     return;
//   //   }

//   //   const requestUrl = `https://hotel-banquet.nearprop.in/api/reels/${reelId}/view`;
//   //   console.log(reelId)
//   //   // console.log(`Attempting PATCH request to ${requestUrl} with token: ${token.substring(0, 10)}...`);

//   //   try {
//   //     const response = await axios.patch(
//   //       requestUrl,
//   //       {
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //           "Content-Type": "application/json",
//   //         },
//   //         withCredentials: false,
//   //       }
//   //     );

//   //     console.log(`View tracked successfully for reel ${reelId}:`, {
//   //       status: response.status,
//   //       data: response.data,
//   //     });
//   //     setViewedReels((prev) => new Set(prev).add(reelId));
//   //     setReels((prev) =>
//   //       prev.map((reel) =>
//   //         reel._id === reelId
//   //           ? {
//   //             ...reel,
//   //             stats: {
//   //               ...reel.stats,
//   //               viewsCount: (reel.stats?.viewsCount || 0) + 1,
//   //             },
//   //           }
//   //           : reel
//   //       )
//   //     );
//   //   } catch (error) {
//   //     console.error(`Error tracking reel view for reel ${reelId}:`, {
//   //       status: error.response?.status,
//   //       statusText: error.response?.statusText,
//   //       data: error.response?.data,
//   //       message: error.message,
//   //       config: {
//   //         url: error.config?.url,
//   //         method: error.config?.method,
//   //         headers: error.config?.headers,
//   //       },
//   //     });
//   //     if (error.response?.status === 404) {
//   //       setError(`View tracking endpoint not found for reel ${reelId}. Verify the URL or reel ID.`);
//   //     } else if (error.response?.status === 401) {
//   //       setError("Unauthorized. Please check your token and log in again.");
//   //     } else if (error.response?.status === 400) {
//   //       setError(`Bad request: ${error.response?.data?.message || "Check the request format."}`);
//   //     } else if (error.response?.status === 500) {
//   //       setError(`Server error: ${error.response?.data?.message || "Contact the server admin."}`);
//   //     } else if (error.message.includes("Network Error")) {
//   //       setError("Network error. Check your internet connection or server availability.");
//   //     } else {
//   //       setError(`Failed to track reel view: ${error.response?.data?.message || error.message}`);
//   //     }
//   //   }
//   // };

//   // Toggle comments visibility
//   const toggleComments = (reelId) => {
//     if (selectedReelId === reelId) {
//       setSelectedReelId(null);
//       setError(null);
//     } else {
//       setSelectedReelId(reelId);
//       if (!reelComments[reelId]) {
//         fetchComments(reelId, 1, false);
//       }
//     }
//   };

//   useEffect(() => {
//     fetchReels();
//   }, []);

//   // Fetch rooms when hotelId changes
//   useEffect(() => {
//     fetchRooms(hotelId);
//   }, [hotelId]);

//   // Handle search
//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (searchId.trim() === "") {
//       fetchReels();
//       setActiveId("");
//     } else {
//       fetchReels(searchId.trim());
//       setActiveId(searchId.trim());
//     }
//   };

//   const toggleLikeheart = (id) => {
//     setReels((prev) =>
//       prev.map((reel) =>
//         reel._id === id
//           ? {
//             ...reel,
//             isLiked: !reel.isLiked,
//             stats: {
//               ...reel.stats,
//               likesCount: reel.isLiked
//                 ? reel.stats.likesCount - 1
//                 : reel.stats.likesCount + 1,
//             },
//             showHeart: !reel.isLiked ? true : reel.showHeart,
//           }
//           : reel
//       )
//     );

//     setTimeout(() => {
//       setReels((prev) =>
//         prev.map((reel) =>
//           reel._id === id ? { ...reel, showHeart: false } : reel
//         )
//       );
//     }, 800);
//   };

//   // Toggle like/unlike reel
//   const toggleLike = async (reelId) => {
//     try {
//       await axios.post(
//         `https://hotel-banquet.nearprop.in/api/reels/${reelId}/like`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setReels((prev) =>
//         prev.map((reel) =>
//           reel._id === reelId
//             ? {
//               ...reel,
//               stats: {
//                 ...reel.stats,
//                 likesCount: reel.isLiked ? reel.stats.likesCount - 1 : reel.stats.likesCount + 1,
//               },
//               isLiked: !reel.isLiked,
//             }
//             : reel
//         )
//       );
//     } catch (error) {
//       console.error("Error toggling like:", error);
//       setError(error.response?.data?.message || "Failed to toggle like.");
//     }
//   };

//   // Add comment
//   const addComment = async (reelId, commentText) => {
//     if (!commentText.trim()) {
//       setError("Comment cannot be empty.");
//       return;
//     }

//     setError(null);
//     try {
//       console.log("Posting comment for reel:", reelId, "with text:", commentText);
//       const res = await axios.post(
//         `https://hotel-banquet.nearprop.in/api/reels/${reelId}/comment`,
//         { comment: commentText },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log("Add comment response:", res.data);

//       if (res.data.success) {
//         const newCommentRaw = res.data.data;

//         const newComment = {
//           _id: newCommentRaw._id || `temp-${Date.now()}`,
//           comment: typeof newCommentRaw.comment === "string" ? newCommentRaw.comment : commentText,
//           user: {
//             name: newCommentRaw.userId?.name || newCommentRaw.username || "Anonymous",
//             profileImage: newCommentRaw.userId?.profileImage || newCommentRaw.user?.avatar || null,
//           },
//           createdAt: newCommentRaw.createdAt || new Date().toISOString(),
//         };

//         setReels((prev) => {
//           const updatedReels = prev.map((reel) =>
//             reel._id === reelId
//               ? {
//                 ...reel,
//                 stats: {
//                   ...reel.stats,
//                   commentsCount: (reel.stats?.commentsCount || 0) + 1,
//                 },
//                 comments: [...(reel.comments || []), newComment],
//               }
//               : reel
//           );
//           console.log("Updated reels:", updatedReels);
//           return updatedReels;
//         });

//         setReelComments((prev) => {
//           const updatedComments = [...(prev[reelId] || []), newComment];
//           console.log("Updated reelComments for reel", reelId, ":", updatedComments);
//           return {
//             ...prev,
//             [reelId]: updatedComments,
//           };
//         });
//       } else {
//         setError(res.data.message || "Failed to add comment.");
//       }
//     } catch (error) {
//       console.error("Error adding comment:", error);
//       setError(error.response?.data?.message || error.message || "Failed to add comment.");
//     }
//   };

//   // // Handle hotel change

//   // const handleHotelChange = (e) => {
//   //   const selectedId = e.target.value;
//   //   setHotelId(selectedId);
//   //   console.log("Selected hotelId:", selectedId); // Debug hotelId
//   // };



//   // Upload reels
//   const uploadmyreels = async (e) => {
//     e.preventDefault();
//     if (!video) {
//       setMessage("Please select a video file!");
//       return;
//     }
//     if (!hotelId) {
//       setMessage("Please select a hotel!");
//       return;
//     }

//     const maxFileSize = 100 * 1024 * 1024; // 100MB
//     if (video.size > maxFileSize) {
//       setMessage("Video file size is too large. Maximum 100MB allowed.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("hotelId", hotelId);
//     formData.append("title", title);
//     formData.append("video", video);
//     try {
//       setMessage("");
//       const res = await axios.post(
//         "https://hotel-banquet.nearprop.in/api/reels/",
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       setMessage(`✅ Uploaded successfully: ${res.data.message || "Reel added!"}`);
//       setShowPopup(false);
//       alert("Reel uploaded");
//       setTitle("");
//       setVideo(null);
//       setHotelId("");
//       fetchReels();
//     } catch (err) {
//       console.error("Error uploading reel:", err);
//       setMessage(`❌ Upload failed: ${err.response?.data?.message || err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // delete reel button ->
//   const deleteMyReel = async (id) => {
//     try {
//       const confirmDelete = window.confirm("Are you sure to delete reel?");
//       if (!confirmDelete) return; //
//       const response = await axios.delete(
//         `https://hotel-banquet.nearprop.in/api/reels/${id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setMyReels((prevReels) => prevReels.filter((reel) => reel._id !== id));

//       console.log("✅ Reel deleted:", id);
//       window.alert("Reel Deleted Sucessfully");
//       window.location.reload(); // 🔄 पूरी page reload कर देगा

//       console.log("✅ Reel deleted successfully:", response.data);
//     } catch (error) {
//       console.error(
//         "❌ Error deleting reel:",
//         error.response?.data || error.message
//       );
//     }
//   };


//   return (
//     <div className="reels-page">

//       {window.innerWidth < 768 && (
//         <button
//           className="sidebar-toggle-btn"
//           onClick={() => setIsOpen(!isOpen)}
//           style={{
//             position: "fixed",
//             top: "20px",
//             left: "20px",
//             zIndex: 100000,
//             padding: "10px 15px",
//             background: "#1a1a1a",
//             color: "white",
//             border: "none",
//             borderRadius: "5px",
//           }}
//         >
//           {isOpen ? "Menu" : "Close"}
//         </button>
//       )}


//       <div
//         className={`left-toggle-div ${window.innerWidth < 768 && isOpen ? "mobile-hidden" : ""
//           }`}
//       >
//         <div className="logo-image-div">
//           <img style={{ width: "50px" }} src={nearprop} alt="Logo" />
//           <h1 style={{ fontSize: "24px" }}>Nearprop</h1>
//         </div>
//         <div className="all-toggle-headings">
//           <Link style={{ textDecoration: "none", color: "white" }} to="/"  >   <h2 className="toggle-headings-name"> <FaHome />&nbsp; Home</h2> </Link>

//           <Link to="/hb?tab=banquets" style={{ textDecoration: "none", color: "white" }}  >
//             <h2 className="toggle-headings-name"> <BsBuildings /> &nbsp;  Banquets</h2></Link>

//           <Link to="/hb" style={{ textDecoration: "none", color: "white" }}  >  <h2 className="toggle-headings-name">   <FaHotel />&nbsp;  Hotels</h2> </Link>
//           <Link style={{ textDecoration: "none", color: "white" }} to="/rooms" >
//             <h2 className="toggle-headings-name"> <MdMeetingRoom /> &nbsp;  Rooms</h2></Link>

//           <Link style={{ textDecoration: "none", color: "white" }} to="/userprofile"  >
//             <h2 className="toggle-headings-name"> <CgProfile />  &nbsp; Profile</h2>
//           </Link>
//         </div>
//       </div>


//       {/* Floating Button */}
//       <button className="uploadReelFloatingBtn" onClick={() => setShowPopup(true)}>

//         <FaInstagram style={{ fontSize: "30px" }} />
//       </button>
//       {/* Popup Modal */}
//       {showPopup && (
//         <div className="uploadReelOverlay">
//           <div className="uploadReelModal">
//             <button className="uploadReelCloseBtn" onClick={() => setShowPopup(false)}>
//               ✖
//             </button>

//             <h2>Upload Reel</h2>
//             <form onSubmit={uploadmyreels}>
//               <div>
//                 <label>Select Hotel:</label>
//                 <select
//                   value={hotelId}
//                   onChange={(e) => {
//                     setHotelId(e.target.value);
//                     console.log("Selected hotelId:", e.target.value);
//                   }}
//                 >
//                   <option value="">Select Hotel</option>
//                   {hotels.map((hotel) => (
//                     <option key={hotel._id} value={hotel.hotelId}>
//                       {hotel.hotelName || hotel.name} ({hotel.hotelId})
//                     </option>
//                   ))}
//                 </select>


//               </div>

//               <div>
//                 <label>Title:</label>
//                 <input
//                   type="text"
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                   placeholder="Enter reel title"
//                   required
//                 />
//               </div>
//               <div>
//                 <label>Video File:</label>
//                 <input
//                   type="file"
//                   accept="video/*"
//                   onChange={(e) => setVideo(e.target.files[0])}
//                   required
//                 />
//               </div>
//               <button type="submit" disabled={loading}>
//                 {loading ? "Uploading..." : "Upload Reel"}
//               </button>
//             </form>
//             {message && <p>{message}</p>}
//           </div>
//         </div>
//       )}

//       {error && <p className="reels-error">{error}</p>}

//       {loading ? (
//         <p className="reels-loading">Loading reels...</p>
//       ) : reels.length === 0 ? (
//         <div className="no-reels">
//           <p>No reels found.</p>
//         </div>
//       ) : (
//         reels.map((reel) => {
//           const currentComments = reelComments[reel._id] || reel.comments || [];
//           const pagination = reelPagination[reel._id] || {};
//           const isCommentsVisible = selectedReelId === reel._id;

//           return (
//             <div className="reel-card" onDoubleClick={() => toggleLikeheart(reel._id)} key={reel._id}>
//               <video
//                 ref={(el) => (videoRefs.current[reel._id] = el)}
//                 autoPlay
//                 loop
//                 muted
//                 src={reel.content}
//                 className="reel-video"
//                 onTimeUpdate={(e) => updateProgress(reel._id, e)}
//                 // onPlay={() => trackReelView(reel._id)}x`
//                 onMouseDown={() => {
//                   const video = videoRefs.current[reel._id];
//                   if (video) video.pause();
//                 }}
//                 onMouseUp={() => {
//                   const video = videoRefs.current[reel._id];
//                   if (video) video.play();
//                 }}
//                 onTouchStart={() => {
//                   const video = videoRefs.current[reel._id];
//                   if (video) video.pause();
//                 }}
//                 onTouchEnd={() => {
//                   const video = videoRefs.current[reel._id];
//                   if (video) video.play();
//                 }}
//               />
//               <div
//                 className="reel-progress"
//                 onClick={(e) => {
//                   const bar = e.currentTarget;
//                   const clickX = e.nativeEvent.offsetX;
//                   const barWidth = bar.offsetWidth;

//                   const percentage = clickX / barWidth;
//                   const video = videoRefs.current[reel._id];

//                   if (video) {
//                     video.currentTime = percentage * video.duration;
//                   }
//                 }}
//               >
//                 <div
//                   className="reel-progress-fill"
//                   style={{ width: reel.progress + "%" }}
//                 ></div>
//               </div>

//               <div className="reel-overlay">
//                 <div className="reel-left">
//                   <div className="reel-owner">
//                     <img
//                       src={
//                         reel.owner?.images?.[0] ||
//                         reel.owner?.userId?.profileImage ||
//                         "https://via.placeholder.com/50"
//                       }
//                       alt="Owner"
//                       className="reel-owner-img"
//                     />
//                     <div>
//                       <h3 className="reel-owner-name">{reel.owner?.name || "Unknown"}</h3>
//                       <p className="reel-owner-location">
//                         {reel.owner?.city || "Unknown"},{" "}
//                         {reel.owner?.state || "Unknown"}
//                       </p>
//                     </div>
//                   </div>
//                   <h4 className="reel-video-title">{reel.title || "Untitled"}</h4>
//                 </div>

//                 <div className="reel-right">
//                   <div className="reel-action" onClick={() => toggleLike(reel._id)}>
//                     <span className="reel-icon">{reel.isLiked ? "💖" : "🤍"}</span>
//                     <span className="reel-count">{reel.stats?.likesCount || 0}</span>
//                   </div>

//                   <div className="reel-action" onClick={() => toggleComments(reel._id)}>
//                     <span className="reel-icon">💬</span>
//                     <span className="reel-count">{reel.stats?.commentsCount || 0}</span>
//                   </div>

//                   <div className="reel-action">
//                     <span className="reel-icon"> <FaShare /></span>
//                     <span className="reel-count">{reel.stats?.sharesCount || 0}</span>
//                   </div>

//                   {/* <div className="reel-action">
//                     <span className="reel-icon">👁️</span>
//                     <span className="reel-count">{reel.stats?.viewsCount || 0}</span>
//                   </div> */}

//                   <div className="reel-action">
//                     <span className="reel-icon" onClick={() => deleteMyReel(reel._id)}>  <MdDelete /> </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })
//       )}

//       {selectedReelId && (
//         <div
//           className="comments-popup-overlay"
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: "rgba(0, 0, 0, 0.5)",
//             zIndex: 1000,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: "20px",
//           }}
//           onClick={(e) => {
//             if (e.target === e.currentTarget) {
//               setSelectedReelId(null);
//             }
//           }}
//         >
//           <div
//             className="comments-popup"
//             style={{
//               backgroundColor: "white",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: "500px",
//               maxHeight: "80vh",
//               display: "flex",
//               flexDirection: "column",
//               boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
//             }}
//           >
//             <div
//               style={{
//                 padding: "20px",
//                 borderBottom: "1px solid #e0e0e0",
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
//                 Comments ({reels.find((r) => r._id === selectedReelId)?.stats?.commentsCount || 0})
//               </h3>
//               <button
//                 onClick={() => setSelectedReelId(null)}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   fontSize: "24px",
//                   cursor: "pointer",
//                   padding: "5px",
//                   borderRadius: "50%",
//                   width: "35px",
//                   height: "35px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 ×
//               </button>
//             </div>

//             <div
//               className="popup-comments-container"
//               style={{
//                 flex: 1,
//                 overflowY: "auto",
//                 padding: "0 20px",
//                 maxHeight: "calc(80vh - 160px)",
//               }}
//               onScroll={(e) => {
//                 const { scrollTop, scrollHeight, clientHeight } = e.target;
//                 const pagination = reelPagination[selectedReelId] || {};
//                 if (scrollHeight - scrollTop <= clientHeight + 50 && pagination.hasMore) {
//                   fetchComments(selectedReelId, (pagination.page || 1) + 1, true);
//                 }
//               }}
//             >
//               {(reelComments[selectedReelId] || []).length === 0 ? (
//                 <div style={{ textAlign: "center", padding: "40px 0", color: "#666" }}>
//                   <p style={{ margin: 0, fontSize: "16px" }}>No comments yet.</p>
//                   <p style={{ margin: "5px 0 0 0", fontSize: "14px" }}>Be the first to comment!</p>
//                 </div>
//               ) : (
//                 <div style={{ padding: "15px 0" }}>
//                   {(reelComments[selectedReelId] || []).map((comment, index) => (
//                     <div
//                       key={comment._id || `comment-${index}`}
//                       className="popup-comment"
//                       style={{
//                         padding: "15px",
//                         borderBottom:
//                           index < (reelComments[selectedReelId] || []).length - 1
//                             ? "1px solid #f0f0f0"
//                             : "none",
//                         backgroundColor: "white",
//                         borderRadius: "8px",
//                         marginBottom: "10px",
//                         boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
//                       }}
//                     >
//                       <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
//                         <img
//                           src={comment.user?.profileImage || "https://via.placeholder.com/40"}
//                           alt="User"
//                           style={{
//                             width: "40px",
//                             height: "40px",
//                             borderRadius: "50%",
//                             marginRight: "12px",
//                             objectFit: "cover",
//                           }}
//                         />
//                         <div>
//                           <strong style={{ fontSize: "15px", color: "#333", display: "block" }}>
//                             {comment.user?.name || "Anonymous"}
//                           </strong>
//                           <span style={{ fontSize: "12px", color: "#888" }}>
//                             {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "Just now"}
//                           </span>
//                         </div>
//                       </div>
//                       <p
//                         style={{
//                           margin: "0",
//                           fontSize: "14px",
//                           lineHeight: "1.5",
//                           color: "#333",
//                           paddingLeft: "52px",
//                         }}
//                       >
//                         {typeof comment.comment === "string" ? comment.comment : "No comment text"}
//                       </p>
//                     </div>
//                   ))}
//                   {(reelPagination[selectedReelId] || {}).hasMore && (
//                     <div
//                       style={{
//                         textAlign: "center",
//                         padding: "15px",
//                         color: "#666",
//                         fontSize: "14px",
//                       }}
//                     >
//                       📝 Scroll down to load more comments...
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div
//               style={{
//                 padding: "20px",
//                 borderTop: "1px solid #e0e0e0",
//                 backgroundColor: "#f9f9f9",
//               }}
//             >
//               <div style={{ display: "flex", gap: "10px" }}>
//                 <input
//                   type="text"
//                   placeholder="Write a comment..."
//                   value={reels.find((r) => r._id === selectedReelId)?.newComment || ""}
//                   onChange={(e) =>
//                     setReels((prev) =>
//                       prev.map((r) =>
//                         r._id === selectedReelId ? { ...r, newComment: e.target.value } : r
//                       )
//                     )
//                   }
//                   style={{
//                     flex: 1,
//                     padding: "12px 15px",
//                     border: "1px solid #ddd",
//                     borderRadius: "25px",
//                     fontSize: "14px",
//                     outline: "none",
//                   }}
//                   onKeyPress={(e) => {
//                     if (e.key === "Enter") {
//                       const commentText = reels.find((r) => r._id === selectedReelId)?.newComment || "";
//                       if (commentText.trim()) {
//                         addComment(selectedReelId, commentText);
//                         setReels((prev) =>
//                           prev.map((r) =>
//                             r._id === selectedReelId ? { ...r, newComment: "" } : r
//                           )
//                         );
//                       }
//                     }
//                   }}
//                 />
//                 <button
//                   onClick={() => {
//                     const commentText = reels.find((r) => r._id === selectedReelId)?.newComment || "";
//                     if (commentText.trim()) {
//                       addComment(selectedReelId, commentText);
//                       setReels((prev) =>
//                         prev.map((r) =>
//                           r._id === selectedReelId ? { ...r, newComment: "" } : r
//                         )
//                       );
//                     }
//                   }}
//                   style={{
//                     padding: "12px 20px",
//                     backgroundColor: "#007bff",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "25px",
//                     cursor: "pointer",
//                     fontSize: "14px",
//                     fontWeight: "600",
//                   }}
//                 >
//                   Post
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Reels;


import React, { useEffect, useState, useRef } from "react";
import { FaHome, FaHotel, FaInstagram } from "react-icons/fa";
import { FaShare } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { MdMeetingRoom } from "react-icons/md";
import { BsBuildings } from "react-icons/bs";
import axios from "axios";
import "./Reels.css";
import nearprop from "../assets/nearproplogo.png";
import { Link } from "react-router-dom";

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [activeId, setActiveId] = useState("");
  const [selectedReelId, setSelectedReelId] = useState(null);
  const [reelComments, setReelComments] = useState({});
  const [error, setError] = useState(null);
  const [reelPagination, setReelPagination] = useState({});
  const [viewedReels, setViewedReels] = useState(new Set());
  const videoRefs = useRef({});

  // Track upload reels states
  const [hotelId, setHotelId] = useState("");
  const [hotels, setHotels] = useState([]);
  const [title, setTitle] = useState("");
  const [video, setVideo] = useState(null);
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [myReels, setMyReels] = useState(reels);
  const [sharePopup, setSharePopup] = useState(null); // 👈 Added for share popup

  const token = localStorage.getItem("token");

  // Fetch hotels
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axios.get("https://hotel-banquet.nearprop.in/api/hotels/owner", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHotels(res.data.data.hotels || []);
      } catch (error) {
        setHotels([]);
        setError(error.response?.data?.message || "Failed to load hotels.");
      }
    };
    fetchHotels();
  }, [token]);

  // Fetch rooms for the selected hotel (commented out since not used in upload)
  // const fetchRooms = async (hotelId) => { ... }

  // Update video progress
  const updateProgress = (id, e) => {
    const video = e.target;
    if (video.duration) {
      const progress = (video.currentTime / video.duration) * 100;
      setReels((prev) => prev.map((r) => (r._id === id ? { ...r, progress } : r)));
    }
  };

  // Reset progress on end (optional)
  const resetProgress = (id) => {
    setReels((prev) => prev.map((r) => (r._id === id ? { ...r, progress: 0 } : r)));
  };

  // Fetch reels
  const fetchReels = async (hotelId = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = hotelId
        ? `https://hotel-banquet.nearprop.in/api/reels/${hotelId}/`
        : "https://hotel-banquet.nearprop.in/api/reels/all";

      const res = await axios.get(url);
      if (res.data.success) {
        const reelsData = res.data.data?.reels || res.data.data || [];
        setReels(
          reelsData.map((reel) => ({
            ...reel,
            newComment: "",
            isLiked: reel.likedByUser || false,
            comments: (reel.comments || []).map((comment, index) => ({
              _id: comment._id || `temp-${Date.now()}-${index}`,
              comment: comment.comment || "No comment text",
              user: {
                name: comment.userId?.name || "Anonymous",
                profileImage: comment.userId?.profileImage || null,
              },
              createdAt: comment.createdAt || new Date().toISOString(),
            })),
          }))
        );
      } else {
        setReels([]);
        setError(res.data.message || "No reels found.");
      }
    } catch (error) {
      setReels([]);
      setError(error.response?.data?.message || "Failed to load reels.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments
  const fetchComments = async (reelId, page = 1, append = false) => {
    setError(null);
    try {
      const res = await axios.get(
        `https://hotel-banquet.nearprop.in/api/reels/${reelId}/comments?page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        let commentsData = [];
        if (Array.isArray(res.data.data)) {
          commentsData = res.data.data;
        } else if (Array.isArray(res.data.data?.comments)) {
          commentsData = res.data.data.comments;
        } else if (res.data.data && typeof res.data.data === "object") {
          const key = Object.keys(res.data.data).find(k => Array.isArray(res.data.data[k]));
          if (key) commentsData = res.data.data[key];
        }

        const sanitizedComments = commentsData.map((comment, index) => ({
          _id: comment._id || `temp-${Date.now()}-${index}`,
          comment: comment.comment || "No comment text",
          user: {
            name: comment.userId?.name || comment.username || "Anonymous",
            profileImage: comment.userId?.profileImage || comment.user?.avatar || null,
          },
          createdAt: comment.createdAt || comment.timestamp || new Date().toISOString(),
        }));

        setReelComments((prev) => ({
          ...prev,
          [reelId]: append ? [...(prev[reelId] || []), ...sanitizedComments] : sanitizedComments,
        }));

        const total = res.data.data?.total || res.data.total || commentsData.length;
        const perPage = res.data.data?.limit || res.data.limit || 10;
        const current = res.data.data?.page || res.data.page || page;

        setReelPagination((prev) => ({
          ...prev,
          [reelId]: { page: current, hasMore: total > current * perPage, total },
        }));
      } else {
        setReelComments((prev) => ({ ...prev, [reelId]: [] }));
        setError(res.data.message || "No comments available.");
      }
    } catch (error) {
      setReelComments((prev) => ({ ...prev, [reelId]: [] }));
      setError(error.response?.data?.message || "Failed to load comments.");
    }
  };

  // Toggle comments
  const toggleComments = (reelId) => {
    if (selectedReelId === reelId) {
      setSelectedReelId(null);
      setError(null);
    } else {
      setSelectedReelId(reelId);
      if (!reelComments[reelId]) {
        fetchComments(reelId, 1, false);
      }
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId.trim() === "") {
      fetchReels();
      setActiveId("");
    } else {
      fetchReels(searchId.trim());
      setActiveId(searchId.trim());
    }
  };

  // Toggle like heart animation
  const toggleLikeheart = (id) => {
    setReels((prev) =>
      prev.map((reel) =>
        reel._id === id
          ? {
              ...reel,
              isLiked: !reel.isLiked,
              stats: {
                ...reel.stats,
                likesCount: reel.isLiked
                  ? reel.stats.likesCount - 1
                  : reel.stats.likesCount + 1,
              },
              showHeart: !reel.isLiked,
            }
          : reel
      )
    );

    setTimeout(() => {
      setReels((prev) =>
        prev.map((reel) => (reel._id === id ? { ...reel, showHeart: false } : reel))
      );
    }, 800);
  };

  // Toggle like (API call)
  const toggleLike = async (reelId) => {
    try {
      await axios.post(
        `https://hotel-banquet.nearprop.in/api/reels/${reelId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReels((prev) =>
        prev.map((reel) =>
          reel._id === reelId
            ? {
                ...reel,
                stats: {
                  ...reel.stats,
                  likesCount: reel.isLiked
                    ? reel.stats.likesCount - 1
                    : reel.stats.likesCount + 1,
                },
                isLiked: !reel.isLiked,
              }
            : reel
        )
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to toggle like.");
    }
  };

  // Add comment
  const addComment = async (reelId, commentText) => {
    if (!commentText.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    setError(null);
    try {
      const res = await axios.post(
        `https://hotel-banquet.nearprop.in/api/reels/${reelId}/comment`,
        { comment: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        const newCommentRaw = res.data.data;
        const newComment = {
          _id: newCommentRaw._id || `temp-${Date.now()}`,
          comment: typeof newCommentRaw.comment === "string" ? newCommentRaw.comment : commentText,
          user: {
            name: newCommentRaw.userId?.name || newCommentRaw.username || "Anonymous",
            profileImage: newCommentRaw.userId?.profileImage || newCommentRaw.user?.avatar || null,
          },
          createdAt: newCommentRaw.createdAt || new Date().toISOString(),
        };

        setReels((prev) =>
          prev.map((reel) =>
            reel._id === reelId
              ? {
                  ...reel,
                  stats: {
                    ...reel.stats,
                    commentsCount: (reel.stats?.commentsCount || 0) + 1,
                  },
                  comments: [...(reel.comments || []), newComment],
                }
              : reel
          )
        );

        setReelComments((prev) => ({
          ...prev,
          [reelId]: [...(prev[reelId] || []), newComment],
        }));
      } else {
        setError(res.data.message || "Failed to add comment.");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Failed to add comment.");
    }
  };

  // Upload reel
  const uploadmyreels = async (e) => {
    e.preventDefault();
    if (!video) {
      setMessage("Please select a video file!");
      return;
    }
    if (!hotelId) {
      setMessage("Please select a hotel!");
      return;
    }

    const maxFileSize = 100 * 1024 * 1024;
    if (video.size > maxFileSize) {
      setMessage("Video file size is too large. Maximum 100MB allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("hotelId", hotelId);
    formData.append("title", title);
    formData.append("video", video);

    try {
      setMessage("");
      const res = await axios.post(
        "https://hotel-banquet.nearprop.in/api/reels/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(`✅ Uploaded successfully: ${res.data.message || "Reel added!"}`);
      setShowPopup(false);
      alert("Reel uploaded");
      setTitle("");
      setVideo(null);
      setHotelId("");
      fetchReels();
    } catch (err) {
      setMessage(`❌ Upload failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Delete reel
  const deleteMyReel = async (id) => {
    if (!window.confirm("Are you sure to delete reel?")) return;
    try {
      await axios.delete(`https://hotel-banquet.nearprop.in/api/reels/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyReels((prev) => prev.filter((reel) => reel._id !== id));
      alert("Reel deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error("❌ Error deleting reel:", error.response?.data || error.message);
    }
  };

  return (
    <div className="reels-page">
      {window.innerWidth < 768 && (
        <button
          className="sidebar-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: "fixed",
            top: "20px",
            left: "20px",
            zIndex: 100000,
            padding: "10px 15px",
            background: "#1a1a1a",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          {isOpen ? "Menu" : "Close"}
        </button>
      )}

      <div className={`left-toggle-div ${window.innerWidth < 768 && isOpen ? "mobile-hidden" : ""}`}>
        <div className="logo-image-div">
          <img style={{ width: "50px" }} src={nearprop} alt="Logo" />
          <h1 style={{ fontSize: "24px" }}>Nearprop</h1>
        </div>
        <div className="all-toggle-headings">
          <Link style={{ textDecoration: "none", color: "white" }} to="/">
            <h2 className="toggle-headings-name">
              <FaHome />&nbsp; Home
            </h2>
          </Link>
          <Link to="/hb?tab=banquets" style={{ textDecoration: "none", color: "white" }}>
            <h2 className="toggle-headings-name">
              <BsBuildings /> &nbsp; Banquets
            </h2>
          </Link>
          <Link to="/hb" style={{ textDecoration: "none", color: "white" }}>
            <h2 className="toggle-headings-name">
              <FaHotel />&nbsp; Hotels
            </h2>
          </Link>
          <Link style={{ textDecoration: "none", color: "white" }} to="/rooms">
            <h2 className="toggle-headings-name">
              <MdMeetingRoom /> &nbsp; Rooms
            </h2>
          </Link>
          <Link style={{ textDecoration: "none", color: "white" }} to="/userprofile">
            <h2 className="toggle-headings-name">
              <CgProfile /> &nbsp; Profile
            </h2>
          </Link>
        </div>
      </div>

      {/* Floating Upload Button */}
      <button className="uploadReelFloatingBtn" onClick={() => setShowPopup(true)}>
        <FaInstagram style={{ fontSize: "30px" }} />
      </button>

      {/* Upload Popup */}
      {showPopup && (
        <div className="uploadReelOverlay">
          <div className="uploadReelModal">
            <button className="uploadReelCloseBtn" onClick={() => setShowPopup(false)}>
              ✖
            </button>
            <h2>Upload Reel</h2>
            <form onSubmit={uploadmyreels}>
              <div>
                <label>Select Hotel:</label>
                <select
                  value={hotelId}
                  onChange={(e) => setHotelId(e.target.value)}
                >
                  <option value="">Select Hotel</option>
                  {hotels.map((hotel) => (
                    <option key={hotel._id} value={hotel.hotelId}>
                      {hotel.hotelName || hotel.name} ({hotel.hotelId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter reel title"
                  required
                />
              </div>
              <div>
                <label>Video File:</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideo(e.target.files[0])}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Upload Reel"}
              </button>
            </form>
            {message && <p>{message}</p>}
          </div>
        </div>
      )}

      {error && <p className="reels-error">{error}</p>}

      {loading ? (
        <p className="reels-loading">Loading reels...</p>
      ) : reels.length === 0 ? (
        <div className="no-reels">
          <p>No reels found.</p>
        </div>
      ) : (
        reels.map((reel) => {
          const isCommentsVisible = selectedReelId === reel._id;
          return (
            <div className="reel-card" onDoubleClick={() => toggleLikeheart(reel._id)} key={reel._id}>
              <video
                ref={(el) => (videoRefs.current[reel._id] = el)}
                autoPlay
                loop
                muted
                src={reel.content}
                className="reel-video"
                onTimeUpdate={(e) => updateProgress(reel._id, e)}
                onMouseDown={() => videoRefs.current[reel._id]?.pause()}
                onMouseUp={() => videoRefs.current[reel._id]?.play()}
                onTouchStart={() => videoRefs.current[reel._id]?.pause()}
                onTouchEnd={() => videoRefs.current[reel._id]?.play()}
              />
              <div
                className="reel-progress"
                onClick={(e) => {
                  const bar = e.currentTarget;
                  const clickX = e.nativeEvent.offsetX;
                  const barWidth = bar.offsetWidth;
                  const percentage = clickX / barWidth;
                  const video = videoRefs.current[reel._id];
                  if (video && !isNaN(video.duration)) {
                    video.currentTime = percentage * video.duration;
                  }
                }}
              >
                <div
                  className="reel-progress-fill"
                  style={{ width: `${reel.progress || 0}%` }}
                ></div>
              </div>

              <div className="reel-overlay">
                <div className="reel-left">
                  <div className="reel-owner">
                    <img
                      src={
                        reel.owner?.images?.[0] ||
                        reel.owner?.userId?.profileImage ||
                        "https://via.placeholder.com/50"
                      }
                      alt="Owner"
                      className="reel-owner-img"
                    />
                    <div>
                      <h3 className="reel-owner-name">{reel.owner?.name || "Unknown"}</h3>
                      <p className="reel-owner-location">
                        {reel.owner?.city || "Unknown"}, {reel.owner?.state || "Unknown"}
                      </p>
                    </div>
                  </div>
                  <h4 className="reel-video-title">{reel.title || "Untitled"}</h4>
                </div>

                <div className="reel-right">
                  <div className="reel-action" onClick={() => toggleLike(reel._id)}>
                    <span className="reel-icon">{reel.isLiked ? "💖" : "🤍"}</span>
                    <span className="reel-count">{reel.stats?.likesCount || 0}</span>
                  </div>

                  <div className="reel-action" onClick={() => toggleComments(reel._id)}>
                    <span className="reel-icon">💬</span>
                    <span className="reel-count">{reel.stats?.commentsCount || 0}</span>
                  </div>

                  {/* ✅ SHARE BUTTON WITH POPUP */}
                  <div
                    className="reel-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSharePopup(reel._id);
                    }}
                  >
                    <span className="reel-icon">
                      <FaShare />
                    </span>
                    <span className="reel-count">{reel.stats?.sharesCount || 0}</span>
                  </div>

                  <div className="reel-action">
                    <span className="reel-icon" onClick={() => deleteMyReel(reel._id)}>
                      <MdDelete />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Comments Popup */}
      {selectedReelId && (
        <div
          className="comments-popup-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedReelId(null);
            }
          }}
        >
          <div
            className="comments-popup"
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "500px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
                Comments (
                {reels.find((r) => r._id === selectedReelId)?.stats?.commentsCount || 0})
              </h3>
              <button
                onClick={() => setSelectedReelId(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "5px",
                  borderRadius: "50%",
                  width: "35px",
                  height: "35px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>

            <div
              className="popup-comments-container"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "0 20px",
                maxHeight: "calc(80vh - 160px)",
              }}
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.target;
                const pagination = reelPagination[selectedReelId] || {};
                if (scrollHeight - scrollTop <= clientHeight + 50 && pagination.hasMore) {
                  fetchComments(selectedReelId, (pagination.page || 1) + 1, true);
                }
              }}
            >
              {(reelComments[selectedReelId] || []).length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#666" }}>
                  <p style={{ margin: 0, fontSize: "16px" }}>No comments yet.</p>
                  <p style={{ margin: "5px 0 0 0", fontSize: "14px" }}>Be the first to comment!</p>
                </div>
              ) : (
                <div style={{ padding: "15px 0" }}>
                  {(reelComments[selectedReelId] || []).map((comment, index) => (
                    <div
                      key={comment._id || `comment-${index}`}
                      className="popup-comment"
                      style={{
                        padding: "15px",
                        borderBottom:
                          index < (reelComments[selectedReelId] || []).length - 1
                            ? "1px solid #f0f0f0"
                            : "none",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        marginBottom: "10px",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                        <img
                          src={comment.user?.profileImage || "https://via.placeholder.com/40"}
                          alt="User"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            marginRight: "12px",
                            objectFit: "cover",
                          }}
                        />
                        <div>
                          <strong style={{ fontSize: "15px", color: "#333", display: "block" }}>
                            {comment.user?.name || "Anonymous"}
                          </strong>
                          <span style={{ fontSize: "12px", color: "#888" }}>
                            {comment.createdAt
                              ? new Date(comment.createdAt).toLocaleString()
                              : "Just now"}
                          </span>
                        </div>
                      </div>
                      <p
                        style={{
                          margin: "0",
                          fontSize: "14px",
                          lineHeight: "1.5",
                          color: "#333",
                          paddingLeft: "52px",
                        }}
                      >
                        {typeof comment.comment === "string" ? comment.comment : "No comment text"}
                      </p>
                    </div>
                  ))}
                  {(reelPagination[selectedReelId] || {}).hasMore && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "15px",
                        color: "#666",
                        fontSize: "14px",
                      }}
                    >
                      📝 Scroll down to load more comments...
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              style={{
                padding: "20px",
                borderTop: "1px solid #e0e0e0",
                backgroundColor: "#f9f9f9",
              }}
            >
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={reels.find((r) => r._id === selectedReelId)?.newComment || ""}
                  onChange={(e) =>
                    setReels((prev) =>
                      prev.map((r) =>
                        r._id === selectedReelId ? { ...r, newComment: e.target.value } : r
                      )
                    )
                  }
                  style={{
                    flex: 1,
                    padding: "12px 15px",
                    border: "1px solid #ddd",
                    borderRadius: "25px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const commentText = reels.find((r) => r._id === selectedReelId)?.newComment || "";
                      if (commentText.trim()) {
                        addComment(selectedReelId, commentText);
                        setReels((prev) =>
                          prev.map((r) =>
                            r._id === selectedReelId ? { ...r, newComment: "" } : r
                          )
                        );
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const commentText = reels.find((r) => r._id === selectedReelId)?.newComment || "";
                    if (commentText.trim()) {
                      addComment(selectedReelId, commentText);
                      setReels((prev) =>
                        prev.map((r) =>
                          r._id === selectedReelId ? { ...r, newComment: "" } : r
                        )
                      );
                    }
                  }}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "25px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ SHARE POPUP */}
      {sharePopup && (
        <div
          className="share-popup-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setSharePopup(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px',
              width: '90%',
              maxWidth: '350px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, textAlign: 'center', fontSize: '18px' }}>Share Reel</h3>
            
            {/* WhatsApp */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                border: '1px solid #25D366',
                borderRadius: '10px',
                backgroundColor: '#E6FDCF',
                color: '#128C7E',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '15px',
              }}
              onClick={() => {
                const reelUrl = `${window.location.origin}/reels/${sharePopup}`;
                const text = encodeURIComponent(`Check out this reel: ${reelUrl}`);
                window.open(`https://wa.me/?text=${text}`, '_blank');
                setSharePopup(null);
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.247-.595-.497-.52-.67.074-.173.595-.718 2.06-.89 2.554-.173.497-.347.571-.644.423-.297-.149-2.524-1.169-3.735-1.218-.497-.025-.917-.025-1.265-.025-.372 0-.72.049-1.042.074-.323.025-1.042.149-1.042.447 0 .297.419 1.04.593 1.29.174.247 3.37 5.033 3.692 5.456.323.423.67.917 1.091 1.49 4.49 6.197 7.205 7.408 7.775 7.558.571.149 4.341.149 5.033 0 .692-.149 3.482-1.314 3.976-2.627.497-1.314.497-2.353.348-2.577-.15-.224-.546-.372-1.067-.62z"/>
              </svg>
              WhatsApp
            </button>

            {/* Facebook */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                border: '1px solid #3b5998',
                borderRadius: '10px',
                backgroundColor: '#e7f3ff',
                color: '#3b5998',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '15px',
              }}
              onClick={() => {
                const reelUrl = encodeURIComponent(`${window.location.origin}/reels/${sharePopup}`);
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${reelUrl}`, '_blank');
                setSharePopup(null);
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#3b5998">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.323 0 2.462.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.47h-3.12V24C19.612 23.1 24 18.136 24 12.073z"/>
              </svg>
              Facebook
            </button>

            {/* Twitter */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                border: '1px solid #1DA1F2',
                borderRadius: '10px',
                backgroundColor: '#e6f7ff',
                color: '#1DA1F2',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '15px',
              }}
              onClick={() => {
                const reelUrl = encodeURIComponent(`${window.location.origin}/reels/${sharePopup}`);
                const text = encodeURIComponent('Check out this reel!');
                window.open(`https://twitter.com/intent/tweet?text=${text}&url=${reelUrl}`, '_blank');
                setSharePopup(null);
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </button>

            <button
              onClick={() => setSharePopup(null)}
              style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#f0f0f0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reels;