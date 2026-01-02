

import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope, faMessage, faPhoneVolume, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp, faFacebookF, faInstagram, faYoutube } from "@fortawesome/free-brands-svg-icons";
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import { FaWhatsapp } from 'react-icons/fa';

const API_CONFIG = {
  baseUrl: 'https://api.nearprop.com',
  apiPrefix: 'api',
  wsUrl: 'ws://13.126.35.188:8080/api/ws',
};

const FALLBACK_AD = [
  {
    id: 2,
    title: "Luxury Villas in Bangalore",
    description: "Exclusive gated community villas with private pools and smart home features",
    bannerImageUrl: "https://my-nearprop-bucket.s3.ap-south-1.amazonaws.com/advertisements/media/advertisements/admin/11_sachin-administrator/luxury-villas-in-bangalore/images/luxury-villas-in-bangalore-61ac950a-d959-4d44-a313-43c748b5b012.png",
    videoUrl: "https://my-nearprop-bucket.s3.ap-south-1.amazonaws.com/advertisements/media/advertisements/admin/11_sachin-administrator/luxury-villas-in-bangalore/videos/luxury-villas-in-bangalore-4e011d5e-6f39-4cc6-83da-8f0fb85b4a7f.mp4",
    websiteUrl: "https://tickvia.com/",
    whatsappNumber: "+917024520740",
    phoneNumber: "+917024510740",
    emailAddress: "sandeep.acoreithub@gmail.com",
    instagramUrl: "https://www.instagram.com/saim_7024?igsh=MXF6M2w5aXJ5Y3F4Zw==",
    facebookUrl: "https://www.facebook.com/profile.php?id=100085421884918",
    youtubeUrl: "https://youtu.be/upU0OcE658E?si=yZs8jnCXx5Qm8jpD",
    additionalInfo: "Book a visit today and get a complimentary interior design consultation!",
    targetLocation: "Indore",
    validUntil: "2025-08-01T13:20:23.487501",
    createdBy: { name: "Sachin Administrator" },
  },
];

let stompClient = null;
let currentSubscription = null;

const subscribeToRoom = (roomId, setMessages, setTypingUsers, setIsConnected) => {
  if (!stompClient || !stompClient.connected || !roomId) {
    console.warn('Cannot subscribe: WebSocket not connected or roomId missing', { roomId });
    return;
  }

  if (currentSubscription) {
    currentSubscription.unsubscribe();
    console.log(`Unsubscribed from previous room topic`);
  }

  currentSubscription = stompClient.subscribe(`/topic/chat/${roomId}`, (msg) => {
    try {
      const data = JSON.parse(msg.body);
      console.log('WebSocket message received:', data);
      const messageRoomId = data.chatRoomId || data.roomId || roomId;
      if (data.type === 'MESSAGE') {
        setMessages((prev) => ({
          ...prev,
          [messageRoomId]: [
            ...(prev[messageRoomId] || []),
            {
              ...data,
              type: data.mine ? 'outgoing' : 'incoming',
              status: data.status || 'SENT',
              createdAt: data.createdAt || new Date().toISOString(),
            },
          ],
        }));
        if (!data.mine) {
          const messageSound = new Audio('/message-notification.mp3');
          messageSound.play().catch((err) => console.error('Sound play error:', err));
        }
      } else if (data.type === 'TYPING' || data.type === 'STOP_TYPING') {
        setTypingUsers((prev) => {
          const users = prev[messageRoomId] || [];
          if (data.type === 'TYPING') {
            if (!users.some((user) => user.userId === data.userId)) {
              return { ...prev, [messageRoomId]: [...users, { userId: data.userId, userName: data.userName || `User ${data.userId}` }] };
            }
          } else {
            return { ...prev, [messageRoomId]: users.filter((user) => user.userId !== data.userId) };
          }
          return prev;
        });
      } else if (data.type === 'STATUS_UPDATE') {
        setMessages((prev) => {
          const messages = prev[messageRoomId] || [];
          const updatedMessages = messages.map((msg) =>
            msg.id === data.messageId ? { ...msg, status: data.status } : msg
          );
          return { ...prev, [messageRoomId]: updatedMessages };
        });
        if (data.status === 'READ') {
          setRooms((prev) => prev.map((room) => (room.id === messageRoomId ? { ...room, unreadCount: 0 } : room)));
        }
      }
    } catch (error) {
      console.error('❌ WebSocket parse error:', error);
    }
  });
  console.log(`Subscribed to /topic/chat/${roomId}`);
};

