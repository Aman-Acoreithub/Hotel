import React, { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaPaperclip,
  FaMicrophone,
  FaArrowLeft,
  FaEllipsisV,
} from "react-icons/fa";

import { FaDotCircle } from "react-icons/fa";

const BASE_URL = 'https://api.nearprop.com';
const API_PREFIX = 'api';

const ChatPanel = () => {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState({}); // { roomId: [messages] }
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // { roomId: [{userId, userName}] }
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || null;
  const userName = JSON.parse(localStorage.getItem('user') || '{}')?.name || 'Me';

  const messagesEndRef = useRef(null);
  const hasFetchedMessages = useRef(new Set());
  const pendingMessages = useRef(new Set());
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Responsive handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages[activeRoom?.id] || []]);

  // Fetch chat rooms
  const fetchRooms = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/${API_PREFIX}/chat/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch rooms");
      const data = await response.json();

      const formatted = data.map((room) => ({
        id: room.id,
        name: room.buyer?.name || room.title || `Room ${room.id}`,
        avatar: room.buyer?.avatar || '/assets/default-avatar.png',
        propertyId: room.property?.id,
        district: room.property?.district || 'Unknown',
        thumbnail: room.property?.thumbnail || '/assets/default-property.png',
        lastMsg: room.lastMessage?.content || 'No messages yet',
        time: room.lastMessage?.createdAt ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        unread: room.unreadCount || 0,
      }));
      setRooms(formatted);

      // Restore last active room
      const lastId = localStorage.getItem('lastActiveRoomId');
      if (lastId) {
        const room = formatted.find(r => r.id === parseInt(lastId));
        if (room) setActiveRoom(room);
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for a room
  const fetchMessages = async (roomId) => {
    if (hasFetchedMessages.current.has(roomId)) return;
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/${API_PREFIX}/chat/rooms/${roomId}/messages?includeReplies=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();

      const formattedMsgs = data.map(msg => ({
        id: msg.id,
        content: msg.content,
        type: msg.mine ? 'me' : 'other',
        status: msg.status || 'SENT',
        sender: { id: msg.sender?.id, name: msg.sender?.name || 'Unknown' },
        createdAt: msg.createdAt,
      }));

      setMessages(prev => ({ ...prev, [roomId]: formattedMsgs }));
      hasFetchedMessages.current.add(roomId);

      // Mark unread as read
      data.forEach(msg => {
        if (!msg.mine && msg.status !== 'READ') {
          markMessageAsRead(msg.id, roomId);
        }
      });
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!inputText.trim() || !activeRoom || !token) return;

    const tempId = `temp-${Date.now()}`;
    pendingMessages.current.add(tempId);

    const optimisticMsg = {
      id: tempId,
      content: inputText,
      type: 'me',
      status: 'SENT',
      sender: { id: userId, name: userName },
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => ({
      ...prev,
      [activeRoom.id]: [...(prev[activeRoom.id] || []), optimisticMsg]
    }));

    try {
      const response = await fetch(`${BASE_URL}/${API_PREFIX}/chat/rooms/${activeRoom.id}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: inputText }),
      });
      if (!response.ok) throw new Error("Send failed");
      const newMsg = await response.json();

      setMessages(prev => ({
        ...prev,
        [activeRoom.id]: prev[activeRoom.id].map(m =>
          m.id === tempId
            ? { ...newMsg, type: 'me', status: newMsg.status || 'SENT' }
            : m
        )
      }));
    } catch (err) {
      console.error("Send error:", err);
      // Optionally show error state
    } finally {
      setInputText("");
      pendingMessages.current.delete(tempId);
    }
  };

  // Mark message as read
  const markMessageAsRead = async (messageId, roomId) => {
    try {
      await fetch(`${BASE_URL}/${API_PREFIX}/chat/messages/${messageId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'READ' }),
      });
      setMessages(prev => ({
        ...prev,
        [roomId]: prev[roomId]?.map(m => m.id === messageId ? { ...m, status: 'READ' } : m)
      }));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  // WebSocket Setup (Simple STOMP-like simulation via fetch fallback)
  useEffect(() => {
    if (!token || !activeRoom) return;

    // Clear previous fetch flag
    hasFetchedMessages.current.delete(activeRoom.id);
    fetchMessages(activeRoom.id);

    // Simple polling fallback for real-time (since full STOMP not implemented here)
    const interval = setInterval(() => {
      fetchRooms(); // Update last message & unread
      if (activeRoom) fetchMessages(activeRoom.id);
    }, 5000);

    setIsConnected(true);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [activeRoom, token]);

  // Initial load
  useEffect(() => {
    if (token) fetchRooms();
  }, [token]);

  // Typing handler
  const handleTyping = (e) => {
    setInputText(e.target.value);
    // Typing event can be added later with real WebSocket
  };

  const handleSelectChat = (room) => {
    setActiveRoom(room);
    localStorage.setItem('lastActiveRoomId', room.id);
  };

  const handleBack = () => {
    setActiveRoom(null);
    localStorage.removeItem('lastActiveRoomId');
  };

  const currentMessages = messages[activeRoom?.id] || [];
  const currentTyping = typingUsers[activeRoom?.id] || [];

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      
      <div className="flex h-screen bg-gray-100">
        <div className="flex flex-col md:flex-row w-full max-w-screen-xl mx-auto">
          {/* Sidebar - Chat List */}
          <div className={`${isMobile && activeRoom ? "hidden" : "flex"} ${!isMobile ? "w-96" : "w-full"} flex-col bg-white border-r border-gray-300 h-full`}>
            <div className="bg-[#0e7364] text-white p-4">
              <h1 className="text-xl font-semibold">Chats</h1>
            </div>

            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center bg-gray-200 rounded-lg px-4 py-2">
                <FaSearch className="text-gray-500 mr-3" />
                <input
                  type="text"
                  placeholder="Search chats"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent flex-1 outline-none text-gray-700"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading && rooms.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Loading chats...</div>
              ) : filteredRooms.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No chats found</div>
              ) : (
                filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => handleSelectChat(room)}
                    className={`flex items-center p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-200 ${activeRoom?.id === room.id ? "bg-gray-50" : ""}`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
                      <img src={room.thumbnail} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-gray-800">{room.name}</h3>
                        <span className="text-xs text-gray-500">{room.time || ''}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 truncate mr-2">{room.lastMsg}</p>
                        {room.unread > 0 && (
                          <div className="bg-[#0e7364] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {room.unread}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{room.district}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`${isMobile && !activeRoom ? "hidden" : "flex"} flex-1 flex-col bg-gray-50 h-full`}>
            {activeRoom ? (
              <>
                <div className="bg-[#0e7364] text-white p-4 flex items-center shadow-md">
                  <button onClick={handleBack} className="md:hidden mr-4">
                    <FaArrowLeft className="text-xl" />
                  </button>
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img src={activeRoom.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h2 className="font-semibold">{activeRoom.name}</h2>
                    <p className="text-sm opacity-80 flex items-center gap-2">
                      {activeRoom.district}
                      <span className="flex items-center gap-1">
                        {isConnected ? <FaDotCircle className="text-green-400" /> : null}
                        {isConnected ? "Online" : "Connecting..."}
                      </span>
                    </p>
                  </div>
                  <FaEllipsisV className="text-xl" />
                </div>

                <div
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                  style={{
                    backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-3172b1e2b1f7.png')",
                    backgroundSize: "cover",
                  }}
                >
                  {currentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                          msg.type === "me" ? "bg-[#0e7364] text-white" : "bg-white text-gray-800"
                        }`}
                      >
                        <p className="text-sm md:text-base">{msg.content}</p>
                        <p className={`text-xs mt-1 text-right ${msg.type === "me" ? "text-white/70" : "text-gray-500"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {msg.type === "me" && <span className="ml-2">{msg.status === 'READ' ? '✓✓' : '✓'}</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                  {currentTyping.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-white px-4 py-2 rounded-2xl text-sm text-gray-600 italic">
                        {currentTyping.map(u => u.userName).join(', ')} is typing...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="bg-white p-4 border-t border-gray-300">
                  <div className="flex items-center">
                    <FaPaperclip className="text-gray-500 text-xl mr-3 cursor-pointer" />
                    <input
                      type="text"
                      value={inputText}
                      onChange={handleTyping}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message"
                      className="flex-1 bg-gray-200 rounded-full px-5 py-3 outline-none text-gray-700"
                    />
                    <button
                      onClick={sendMessage}
                      className="ml-3 bg-[#0e7364] text-white px-6 py-3 rounded-full hover:bg-[#0d5f52] transition"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p className="text-xl">Select a chat to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPanel;