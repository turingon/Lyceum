import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import ProtectedPage from "./Protected";
import Settings from "./Settings";
import Library from "./Room";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/protected" element={<ProtectedPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/room" element={<Library />} />
      </Routes>
    </Router>
  );
}

export default App;
