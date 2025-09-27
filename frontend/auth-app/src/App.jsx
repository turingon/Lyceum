import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Settings from "./Settings";
import Library from "./Room";
import SignUp from "./Signup";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/room" element={<Library />} />
        <Route path="/register" element={<SignUp/>}/>
      </Routes>
    </Router>
  );
}

export default App;