const initWebSocket = (token, roomId, setIsConnected, setMessages, setTypingUsers) => {
  if (stompClient && stompClient.connected) {
    if (roomId) {
      subscribeToRoom(roomId, setMessages, setTypingUsers, setIsConnected);
    }
    return;
  }

  stompClient = new Client({
    brokerURL: `${API_CONFIG.wsUrl}?token=${token}`,
    connectHeaders: { Authorization: `Bearer ${token}` },
    debug: (str) => console.log('[STOMP] ' + str),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      if (roomId) {
        subscribeToRoom(roomId, setMessages, setTypingUsers, setIsConnected);
      }
    },
    onStompError: (frame) => console.error('STOMP error:', frame.headers['message']),
    onWebSocketError: (evt) => console.error('WebSocket error:', evt),
    onDisconnect: () => {
      console.warn('🔌 WebSocket disconnected');
      setIsConnected(false);
      currentSubscription = null;
    },
  });

  stompClient.activate();
};

const sendMessageToSocket = ({ destination, body, headers }) => {
  if (stompClient && stompClient.connected) {
    console.log('Sending message:', { destination, body });
    stompClient.publish({ destination, body, headers });
  } else {
    console.warn('⚠️ WebSocket not ready');
  }
};

const sendTypingEvent = ({ destination, body, headers }) => {
  if (stompClient && stompClient.connected) {
    console.log('Sending typing event:', { destination, body });
    stompClient.publish({ destination, body, headers });
  }
};

const closeWebSocket = () => {
  if (stompClient) {
    if (currentSubscription) {
      currentSubscription.unsubscribe();
      currentSubscription = null;
    }
    stompClient.deactivate();
    stompClient = null;
    console.log('WebSocket closed');
  }
};

const Sidebar = ({ propertyId = "17", propertyTitle = "Property", owner = { name: "Michelle Ramirez", phone: "+919155105666", whatsapp: "+919155105666", avatar: "https://media.istockphoto.com/id/1399565382/photo/young-happy-mixed-race-businessman-standing-with-his-arms-crossed-working-alone-in-an-office.jpg" } }) => {
  const recommended = [
    {
      title: "3 BHK Apartment in Noida",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      price: "₹75 Lac",
      location: "Sector 150, Noida",
      propertyId: "noida-3bhk-001",
    },
    {
      title: "Luxury Villa in Gurgaon",
      img: "https://img.freepik.com/free-photo/3d-rendering-loft-luxury-living-room-with-bookshelf_105762-2182.jpg",
      price: "₹1.5 Cr",
      location: "Golf Course Road, Gurgaon",
      propertyId: "gurgaon-villa-002",
    },
    {
      title: "Studio Apartment in Mumbai",
      img: "https://img.freepik.com/premium-photo/swimming-pool-tropical-garden-villa_41487-790.jpg",
      price: "₹45 Lac",
      location: "Andheri West, Mumbai",
      propertyId: "mumbai-studio-003",
    },
    {
      title: "2 BHK in Bangalore",
      img: "https://img.freepik.com/premium-photo/luxury-modern-open-plan-living_1375194-39429.jpg",
      price: "₹65 Lac",
      location: "Whitefield, Bangalore",
      propertyId: "bangalore-2bhk-004",
    },
    {
      title: "1 BHK Budget Home",
      img: "https://img.freepik.com/premium-photo/house-future-is-designed-by-architect_1204564-4887.jpg",
      price: "₹25 Lac",
      location: "Pimpri, Pune",
      propertyId: "pune-1bhk-005",
    },
  ];

  const [activeTab, setActiveTab] = useState('tour');
  const [advertisements, setAdvertisements] = useState([]);
  const [adsLoading, setAdsLoading] = useState(true);
  const [adsError, setAdsError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [visitForm, setVisitForm] = useState({
    propertyId: propertyId || "17",
    scheduledTime: "",
    notes: "",
  });
  const [visits, setVisits] = useState([]);
  const [visitError, setVisitError] = useState(null);
  const [visitSuccess, setVisitSuccess] = useState(null);
  const [isFetchingVisits, setIsFetchingVisits] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);

  const token = localStorage.getItem('authData') ? JSON.parse(localStorage.getItem('authData')).token : null;
  const userId = localStorage.getItem('authData') ? JSON.parse(localStorage.getItem('authData')).userId : null;
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('authData') ? JSON.parse(localStorage.getItem('authData')).name : `User ${userId}`;
  const messagesEndRef = useRef(null);

const generateNextFiveDates = () => {
  const today = new Date();
  const options = { weekday: 'short', month: 'short' }; // e.g., Mon, Jul
  const nextFiveDates = [];

  for (let i = 0; i < 5; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);

    const day = futureDate.toLocaleDateString('en-US', { weekday: 'short' });
    const date = futureDate.getDate();
    const month = futureDate.toLocaleDateString('en-US', { month: 'short' });

    nextFiveDates.push({ day, date, month });
  }

  return nextFiveDates;
};

