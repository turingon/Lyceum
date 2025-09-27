import { useEffect, useState } from "react";
import api from "./api";
import "./index.css";
import Sidebar from "./Sidebar";
import "./App.css";
import "./Room.css";
import { useNavigate } from "react-router-dom";

function Library() {
  const [bookcases, setBookcases] = useState([]);
  const [booksByBookcase, setBooksByBookcase] = useState({});
  const room = localStorage.getItem("current_room");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(
          `https://lyceumapi.turingon.tech/auth/verify_token/${token}`
        );
        if (!response.ok) {
          throw new Error("Token verification failed");
        }
      } catch (error) {
        console.log(error);
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    verifyToken();
  }, [navigate, token]);

  useEffect(() => {
    const fetchBookcasesAndBooks = async () => {
      try {
        const res = await api.get(`/books/get_bookcases/${token}/room/${room}`);
        const bookcases = res.data;
        setBookcases(bookcases);

        const booksById = {};
        await Promise.all(
          bookcases.map(async (bookcase) => {
            const booksResponse = await api.get(
              `/books/get_books/${token}/room/${room}/case/${bookcase.id}`
            );
            booksById[bookcase.id] = booksResponse.data;
          })
        );
        setBooksByBookcase(booksById);
      } catch (error) {
        console.error("Error fetching bookcases/books:", error);
      }
    };

    fetchBookcasesAndBooks();
  }, [room, token]);

  const openPdf = (bookId) => {
    const backendUrl = `https://lyceumapi.turingon.tech/books/book/get_pdf/${bookId}`;
    window.open(backendUrl, "_blank");
  };

  return (
    <div className="grid-container">
      <Sidebar />
      <div className="room">
        {bookcases.map((bookcase) => (
          <div key={bookcase.id} className="shelf">
            <h2 className="title-container title">{bookcase.name}</h2>
            {(booksByBookcase[bookcase.id] || []).map((book) => (
              <div key={book.id} className="book-container">
                <img
                  loading="lazy"
                  src={`data:image/png;base64,${book.image}`}
                  className="book-img"
                  alt={book.name}
                />
                <p className="top-left size">{book.status}</p>
                <button className="button" onClick={() => openPdf(book.id)}>
                  Read
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Library;
