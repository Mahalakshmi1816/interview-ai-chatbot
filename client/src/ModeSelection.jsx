// client/src/ModeSelection.jsx
import { useLocation, useNavigate } from "react-router-dom";

export default function ModeSelection() {
  const location = useLocation();
  const navigate = useNavigate();

  const role = location.state?.role;

  if (!role) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-red-50 text-red-600">
        <h1 className="text-xl font-bold">❌ Error: No role selected.</h1>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Go Home
        </button>
      </div>
    );
  }

  const goToChat = (mode) => {
    navigate("/chat", { state: { role, mode } });
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-6">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 text-3xl font-bold text-blue-700 hover:text-blue-900 transition"
      >
        ←
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-6 text-blue-700 text-center">
        Choose Mode for <br />
        <span className="text-purple-700">{role}</span>
      </h1>

      <p className="mb-8 text-gray-600 text-center text-lg">
        Select how you want to practice:
      </p>

      {/* Buttons */}
      <div className="flex flex-col gap-4 w-72">
        <button
          className="bg-blue-600 text-white py-3 rounded-xl text-lg shadow-md hover:bg-blue-700 transition"
          onClick={() => goToChat("training")}
        >
          🎓 Training Mode
        </button>

        <button
          className="bg-purple-600 text-white py-3 rounded-xl text-lg shadow-md hover:bg-purple-700 transition"
          onClick={() => goToChat("mock")}
        >
          🎤 Mock Interview Mode
        </button>
      </div>
    </div>
  );
}