const dates = generateNextFiveDates();


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeRoom]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      let endpoint;
      if (userRole === 'DEVELOPER' && propertyId) {
        endpoint = `${API_CONFIG.baseUrl}/${API_CONFIG.apiPrefix}/chat/property/${propertyId}/rooms`;
      } else if (userRole === 'ADMIN') {
        endpoint = `${API_CONFIG.baseUrl}/${API_CONFIG.apiPrefix}/admin/chat/rooms`;
      } else {
        endpoint = `${API_CONFIG.baseUrl}/${API_CONFIG.apiPrefix}/chat/rooms`;
      }
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formattedRooms = response.data.map((room) => ({
        id: room.id,
        name: room.seller?.name || room.buyer?.name || room.title || `Room ${room.id}`,
        avatar: room.seller?.avatar || room.buyer?.avatar || owner?.avatar || '/assets/default-avatar.png',
        propertyId: room.property?.id,
        district: room.property?.district || 'Unknown',
        thumbnail: room.property?.thumbnail || '/assets/default-property.png',
        unreadCount: room.unreadCount || 0,
        title: room.title || 'Chat Room',
        lastMessage: room.lastMessage || null,
        owner: {
          name: room.seller?.name || owner?.name || 'Unknown',
          phone: room.seller?.phone || owner?.phone || 'N/A',
          whatsapp: room.seller?.whatsapp || owner?.whatsapp || 'N/A',
          avatar: room.seller?.avatar || owner?.avatar || '/assets/default-avatar.png',
        },
      }));
      setRooms(formattedRooms);

      const propertyRoom = formattedRooms.find((room) => room.propertyId === parseInt(propertyId));
      if (propertyRoom) {
        setActiveRoom(propertyRoom);
      }
    } catch (err) {
      console.error('Failed to fetch chat rooms:', err.message);
      setVisitError('Failed to fetch chat rooms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createChatRoom = async () => {
    if (!token) {
      setVisitError('User is not authenticated');
      return null;
    }

    try {
      const response = await axios.post(
        `${API_CONFIG.baseUrl}/${API_CONFIG.apiPrefix}/chat/rooms`,
        {
          propertyId: parseInt(propertyId),
          title: propertyTitle ? `Chat for ${propertyTitle}` : 'Interested in property',
          initialMessage: "Hello, I'm interested in this property. Can you provide more information?",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Chatroom Created:', response.data);
      const newRoom = {
        id: response.data.id,
        name: response.data.seller?.name || response.data.buyer?.name || owner?.name || response.data.title || `Room ${response.data.id}`,
        avatar: response.data.seller?.avatar || response.data.buyer?.avatar || owner?.avatar || '/assets/default-avatar.png',
        propertyId: response.data.property?.id,
        district: response.data.property?.district || 'Unknown',
        thumbnail: response.data.property?.thumbnail || '/assets/default-property.png',
        unreadCount: response.data.unreadCount || 0,
        title: response.data.title || 'Chat Room',
        lastMessage: room.lastMessage || null,
        owner: {
          name: response.data.seller?.name || owner?.name || 'Unknown',
          phone: response.data.seller?.phone || owner?.phone || 'N/A',
          whatsapp: response.data.seller?.whatsapp || owner?.whatsapp || 'N/A',
          avatar: response.data.seller?.avatar || owner?.avatar || '/assets/default-avatar.png',
        },
      };
      setRooms((prev) => [...prev, newRoom]);
      setActiveRoom(newRoom);
      return newRoom;
    } catch (err) {
      console.error('Error creating chatroom:', err);
      setVisitError(err.response?.data?.message || 'Failed to create chat room');
      return null;
    }
  };

  const fetchChatRoom = async (roomId) => {
    try {
      const response = await axios.get(
        `${API_CONFIG.baseUrl}/${API_CONFIG.apiPrefix}/chat/rooms/${roomId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const room = response.data;
      const formattedRoom = {
        id: room.id,
        name: room.seller?.name || room.buyer?.name || owner?.name || room.title || `Room ${room.id}`,
        avatar: room.seller?.avatar || room.buyer?.avatar || owner?.avatar || '/assets/default-avatar.png',
        propertyId: room.property?.id,
        district: room.property?.district || 'Unknown',
        thumbnail: room.property?.thumbnail || '/assets/default-property.png',
        unreadCount: room.unreadCount || 0,
        title: room.title || 'Chat Room',
        lastMessage: room.lastMessage || null,
        owner: {
          name: room.seller?.name || owner?.name || 'Unknown',
          phone: room.seller?.phone || owner?.phone || 'N/A',
          whatsapp: room.seller?.whatsapp || owner?.whatsapp || 'N/A',
          avatar: room.seller?.avatar || owner?.avatar || '/assets/default-avatar.png',
        },
      };
      setRooms((prev) => {
        const existingRoomIndex = prev.findIndex((r) => r.id === room.id);
        if (existingRoomIndex >= 0) {
          const updatedRooms = [...prev];
          updatedRooms[existingRoomIndex] = formattedRoom;
          return updatedRooms;
        }
        return [...prev, formattedRoom];
      });
      setActiveRoom(formattedRoom);
      return formattedRoom;
    } catch (err) {
      console.error('Error fetching chat room:', err);
      setVisitError('Failed to fetch chat room details. Please try again.');
      return null;
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      setIsLoading(true);
      setMessages((prev) => ({ ...prev, [roomId]: [] }));
      const response = await axios.get(
        `${API_CONFIG.baseUrl}/${API_CONFIG.apiPrefix}/chat/rooms/${roomId}/messages?page=0&size=50&includeReplies=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const messagesData = response.data.map((msg) => ({
        ...msg,
        type: msg.mine ? 'outgoing' : 'incoming',
        status: msg.status || 'SENT',
        createdAt: msg.createdAt || new Date().toISOString(),
      }));
      setMessages((prev) => ({ ...prev, [roomId]: messagesData }));
      messagesData.forEach((msg) => {
        if (!msg.mine && msg.status !== 'READ') {
          markMessageAsRead(msg.id, roomId);
        }
      });
    } catch (err) {
      console.error('Failed to fetch messages for room', roomId, ':', err.message);
      setVisitError('Failed to fetch messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !activeRoom) return;

    try {
      const response = await axios.post(
        `${API_CONFIG.baseUrl}/${API_CONFIG.apiPrefix}/chat/rooms/${activeRoom.id}/messages`,
        {
          content: inputText,
          parentMessageId: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const newMessage = response.data;
      sendMessageToSocket({
        destination: `/app/chat/${activeRoom.id}/send`,
        body: JSON.stringify({
          content: inputText,
          id: newMessage.id,
          chatRoomId: activeRoom.id,
          sender: { id: userId, name: userName },
          type: 'MESSAGE',
          status: 'SENT',
          createdAt: new Date().toISOString(),
        }),
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => ({
        ...prev,
        [activeRoom.id]: [
          ...(prev[activeRoom.id] || []),
          {
            ...newMessage,
            type: 'outgoing',
            status: newMessage.status || 'SENT',
            sender: { id: userId, name: userName || 'Me' },
            createdAt: newMessage.createdAt || new Date().toISOString(),
          },
        ],
      }));
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err.message);
      setVisitError('Failed to send message. Please try again.');
    }
  };

  const markMessageAsRead = async (messageId, roomId) => {
    try {
      await axios.patch(
        `${API_CONFIG.baseUrl}/${API_CONFIG.apiPrefix}/chat/messages/${messageId}/status`,
        { status: 'READ' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setMessages((prev) => {
        const messages = prev[roomId] || [];
        const updatedMessages = messages.map((msg) =>
          msg.id === messageId ? { ...msg, status: 'READ' } : msg
        );
        return { ...prev, [roomId]: updatedMessages };
      });
      setRooms((prev) => prev.map((room) => (room.id === roomId ? { ...room, unreadCount: 0 } : room)));
      fetchRooms();
    } catch (err) {
      console.error('Failed to mark message as READ:', err.message);
      setVisitError('Failed to mark message as read. Please try again.');
    }
  };

  const fetchAdvertisements = async () => {
    try {
      setAdsLoading(true);
      if (!token) {
        console.warn('No token found, using fallback advertisement data');
        setAdvertisements(FALLBACK_AD);
        setAdsLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_CONFIG.baseUrl}/api/v1/advertisements/district/Indore?page=0&size=10&sortBy=createdAt&direction=DESC`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setAdvertisements(response.data.content || FALLBACK_AD);
      setAdsLoading(false);
    } catch (err) {
      console.error('Ads fetch error:', err.message);
      setAdsError(err.message);
      setAdvertisements(FALLBACK_AD);
      setAdsLoading(false);
    }
  };

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    if (!token) {
      setVisitError('User is not authenticated');
      return;
    }

    try {
      const response = await axios.post(
        `${API_CONFIG.baseUrl}/${API_CONFIG.apiPrefix}/visits`,
        {
          propertyId: visitForm.propertyId,
          scheduledTime: visitForm.scheduledTime,
          notes: visitForm.notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setVisitSuccess('Visit scheduled successfully!');
      setVisitError(null);
      setVisitForm({ propertyId: visitForm.propertyId, scheduledTime: "", notes: "" });
      fetchVisits();
    } catch (err) {
      console.error('Error scheduling visit:', err);
      setVisitError(err.response?.data?.message || 'Failed to schedule visit');
      setVisitSuccess(null);
    }
  };

  // Generates the next 14 days from today
const generateUpcomingDates = (numDays = 14) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const today = new Date();
  const dateList = [];

  for (let i = 0; i < numDays; i++) {
    const current = new Date();
    current.setDate(today.getDate() + i);
    dateList.push({
      day: dayNames[current.getDay()],
      date: current.getDate(),
      month: monthNames[current.getMonth()],
      fullDate: current.toISOString().split('T')[0], // optional
    });
  }

  return dateList;
};


  const fetchVisits = async () => {
    if (!token) {
      setVisitError('User is not authenticated');
      return;
    }

    try {
      setIsFetchingVisits(true);
      const response = await axios.get(
        `${API_CONFIG.baseUrl}/${API_CONFIG.apiPrefix}/visits/my-visits?page=0&size=10&sortBy=scheduledTime&direction=ASC`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setVisits(response.data.content || []);
      setVisitError(null);
    } catch (err) {
      console.error('Error fetching visits:', err);
      setVisitError(err.response?.data?.message || 'Failed to fetch visits');
    } finally {
      setIsFetchingVisits(false);
    }
  };

  const handleTyping = (e) => {
    setInputText(e.target.value);
    if (activeRoom) {
      sendTypingEvent({
        destination: `/app/chat/${activeRoom.id}/typing`,
        body: JSON.stringify({
          type: 'TYPING',
          roomId: activeRoom.id,
          userId,
          userName: userName || `User ${userId}`,
        }),
        headers: { Authorization: `Bearer ${token}` },
      });
      if (typingTimeout) clearTimeout(typingTimeout);
      setTypingTimeout(
        setTimeout(() => {
          sendTypingEvent({
            destination: `/app/chat/${activeRoom.id}/typing`,
            body: JSON.stringify({
              type: 'STOP_TYPING',
              roomId: activeRoom.id,
              userId,
              userName: userName || `User ${userId}`,
            }),
            headers: { Authorization: `Bearer ${token}` },
          });
        }, 2000)
      );
    }
  };

  const handleSend = () => {
    sendMessage();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const toggleContact = () => {
    setShowContact(!showContact);
    setShowDetails(false);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
    setShowContact(false);
  };

  const toggleChatModal = async () => {
    if (!isChatOpen && token) {
      await fetchRooms();
      if (!rooms.find((room) => room.propertyId === parseInt(propertyId))) {
        const newRoom = await createChatRoom();
        if (newRoom) {
          await fetchChatRoom(newRoom.id);
          setIsChatOpen(true);
        }
      } else {
        setIsChatOpen(true);
      }
    } else {
      setIsChatOpen(false);
    }
  };

  const handlePrev = () => {
    setSelectedDateIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setSelectedDateIndex((prev) => (prev < dates.length - 3 ? prev + 1 : prev));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const formattedDate = `2025-07-${date.date < 10 ? '0' + date.date : date.date}T10:00:00`;
    setVisitForm({ ...visitForm, scheduledTime: formattedDate });
  };

  const formatIndianNumber = (number) => {
    if (!number) return '';

    const clean = number.toString().replace(/\D/g, '');
    if (!clean.startsWith('91') || clean.length < 12) return number;

    const country = '+91';
    const main = clean.slice(2);
    const part1 = main.slice(0, 5);
    const part2 = main.slice(5);

    return `${country} ${part1}-${part2}`;
  };

  useEffect(() => {
    if (token) {
      fetchRooms();
      fetchAdvertisements();
      fetchVisits();
    }
  }, [token, propertyId]);

  useEffect(() => {
    if (token && activeRoom) {
      initWebSocket(token, activeRoom.id, setIsConnected, setMessages, setTypingUsers);
      fetchMessages(activeRoom.id);
      localStorage.setItem('lastActiveRoomId', activeRoom.id);
    }
    return () => closeWebSocket();
  }, [activeRoom, token]);

  const ad = advertisements && advertisements.length > 0 ? advertisements[0] : null;

  return (
    <>
      <h4 className="tab-button-container mb-4">
        <button
          className={`long-tab-button ${activeTab === 'tour' ? 'active' : ''}`}
          onClick={() => setActiveTab('tour')}
        >
          Schedule a Tour
        </button>
        <button
          className={`long-tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          My Visits
        </button>
      </h4>
      <div className="sidebar-container">
        <div className="requestinfo-right-section">
          {activeTab === 'tour' && (
            <div className="requestinfo-tour-section">
              <div className="agent-info">
                <img
                  src={owner?.avatar || "https://media.istockphoto.com/id/1399565382/photo/young-happy-mixed-race-businessman-standing-with-his-arms-crossed-working-alone-in-an-office.jpg"}
                  alt={owner?.name || "Michelle Ramirez"}
                  className="agent-avatar"
                />
                <div>
                  <div className="agent-name">{owner?.name || "Michelle Ramirez"}</div>
                  
                </div>
              </div>

            <div className="requestinfo-date-selector">
                <div
                  className="Piobutton"
                  onClick={handlePrev}
                  aria-label="Previous dates"
                  disabled={selectedDateIndex === 0}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </div>
                <div className="requestinfo-date-container">
                  {dates.slice(selectedDateIndex, selectedDateIndex + 3).map((d, idx) => (
                    <div
                      className={`requestinfo-date-box ${selectedDate && selectedDate.date === d.date && selectedDate.month === d.month ? 'selected' : ''}`}
                      key={idx}
                      onClick={() => handleDateSelect(d)}
                      style={{ cursor: 'pointer' }}
                      role="button"
                      aria-label={`Select ${d.day} ${d.date} ${d.month}`}
                    >
                      <div><strong>{d.day}</strong></div>
                      <div>{d.date}</div>
                      <div>{d.month}</div>
                    </div>
                  ))}
                </div>
                <div
                  className="Piobutton"
                  onClick={handleNext}
                  aria-label="Next dates"
                  disabled={selectedDateIndex >= dates.length - 3}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </div>
              </div>

      <div className="requestinfo-tour-type">
  {/* Row 1: Send + Call buttons (smaller now) */}
  <div className="action-buttons-row">
    <button onClick={toggleChatModal} className="action-button send-button">
      <FontAwesomeIcon icon={faMessage} /> Send
    </button>
    <button
      onClick={() => window.location.href = `tel:${owner?.phone || 'N/A'}`}
      className="action-button call-button"
      disabled={owner?.phone === 'N/A'}
    >
      <FontAwesomeIcon icon={faPhoneVolume} /> Call
    </button>
  </div>

  {/* Row 2: WhatsApp button */}
  <div className="whatsapp-button-wrapper" >
     <button
                         className="small-button"
                         style={{ backgroundColor: 'green', color: 'white', border: 'none' }}
                         onClick={() => window.open('https://wa.me/+919155105666?text=Hello%20there!', '_blank')}
                       >
                         <FontAwesomeIcon icon={FaWhatsapp} className="me-1" />
                         Whatsapp
                       </button>
  </div>
</div>



              {isChatOpen && (
                <div className="chat-modal-overlay" onClick={toggleChatModal}>
                  <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="whatsapp-container">
                      {isLoading && <div className="loading">Loading...</div>}
                      <div
                        className={`chat-sidebar ${activeRoom && window.innerWidth <= 768 ? 'mobile-hidden' : ''}`}
                      >
                        <div className="search-bar">
                          <input type="text" placeholder="Search or start a new chat" />
                        </div>
                        <div className="chat-list">
                          {rooms.map((chat) => (
                            <div
                              className={`chat-item ${activeRoom?.id === chat.id ? 'active' : ''}`}
                              key={chat.id}
                              onClick={() => {
                                setActiveRoom(chat);
                                fetchChatRoom(chat.id);
                              }}
                            >
                              <div className="chat-avatar">
                                <img
                                  src={chat.owner.avatar}
                                  alt={chat.owner.name}
                                  title={`Property in ${chat.district}`}
                                  className="avatar-img"
                                />
                              </div>
                              <div className="chat-info">
                                <div className="chat-name">
                                  {chat.owner.name}
                                  <div className="district-name">{chat.district}</div>
                                </div>
                                <div className="chat-msg">
                                  {(messages[chat.id] || []).slice(-1)[0]?.content || chat.lastMessage?.content || 'No messages yet'}
                                </div>
                                {chat.unreadCount > 0 && (
                                  <span className="unread-count">{chat.unreadCount}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div
                        className={`chat-window ${!activeRoom && window.innerWidth <= 768 ? 'mobile-hidden' : ''}`}
                      >
                        {activeRoom ? (
                          <>
                            <div className="chat-header">
                              {window.innerWidth <= 768 && (
                                <button className="back-arrow" onClick={() => setActiveRoom(null)}>
                                  <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                              )}
                              <img src={activeRoom.owner.avatar} alt={activeRoom.owner.name} className="avatar-img" />
                              <div className="chat-header-info">
                                <span className="chat-header-name">{activeRoom.owner.name}</span>
                                <span className="chat-header-district">{activeRoom.district}</span>
                              </div>
                              <div className="chat-contact-options">
                                <a
                                  href={`tel:${activeRoom.owner.phone}`}
                                  className="chat-contact-btn"
                                  disabled={activeRoom.owner.phone === 'N/A'}
                                >
                                  <FontAwesomeIcon icon={faPhone} />
                                </a>
                                <a
                                  href={`https://wa.me/${activeRoom.owner.whatsapp}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="chat-contact-btn whatsapp"
                                  disabled={activeRoom.owner.whatsapp === 'N/A'}
                                >
                                  <FontAwesomeIcon icon={faWhatsapp} />
                                </a>
                              </div>
                              <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                                {isConnected ? '🟢 Online' : '🔴 Offline'}
                              </span>
                              <button className="chat-close" onClick={toggleChatModal}>×</button>
                            </div>
                            <div className="chat-messages">
                              {(messages[activeRoom.id] || []).map((msg, idx) => (
                                <div
                                  key={msg.id || idx}
                                  className={`message ${msg.type} ${msg.status === 'READ' ? 'read' : ''}`}
                                  onClick={() => !msg.mine && msg.status !== 'READ' && markMessageAsRead(msg.id, activeRoom.id)}
                                >
                                  <div className="message-content">{msg.content}</div>
                                  <div className="message-meta">
                                    <span className="timestamp">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {msg.type === 'outgoing' && (
                                      <span className={`message-status ${msg.status.toLowerCase()}`}>
                                        {msg.status === 'READ' ? '✓✓' : '✓'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                              <div ref={messagesEndRef} />
                              {typingUsers[activeRoom.id]?.length > 0 && (
                                <div className="typing-indicator">
                                  {typingUsers[activeRoom.id].map((user) => user.userName).join(', ')} is typing...
                                </div>
                              )}
                            </div>
                            <div className="chat-input">
                              <input
                                type="text"
                                placeholder="Type a message"
                                value={inputText}
                                onChange={handleTyping}
                                onKeyDown={handleKeyPress}
                                disabled={!isConnected || !activeRoom}
                              />
                              <button
                                className="me-3 mb-3 kuibutton1"
                                onClick={handleSend}
                                disabled={!isConnected || !activeRoom}
                              >
                                <FontAwesomeIcon icon={faMessage} className="me-3" size="xl" /> Send
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="chat-placeholder">Select a chat room or start a new one</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleScheduleVisit}>
                <div className="requestinfo-form-group">
                  <input
                    type="datetime-local"
                    value={visitForm.scheduledTime}
                    onChange={(e) => setVisitForm({ ...visitForm, scheduledTime: e.target.value })}
                    required
                  />
                </div>
                <div className="requestinfo-form-group">
                  <textarea
                    placeholder="Enter your notes (e.g., preferred time or additional requests)"
                    value={visitForm.notes}
                    onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                  />
                </div>
                <div className="requestinfo-terms">
                  <div className="d-inline-flex">
                    <input
                      type="checkbox"
                      id="gdpr"
                      style={{ width: '20px' }}
                      name="gdprConsent"
                      className="h-4 w-4 me-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="gdpr" className="ml-2 text-sm text-gray-600">
                      By submitting this form I agree to <a href="#">Terms of Use</a>
                    </label>
                  </div>
                </div>
                <button type="submit" className="requestinfo-submit-btn">Submit a Tour Request</button>
                {visitError && <p className="text-red-500 mt-2">{visitError}</p>}
                {visitSuccess && <p className="text-green-500 mt-2">{visitSuccess}</p>}
              </form>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="requestinfo-info-section">
              <button
                className="requestinfo-submit-btn"
                onClick={fetchVisits}
                disabled={isFetchingVisits}
              >
                {isFetchingVisits ? 'Loading...' : 'Refresh My Scheduled Visits'}
              </button>
              {isFetchingVisits && <div className="loading">Loading visits...</div>}
              {visits.length > 0 && (
                <div className="mt-4">
                  <h5>Scheduled Visits</h5>
                  {visits.map((visit) => (
                    <div key={visit.id} className="border p-3 mb-2 rounded">
                      <p><strong>Property:</strong> {visit.property.title}</p>
                      <p><strong>Scheduled Time:</strong> {new Date(visit.scheduledTime).toLocaleString()}</p>
                      <p><strong>Status:</strong> {visit.status}</p>
                      <p><strong>Notes:</strong> {visit.notes || 'None'}</p>
                    </div>
                  ))}
                </div>
              )}
              {visits.length === 0 && !isFetchingVisits && (
                <p className="mt-2">No scheduled visits found.</p>
              )}
            </div>
          )}
        </div>

        <div className="advertisements-container oppo">
          <h4 style={{ marginTop: '40px', marginBottom: '20px' }}>Advertisements</h4>
          {adsLoading ? (
            <div className="spinner text-center">Loading advertisements...</div>
          ) : adsError ? (
            <div className="error text-center">Error: {adsError}</div>
          ) : !ad ? (
            <div className="text-center">No advertisements available for Indore.</div>
          ) : (
            <div className="adlist-advertisement-list">
              <div className="adlist-advertisement-card">
                {ad.bannerImageUrl ? (
                  <img
                    src={ad.bannerImageUrl}
                    alt={ad.title}
                    className="ad-image"
                    onError={(e) => {
                      console.error('Image load error for:', ad.bannerImageUrl);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="ad-placeholder">No Image Available</div>
                )}
                <div className="ad-placeholder" style={{ display: 'none' }}>No Image Available</div>
                <div className="adlist-advertisement-content">
                  <h5 className="ad-title">{ad.title || 'Untitled Advertisement'}</h5>
                  <div className="ad-buttons">
                    <button onClick={toggleContact} className="ad-button">
                      Contact
                    </button>
                    <button onClick={toggleDetails} className="ad-button">
                      Details
                    </button>
                  </div>
                  {showContact && (
                    <div className="ad-contact-info">
                      {ad.phoneNumber && (
                        <a href={`tel:${ad.phoneNumber}`} className="ad-contact-link">
                          <FontAwesomeIcon icon={faPhone} /> {formatIndianNumber(ad.phoneNumber)}
                        </a>
                      )}
                      {ad.whatsappNumber && (
                        <a
                          href={`https://wa.me/${ad.whatsappNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ad-contact-link"
                        >
                          <FontAwesomeIcon icon={faWhatsapp} /> WhatsApp
                        </a>
                      )}
                      {ad.emailAddress && (
                        <a href={`mailto:${ad.emailAddress}`} className="ad-contact-link">
                          <FontAwesomeIcon icon={faEnvelope} /> {ad.emailAddress}
                        </a>
                      )}
                    </div>
                  )}
                  {showDetails && (
                    <div className="ad-details">
                      <p className="ad-description">{ad.description || 'No description provided.'}</p>
                      {ad.additionalInfo && (
                        <p className="ad-additional-info">{ad.additionalInfo}</p>
                      )}
                      <div className="ad-social-links">
                        {ad.facebookUrl && (
                          <a
                            href={ad.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ad-social-link"
                          >
                            <FontAwesomeIcon icon={faFacebookF} />
                          </a>
                        )}
                        {ad.instagramUrl && (
                          <a
                            href={ad.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ad-social-link"
                          >
                            <FontAwesomeIcon icon={faInstagram} />
                          </a>
                        )}
                        {ad.youtubeUrl && (
                          <a
                            href={ad.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ad-social-link"
                          >
                            <FontAwesomeIcon icon={faYoutube} />
                          </a>
                        )}
                      </div>
                      <div className="ad-meta">
                        <p>Location: {ad.targetLocation || 'Not specified'}</p>
                        <p>Valid Until: {ad.validUntil ? new Date(ad.validUntil).toLocaleDateString() : 'Not specified'}</p>
                        <p>Posted by: {ad.createdBy?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;