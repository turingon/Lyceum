import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import api from "./api";
function SideNavBar({refreshKey}) {
  const [isExpanded, setExpendState] = useState(false);
  const [rooms, setRooms] = useState([]);
  const fetchCases = async () => {
    const token = localStorage.getItem("token");
    const rooms = await api.get(
      `http://localhost:8000/books/get_rooms/${token}`,
    );
    setRooms(rooms.data);
  };

  useEffect(() => {
    fetchCases();
  }, [refreshKey]);
  return (
    <div className="sidebar">
      <div
        className={
          isExpanded
            ? "side-nav-container sidebar"
            : "side-nav-container side-nav-container-NX sidebar"
        }
      >
        <div className="nav-upper">
          <div className="nav-heading">
            {isExpanded && (
              <div className="nav-brand">
                <a href="/">
                  {" "}
                  <img src="../../public/logo.png" />{" "}
                </a>
              </div>
            )}
            <button
              className={
                isExpanded
                  ? "hamburger hamburger-in"
                  : "hamburger hamburger-out"
              }
              onClick={() => setExpendState(!isExpanded)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
          <div className="nav-menu">
            <div className="menu-item-div">
              <a
                href="/settings"
                className={isExpanded ? "menu-item" : "menu-item menu-item-NX"}
              >
                {isExpanded && <p>Settings</p>}
              </a>
              {rooms.map((room) => (
                <a
                  key={room.id}
                  className={
                    isExpanded ? "menu-item" : "menu-item menu-item-NX"
                  }
                  onClick={() => {
                    localStorage.setItem("current_room", room.id);
                  }}
                  href="/room"
                >
                  {isExpanded && <p>{room.name}</p>}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideNavBar;
