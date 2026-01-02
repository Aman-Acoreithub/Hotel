import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./roomdetails.css";
import { Axis3D } from "lucide-react";

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Failed to find token property.");
    return null;
  }

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(
          `https://hotel-banquet.nearprop.in/api/rooms/${id}`
        );
        setRoom(res.data.data);
      } catch (err) {
        console.error("Error fetching room details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  const deleteRoom = async () => {
    const confirmDelete = window.confirm("Are you sure to delete your room?");
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `https://hotel-banquet.nearprop.in/api/rooms/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert("Room deleted successfully");
      }
    } catch (error) {
      console.log(error);
      alert("Failed to delete room");
    }
  };

  if (loading) return <div className="rooms-loading">Loading room details...</div>;
  if (!room) return <div className="no-rooms">Room not found.</div>;

  return (
    <div className="room-details">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>
          <strong>Hotel:</strong> {room.hotelDetails?.name}
        </h2>
        <button
          className="updateBtn"
          onClick={() => navigate(`/rooms/${id}/update`)}
          style={{
            background: "#4CAF50",
            color: "white",
            padding: "10px 12px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Update room
        </button>
      </div>
      <h4>
        {room.type} - Room {room.roomNumber}
      </h4>
      <br />

      {/* Room Images */}
      <div className="room-images">
        {room.images?.map((img, idx) => (
          <img key={idx} src={img} alt={`room-${idx}`} className="room-image" />
        ))}
      </div>

      {/* Basic Info */}
      <h3 className="title-all">Room Description</h3>
      <div className="room-details">
        <p className="room-location">
          <strong>Location:</strong> {room.hotelDetails?.city},{" "}
          {room.hotelDetails?.state}, {room.hotelDetails?.pincode}
        </p>
        <p className="room-description">
          <strong>Hotel Description:</strong> {room.hotelDetails?.description}
        </p>
        <p className="room-price">
          <strong>Room Price:</strong> ₹{room.price}
        </p>
      </div>

      {/* Seasonal Prices */}
      <div className="seasonal-prices">
        <h3 className="title-all">Seasonal Prices</h3>
        <ul>
          {room.seasonalPrice &&
            Object.entries(room.seasonalPrice).map(([season, price]) => (
              <li key={season}>
                {season}: ₹{price}
              </li>
            ))}
        </ul>
      </div>
      <br />
      {/* Availability */}
      <p>
        <strong>Availability:</strong>{" "}
        {room.isAvailable ? "Available ✅" : "Not Available ❌"}
      </p>
      <br />
      {/* Features */}
      <div className="seasonal-prices">
        <h3>Features</h3>
        <ul>
          {room.features?.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          ))}
        </ul>
      </div>

      {/* Services */}
      <div className="seasonal-prices">
        <h3>Services</h3>
        <ul>
          {room.services?.map((service, idx) => (
            <li key={idx}>{service}</li>
          ))}
        </ul>
      </div>

      {/* Room Video */}
      {room.videos && room.videos.length > 0 && (
        <div className="room-videos">
          <h3>Room Video</h3>
          <video width="250" controls>
            <source src={room.videos[0]} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      <br />
      {/* Hotel Media */}
      <div className="seasonal-prices">
        <h3>Hotel Images</h3>
        <br />
        {room.hotelDetails?.images?.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`hotel-${idx}`}
            className="hotel-image"
          />
        ))}

        {room.hotelDetails?.videos && room.hotelDetails.videos.length > 0 && (
          <div className="hotel-video">
            <h3>Hotel Video</h3>
            <video width="400" controls>
              <source src={room.hotelDetails.videos[0]} type="video/mp4" />
            </video>
          </div>
        )}
      </div>

      {/* Ratings & Reviews */}
      <br />
      <div className="room-rating">
        <h3>Rating</h3>
        <p>
          Average: {room.rating?.average} ⭐ ({room.rating?.total} reviews)
        </p>
      </div>

      {room.reviews && room.reviews.length > 0 ? (
        <div className="room-reviews">
          <h3>Reviews</h3>
          <br />
          {room.reviews.map((review, idx) => (
            <div key={idx} className="review">
              <p>
                <strong>{review.user}</strong>: {review.comment}
              </p>
            </div>
          ))}
          <br />
        </div>
      ) : (
        <p>No reviews yet.</p>
      )}

      <br />
      <button
        onClick={deleteRoom}
        style={{
          color: "white",
          background: "red",
          padding: "10px 12px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Delete room
      </button>
    </div>
  );
};

export default RoomDetails;