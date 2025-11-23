// client/src/ChatScreen.jsx
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EvaluationCard from "./components/EvaluationCard";

export default function ChatScreen() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Extract role + mode safely
  const role = state?.role || null;
  const mode = state?.mode || null;

  // -------------------------------
  // Hooks MUST be here at the top
  // -------------------------------

  const [messages, setMessages] = useState(() => {
    if (state?.mode === "training") {
      return [
        {
          sender: "bot",
          text: `Great! Let's begin your training for **${state.role}**.\n\nI'll guide you step by step. Type "next" whenever you're ready.`,
        },
      ];
    }
    if (state?.mode === "mock") {
      return [
        {
          sender: "bot",
          text: `Welcome to your mock interview for **${state.role}**!\n\nFirst question: Tell me about yourself.`,
        },
      ];
    }
    return [];
  });

  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [evaluation, setEvaluation] = useState(null);

  const endRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, suggestions, evaluation]);

  // Helper to handle backend response
  async function handleBackendResponse(res) {
    const data = await res.json();

    if (data.sessionId) setSessionId(data.sessionId);
    if (data.reply)
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);

    if (data.suggestions) setSuggestions(data.suggestions);

    if (data.evaluation) setEvaluation(data.evaluation);

    return data;
  }

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:4000/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: userMsg,
          role,
          mode,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await handleBackendResponse(res);
      setIsTyping(false);

      if (data.evaluation) {
        setTimeout(
          () =>
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            }),
          150
        );
      }
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Server error: Failed to fetch" },
      ]);
    }
  };

  const sendSuggestion = async (text) => {
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setSuggestions([]);
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:4000/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text, role, mode }),
      });

      await handleBackendResponse(res);
      setIsTyping(false);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Server error: Failed to fetch" },
      ]);
    }
  };

  // ---------------------------------------------------
  // SAFELY handle missing role/mode AFTER hooks
  // ---------------------------------------------------

  if (!role || !mode) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-bold text-red-600">
          ❌ Error: Role or Mode missing.
        </h1>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Go to Home
        </button>
      </div>
    );
  }

  // ---------------------------------------------------
  // MAIN UI
  // ---------------------------------------------------

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-100">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 text-xl font-bold shadow-md flex items-center gap-4">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-white text-2xl font-bold hover:text-gray-200"
        >
          ←
        </button>

        {role} — {mode === "training" ? "Training Mode" : "Mock Interview"}
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[75%] rounded-2xl p-3 shadow-md whitespace-pre-line ${
              msg.sender === "user"
                ? "bg-blue-500 text-white ml-auto rounded-br-none"
                : "bg-white text-gray-900 rounded-bl-none"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {isTyping && (
          <div className="max-w-[75%] p-3 bg-white text-gray-600 rounded-2xl shadow-md animate-pulse">
            AI is typing…
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* SUGGESTIONS */}
      {suggestions.length > 0 && (
        <div className="p-4 flex flex-wrap gap-2">
          {suggestions.map((btn, idx) => (
            <button
              key={idx}
              onClick={() => sendSuggestion(btn)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full shadow hover:bg-blue-200 transition"
            >
              {btn}
            </button>
          ))}
        </div>
      )}

      {/* INPUT BAR */}
      <div className="p-4 bg-white flex gap-2 border-t shadow-inner">
        <input
          className="flex-1 border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow-md hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>

      {/* EVALUATION CARD */}
      {evaluation && (
        <EvaluationCard
          evaluation={evaluation}
          onClose={() => setEvaluation(null)}
        />
      )}
    </div>
  );
}
