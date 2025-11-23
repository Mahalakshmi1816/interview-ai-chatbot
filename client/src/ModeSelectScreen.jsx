export default function ModeSelectScreen({ role, onSelectMode }) {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-yellow-50 p-6">
      <h1 className="text-2xl font-bold mb-4 text-yellow-800">
        {role} Interview Preparation
      </h1>

      <p className="mb-6 text-gray-700 text-center">
        Do you want to learn and train with me first, or start the mock interview?
      </p>

      <div className="flex flex-col gap-4 w-64">
        <button
          className="bg-yellow-600 text-white py-2 rounded-lg"
          onClick={() => onSelectMode("training")}
        >
          Training Mode
        </button>

        <button
          className="bg-orange-600 text-white py-2 rounded-lg"
          onClick={() => onSelectMode("mock")}
        >
          Mock Interview
        </button>
      </div>
    </div>
  );
}
