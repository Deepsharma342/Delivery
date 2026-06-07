import { NavLink } from "react-router-dom";

const BottomNav = () => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "70px",
        borderTop: "1px solid #ddd",
        background: "#fff",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      <NavLink
        to="/"
        style={({ isActive }) => ({
          color: isActive ? "blue" : "black",
          textDecoration: "none",
        })}
      >
        🏠 Home
      </NavLink>

      <NavLink
        to="/route"
        style={({ isActive }) => ({
          color: isActive ? "blue" : "black",
          textDecoration: "none",
        })}
      >
        🚚 Route
      </NavLink>

      <NavLink
        to="/stops"
        style={({ isActive }) => ({
          color: isActive ? "blue" : "black",
          textDecoration: "none",
        })}
      >
        📋 Stops
      </NavLink>

      <NavLink
        to="/settings"
        style={({ isActive }) => ({
          color: isActive ? "blue" : "black",
          textDecoration: "none",
        })}
      >
        ⚙️ Settings
      </NavLink>
    </div>
  );
};

export default BottomNav;