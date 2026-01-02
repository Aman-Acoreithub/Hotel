// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { showSuccess, showError, showInfo, showWarning } from "../utils/Toast";
// import "react-toastify/dist/ReactToastify.css";
// import "./Register.css";


// const Register = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//     confirmMobile: "",
//     aadhaarNumber: "",
//     profileImage: "",
//     dateOfBirth: "",
//     gender: "",
//     street: "",
//     city: "",
//     state: "",
//     pincode: "",
//     country: "",
//     districtId: "",
//     location: "",
//     businessName: "",
//     // businessType: "",
//     gstNumber: "",
//     panNumber: "",
//     otp: ""
//   });


//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [showOtpPopup, setShowOtpPopup] = useState(false);
//   const [mobileMatch, setMobileMatch] = useState(null); // null, true, false
//   const navigate = useNavigate();


//   const baseUrl = "https://hotel-banquet.nearprop.in";


//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => {
//       const newFormData = { ...prev, [name]: value };

//       // Check mobile number matching when both fields have 10 digits
//       if (name === "mobile" || name === "confirmMobile") {
//         const mobile = name === "mobile" ? value : newFormData.mobile;
//         const confirmMobile = name === "confirmMobile" ? value : newFormData.confirmMobile;

//         if (mobile.length === 10 && confirmMobile.length === 10) {
//           setMobileMatch(mobile === confirmMobile);
//         } else {
//           setMobileMatch(null);
//         }
//       }

//       return newFormData;
//     });
//   };


//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);


//     const payload = {
//       name: formData.name.trim(),
//       email: formData.email.trim().toLowerCase(),
//       mobile: formData.mobile.trim(),
//       aadhaarNumber: formData.aadhaarNumber.trim(),
//       profileImage:
//         formData.profileImage.trim() ||
//         "https://www.flaticon.com/free-icon/account_3033143?term=profile+picture&page=1&position=5&origin=tag&related_id=3033143",
//       dateOfBirth: formData.dateOfBirth,
//       gender: formData.gender.trim(),
//       address: {
//         street: formData.street.trim(),
//         city: formData.city.trim(),
//         state: formData.state.trim(),
//         pincode: formData.pincode.trim(),
//         country: formData.country.trim(),
//         districtId: formData.districtId.trim(),
//         location: formData.location.trim(),
//       },
//       businessName: formData.businessName.trim(),
//       panNumber: formData.panNumber.trim(),
//     };


//     try {
//       console.log("Register Payload:", JSON.stringify(payload));


//       // ✅ Validate BEFORE API call
//       if (!payload.name) {
//         showWarning("Name is required");
//         setLoading(false);
//         return;
//       }
//       if (!payload.email || !payload.email.includes("@")) {
//         showWarning("Valid email is required");
//         setLoading(false);
//         return;
//       }
//       if (!payload.mobile || String(payload.mobile).trim().length !== 10) {
//         showWarning("Mobile number must be 10 digits");
//         setLoading(false);
//         return;
//       }
//       if (formData.mobile !== formData.confirmMobile) {
//         showWarning("Mobile numbers do not match");
//         setLoading(false);
//         return;
//       }
//       if (!payload.aadhaarNumber || payload.aadhaarNumber.length !== 12) {
//         showWarning("Aadhaar number must be 12 digits");
//         setLoading(false);
//         return;
//       }
//       if (!payload.address.city) {
//         showWarning("City is required in address");
//         setLoading(false);
//         return;
//       }
//       if (!payload.businessName) {
//         showWarning("Business Name is required");
//         setLoading(false);
//         return;
//       }
//       if (!payload.panNumber) {
//         showWarning("PAN Number is required");
//         setLoading(false);
//         return;
//       }


//       // ✅ Only call API after validation passes
//       const res = await fetch(`${baseUrl}/api/auth/register-owner`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });


//       const data = await res.json();


//       if (!res.ok) {
//         throw new Error(data.message || "Failed to register");
//       }


