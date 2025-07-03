import { useEffect, useState } from "react";
import api from "./api";
import "./index.css";
import Sidebar from "./Sidebar";
import "./App.css";
import "./Room.css";
function Library() {
  const [bookcases, setBookcases] = useState([]);
  const [booksByBookcase, setBooksByBookcase] = useState({}); // key: bookcaseId
  const room = localStorage.getItem("current_room");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBookcases = async () => {
      try {
        const response = await api.get(
          `/books/get_bookcases/${token}/room/${room}`,
        );
        const bookcases = response.data;
        setBookcases(bookcases);

        // Fetch books for each bookcase
        for (const bookcase of bookcases) {
          const booksResponse = await api.get(
            `/books/get_books/${token}/room/${room}/case/${bookcase.id}`,
          );
          setBooksByBookcase((prev) => ({
            ...prev,
            [bookcase.id]: booksResponse.data,
          }));
        }
      } catch (error) {
        console.error("Error fetching bookcases/books:", error);
      }
    };

    fetchBookcases();
  }, []);
  const openPdf = (bookId) => {
    const encodedBookId = encodeURIComponent(bookId);
    const backendUrl = `http://localhost:8000/books/book/get_pdf/${bookId}`;
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
                  src={`data:image/png;base64,${book.image}`}
                  className="book-img"
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
