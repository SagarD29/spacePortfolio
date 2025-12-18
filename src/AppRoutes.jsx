import { Routes, Route } from "react-router-dom";
import JourneyPage from "./journey/JourneyPage";
import Archive from "./routes/Archive";
import HomeGateway from "./routes/HomeGateway";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeGateway />} />
      <Route path="/journey" element={<JourneyPage />} />
      <Route path="/archive" element={<Archive />} />
    </Routes>
  );
}