//       console.log("Mobile entered:", payload.mobile, "Length:", payload.mobile?.length);


//       setShowOtpPopup(true);
//       showSuccess("OTP sent successfully to your mobile", {
//         position: "top-right",
//         autoClose: 3000,
//       });
//     } catch (err) {
//       showError(err.message || "Failed to initiate registration", {
//         position: "top-right",
//         autoClose: 3000,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };



//   const handleVerifyOTP = async () => {
//     setLoading(true);
//     setError(null);


//     if (!formData.otp || formData.otp.trim().length === 0) {
//       setError("Please enter the OTP sent to your mobile.");
//       setLoading(false);
//       return;
//     }


//     try {
//       const res = await fetch(`${baseUrl}/api/auth/login/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           mobile: formData.confirmMobile.trim(),
//           otp: formData.otp.trim()
//         })
//       });


//       const data = await res.json();


//       if (!res.ok) {
//         throw new Error(data.message || "Invalid OTP");
//       }


//       if (data.token) {
//         const token = localStorage.setItem("token", data.data.token)
//         console.log(token)
//       }


//       showSuccess("Owner registered successfully", {
//         position: "top-right",
//         autoClose: 3000,
//       });

//       localStorage.setItem("token", data.data.token);

//       setTimeout(() => {
//         navigate("/");
//       }, 3000);


//       setFormData({
//         name: "",
//         email: "",
//         mobile: "",
//         confirmMobile: "",
//         aadhaarNumber: "",
//         profileImage: "",
//         dateOfBirth: "",
//         gender: "",
//         street: "",
//         city: "",
//         state: "",
//         pincode: "",
//         country: "",
//         districtId: "",
//         location: "",
//         businessName: "",
//         // businessType: "",
//         gstNumber: "",
//         panNumber: "",
//         otp: ""
//       });
//       setShowOtpPopup(false);
//     } catch (err) {
//       showError(err.message || "Something went wrong", {
//         position: "top-right",
//         autoClose: 3000
//       });
//     } finally {
//       setLoading(false);
//     }
//   };


//   const closePopup = () => {
//     setShowOtpPopup(false);
//     setFormData((prev) => ({ ...prev, otp: "" }));
//   };


//   return (
//     <div className="register-container">
//       <div className="overlay"></div>



//       <motion.div
//         className="register-card"
//         initial={{ opacity: 0, y: -50 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//       >
//         <h2 className="register-title">Create Your Account</h2>
//         {error && <div className="error-message">{error}</div>}
//         <form onSubmit={handleRegister} className="register-form">
//           <div className="form-row">
//             <div className="input-group">
//               <label htmlFor="name">Full Name *</label>
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 placeholder="Enter you Name"
//                 value={formData.name}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="input-group">
//               <label htmlFor="email">Email Address *</label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 placeholder="Email Address"
//                 value={formData.email}
//                 onChange={handleChange}
//               />
//             </div>
//           </div>



//           <div className="form-row">
//             <div className="input-group">
//               <label htmlFor="mobile">Mobile Number *</label>
//               <input
//                 type="text"
//                 id="mobile"
//                 name="mobile"
//                 placeholder="Mobile Number (e.g., +918351927365)"
//                 value={formData.mobile}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="input-group ">
//               <label htmlFor="confirmMobile">Confirm Mobile Number *</label>
//               <input
//                 type="text"
//                 id="confirmMobile"
//                 name="confirmMobile"
//                 placeholder="Confirm Mobile Number"
//                 value={formData.confirmMobile}
//                 onChange={handleChange}
//               />
//               {mobileMatch === true && (
//                 <div className="match-message success">✓ Mobile numbers match</div>
//               )}
//               {mobileMatch === false && (
//                 <div className="match-message error">✗ Mobile numbers do not match</div>
//               )}
//             </div>
//           </div>



