import React from 'react';
import { motion } from 'framer-motion';
import './PropertyFilterPage.css';

const staticFilterData = {
  cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'],
  states: ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu'],
  propertyTypes: ['Room'],
  genders: ['Male', 'Female', 'Co-ed'],
  sharingTypes: ['Single', 'Double', 'Triple', 'Quad'],
  availabilities: ['Immediate', 'Within 1 Month', 'Within 3 Months'],
  sections: ['Hotels', 'Banquet Halls'], // New filter for Hotels/Banquet Halls
};

const PropertyFilterPage = ({ formData, setFormData, handleSearch }) => {
  // Safe defaults for priceRange and distanceRange
  const priceRange = Array.isArray(formData.priceRange) ? formData.priceRange : [0, 125000];
  const distanceRange = Array.isArray(formData.distanceRange) ? formData.distanceRange : [0, 50];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e, index) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = Number(e.target.value);
    setFormData((prev) => ({ ...prev, priceRange: newPriceRange }));
  };

  const handleDistanceChange = (e, index) => {
    const newDistanceRange = [...distanceRange];
    newDistanceRange[index] = Number(e.target.value);
    setFormData((prev) => ({ ...prev, distanceRange: newDistanceRange }));
  };

  return (
    <motion.div
      className="center-wrapper sticky top-6 z-20 w-[320px] mr-6 ml-4"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <style>
        {`
          .filtersection-wrapper::-webkit-scrollbar {
            display: none;
          }
          .filtersection-wrapper {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f1f5f9;
          }
          .filtersection-category-child:hover {
            background: #f1f5f9;
            transform: translateY(-2px);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          }
          .filtersection-category-child.active {
            background: linear-gradient(90deg, #0e7490, #06b6d4);
            color: #ffffff;
            border-color: transparent;
          }
          .filtersection-slider::-webkit-slider-thumb {
            width: 16px;
            height: 16px;
            background: #06b6d4;
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .filtersection-slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: #06b6d4;
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .filtersection-search-btn:hover {
            background: linear-gradient(90deg, #155e75, #0284c7);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
          }
          .filtersection-search-btn:active {
            transform: translateY(0);
            box-shadow: 0 2px 6px rgba(6, 182, 212, 0.2);
          }
        `}
      </style>
      <div className="filtersection-wrapper bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg max-h-[calc(100vh-48px)] overflow-y-auto">
        <h2 className="filtersection-title text-2xl font-bold mb-6 text-center text-slate-800 tracking-tight">
          Hotels & Banquet Filters
        </h2>

        {/* Section Filter */}
        <div className="filtersection-block mb-6">
          <h4 className="filtersection-subtitle text-lg font-semibold mb-3 text-slate-700 uppercase tracking-wider">
            SECTION
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {staticFilterData.sections.map((section) => (
              <div
                key={section}
                className={`filtersection-category-child p-3 rounded-lg border border-gray-200 mb-2 bg-white transition-all cursor-pointer text-slate-600 ${
                  formData.section === section.toLowerCase() ? 'active' : ''
                }`}
                onClick={() => setFormData((prev) => ({ ...prev, section: section.toLowerCase() }))}
              >
                {section}
              </div>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div className="filtersection-block mb-6">
          <h4 className="filtersection-subtitle text-lg font-semibold mb-3 text-slate-700 uppercase tracking-wider">
            PROPERTY TYPE
          </h4>
          {staticFilterData.propertyTypes.map((type) => (
            <div
              key={type}
              className={`filtersection-category-child p-3 rounded-lg border border-gray-200 mb-2 bg-white transition-all cursor-pointer text-slate-600 ${
                formData.propertyType === type ? 'active' : ''
              }`}
              onClick={() => setFormData((prev) => ({ ...prev, propertyType: type }))}
            >
              Hotels
            </div>
          ))}
          {staticFilterData.propertyTypes.map((type) => (
            <div
              key={type}
              className={`filtersection-category-child p-3 rounded-lg border border-gray-200 mb-2 bg-white transition-all cursor-pointer text-slate-600 ${
                formData.propertyType === type ? 'active' : ''
              }`}
              onClick={() => setFormData((prev) => ({ ...prev, propertyType: type }))}
            >
              Banquet Halls
            </div>
          ))}
        </div>

        {/* State */}
        <div className="filtersection-block mb-6">
          <h4 className="filtersection-subtitle text-lg font-semibold mb-3 text-slate-700 uppercase tracking-wider">
            STATE
          </h4>
          <select
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="filtersection-select w-full p-3 rounded-lg border border-gray-200 mb-3 bg-white text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
          >
            <option value="">Select State</option>
            {staticFilterData.states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="filtersection-block mb-6">
          <h4 className="filtersection-subtitle text-lg font-semibold mb-3 text-slate-700 uppercase tracking-wider">
            CITY
          </h4>
          <select
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="filtersection-select w-full p-3 rounded-lg border border-gray-200 mb-3 bg-white text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
          >
            <option value="">Select City</option>
            {staticFilterData.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div className="filtersection-block mb-6">
          <h4 className="filtersection-subtitle text-lg font-semibold mb-3 text-slate-700 uppercase tracking-wider">
            GENDER
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {staticFilterData.genders.map((gender) => (
              <div
                key={gender}
                className={`filtersection-category-child p-3 rounded-lg border border-gray-200 mb-2 bg-white transition-all cursor-pointer text-slate-600 ${
                  formData.gender === gender ? 'active' : ''
                }`}
                onClick={() => setFormData((prev) => ({ ...prev, gender }))}
              >
                {gender}
              </div>
            ))}
          </div>
        </div>

        {/* Sharing Type */}
        <div className="filtersection-block mb-6">
          <h4 className="filtersection-subtitle text-lg font-semibold mb-3 text-slate-700 uppercase tracking-wider">
            SHARING TYPE
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {staticFilterData.sharingTypes.map((sharingType) => (
              <div
                key={sharingType}
                className={`filtersection-category-child p-3 rounded-lg border border-gray-200 mb-2 bg-white transition-all cursor-pointer text-slate-600 ${
                  formData.sharingType === sharingType ? 'active' : ''
                }`}
                onClick={() => setFormData((prev) => ({ ...prev, sharingType }))}
              >
                {sharingType}
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="filtersection-block mb-6">
          <h4 className="filtersection-subtitle text-lg font-semibold mb-3 text-slate-700 uppercase tracking-wider">
            PRICE RANGE
          </h4>
          <input
            type="range"
            className="filtersection-slider w-full mb-3 h-1.5 rounded-full cursor-pointer"
            min="0"
            max="125000"
            value={priceRange[1]}
            onChange={(e) => handlePriceChange(e, 1)}
          />
          <div className="filtersection-price-inputs flex items-center gap-3">
            <input
              type="number"
              name="minPrice"
              placeholder="Min (₹)"
              value={priceRange[0]}
              onChange={(e) => handlePriceChange(e, 0)}
              className="filtersection-input w-1/2 p-3 rounded-lg border border-gray-200 bg-white text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            />
            <span>-</span>
            <select
              name="maxPrice"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(e, 1)}
              className="filtersection-select w-1/2 p-3 rounded-lg border border-gray-200 bg-white text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            >
              <option value="8000">₹8,000</option>
              <option value="20000">₹20,000</option>
              <option value="50000">₹50,000</option>
              <option value="125000">₹1,25,000</option>
            </select>
          </div>
        </div>

        {/* Distance Range (added as requested) */}
        <div className="filtersection-block mb-6">
          <h4 className="filtersection-subtitle text-lg font-semibold mb-3 text-slate-700 uppercase tracking-wider">
            DISTANCE RANGE (KM)
          </h4>
          <input
            type="range"
            className="filtersection-slider w-full mb-3 h-1.5 rounded-full cursor-pointer"
            min="0"
            max="50"
            value={distanceRange[1]}
            onChange={(e) => handleDistanceChange(e, 1)}
          />
          <div className="filtersection-price-inputs flex items-center gap-3">
            <input
              type="number"
              name="minDistance"
              placeholder="Min (KM)"
              value={distanceRange[0]}
              onChange={(e) => handleDistanceChange(e, 0)}
              className="filtersection-input w-1/2 p-3 rounded-lg border border-gray-200 bg-white text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            />
            <span>-</span>
            <select
              name="maxDistance"
              value={distanceRange[1]}
              onChange={(e) => handleDistanceChange(e, 1)}
              className="filtersection-select w-1/2 p-3 rounded-lg border border-gray-200 bg-white text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            >
              <option value="5">5 KM</option>
              <option value="10">10 KM</option>
              <option value="20">20 KM</option>
              <option value="50">50 KM</option>
            </select>
          </div>
        </div>

        {/* Availability */}
        <div className="filtersection-block mb-6">
          <h4 className="filtersection-subtitle text-lg font-semibold mb-3 text-slate-700 uppercase tracking-wider">
            AVAILABILITY
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {staticFilterData.availabilities.map((availability) => (
              <div
                key={availability}
                className={`filtersection-category-child p-3 rounded-lg border border-gray-200 mb-2 bg-white transition-all cursor-pointer text-slate-600 ${
                  formData.availability === availability ? 'active' : ''
                }`}
                onClick={() => setFormData((prev) => ({ ...prev, availability }))}
              >
                {availability}
              </div>
            ))}
          </div>
        </div>

        {/* Property Title */}
        <div className="filtersection-block mb-6">
          <h4 className="filtersection-subtitle text-lg font-semibold mb-3 text-slate-700 uppercase tracking-wider">
            PROPERTY TITLE
          </h4>
          <input
            type="text"
            placeholder="Search by Title"
            className="filtersection-input w-full p-3 rounded-lg border border-gray-200 bg-white text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
          />
        </div>

        {/* Search Button */}
        <button
          type="button"
          className="filtersection-search-btn w-full p-3 bg-gradient-to-r from-cyan-700 to-cyan-500 text-white rounded-lg font-semibold uppercase tracking-wider transition-all"
          onClick={handleSearch}
        >
          Apply Filters
        </button>
      </div>
    </motion.div>
  );
};

export default PropertyFilterPage;
