import React, { useState, useCallback, useEffect, useRef } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAepBinSy2JxyEvbidFz_AnFYFsFlFqQo4';

const GoogleMapLocationPicker = ({ 
  latitude, 
  longitude, 
  onLocationChange, 
  isVisible = true 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoading(false);
    };

    script.onerror = () => {
      setError('Failed to load Google Maps');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (isLoading || error || !window.google || !mapRef.current || !isVisible) return;

    const defaultLat = parseFloat(latitude) || 22.7196; // Default to Indore, India
    const defaultLng = parseFloat(longitude) || 75.8577;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: defaultLat, lng: defaultLng },
      zoom: 13,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;

    // Create marker
    const marker = new window.google.maps.Marker({
      position: { lat: defaultLat, lng: defaultLng },
      map: map,
      draggable: true,
      title: 'Property Location',
    });

    markerRef.current = marker;

    // Handle marker drag
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      const lat = position.lat();
      const lng = position.lng();
      onLocationChange(lat.toFixed(6), lng.toFixed(6));
    });

    // Handle map click
    map.addListener('click', (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      marker.setPosition({ lat, lng });
      onLocationChange(lat.toFixed(6), lng.toFixed(6));
    });

    // Add search box
    const searchBox = new window.google.maps.places.SearchBox(
      document.getElementById('map-search-input')
    );

    // Bias the SearchBox results towards current map's viewport
    map.addListener('bounds_changed', () => {
      searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      map.setCenter({ lat, lng });
      map.setZoom(15);
      marker.setPosition({ lat, lng });
      onLocationChange(lat.toFixed(6), lng.toFixed(6));
    });

  }, [isLoading, error, latitude, longitude, onLocationChange, isVisible]);

  // Update marker position when props change
  useEffect(() => {
    if (!markerRef.current || !mapInstanceRef.current) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      const newPosition = { lat, lng };
      markerRef.current.setPosition(newPosition);
      mapInstanceRef.current.setCenter(newPosition);
    }
  }, [latitude, longitude]);

  if (!isVisible) return null;

  if (error) {
    return (
      <div style={{
        padding: '20px',
        border: '1px solid #dc3545',
        borderRadius: '8px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        textAlign: 'center'
      }}>
        <strong>Map Error:</strong> {error}
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
          Search Location
        </label>
        <input
          id="map-search-input"
          type="text"
          placeholder="Search for a location..."
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '14px'
          }}
        />
      </div>
      
      {isLoading ? (
        <div style={{
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px'
        }}>
          <div>Loading Google Maps...</div>
        </div>
      ) : (
        <div
          ref={mapRef}
          style={{
            height: '400px',
            width: '100%',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}
        />
      )}
      
      <div style={{
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#e9ecef',
        borderRadius: '5px',
        fontSize: '12px',
        color: '#495057'
      }}>
        <strong>Instructions:</strong> Click anywhere on the map or drag the red marker to set the location. 
        You can also search for a specific address using the search box above.
      </div>
    </div>
  );
};

// Example usage component showing how to integrate with your form
const GoogleMapLocation = () => {
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    address: '',
    city: '',
    state: ''
  });

  const [showMap, setShowMap] = useState(false);

  const handleLocationChange = useCallback((lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Property Location Form</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px',
          marginBottom: '20px' 
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Latitude *
            </label>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              placeholder="Enter latitude"
              step="any"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Longitude *
            </label>
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              placeholder="Enter longitude"
              step="any"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          style={{
            padding: '10px 20px',
            backgroundColor: showMap ? '#dc3545' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          {showMap ? 'Hide Map' : 'Select Location on Map'}
        </button>

        <GoogleMapLocationPicker
          latitude={formData.latitude}
          longitude={formData.longitude}
          onLocationChange={handleLocationChange}
          isVisible={showMap}
        />
      </div>

      <div style={{
        padding: '15px',
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <strong>Current Coordinates:</strong>
        <div>Latitude: {formData.latitude || 'Not set'}</div>
        <div>Longitude: {formData.longitude || 'Not set'}</div>
      </div>
    </div>
  );
};

export default GoogleMapLocation;