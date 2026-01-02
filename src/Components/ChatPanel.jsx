import React from "react";
import "./ChatPanel.css";

function ChatPanel() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex flex-1">

        {/* ===== LEFT SIDEBAR ===== */}
        <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search or start a new chat"
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
            />
          </div>

          {/* Chat list empty */}
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-medium text-gray-700">No chat rooms available</p>
            <p className="text-gray-500 text-sm mt-1 text-center">Start a conversation to see it here</p>
          </div>
        </div>

        {/* ===== RIGHT CHAT AREA ===== */}
        <div className="flex-1 bg-[#e5ddd5] flex items-center justify-center">
          <div className="text-center p-8">
           
           
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Select a chat room
            </h2>
            <p className="text-gray-500 text-lg">
              Choose a conversation from the left panel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;