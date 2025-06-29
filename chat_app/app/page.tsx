"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<{ msg: string; id: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    const handleMessages = (msg: string, senderId: any) => {
      setMessages((prev) => [...prev, { msg: msg, id: senderId }]);
    };
    socket.on("chat message", handleMessages);
    return () => {
      socket.off("chat message", handleMessages);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-full bg-slate-800 rounded-xl flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="bg-slate-700 text-white p-4 text-sm flex justify-between">
          <span>Status: {isConnected ? "🟢 Online" : "🔴 Disconnected"}</span>
          <span>Transport: {transport}</span>
        </div>

        {/* Messages area (reversed order) */}
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col-reverse space-y-reverse space-y-2">
          <div ref={messagesEndRef} />
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.id === socket.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-[70%] shadow-md text-sm ${
                  message.id === socket.id
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                {message.msg}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input fixed at bottom */}
        <div className="bg-slate-700 p-4 border-t border-slate-600 flex items-center gap-2">
          <Input
            onChange={(e) => {
              setInputMessage(e.target.value);
            }}
            value={inputMessage}
            placeholder="Enter your message ..."
            className="flex-1 text-white bg-slate-600 border-none focus:outline-none focus:ring-0"
          />
          <Button
            onClick={() => {
              socket.emit("chat message", inputMessage);
              setInputMessage("");
            }}
            className="bg-green-500 hover:bg-green-600"
          >
            <SendIcon size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