//           <div className="form-row">
//             <div className="input-group">
//               <label htmlFor="aadhaarNumber">Aadhaar Number *</label>
//               <input
//                 type="text"
//                 id="aadhaarNumber"
//                 name="aadhaarNumber"
//                 placeholder="Aadhaar Number (12 digits)"
//                 value={formData.aadhaarNumber}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="input-group">
//               <label htmlFor="profileImage">Profile Image URL</label>
//               <input
//                 type="text"
//                 id="profileImage"
//                 name="profileImage"
//                 placeholder="Profile Image URL (optional)"
//                 value={formData.profileImage}
//                 onChange={handleChange}
//               />
//             </div>
//           </div>



//           <div className="form-row">
//             <div className="input-group">
//               <label htmlFor="dateOfBirth">Date of Birth *</label>
//               <input
//                 type="date"
//                 id="dateOfBirth"
//                 name="dateOfBirth"
//                 placeholder="Date of Birth"
//                 value={formData.dateOfBirth}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="input-group">
//               <label htmlFor="gender">Gender *</label>
//               <select
//                 id="gender"
//                 name="gender"
//                 value={formData.gender}
//                 onChange={handleChange}
//               >
//                 <option value="">Select Gender</option>
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//                 <option value="Other">Other</option>
//               </select>
//             </div>
//           </div>



//           <div className="form-row">
//             <div className="input-group">
//               <label htmlFor="pincode">Pincode *</label>
//               <input
//                 type="text"
//                 id="pincode"
//                 name="pincode"
//                 placeholder="Pincode (6 digits)"
//                 value={formData.pincode}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="input-group">
//               <label htmlFor="street">Street Address *</label>
//               <input
//                 type="text"
//                 id="street"
//                 name="street"
//                 placeholder="Street"
//                 value={formData.street}
//                 onChange={handleChange}
//               />
//             </div>
//           </div>



//           <div className="form-row">
//             <div className="input-group">
//               <label htmlFor="city">City *</label>
//               <input
//                 type="text"
//                 id="city"
//                 name="city"
//                 placeholder="City"
//                 value={formData.city}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="input-group">
//               <label htmlFor="state">State *</label>
//               <input
//                 type="text"
//                 id="state"
//                 name="state"
//                 placeholder="State"
//                 value={formData.state}
//                 onChange={handleChange}
//               />
//             </div>
//           </div>



//           <div className="form-row">
//             <div className="input-group">
//               <label htmlFor="country">Country *</label>
//               <input
//                 type="text"
//                 id="country"
//                 name="country"
//                 placeholder="Country"
//                 value={formData.country}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="input-group">
//               <label htmlFor="districtId">District ID *</label>
//               <input
//                 type="text"
//                 id="districtId"
//                 name="districtId"
//                 placeholder="District ID (e.g., MP-UJJ)"
//                 value={formData.districtId}
//                 onChange={handleChange}
//               />
//             </div>
//           </div>
//           {/* 
//           <div className="input-group">
//             <label htmlFor="location">Location</label>
//             <input
//               type="text"
//               id="location"
//               name="location"
//               placeholder="Location (e.g., 23.1765,75.7885)"
//               value={formData.location}
//               onChange={handleChange}
//             />
//           </div> */}



//           <div className="form-row">
//             <div className="input-group">
//               <label htmlFor="businessName">Business Name *</label>
//               <input
//                 type="text"
//                 id="businessName"
//                 name="businessName"
//                 placeholder="Business Name"
//                 value={formData.businessName}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="input-group">
//               <label htmlFor="businessType">Business Type</label>
//               <input
//                 type="text"
//                 id="businessType"
//                 name="businessType"
//                 placeholder="Business Type"
//                 value={formData.businessType}
//                 onChange={handleChange}
//               />
//             </div>
//           </div>



