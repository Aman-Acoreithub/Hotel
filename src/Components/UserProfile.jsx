import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UserProfile.css";

const url = "https://hotel-banquet.nearprop.in";

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    mobile: "",
    dateOfBirth: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
    },
    businessName: "",
    businessType: "",
    gstNumber: "",
    panNumber: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null); // Store selected image file
  const [imagePreview, setImagePreview] = useState(null); // Store preview URL
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${url}/api/auth/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.success) {
          setProfile(data.data);
          setImagePreview(data.data.profileImage || "https://via.placeholder.com/150");
          setFormData({
            name: data.data.name || "",
            email: data.data.email || "",
            gender: data.data.gender || "",
            mobile: data.data.mobile || "",
            dateOfBirth: data.data.dateOfBirth
              ? data.data.dateOfBirth.split("T")[0]
              : "",

            address: {
              street: data.data.address?.street || "",
              city: data.data.address?.city || "",
              state: data.data.address?.state || "",
              pincode: data.data.address?.pincode || "",
              country: data.data.address?.country || "",
            },
            businessName: data.data.businessName || "",
            businessType: data.data.businessType || "",
            gstNumber: data.data.gstNumber || "",
            panNumber: data.data.panNumber || "",
          });
        } else {
          setError(data.message || "Failed to fetch profile");
        }
      } catch (err) {
        setError("An error occurred while fetching profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


  const handleLogout = () => {
    setLogoutLoading(true);
    localStorage.removeItem("token");
    toast.info("You are logging out. Login again...");
    setTimeout(() => {
      setLogoutLoading(false);
      navigate("/login");
    }, 1000);
  };

  const handleUpdateProfile = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    setUpdateLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      // Append text fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("mobile", formData.mobile);
      formDataToSend.append("dateOfBirth", formData.dateOfBirth || "");
      formDataToSend.append("address[street]", formData.address.street);
      formDataToSend.append("address[city]", formData.address.city);
      formDataToSend.append("address[state]", formData.address.state);
      formDataToSend.append("address[pincode]", formData.address.pincode);
      formDataToSend.append("address[country]", formData.address.country);
      formDataToSend.append("businessName", formData.businessName);
      formDataToSend.append("businessType", formData.businessType);
      formDataToSend.append("gstNumber", formData.gstNumber);
      formDataToSend.append("panNumber", formData.panNumber);
      // Append image file if selected
      if (profileImageFile) {
        formDataToSend.append("profileImage", profileImageFile);
      }

      const response = await fetch(`${url}/api/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
        setImagePreview(data.data.profileImage || "https://via.placeholder.com/150");
        setProfileImageFile(null); // Clear file after upload
        setIsEditing(false);
        toast.success(data.message || "Profile updated successfully");
      } else {
        toast.error(data.message || "Failed to update profile. Please check your inputs.");
      }
    } catch (err) {
      toast.error("An error occurred while updating profile. The server may be experiencing issues.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage") {
      const file = files[0];
      if (file) {
        setProfileImageFile(file);
        setImagePreview(URL.createObjectURL(file)); // Show preview
      }
    } else if (name.includes("address.")) {
      const addressField = name.split(".")[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [addressField]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Clean up preview URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (logoutLoading) {
    return (
      <div className="profileBox">
        <div className="loadingText">⏳ Logging out...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profileBox">
        <div className="loadingText">⏳ Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profileBox">
        <div className="errorCard">
          {/* <h2>⚠️ Error</h2> */}
          <p>{error}</p>
          <div className="errorButtons">
            <button className="loginBtn" onClick={() => window.location.href = "/login"}>
              🔑 Go to Login
            </button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profileBox">
      <div className="mainWrapper">
        {/* Card 1 */}
        <div className="userCard">
          <div className="avatarSection">
            <div className="imgBox">
              <img
                className="userImg"
                src={imagePreview || "https://via.placeholder.com/150"}
                alt="Profile"
              />
            </div>
            {isEditing && (
              <div className="imageUpload">
                <label htmlFor="profileImage">Upload New Image</label>
                <input
                  type="file"
                  id="profileImage"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>
          <div className="userHeader">
            <p className="userRole">{profile.role}</p>
            <p className="userName">{profile.name}</p>
          </div>

          {isEditing ? (
            <div className="infoGrid">
              <div className="formGrid">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                />
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <label>Mobile</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                  maxLength="10"
                />
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                />
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />

                <label>Street</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  placeholder="Enter street"
                />
                <label>City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                />
                <label>State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                />
                <label>Pincode</label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleInputChange}
                  placeholder="Enter pincode"
                />
                <label>Country</label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  placeholder="Enter country"
                />
              </div>
              <div className="formButtons">
                <button
                  className="saveBtn"
                  onClick={handleUpdateProfile}
                  disabled={updateLoading}
                >
                  {updateLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  className="cancelBtn"
                  onClick={() => {
                    setIsEditing(false);
                    setProfileImageFile(null);
                    setImagePreview(profile.profileImage || "https://via.placeholder.com/150");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="infoGrid">
              <ul className="labelCol">
                <li>Gender</li>
                <li>{profile.gender}</li>
                <li>Mobile</li>
                <li>{profile.mobile}</li>
                <li>Email</li>
                <li>{profile.email}</li>
                <li>Date of Birth</li>
                <li>
                  {profile.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString("en-GB")
                    : "-"}
                </li>

                <li>Address</li>
                <li>
                  {profile.address.street}, {profile.address.city},{" "}
                  {profile.address.state}, {profile.address.pincode},{" "}
                  {profile.address.country}
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Card 2 */}
        <div className="userCard">
          <div className="infoGrid">
            <ul className="labelCol">
              <li>Aadhaar Number</li>
              <li>{profile.aadhaarNumber}</li>
              {isEditing ? (
                <>
                  {/* <li>Business Name</li>
                  <li>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="Enter business name"
                    />
                  </li>
                  <li>Business Type</li>
                  <li>
                    <input
                      type="text"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      placeholder="Enter business type"
                    />
                  </li>
                  <li>GST Number</li>
                  <li>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      placeholder="Enter GST number"
                    />
                  </li>
                  <li>PAN Number</li>
                  <li>
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleInputChange}
                      placeholder="Enter PAN number"
                    />
                  </li> */}
                </>
              ) : (
                <>
                  <li>Business Name</li>
                  <li>{profile.businessName}</li>
                  <li>Business Type</li>
                  <li>{profile.businessType}</li>
                  <li>GST Number</li>
                  <li>{profile.gstNumber}</li>
                  <li>PAN Number</li>
                  <li>{profile.panNumber}</li>
                </>
              )}
              <li>Created At</li>
              <li>{profile.createdAt}</li>
              <li>Updated At</li>
              <li>{profile.updatedAt}</li>
            </ul>
          </div>
          <div className="update-logout-buttons">
            <button
              className="updateBtn"
              onClick={() => setIsEditing(true)}
              disabled={isEditing}
            >
              ✏️ Update Profile
            </button>
            <button className="logoutBtn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default UserProfile;