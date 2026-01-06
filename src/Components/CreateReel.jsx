import React, { useEffect, useMemo, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faHeart, faShare, faComment, faPlus, faUpload } from "@fortawesome/free-solid-svg-icons";
import "./CreateReel.css";

function CreateReel({ addReel }) {
  // ------------ CONFIG ------------
  const baseUrl = "http://3.111.155.28:5002";
  const authToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODk1OGRiYTYxMWQ4MDMyMTQwYjNlM2YiLCJpZCI6IjY4OTU4ZGJhNjExZDgwMzIxNDBiM2UzZiIsInJvbGVzIjpbIm93bmVyIl0sInNlc3Npb25JZCI6Ijk3MDY3N2QzLWU4Y2EtNDE0NS1iYzgwLWQ5OTYzMjM5NjBjZCIsImlzcyI6Ik5lYXJwcm9wQmFja2VuZCIsImlhdCI6MTc1NDYzMTY5MSwiZXhwIjoxNzU1MjM2NDkxfQ.Gc4N4mofq15hioANXYwVjlAt5e5ZXF3mEv2nzccQW_k";
  const hotelId = "HOTEL006";
  const apiCreate = `${baseUrl}/api/reels/`;
  const apiList = `${baseUrl}/api/reels/${hotelId}/`;
  const apiInitPay = `${baseUrl}/api/reels/extra-reel-payment`;
  const apiVerifyPay = `${baseUrl}/api/reels/verify-extra-reel-payment`;
  const apiDelete = (id) => `${baseUrl}/api/reels/${id}`;
  const apiAnalytics = (id) => `${baseUrl}/api/reels/${id}/analytics`;

  const razorpayKeyId = "rzp_test_LoJiA2mTb0THiq";
  const MAX_FREE = 3;
  const PRICE = 99; // INR

  // ------------ STATE ------------
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' | 'myReels'
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reels, setReels] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reelsError, setReelsError] = useState("");
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null); // {status:'completed'|'failed'|...}
  const [extraSlots, setExtraSlots] = useState(0); // client-side unlocked extra uploads after purchase(s)
  const [uploadProgress, setUploadProgress] = useState(0);
  const dragRef = useRef(null);

  const totalAllowed = useMemo(() => MAX_FREE + extraSlots, [extraSlots]);

  // ------------ EFFECTS ------------
  // Load Razorpay + fetch reels
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    fetchReels();

    return () => {
      document.body.removeChild(script);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------ HELPERS ------------
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVideoFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setUploadProgress(0);
  };

  const handleFilePick = (file) => {
    if (!file) return;
    if (!file.type?.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }
    setError("");
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const onFileChange = (e) => {
    handleFilePick(e.target.files?.[0]);
  };

  // Drag & Drop
  useEffect(() => {
    const area = dragRef.current;
    if (!area) return;

    const onDragOver = (e) => {
      e.preventDefault();
      area.classList.add("drop-active");
    };
    const onDragLeave = () => {
      area.classList.remove("drop-active");
    };
    const onDrop = (e) => {
      e.preventDefault();
      area.classList.remove("drop-active");
      const file = e.dataTransfer.files?.[0];
      handleFilePick(file);
    };

    area.addEventListener("dragover", onDragOver);
    area.addEventListener("dragleave", onDragLeave);
    area.addEventListener("drop", onDrop);

    return () => {
      area.removeEventListener("dragover", onDragOver);
      area.removeEventListener("dragleave", onDragLeave);
      area.removeEventListener("drop", onDrop);
    };
  }, []);

  // ------------ API CALLS ------------
  async function fetchReels() {
    setIsLoading(true);
    setReelsError("");
    try {
      const res = await fetch(apiList, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to fetch reels");

      const mapped = (json?.data?.reels || []).map((r) => ({
        id: r._id,
        videoUrl: r.content,
        title: r.title,
        description: r.description || "",
        viewCount: r.viewCount || 0,
        likeCount: r.likeCount || 0,
        commentCount: r.commentCount || 0,
        shareCount: r.shareCount || 0,
      }));

      setReels(mapped);

      // fetch analytics serially (optional)
      const analyticsData = {};
      for (const r of mapped) {
        try {
          const ar = await fetch(apiAnalytics(r.id), {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          const aj = await ar.json();
          if (ar.ok) analyticsData[r.id] = aj.data || {};
        } catch {
          // ignore analytics error for any one reel
        }
      }
      setAnalytics(analyticsData);
    } catch (e) {
      setReelsError(e.message || "Error fetching reels.");
    } finally {
      setIsLoading(false);
    }
  }

  // INITIATE PAYMENT
  async function initiatePayment() {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(apiInitPay, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hotelId, extraReels: 1, price: PRICE }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to initiate payment");

      // Expecting {data:{orderId}} from your backend
      const { orderId } = json.data || {};
      if (!orderId) throw new Error("Order id not returned from server.");

      const options = {
        key: razorpayKeyId,
        amount: PRICE * 100,
        currency: "INR",
        name: "PropertyReels",
        description: "Purchase Extra Reel Slot",
        order_id: orderId,
        handler: async (paymentResult) => {
          await verifyPayment(paymentResult);
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
        },
        theme: { color: "#ff0000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setError(e.message || "Payment init failed.");
    } finally {
      setIsLoading(false);
    }
  }

  // VERIFY PAYMENT
  async function verifyPayment(paymentResult) {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(apiVerifyPay, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentResult.razorpay_payment_id,
          razorpay_order_id: paymentResult.razorpay_order_id,
          razorpay_signature: paymentResult.razorpay_signature,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Payment verification failed");

      if (json?.data?.paymentStatus === "completed") {
        setPaymentStatus({ status: "completed" });
        setExtraSlots((s) => s + 1); // unlock one more upload
        setSuccess("Payment successful! You can now upload an extra reel.");
        setActiveTab("upload");
      } else {
        setPaymentStatus({ status: "failed" });
        setError("Payment not completed. Please try again.");
      }
    } catch (e) {
      setPaymentStatus({ status: "failed" });
      setError(e.message || "Payment verification error.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  }

  // UPLOAD WITH PROGRESS (XHR)
  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !videoFile) {
      setError("Title and video file are required.");
      return;
    }

    // Allow upload only if under allowed count
    if (reels.length >= totalAllowed) {
      setError("Please purchase an extra slot to upload more reels.");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);
    setUploadProgress(0);

    const form = new FormData();
    form.append("hotelId", hotelId);
    form.append("title", title.trim());
    form.append("video", videoFile);
    if (description.trim()) form.append("description", description.trim());

    // Using XMLHttpRequest for progress
    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiCreate, true);
    xhr.setRequestHeader("Authorization", `Bearer ${authToken}`);

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const prog = Math.round((evt.loaded / evt.total) * 100);
        setUploadProgress(prog);
      }
    };

    xhr.onload = () => {
      setIsLoading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          const newReel = {
            id: result?.data?.reel?._id,
            videoUrl: result?.data?.reel?.content,
            title: result?.data?.reel?.title,
            description: result?.data?.reel?.description || "",
            viewCount: result?.data?.reel?.viewCount || 0,
            likeCount: 0,
            commentCount: 0,
            shareCount: result?.data?.reel?.shareCount || 0,
          };

          addReel?.(newReel);
          setReels((prev) => [newReel, ...prev]);
          setAnalytics((prev) => ({
            ...prev,
            [newReel.id]: { views: 0, shares: 0, likes: 0, comments: 0 },
          }));
          setSuccess("Reel uploaded successfully!");
          // if this upload consumed an extra slot (beyond free), reduce one:
          if (reels.length >= MAX_FREE) {
            setExtraSlots((s) => Math.max(0, s - 1));
          }
          resetForm();
          setActiveTab("myReels");
        } catch {
          setError("Unexpected response from server.");
        }
      } else {
        try {
          const j = JSON.parse(xhr.responseText);
          setError(j?.message || "Failed to upload reel.");
        } catch {
          setError("Failed to upload reel.");
        }
      }
      setTimeout(() => setSuccess(""), 2500);
    };

    xhr.onerror = () => {
      setIsLoading(false);
      setError("Network error during upload.");
    };

    xhr.send(form);
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this reel?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(apiDelete(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j?.message || "Failed to delete reel");
      }
      setReels((prev) => prev.filter((r) => r.id !== id));
      setDeleteSuccessMessage("Reel deleted successfully.");
      setTimeout(() => setDeleteSuccessMessage(""), 2000);
    } catch (e) {
      setReelsError(e.message || "Delete failed.");
    } finally {
      setIsLoading(false);
    }
  }

  const shouldShowPurchase =
    reels.length >= totalAllowed; // limit cross incl. extraSlots

  return (
    
    <div className="cr-page">
      <header className="cr-header">
        <div className="cr-brand">
          <span className="yt-dot" />
          <h1>Reels Studio</h1>
        </div>
        <div className="cr-tabs">
          <button
            className={`cr-tab ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => setActiveTab("upload")}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faPlus} /> Upload
          </button>
          <button
            className={`cr-tab ${activeTab === "myReels" ? "active" : ""}`}
            onClick={() => setActiveTab("myReels")}
            disabled={isLoading}
          >
            My Reels
          </button>
        </div>
      </header>

      {(error || success || deleteSuccessMessage) && (
        <div className="cr-flash-wrap">
          {error && <div className="cr-flash err fade-in">{error}</div>}
          {success && <div className="cr-flash ok fade-in">{success}</div>}
          {deleteSuccessMessage && (
            <div className="cr-flash ok fade-in">{deleteSuccessMessage}</div>
          )}
        </div>
      )}

      {activeTab === "upload" && (
        <section className="cr-upload-wrap slide-in">
          {shouldShowPurchase ? (
            <div className="cr-purchase-card pulse">
              <h2>Reel limit reached</h2>
              <p>
                You’ve used your free <b>{MAX_FREE}</b> uploads. Purchase extra
                slot for <b>₹{PRICE}</b> to continue.
              </p>
              <button
                className="cr-btn-buy"
                onClick={initiatePayment}
                disabled={isLoading}
              >
                {isLoading ? "Opening..." : `Purchase More Reels (₹${PRICE})`}
              </button>
              {paymentStatus?.status === "completed" && (
                <p className="cr-note">Payment verified. You can upload now!</p>
              )}
            </div>
          ) : (
            <form className="cr-form" onSubmit={handleSubmit}>
              <div className="cr-field">
                <label>Title</label>
                <input
                  className="cr-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add a catchy title"
                  required
                />
              </div>

              <div className="cr-field">
                <label>Description (optional)</label>
                <textarea
                  className="cr-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your reel"
                />
              </div>

              <div className="cr-drop" ref={dragRef}>
                <input
                  id="cr-file"
                  type="file"
                  accept="video/*"
                  onChange={onFileChange}
                />
                <label htmlFor="cr-file" className="cr-drop-inner">
                  <FontAwesomeIcon icon={faUpload} />
                  <span>Drag & drop your video here</span>
                  <small>or click to browse</small>
                </label>
              </div>

              {previewUrl && (
                <div className="cr-preview fade-in">
                  <video src={previewUrl} controls muted />
                </div>
              )}

              {uploadProgress > 0 && isLoading && (
                <div className="cr-progress">
                  <div
                    className="cr-progress-bar"
                    style={{ width: `${uploadProgress}%` }}
                  />
                  <span>{uploadProgress}%</span>
                </div>
              )}

              <div className="cr-actions">
                <button className="cr-btn primary" type="submit" disabled={isLoading}>
                  {isLoading ? "Uploading..." : "Upload Reels"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {activeTab === "myReels" && (
        <section className="cr-myreels slide-in">
          <h2 className="cr-section-title">My Reels</h2>
          {reelsError && <div className="cr-flash err">{reelsError}</div>}
          {!reelsError && reels.length === 0 && (
            <p className="cr-empty">No reels found yet.</p>
          )}

          <div className="cr-grid">
            {reels.map((reel) => (
              <div className="cr-card pop" key={reel.id}>
                <div className="cr-thumb">
                  <video src={reel.videoUrl} controls muted />
                </div>
                <div className="cr-meta">
                  <h3 className="cr-title" title={reel.title}>
                    {reel.title}
                  </h3>
                  <p className="cr-desc" title={reel.description}>
                    {reel.description}
                  </p>
                  <div className="cr-stats">
                    <span>
                      <FontAwesomeIcon icon={faEye} /> {analytics[reel.id]?.views || 0}
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faHeart} /> {analytics[reel.id]?.likes || 0}
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faShare} /> {analytics[reel.id]?.shares || 0}
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faComment} />{" "}
                      {analytics[reel.id]?.comments || 0}
                    </span>
                  </div>
                </div>
                <button
                  className="cr-btn danger"
                  onClick={() => handleDelete(reel.id)}
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default CreateReel;
