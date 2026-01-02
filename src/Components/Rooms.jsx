import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./rooms.css";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const token = localStorage.getItem("token");
  console.log(token)
  const navigate = useNavigate();
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(
          "https://hotel-banquet.nearprop.in/api/hotels/owner",
          { headers }
        );

        console.log("API ------------------------Response:", res.data);

        const fetchedHotels = res.data.data.hotels || [];

        // Flatten rooms with hotel details
        const allRooms = fetchedHotels.flatMap((hotel) =>
          hotel.rooms.map((room) => ({
            ...room,
            hotelName: hotel.name,
            hotelId: hotel._id,
          }))
        );

        setRooms(allRooms);

        // Extract unique hotel names
        const uniqueHotels = fetchedHotels.map((hotel) => hotel.name);
        setHotels(uniqueHotels);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [token]);

  // ✅ Filter logic
  const filteredRooms = rooms.filter((room) => {
    const hotelMatch = selectedHotel === "All" || room.hotelName === selectedHotel;
    const priceMatch =
      (!minPrice || room.price >= parseInt(minPrice)) &&
      (!maxPrice || room.price <= parseInt(maxPrice));
    return hotelMatch && priceMatch;
  });

  const seeDetails = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  if (loading) {
    return <div className="rooms-loading">Loading rooms...</div>;
  }

  return (
    <div className="rooms-layout">
      <h2 className="rooms-title">Available Rooms</h2> 
        <div className="rooms-section-container">
                <div className="rooms-section-header">
                  <h3 className="about-hotel">Rooms</h3>
                  <button className="rooms-header">
                    <Link to="/createroom" style={{ textDecoration: "none", color: "white" }}>
                      Add room
                    </Link>
                  </button>
                </div>
                </div>

      {/* Hotel Filter */}
      <div className="filter-section">
        <label>Filter by Hotel:</label>
        <select
          value={selectedHotel}
          onChange={(e) => setSelectedHotel(e.target.value)}
          className="hotel-select"
        >
          <option value="All">All Hotels</option>
          {hotels.map((hotel, idx) => (
            <option key={idx} value={hotel}>
              {hotel}
            </option>
          ))}
        </select>

        {/* Price Filter */}
        <div className="filter-section">
          <label>Min Price:</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Enter min price"
          />
          <hr /> <hr />
          <label>Max Price:</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Enter max price"
          />
        </div>

      </div>

      {/* Rooms List */}
      <div className="rooms-container">
        <div className="rooms-grid">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <div key={room._id} className="room-card">
                <div className="room-image-wrapper">
                  <img
                    src={room.images[0]}
                    alt={room.type}
                    className="room-image"
                  />
                </div>

                <div className="room-info">
                  <h3>
                    {room.type} - {room.roomNumber}
                  </h3>
                  <p className="room-hotel">Hotel: {room.hotelName}</p>
                  <p className="room-price">₹{room.price}</p>
                  <p className="room-features">
                    Features: {room.features?.join(", ")}
                  </p>
                  <p className="room-services">
                    Services: {room.services?.join(", ")}
                  </p>

                  <button
                    onClick={() => seeDetails(room._id)}
                    className="view-details-button"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-rooms">No rooms match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rooms;