//           <div className="form-row">
//             <div className="input-group">
//               <label htmlFor="gstNumber">GST Number</label>
//               <input
//                 type="text"
//                 id="gstNumber"
//                 name="gstNumber"
//                 placeholder="GST Number (optional)"
//                 value={formData.gstNumber}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="input-group">
//               <label htmlFor="panNumber">PAN Number *</label>
//               <input
//                 type="text"
//                 id="panNumber"
//                 name="panNumber"
//                 placeholder="PAN Number"
//                 value={formData.panNumber}
//                 onChange={handleChange}
//               />
//             </div>
//           </div>



//           <motion.button
//             type="submit"
//             className="register-btn"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             disabled={loading}
//           >
//             {loading ? "Sending OTP..." : "Register"}
//           </motion.button>
//         </form>
//       </motion.div>



//       {showOtpPopup && (
//         <motion.div
//           className="otp-popup"
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.3 }}
//         >
//           <div className="otp-popup-content">
//             <h3>Verify OTP</h3>
//             <div className="input-group">
//               <label htmlFor="otp">Enter OTP *</label>
//               <input
//                 type="text"
//                 id="otp"
//                 name="otp"
//                 placeholder="Enter OTP"
//                 value={formData.otp}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="otp-popup-buttons">
//               <motion.button
//                 className="verify-btn"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={handleVerifyOTP}
//                 disabled={loading}
//               >
//                 {loading ? "Verifying..." : "Verify OTP"}
//               </motion.button>
//               <motion.button
//                 className="cancel-btn"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={closePopup}
//                 disabled={loading}
//               >
//                 Cancel
//               </motion.button>
//             </div>
//           </div>
//         </motion.div>
//       )}



//       {/* <ToastContainer /> */}
//     </div>
//   );
// };


// export default Register;



