import { Routes, Route } from "react-router-dom";
import RoleSelection from "./RoleSelectScreen";
import ModeSelection from "./ModeSelection";
import ChatScreen from "./ChatScreen";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/mode" element={<ModeSelection />} />
      <Route path="/chat" element={<ChatScreen />} />
    </Routes>
  );
}
