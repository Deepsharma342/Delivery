import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import RoutePage from "./pages/Route";
import Stops from "./pages/Stops";
import Settings from "./pages/Settings";

import BottomNav from "./components/BottomNav";

function App() {
  return (
    <BrowserRouter>
      <div style={{ paddingBottom: "80px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/route" element={<RoutePage />} />
          <Route path="/stops" element={<Stops />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>

        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;