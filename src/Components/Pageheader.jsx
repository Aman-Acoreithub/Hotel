import React, { useState, useEffect } from 'react';
import './Pageheader.css';
import logo from '../assets/nearproplogo.png';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { baseurl } from '../BaseUrl';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faLocationDot, faPhoneVolume } from '@fortawesome/free-solid-svg-icons';

const Pageheader = ({ path }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');
  const isLanding = path === '/';

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  // Retrieve auth data from localStorage
  const getAuthData = () => {
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        return JSON.parse(authData);
      } catch (err) {
        console.error('Error parsing authData:', err);
        return null;
      }
    }
    return null;
  };

  // Get token from auth data
  const getToken = () => {
    const authData = getAuthData();
    const token = authData?.token || null;
    return token;
  };

  // Fetch and process user location
  const getCurrentLocation = async (lat, lng) => {
    try {
      const googleResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyAepBinSy2JxyEvbidFz_AnFYFsFlFqQo4`
      );

      if (googleResponse.data.status === 'OK') {
        const addressComponents = googleResponse.data.results[0].address_components;

        let city = '';
        let state = '';
        let districtName = '';

        for (const component of addressComponents) {
          if (component.types.includes('locality')) {
            city = component.long_name;
          } else if (!city && component.types.includes('administrative_area_level_2')) {
            city = component.long_name;
          } else if (!city && component.types.includes('administrative_area_level_3')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (component.types.includes('administrative_area_level_3')) {
            districtName = component.long_name;
          } else if (component.types.includes('administrative_area_level_2')) {
            districtName = component.long_name;
          }
        }

        if (city.toLowerCase().includes('district')) {
          city = city.replace(/ District$/i, '').trim();
        }

        const formattedLocation = city && state ? `${city}, ${state}` : city || state || 'Location not found';
        setCurrentLocation(formattedLocation);
        console.log('Formatted location:', formattedLocation);

        const token = getToken();
        if (token && (city || districtName)) {
          try {
            const districtsResponse = await axios.get(`${baseurl}/property-districts`, {
              headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            });
            const districts = districtsResponse.data;

            const matchingDistrict = districts.find(
              (district) =>
                (city && city.toLowerCase() === district.name?.toLowerCase()) ||
                (city && city.toLowerCase() === district.city?.toLowerCase()) ||
                (districtName && districtName.toLowerCase() === district.name?.toLowerCase())
            );

            if (matchingDistrict) {
              const locationPayload = {
                latitude: lat,
                longitude: lng,
                districtId: matchingDistrict.id,
              };

              const locationRes = await axios.post(`${baseurl}/v1/users/location`, locationPayload, {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });
              console.log('Location update response:', locationRes.data);
            }
          } catch (districtError) {
            console.error('District fetch for location error:', districtError.response || districtError);
          }
        }
      } else {
        console.error('Geocoding API status not OK:', googleResponse.data.status);
        setCurrentLocation('Location not found');
      }
    } catch (error) {
      console.error('Location fetch error:', error.response || error);
      setCurrentLocation('Location not found');
    }
  };

  // Trim location if necessary
  const getTrimmedLocation = (location) => {
    if (!location) return 'Location not found';
    return location.length > 50 ? location.slice(0, 50) + '...' : location;
  };

  // Fetch location on mount
  useEffect(() => {
    if (!isLanding) return;

    const handleScroll = () => {
      const header = document.querySelector('header');
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);

    const token = getToken();
    if (token && navigator.geolocation) {
      const requestLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            getCurrentLocation(latitude, longitude);
          },
          (error) => {
            console.error('Geolocation error:', error);
            if (error.code === error.PERMISSION_DENIED) {
              console.log('Location permission denied. Will retry on next load.');
            }
            setCurrentLocation('Location not found');
          },
          { timeout: 10000 }
        );
      };

      requestLocation();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isLanding]);

  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isLoggedIn = !!getToken();

  const [activeMain, setActiveMain] = useState('');

  const propertyItems = [
    { path: '/properties', label: 'Properties' },
    { path: '/residential', label: 'Residential' },
    { path: '/commercial', label: 'Commercial' },
  ];

  const othersItems = [
    { path: '/about', label: 'About' },
    { path: '/enquiryform', label: 'Inquiry Form' },
    { path: '/contact', label: 'Contact' },
    { path: '/faq', label: 'Faq' },
    { path: '/residential', label: 'Residential' },
    { path: '/commercial', label: 'Commercial' },
    { path: '/termsandcondition', label: 'Terms and Conditions' },
    { path: '/privacyandpolicy', label: 'Privacy' },
  ];

  return (
    <>
      <header className={`${isLanding ? 'fixed transparent-header text-white' : 'relative white-header text-dark'}  h-30`} >
        <div
          className="nav"
        >
          <div className="mobile-left">
            <div className="menu-toggle" onClick={toggleMenu}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img className='me-2' src={logo} alt="Logo" style={{ width: '50px', marginTop: '3px' }} />
              <span
                className="nearprop-logo-text "
                style={{
                  marginLeft: '10px',
                  marginBottom: '20px',
                  fontSize: '30px',
                  fontFamily: "Courier, monospace",
                  fontWeight: 'bold',
                  marginTop: '15px',
                  color: 'white'
                }}
              >
                Nearprop
              </span>
            </div>
          </Link>

          <nav className="desktop-nav">
            <ul className="nav-links">
              <li>
                <Link to="/" onClick={() => setActiveMain('')}>
                  <strong >Dashboard </strong>
                </Link>
              </li>
              <li>
                <Link to="/hb" >
                  <strong >Hotels & Banquets </strong>
                </Link>
              </li>
              <li>
                <Link to="/add-property">
                  <strong>Add-Property </strong>
                </Link>
              </li>
              <li>
                <Link to="/Chat">
                  <strong>ChatPanel </strong>
                </Link>
              </li>
              <li>
                <Link to="/reels">
                  <strong>Reel </strong>
                </Link>
              </li>
              <li>
                <Link to="/subscription">
                  <strong>Subscription</strong>
                </Link>
              </li>

              {/* <li>
                <Link to="/userprofile">
                  <strong>Profile </strong>
                </Link>
              </li> */}

            </ul>
          </nav>

          <div
            className="mobile-right abci mobile-left user-dropdown-container"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', position: 'relative' }}
          >
            <div className="user-location-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <Link to="/userprofile">
                <FontAwesomeIcon
                  icon={faCircleUser}
                  size="2xl"
                  className="nearprop-logo-text "
                  style={{
                    color: "white",
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                  }}
                />
              </Link>
            </div>
          </div>
        </div >

        <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
          <div className="logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <img src={logo} alt="Logo" style={{ height: '50px' }} />
            <span
              className="nearprop-logo-text-color"
              style={{
                marginLeft: '10px',
                // border : "2px solid red",
                marginBottom: '20px',
                fontSize: '28px',
                fontWeight: 'bold',
                marginTop: '30px',

                // color: isLandingPage ? 'white' : 'darkcyan',
              }}
            >
              NEARPROP
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: 'black',
              }}
            >
              ×
            </button>
          </div>
          <ul className="scrollable-list">
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/hb" onClick={() => setMenuOpen(false)}>Hotels & Banquets</Link></li>
            <li><Link to="/add-property" onClick={() => setMenuOpen(false)}>Add-Property</Link></li>
            <li><Link to="/rooms" onClick={() => setMenuOpen(false)}>Rooms</Link></li>
            <li><Link to="/reels" onClick={() => setMenuOpen(false)}>Reel</Link></li>
            <li><Link to="/subscription" onClick={() => setMenuOpen(false)}>subscription</Link></li>
            <li><Link to="/userprofile" onClick={() => setMenuOpen(false)}>Profile</Link></li>
            <li><Link to="/termsandcondition" onClick={() => setMenuOpen(false)}>Terms and Conditions</Link></li>
            <li><Link to="/privacyandpolicy" onClick={() => setMenuOpen(false)}>Privacy</Link></li>

            <li>
              <div
                className="user-location-container"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px',
                  marginBottom: '70px'
                }}
              >
                <Link to="/login">
                  <FontAwesomeIcon
                    icon={faCircleUser}
                    size="2xl"
                    className="nearprop-logo-text"
                    style={{ color: '#000000', cursor: 'pointer' }}
                  />
                </Link>
                {isLoggedIn && currentLocation && (
                  <div
                    className="location-display lover ms-5"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <FontAwesomeIcon icon={faLocationDot} style={{ color: '#000000' }} />
                    <span
                      className="nearprop-location-text"
                      style={{
                        color: '#000000',
                        fontSize: '12px',
                        fontWeight: '500',
                      }}
                    >
                      {getTrimmedLocation(currentLocation)}
                    </span>
                  </div>
                )}
              </div>
            </li>
          </ul>
        </div>

        {
          menuOpen && (
            <div
              className={`overlay ${menuOpen ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            ></div>
          )
        }

        {
          isLoggedIn && currentLocation && (
            <div className="location-display crisp dousy " style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '-10px', marginLeft: "200px" }}>
              <FontAwesomeIcon icon={faLocationDot} className="dousy" style={{ color: isLanding ? '#ffffff' : '#000000' }} />
              <span
                className="nearprop-location-text dousy"
                style={{ fontSize: '14px', fontWeight: '500', color: isLanding ? '#ffffff' : '#000000' }}
              >
                {getTrimmedLocation(currentLocation)}
              </span>
            </div>
          )
        }

        {
          location.pathname === '/' && (
            <hr style={{ color: 'white' }} className="disp" />
          )
        }
      </header >
    </>
  );
};

export default Pageheader;