import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError, showInfo, showWarning } from "../utils/Toast";
import "react-toastify/dist/ReactToastify.css";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    confirmMobile: "",
    aadhaarNumber: "",
    profileImage: "",
    dateOfBirth: "",
    gender: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    districtId: "",
    location: "",
    businessName: "",
    gstNumber: "",
    panNumber: "",
    otp: ""
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  const baseUrl = "https://hotel-banquet.nearprop.in";

  // Validation functions
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "Name is required";
        } else if (value.trim().length < 3) {
          error = "Name must be at least 3 characters";
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = "Name should only contain letters";
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email";
        }
        break;

      case "mobile":
        if (!value.trim()) {
          error = "Mobile number is required";
        } else if (!/^\d{10}$/.test(value)) {
          error = "Mobile number must be exactly 10 digits";
        }
        break;

      case "confirmMobile":
        if (!value.trim()) {
          error = "Please confirm your mobile number";
        } else if (!/^\d{10}$/.test(value)) {
          error = "Mobile number must be exactly 10 digits";
        } else if (value !== formData.mobile) {
          error = "Mobile numbers do not match";
        }
        break;

      case "aadhaarNumber":
        if (!value.trim()) {
          error = "Aadhaar number is required";
        } else if (!/^\d{12}$/.test(value)) {
          error = "Aadhaar number must be exactly 12 digits";
        }
        break;

      case "dateOfBirth":
        if (!value) {
          error = "Date of birth is required";
        } else {
          const today = new Date();
          const birthDate = new Date(value);
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 18) {
            error = "You must be at least 18 years old";
          }
        }
        break;

      case "gender":
        if (!value) {
          error = "Gender is required";
        }
        break;

      case "pincode":
        if (!value.trim()) {
          error = "Pincode is required";
        } else if (!/^\d{6}$/.test(value)) {
          error = "Pincode must be exactly 6 digits";
        }
        break;

      case "street":
        if (!value.trim()) {
          error = "Street address is required";
        }
        break;

      case "city":
        if (!value.trim()) {
          error = "City is required";
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = "City should only contain letters";
        }
        break;

      case "state":
        if (!value.trim()) {
          error = "State is required";
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = "State should only contain letters";
        }
        break;

      case "country":
        if (!value.trim()) {
          error = "Country is required";
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = "Country should only contain letters";
        }
        break;

      case "districtId":
        if (!value.trim()) {
          error = "District ID is required";
        } else if (!/^[A-Z]{2}-[A-Z]{3}$/.test(value)) {
          error = "District ID format: XX-XXX (e.g., MP-UJJ)";
        }
        break;

      case "businessName":
        if (!value.trim()) {
          error = "Business name is required";
        } else if (value.trim().length < 3) {
          error = "Business name must be at least 3 characters";
        }
        break;

      case "panNumber":
        if (!value.trim()) {
          error = "PAN number is required";
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
          error = "Invalid PAN format (e.g., ABCDE1234F)";
        }
        break;

      case "gstNumber":
        if (value.trim() && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(value)) {
          error = "Invalid GST format";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow only numbers for specific fields
    if (["mobile", "confirmMobile", "aadhaarNumber", "pincode"].includes(name)) {
      if (value && !/^\d*$/.test(value)) {
        return; // Don't update if non-numeric
      }
    }

    // Convert to uppercase for specific fields
    let processedValue = value;
    if (["districtId", "panNumber", "gstNumber"].includes(name)) {
      processedValue = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue
    }));

    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, processedValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  };

  // Check form validity
  useEffect(() => {
    const requiredFields = [
      "name", "email", "mobile", "confirmMobile", "aadhaarNumber",
      "dateOfBirth", "gender", "pincode", "street", "city", "state",
      "country", "districtId", "businessName", "panNumber"
    ];

    const allFieldsFilled = requiredFields.every(field => formData[field]?.toString().trim());
    const noErrors = requiredFields.every(field => !validateField(field, formData[field]));

    setIsFormValid(allFieldsFilled && noErrors);
  }, [formData]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      showWarning("Please fix all errors before submitting");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      mobile: formData.mobile.trim(),
      aadhaarNumber: formData.aadhaarNumber.trim(),
      profileImage:
        formData.profileImage.trim() ||
        "https://www.flaticon.com/free-icon/account_3033143?term=profile+picture&page=1&position=5&origin=tag&related_id=3033143",
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender.trim(),
      address: {
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        country: formData.country.trim(),
        districtId: formData.districtId.trim(),
        location: formData.location.trim(),
      },
      businessName: formData.businessName.trim(),
      panNumber: formData.panNumber.trim(),
    };

    try {
      console.log("Register Payload:", JSON.stringify(payload));

      const res = await fetch(`${baseUrl}/api/auth/register-owner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to register");
      }

      setShowOtpPopup(true);
      showSuccess("OTP sent successfully to your mobile");
    } catch (err) {
      showError(err.message || "Failed to initiate registration");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError(null);

    if (!formData.otp || formData.otp.trim().length === 0) {
      setError("Please enter the OTP sent to your mobile.");
      showWarning("Please enter the OTP");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/auth/login/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: formData.confirmMobile.trim(),
          otp: formData.otp.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      if (data.token) {
        localStorage.setItem("token", data.data.token);
      }

      showSuccess("Owner registered successfully! Redirecting...");

      setTimeout(() => {
        navigate("/");
      }, 2000);

      setFormData({
        name: "",
        email: "",
        mobile: "",
        confirmMobile: "",
        aadhaarNumber: "",
        profileImage: "",
        dateOfBirth: "",
        gender: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
        districtId: "",
        location: "",
        businessName: "",
        gstNumber: "",
        panNumber: "",
        otp: ""
      });
      setShowOtpPopup(false);
    } catch (err) {
      showError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setShowOtpPopup(false);
    setFormData((prev) => ({ ...prev, otp: "" }));
  };

  return (
    <div className="register-container">
      <div className="overlay"></div>

      <motion.div
        className="register-card"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="register-title">Create Your Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleRegister} className="register-form">
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.name && errors.name ? "invalid" : touched.name ? "valid" : ""}
              />
              {touched.name && errors.name && <div className="field-error">{errors.name}</div>}
              {touched.name && !errors.name && formData.name && <div className="field-success">✓ Valid</div>}
            </div>
            <div className="input-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.email && errors.email ? "invalid" : touched.email ? "valid" : ""}
              />
              {touched.email && errors.email && <div className="field-error">{errors.email}</div>}
              {touched.email && !errors.email && formData.email && <div className="field-success">✓ Valid</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="mobile">Mobile Number *</label>
              <input
                type="text"
                id="mobile"
                name="mobile"
                placeholder="10-digit mobile (e.g., 9876543210)"
                value={formData.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength="10"
                className={touched.mobile && errors.mobile ? "invalid" : touched.mobile ? "valid" : ""}
              />
              {touched.mobile && errors.mobile && <div className="field-error">{errors.mobile}</div>}
              {touched.mobile && !errors.mobile && formData.mobile && <div className="field-success">✓ Valid</div>}
            </div>
            <div className="input-group">
              <label htmlFor="confirmMobile">Confirm Mobile Number *</label>
              <input
                type="text"
                id="confirmMobile"
                name="confirmMobile"
                placeholder="Re-enter mobile number"
                value={formData.confirmMobile}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength="10"
                className={touched.confirmMobile && errors.confirmMobile ? "invalid" : touched.confirmMobile ? "valid" : ""}
              />
              {touched.confirmMobile && errors.confirmMobile && <div className="field-error">{errors.confirmMobile}</div>}
              {touched.confirmMobile && !errors.confirmMobile && formData.confirmMobile && <div className="field-success">✓ Mobile numbers match</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="aadhaarNumber">Aadhaar Number *</label>
              <input
                type="text"
                id="aadhaarNumber"
                name="aadhaarNumber"
                placeholder="12-digit Aadhaar (e.g., 123456789012)"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength="12"
                className={touched.aadhaarNumber && errors.aadhaarNumber ? "invalid" : touched.aadhaarNumber ? "valid" : ""}
              />
              {touched.aadhaarNumber && errors.aadhaarNumber && <div className="field-error">{errors.aadhaarNumber}</div>}
              {touched.aadhaarNumber && !errors.aadhaarNumber && formData.aadhaarNumber && <div className="field-success">✓ Valid</div>}
            </div>
            {/* <div className="input-group">
              <label htmlFor="profileImage">Profile Image URL</label>
              <input
                type="text"
                id="profileImage"
                name="profileImage"
                placeholder="https://example.com/image.jpg (optional)"
                value={formData.profileImage}
                onChange={handleChange}
              />
            </div> */}
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.dateOfBirth && errors.dateOfBirth ? "invalid" : touched.dateOfBirth ? "valid" : ""}
              />
              {touched.dateOfBirth && errors.dateOfBirth && <div className="field-error">{errors.dateOfBirth}</div>}
              {touched.dateOfBirth && !errors.dateOfBirth && formData.dateOfBirth && <div className="field-success">✓ Valid</div>}
            </div>
            <div className="input-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.gender && errors.gender ? "invalid" : touched.gender ? "valid" : ""}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {touched.gender && errors.gender && <div className="field-error">{errors.gender}</div>}
              {touched.gender && !errors.gender && formData.gender && <div className="field-success">✓ Valid</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="pincode">Pincode *</label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                placeholder="6-digit pincode (e.g., 110001)"
                value={formData.pincode}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength="6"
                className={touched.pincode && errors.pincode ? "invalid" : touched.pincode ? "valid" : ""}
              />
              {touched.pincode && errors.pincode && <div className="field-error">{errors.pincode}</div>}
              {touched.pincode && !errors.pincode && formData.pincode && <div className="field-success">✓ Valid</div>}
            </div>
            <div className="input-group">
              <label htmlFor="street">Street Address *</label>
              <input
                type="text"
                id="street"
                name="street"
                placeholder="Enter street address"
                value={formData.street}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.street && errors.street ? "invalid" : touched.street ? "valid" : ""}
              />
              {touched.street && errors.street && <div className="field-error">{errors.street}</div>}
              {touched.street && !errors.street && formData.street && <div className="field-success">✓ Valid</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Enter city name"
                value={formData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.city && errors.city ? "invalid" : touched.city ? "valid" : ""}
              />
              {touched.city && errors.city && <div className="field-error">{errors.city}</div>}
              {touched.city && !errors.city && formData.city && <div className="field-success">✓ Valid</div>}
            </div>
            <div className="input-group">
              <label htmlFor="state">State *</label>
              <input
                type="text"
                id="state"
                name="state"
                placeholder="Enter state name"
                value={formData.state}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.state && errors.state ? "invalid" : touched.state ? "valid" : ""}
              />
              {touched.state && errors.state && <div className="field-error">{errors.state}</div>}
              {touched.state && !errors.state && formData.state && <div className="field-success">✓ Valid</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="country">Country *</label>
              <input
                type="text"
                id="country"
                name="country"
                placeholder="Enter country name"
                value={formData.country}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.country && errors.country ? "invalid" : touched.country ? "valid" : ""}
              />
              {touched.country && errors.country && <div className="field-error">{errors.country}</div>}
              {touched.country && !errors.country && formData.country && <div className="field-success">✓ Valid</div>}
            </div>
            <div className="input-group">
              <label htmlFor="districtId">District ID *</label>
              <input
                type="text"
                id="districtId"
                name="districtId"
                placeholder="Format: XX-XXX (e.g., MP-UJJ)"
                value={formData.districtId}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength="6"
                className={touched.districtId && errors.districtId ? "invalid" : touched.districtId ? "valid" : ""}
              />
              {touched.districtId && errors.districtId && <div className="field-error">{errors.districtId}</div>}
              {touched.districtId && !errors.districtId && formData.districtId && <div className="field-success">✓ Valid</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="businessName">Business Name *</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                placeholder="Enter business name"
                value={formData.businessName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.businessName && errors.businessName ? "invalid" : touched.businessName ? "valid" : ""}
              />
              {touched.businessName && errors.businessName && <div className="field-error">{errors.businessName}</div>}
              {touched.businessName && !errors.businessName && formData.businessName && <div className="field-success">✓ Valid</div>}
            </div>
            <div className="input-group">
              <label htmlFor="gstNumber">GST Number</label>
              <input
                type="text"
                id="gstNumber"
                name="gstNumber"
                placeholder="15-digit GST (optional)"
                value={formData.gstNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength="15"
              />
              {touched.gstNumber && errors.gstNumber && <div className="field-error">{errors.gstNumber}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="panNumber">PAN Number *</label>
              <input
                type="text"
                id="panNumber"
                name="panNumber"
                placeholder="Format: ABCDE1234F"
                value={formData.panNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength="10"
                className={touched.panNumber && errors.panNumber ? "invalid" : touched.panNumber ? "valid" : ""}
              />
              {touched.panNumber && errors.panNumber && <div className="field-error">{errors.panNumber}</div>}
              {touched.panNumber && !errors.panNumber && formData.panNumber && <div className="field-success">✓ Valid</div>}
            </div>
            <div className="input-group"></div>
          </div>

          <motion.button
            type="submit"
            className="register-btn"
            whileHover={isFormValid ? { scale: 1.05 } : {}}
            whileTap={isFormValid ? { scale: 0.95 } : {}}
            disabled={loading || !isFormValid}
          >
            {loading ? "Sending OTP..." : "Register"}
          </motion.button>
        </form>
      </motion.div>

      {showOtpPopup && (
        <motion.div
          className="otp-popup"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="otp-popup-content">
            <h3>Verify OTP</h3>
            <div className="input-group">
              <label htmlFor="otp">Enter OTP *</label>
              <input
                type="text"
                id="otp"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={handleChange}
                maxLength="6"
              />
            </div>
            <div className="otp-popup-buttons">
              <motion.button
                className="verify-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </motion.button>
              <motion.button
                className="cancel-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closePopup}
                disabled={loading}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Register;