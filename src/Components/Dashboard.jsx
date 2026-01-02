import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { showSuccess, showError, showInfo, showWarning } from "../utils/Toast";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faUser } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import './Dashboard.css';

const API_BASE = 'https://hotel-banquet.nearprop.in';

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-image"></div>
    <div className="skeleton-info">
      <div className="skeleton-line w-75"></div>
      <div className="skeleton-line w-50"></div>
      <div className="skeleton-line w-100"></div>
      <div className="skeleton-footer">
        <div className="skeleton-line w-33"></div>
        <div className="skeleton-line w-25"></div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "hotels";
  const [activeSection, setActiveSection] = useState(initialTab);
  const [hotelsData, setHotelsData] = useState([]);
  const [banquetHallsData, setBanquetHallsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveSection(tab);
    setSearchParams({ tab });
  }

  // Fetch Hotels & Banquet Halls
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("Token not found");  // Check if this log appears
        setError('No authorization token found. Please login.');
        setLoading(false);
        return
      }


      try {
        // Hotels
        const hotelsRes = await fetch(`${API_BASE}/api/hotels/owner`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const hotelsJson = await hotelsRes.json();

        console.log(hotelsJson.data.hotels)
        if (hotelsJson.success) {
          setHotelsData(hotelsJson.data.hotels || []);
        }

        // Banquet Halls
        const banquetRes = await fetch(`${API_BASE}/api/banquet-halls/owner`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const banquetJson = await banquetRes.json();
        if (banquetJson.success) {
          setBanquetHallsData(banquetJson.data.banquetHalls || []);
        }
        return hotelsJson;
      } catch (err) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle property click → redirect
  const handlePropertyClick = (e, id, type) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const from = `/HotelAndBanquetDetails/${id}`; // 👈 original page

    if (!token) {
      // user not logged in → go to login
      navigate("/login", { state: { from, id, type } });
    } else {
      // user logged in → go to details
      navigate(from, { state: { id, type, from } });
    }
  };


  // Example button
  {/* <button onClick={(e) => handlePropertyClick(e, propertyId, "Hotel")}>Hotel</button> */ }

  const dataToShow = activeSection === 'hotels' ? hotelsData : banquetHallsData;

  if (loading) {
    return (
      <div className="property-grid">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }
  return (
    <>

      <div className='my-title'> My hotels & Banquet</div>
      <div className="dashboard-container">
        <div className="content-wrapper">

          <div className="main-content">
            <div className="tabs-container">
              <motion.button
                className={`tab-btn ${activeSection === 'hotels' ? 'active' : ''}`}
                onClick={() => handleTabChange('hotels')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                Hotels
              </motion.button>

              <motion.button
                className={`tab-btn ${activeSection === 'banquets' ? 'active' : ''}`}
                onClick={() => handleTabChange('banquets')}

              >
                Banquet Halls
              </motion.button>
            </div>

            {/* Properties Grid */}
            <AnimatePresence>
              {dataToShow.length === 0 ? (
                <motion.p
                  key="no-results"
                  className="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  No {activeSection === 'hotels' ? 'Hotels' : 'Banquet Halls'} found.
                </motion.p>
              ) : (
                <motion.div
                  key="grid"
                  className="property-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {dataToShow.map((item) => {
                    const isHotel = activeSection === 'hotels';
                    const propertyType = isHotel ? 'Hotel' : 'Banquet';
                    const propertyId = isHotel ? item.hotelId : item.banquetHallId;
                    return (
                      <motion.div
                        key={item._id}
                        className="property-card-wrapper"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={(e) => handlePropertyClick(e, propertyId, propertyType)}
                      // onClick={(e) => handlePropertyClick(e, propertyId, "Banquet")}
                      >
                        <div className="property-card">
                          <div className="property-image-container">
                            {item.images?.[0] ? (
                              <img
                                src={item.images[0]}
                                alt={item.name}
                                className="property-image"
                                loading="lazy"
                              />
                            ) : (
                              <div className="no-image">No Image</div>
                            )}
                            <div className="overlay-icons">


                              <h3
                                style={{
                                  backgroundColor: item.subscriptions && item.subscriptions.length > 0 ? "blue" : "red",
                                  color: "white",
                                  fontSize : "12px",
                                  fontFamily : "revert-layer",
                                  padding : "5px",
                                  borderRadius : "8px"
                                }}
                              >
                                {item.subscriptions && item.subscriptions.length > 0
                                  ? "Subscribed ✅"
                                  : "Pending ⏳"}
                              </h3>

                            </div>
                            {/* <span className="status-badge">{ item.isAvailable ? item.status.toUpperCase() :  "Pending"}</span> */}
                          </div>
                          <div className="property-info">
                            <h3 className="property-name"> 🏨 {item.name}</h3>
                            <p className="property-location">
                              {item.city}, {item.state}
                            </p>
                            <p className="property-description"> 💬{item.description}</p>
                            {isHotel ? (
                              <div className="property-footer">
                                <span> Created:  {new Date(item.createdAt).toLocaleDateString()}</span>
                                <span>
                                  <FontAwesomeIcon icon={faUser} /> Owner
                                </span>
                              </div>
                            ) : (
                              <div className="property-footer">
                                <span>Capacity: {item.capacity}</span>
                                <span>Price/Event: ₹{item.seasonalPrice.summer}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>



    </>

  );
};

export default Dashboard;
