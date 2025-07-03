import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function ProtectedPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [cases, setCases] = useState([]);

  const fetchRooms = async () => {
    const token = localStorage.getItem("token");
    const response = await api.get(
      `http://localhost:8000/books/get_rooms/${token}`,
    );
    setRooms(response.data);
  };

  const fetchCases = async () => {
    const token = localStorage.getItem("token");
    const response = await api.get(
      `http://localhost:8000/books/get_bookcases/${token}`,
    );
    setCases(response.data);
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `http://localhost:8000/auth/verify_token/${token}`,
        );

        if (!response.ok) {
          throw new Error("Token verification failed");
        }
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    verifyToken();
  }, [navigate]);

  useEffect(() => {
    fetchRooms();
    fetchCases();
  }, []);

  return (
    <div>
      <h1>Rooms</h1>
      <table className="rooms">
        <thead className="rooms-head">
          <tr>
            <th>Name</th>
            <th>Owner</th>
          </tr>
        </thead>
        <tbody className="rooms-body">
          {rooms.map((rooms) => (
            <tr key={rooms.id} className="rooms-datas">
              <td>{rooms.name}</td>
              <td>{rooms.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h1>Bookcases</h1>
      <table className="bookcases">
        <thead className="bookcase-head">
          <tr>
            <th>Name</th>
            <th>Room</th>
          </tr>
        </thead>
        <tbody className="bookcase-body">
          {cases.map((bookcase) => (
            <tr key={bookcase.id} className="bookcase-datas">
              <td>{bookcase.name}</td>
              <td>{bookcase.room}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProtectedPage;
