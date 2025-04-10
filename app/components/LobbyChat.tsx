"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/app/providers/SupabaseProvider";
import {
  fetchChatMessages,
  sendChatMessage,
  subscribeToChat,
} from "@/app/lib/supabaseHelpers";
import { FiSend, FiMessageSquare, FiX } from "react-icons/fi";

type ChatMessage = {
  id: string;
  lobby_code: string;
  player_id: string;
  player_name: string;
  message: string;
  created_at: string;
};

type LobbyChatProps = {
  lobbyCode: string;
  playerId: string;
  playerName: string;
};

export default function LobbyChat({
  lobbyCode,
  playerId,
  playerName,
}: LobbyChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { supabase } = useSupabase();

  // Fetch initial messages and subscribe to updates
  useEffect(() => {
    if (!lobbyCode) return;

    // Fetch existing messages
    const fetchMessages = async () => {
      const data = await fetchChatMessages(supabase, lobbyCode);
      if (data) {
        setMessages(data);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = subscribeToChat(supabase, lobbyCode, (newMessages) => {
      setMessages(newMessages);
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, lobbyCode, isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      // Reset unread count when opening chat
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const success = await sendChatMessage(
      supabase,
      lobbyCode,
      playerId,
      playerName,
      newMessage
    );

    if (success) {
      setNewMessage("");
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-10">
      {/* Chat toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className="bg-green-600 hover:bg-green-500 rounded-full p-3 shadow-lg flex items-center justify-center text-white"
      >
        <FiMessageSquare size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </motion.button>

      {/* Chat dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute bottom-14 right-0 w-80 sm:w-96 bg-secondary rounded-lg shadow-xl overflow-hidden"
          >
            {/* Chat header */}
            <div className="flex items-center justify-between bg-primary p-3 border-b border-gray-700">
              <h3 className="font-semibold text-white">Lobby Chat</h3>
              <button
                onClick={toggleChat}
                className="text-gray-400 hover:text-white"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Messages container */}
            <div className="h-72 overflow-y-auto p-3 bg-opacity-50 bg-gray-900">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-2 ${
                      msg.player_id === playerId ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block rounded-lg px-3 py-2 max-w-[85%] ${
                        msg.player_id === playerId
                          ? "bg-green-700 text-white"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {msg.player_id !== playerId && (
                        <div className="font-semibold text-green-300 text-sm mb-1">
                          {msg.player_name}
                        </div>
                      )}
                      <div className="text-sm">{msg.message}</div>
                      <div className="text-xs text-gray-300 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-gray-700"
            >
              <div className="flex p-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow bg-gray-700 text-white rounded-l-md px-3 py-2 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-500 text-white rounded-r-md px-3 flex items-center justify-center"
                >
                  <FiSend />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
