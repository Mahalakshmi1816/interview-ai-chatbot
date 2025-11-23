// client/src/RoleSelectScreen.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSelectScreen() {
  const navigate = useNavigate();
  const [customRole, setCustomRole] = useState("");

  const goToMode = (role) => {
    navigate("/mode", { state: { role } });
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-blue-50 p-6">

      <h1 className="text-4xl font-bold mb-8 text-blue-700 tracking-wide">
        Interview Prep AI
      </h1>

      <p className="mb-6 text-gray-600 text-center text-lg">
        Choose a role or enter your own:
      </p>

      {/* Preset Roles */}
      <div className="flex flex-col gap-4 w-64 mb-10">
        <button
          className="bg-blue-600 text-white py-3 rounded-lg text-lg shadow hover:bg-blue-700 transition"
          onClick={() => goToMode("Sales Associate")}
        >
          Sales Associate
        </button>

        <button
          className="bg-green-600 text-white py-3 rounded-lg text-lg shadow hover:bg-green-700 transition"
          onClick={() => goToMode("Software Engineer")}
        >
          Software Engineer
        </button>

        <button
          className="bg-purple-600 text-white py-3 rounded-lg text-lg shadow hover:bg-purple-700 transition"
          onClick={() => goToMode("Retail Associate")}
        >
          Retail Associate
        </button>
      </div>

      {/* Custom Role Input */}
      <div className="flex flex-col items-center gap-3 w-72">
        <input
          type="text"
          className="border p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Enter any role…"
          value={customRole}
          onChange={(e) => setCustomRole(e.target.value)}
        />

        <button
          className={`py-3 w-full rounded-lg text-lg shadow 
            ${customRole.trim() 
              ? "bg-black text-white hover:bg-gray-800 transition"
              : "bg-gray-400 text-white cursor-not-allowed"}`}
          disabled={!customRole.trim()}
          onClick={() => goToMode(customRole)}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
