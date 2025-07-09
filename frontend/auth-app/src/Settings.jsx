import React, { useEffect, useState } from "react";
import "./Settings.css";
import api from "./api";
import SideNavBar from "./Sidebar";
function Rooms({ refreshKey, triggerRefresh }) {
  const [rooms, setRooms] = useState([]);

  const fetchRooms = async () => {
    const token = localStorage.getItem("token");
    const response = await api.get(`/books/get_rooms/${token}`);
    setRooms(response.data);
  };

  useEffect(() => {
    fetchRooms();
  }, [refreshKey]);

  const handleDelete = (id) => async (event) => {
    await api.delete(`/books/room/${id}`);
    fetchRooms();
    triggerRefresh();
  };

  return (
    <div>
      <h1>Rooms</h1>
      <table className="rooms">
        <thead className="rooms-head">
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody className="rooms-body">
          {rooms.map((room) => (
            <tr key={room.id} className="rooms-datas">
              <td>{room.name}</td>
              <td className="actions">
                <button
                  onClick={handleDelete(room.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Bookcases({ refreshKey }) {
  const [cases, setCases] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState("room");

  const handleChange = async (e) => {
    const value = e.target.value;
    await setSelected(value);
    await fetchCases(value);
  };
  const fetchCases = async (selected) => {
    const token = localStorage.getItem("token");
    const response = await api.get(
      `/books/get_bookcases/${token}/room/${selected}`,
    );
    setCases(response.data);
    const rooms = await api.get(`/books/get_rooms/${token}`);
    setRooms(rooms.data);
  };
  const handleDelete = (id) => async (event) => {
    await api.delete(`/books/bookcase/${id}`);
    fetchCases(selected);
  };

  useEffect(() => {
    fetchCases(selected);
  }, [refreshKey]);
  return (
    <div>
      <select value={selected} onChange={handleChange}>
        <option value="room">Select your Room </option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>{" "}
      <h1>Bookcases</h1>
      <table className="bookcases">
        <thead className="bookcase-head">
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody className="bookcase-body">
          {cases.map((bookcase) => (
            <tr key={bookcase.id} className="bookcase-datas">
              <td>{bookcase.name}</td>
              <td className="actions">
                <button
                  onClick={handleDelete(bookcase.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Book({ refreshKey }) {
  const [book, setBooks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookcases, setBookcases] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("room");
  const [selectedCase, setSelectedCase] = useState("case");
  const token = localStorage.getItem("token");

  const handleChangeRoom = async (e) => {
    const value = e.target.value;
    setSelectedRoom(value);
    await fetchBooks(value, "case");
  };

  const handleChangeCase = async (e) => {
    const value = e.target.value;
    setSelectedCase(value);
    fetchBooks(selectedRoom, value);
  };
  const fetchBooks = async (selectedRoom, selectedCase) => {
    const token = localStorage.getItem("token");
    const response = await api.get(
      `/books/get_books/${token}/room/${selectedRoom}/case/${selectedCase}`,
    );
    setBooks(response.data);
    const rooms = await api.get(`/books/get_rooms/${token}`);
    setRooms(rooms.data);
    const cases = await api.get(
      `/books/get_bookcases/${token}/room/${selectedRoom}`,
    );

    setBookcases(cases.data);
  };

  useEffect(() => {
    fetchBooks(selectedRoom, selectedCase);
  }, [refreshKey]);

  const handleDelete = (id) => async (event) => {
    await api.delete(`/books/book/${id}`);
    fetchBooks(selectedRoom, selectedCase);
  };

  return (
    <div>
      <select value={selectedRoom} onChange={handleChangeRoom}>
        <option value="room">Select your Room </option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>{" "}
      <select value={selectedCase} onChange={handleChangeCase}>
        <option value="case">Select your Bookcase</option>
        {bookcases.map((bookcase) => (
          <option key={bookcase.id} value={bookcase.id}>
            {bookcase.name}
          </option>
        ))}
      </select>{" "}
      <h1>Books</h1>
      <table className="bookcases">
        <thead className="bookcase-head">
          <tr>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody className="bookcase-body">
          {book.map((book) => (
            <tr key={book.id} className="bookcase-datas">
              <td>{book.name}</td>
              <td>{book.status}</td>
              <td className="actions">
                <button
                  onClick={handleDelete(book.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AddRoom({ triggerRefresh }) {
  const [formData, setFormData] = useState({
    name: "",
  });

  const handleInputChange = (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      [event.target.name]: value,
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    await api.post(`/books/add_room/${token}`, formData);
    setFormData({
      name: "",
    });
    triggerRefresh();
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Add Room</h1>
      <form className="form" onSubmit={handleFormSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            onChange={handleInputChange}
            value={formData.name}
          />
        </div>
        <div className="buttons">
          <button className="submit" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

function AddBookcase({ triggerRefresh }) {
  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState("room");
  const [formData, setFormData] = useState({
    name: "",
    room_id: selected,
  });
  const handleChange = async (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      room_id: value,
    });
    await setSelected(value);
  };
  const fetchCases = async () => {
    const token = localStorage.getItem("token");
    const rooms = await api.get(`/books/get_rooms/${token}`);
    setRooms(rooms.data);
  };

  useEffect(() => {
    triggerRefresh();
    fetchCases();
  }, []);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      [event.target.name]: value,
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (selected == "room") {
      alert("Please choose a room");
    } else {
      const token = localStorage.getItem("token");
      await api.post(`/books/add_bookcase/${token}`, formData);
      setFormData({
        name: "",
        room_id: selected,
      });
      triggerRefresh();
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Add Bookcase</h1>
      <form className="form" onSubmit={handleFormSubmit}>
        <div>
          <select value={selected} onChange={handleChange}>
            <option value="room">Select your Room </option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>{" "}
        </div>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            onChange={handleInputChange}
            value={formData.name}
          />
        </div>
        <div className="buttons">
          <button className="submit" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

function AddBook({ triggerRefresh }) {
  const [rooms, setRooms] = useState([]);
  const [bookcases, setBookcases] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("room");
  const [selectedBookcase, setSelectedBookcase] = useState("case");
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [formFields, setFormFields] = useState({
    room_id: selectedRoom,
    bookcase_id: selectedBookcase,
    name: "",
    status: "",
  });

  const handleChangeRoom = async (e) => {
    const value = e.target.value;

    setFormFields({
      ...formFields,
      room_id: value,
    });

    setSelectedRoom(value);
    await fetchBooks(value, "case");
  };

  const handleChangeCase = async (e) => {
    const value = e.target.value;
    setFormFields({
      ...formFields,
      bookcase_id: value,
    });

    setSelectedBookcase(value);
    fetchBooks(selectedRoom, value);
  };
  const fetchBooks = async (selectedRoom, setSelectedBookcase) => {
    const token = localStorage.getItem("token");
    const rooms = await api.get(`/books/get_rooms/${token}`);
    setRooms(rooms.data);
    const bookcases = await api.get(
      `/books/get_bookcases/${token}/room/${selectedRoom}`,
    );

    setBookcases(bookcases.data);
  };

  useEffect(() => {
    fetchBooks(selectedRoom, selectedBookcase);
  }, []);

  const handleInputChange = (e) => {
    setFormFields((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handlePdfChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile || !pdfFile) {
      alert("Please select both an image file and a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("pdf", pdfFile);
    formData.append("id", formFields.id);
    formData.append("room_id", formFields.room_id);
    formData.append("bookcase_id", formFields.bookcase_id);
    formData.append("name", formFields.name);
    formData.append("status", formFields.status);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:8000/books/add_book/${token}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert("Upload failed: " + (errorData.detail || response.statusText));
        return;
      }

      const data = await response.json();
      alert("Upload successful! Book ID: " + data.book_id);
    } catch (error) {
      alert("An error occurred: " + error.message);
    }

    triggerRefresh();
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Add Book</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div>
          <select value={selectedRoom} onChange={handleChangeRoom}>
            <option value="room">Select your Room </option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>{" "}
          <select value={selectedBookcase} onChange={handleChangeCase}>
            <option value="case">Select your Bookcase</option>
            {bookcases.map((bookcase) => (
              <option key={bookcase.id} value={bookcase.id}>
                {bookcase.name}
              </option>
            ))}
          </select>{" "}
        </div>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formFields.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="status"
          placeholder="Status"
          value={formFields.status}
          onChange={handleInputChange}
          required
        />
        <label>
          Select Image:
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </label>
        <label>
          Select PDF:
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePdfChange}
            required
          />
        </label>
        <button className="submit" type="submit">
          Upload Book
        </button>{" "}
      </form>
    </div>
  );
}

function UpdateRoom({ triggerRefresh, refreshKey }) {
  const [formData, setFormData] = useState({
    name: "",
  });
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(-1);
  const handleInputChange = (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      [event.target.name]: value,
    });
  };

  const handleChange = async (e) => {
    const value = e.target.value;
    setRoom(value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    await api.put(`/books/room/${room}`, formData);
    setFormData({
      name: "",
    });
    triggerRefresh();
  };

  const fetchCases = async () => {
    const token = localStorage.getItem("token");
    const rooms = await api.get(`/books/get_rooms/${token}`);
    setRooms(rooms.data);
  };

  useEffect(() => {
    fetchCases();
  }, [refreshKey]);

  return (
    <div className="form-container">
      <h1 className="form-title">Update Room</h1>
      <form className="form" onSubmit={handleFormSubmit}>
        <div>
          <select onChange={handleChange}>
            <option value="room">Select your Room </option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>{" "}
        </div>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            onChange={handleInputChange}
            value={formData.name}
          />
        </div>
        <div className="buttons">
          <button className="submit" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

function UpdateBookcase({ triggerRefresh, refreshKey }) {
  const [rooms, setRooms] = useState([]);
  const [bookcases, setBookcases] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("room");
  const [selectedBookcase, setSelectedBookcase] = useState("case");
  const [formData, setFormData] = useState({
    name: "",
  });

  const token = localStorage.getItem("token");

  const handleChangeRoom = async (e) => {
    const value = e.target.value;
    setSelectedRoom(value);
    await fetchBooks(value, "case");
  };

  const handleChangeCase = async (e) => {
    const value = e.target.value;
    setSelectedBookcase(value);
    fetchBooks(selectedRoom, value);
  };
  const fetchBooks = async (selectedRoom, setSelectedBookcase) => {
    const token = localStorage.getItem("token");
    const rooms = await api.get(`/books/get_rooms/${token}`);
    setRooms(rooms.data);
    const bookcases = await api.get(
      `/books/get_bookcases/${token}/room/${selectedRoom}`,
    );

    setBookcases(bookcases.data);
  };

  useEffect(() => {
    fetchBooks(selectedRoom, selectedBookcase);
  }, [refreshKey]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      [event.target.name]: value,
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    await api.put(`/books/bookcase/${selectedBookcase}`, formData);

    setFormData({
      name: "",
    });
    triggerRefresh();
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Update Bookcase</h1>
      <form className="form" onSubmit={handleFormSubmit}>
        <div>
          <select value={selectedRoom} onChange={handleChangeRoom}>
            <option value="room">Select your Room </option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>{" "}
          <select value={selectedBookcase} onChange={handleChangeCase}>
            <option value="case">Select your Bookcase</option>
            {bookcases.map((bookcase) => (
              <option key={bookcase.id} value={bookcase.id}>
                {bookcase.name}
              </option>
            ))}
          </select>{" "}
        </div>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            onChange={handleInputChange}
            value={formData.name}
          />
        </div>
        <div className="buttons">
          <button className="submit" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

function UpdateBook({ triggerRefresh, refreshKey }) {
  const [rooms, setRooms] = useState([]);
  const [bookcases, setBookcases] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("room");
  const [selectedBookcase, setSelectedBookcase] = useState("case");
  const [selectedBook, setSelectedBook] = useState("book");
  const [formData, setFormData] = useState({
    name: "",
    status: "",
  });

  const handleChangeRoom = async (e) => {
    const value = e.target.value;
    setSelectedRoom(value);
    await fetchBooks(value, "case");
  };

  const handleChangeCase = async (e) => {
    const value = e.target.value;
    setSelectedBookcase(value);
    fetchBooks(selectedRoom, value);
  };

  const handleChangeBook = async (e) => {
    const value = e.target.value;
    setSelectedBook(value);
    fetchBooks(selectedRoom, selectedBookcase, value);
  };

  const fetchBooks = async (selectedRoom, selectedBookcase, selectedBook) => {
    const token = localStorage.getItem("token");

    const rooms = await api.get(`/books/get_rooms/${token}`);
    setRooms(rooms.data);

    const bookcases = await api.get(
      `/books/get_bookcases/${token}/room/${selectedRoom}`,
    );
    setBookcases(bookcases.data);

    const books = await api.get(
      `/books/get_books/${token}/room/${selectedRoom}/case/${selectedBookcase}`,
    );

    setBooks(books.data);
  };

  useEffect(() => {
    fetchBooks(selectedRoom, selectedBookcase, selectedBook);
  }, [refreshKey]);

  const handleChange = (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      [event.target.name]: value,
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    await api.put(`/books/book/${selectedBook}`, formData);
    setFormData({
      name: "",
      status: "",
    });
    triggerRefresh();
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Update Book</h1>
      <form className="form" onSubmit={handleFormSubmit}>
        <div>
          <select value={selectedRoom} onChange={handleChangeRoom}>
            <option value="room">Select your Room </option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>{" "}
          <select value={selectedBookcase} onChange={handleChangeCase}>
            <option value="case">Select your Bookcase</option>
            {bookcases.map((bookcase) => (
              <option key={bookcase.id} value={bookcase.id}>
                {bookcase.name}
              </option>
            ))}
          </select>{" "}
          <select value={selectedBook} onChange={handleChangeBook}>
            <option value="book">Select your Book</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.name}
              </option>
            ))}
          </select>{" "}
        </div>
        <input
          type="text"
          name="name"
          placeholder="Book Name"
          onChange={handleChange}
          value={formData.name}
          required
        />
        <input
          type="text"
          name="status"
          placeholder="Status"
          onChange={handleChange}
          value={formData.status}
          required
        />
        <button type="submit" className="submit">
          Upload Book
        </button>{" "}
      </form>
    </div>
  );
}

function Settings() {
  const [component, setComponent] = useState("room");
  const [method, setMethod] = useState("add_room");

  // Refresh logic
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const renderType = () => {
    if (component === "room")
      return <Rooms refreshKey={refreshKey} triggerRefresh={triggerRefresh} />;
    if (component === "bookcase") return <Bookcases refreshKey={refreshKey} />;
    if (component === "book") return <Book refreshKey={refreshKey} />;
    return null;
  };

  const renderMethod = () => {
    if (method === "add_room")
      return <AddRoom triggerRefresh={triggerRefresh} />;
    if (method === "add_bookcase")
      return <AddBookcase triggerRefresh={triggerRefresh} />;
    if (method === "add_book")
      return <AddBook triggerRefresh={triggerRefresh} />;
    if (method === "update_room")
      return (
        <UpdateRoom triggerRefresh={triggerRefresh} refreshKey={refreshKey} />
      );
    if (method === "update_bookcase")
      return (
        <UpdateBookcase
          triggerRefresh={triggerRefresh}
          refreshKey={refreshKey}
        />
      );
    if (method === "update_book")
      return (
        <UpdateBook triggerRefresh={triggerRefresh} refreshKey={refreshKey} />
      );
    return null;
  };

  return (
    <div className="grid-container">
      <SideNavBar refreshKey={refreshKey} />
      <div className="room">
        <div className="button-container">
          <div className="type-buttons">
            <button
              onClick={() => {
                setComponent("room");
                setMethod("add_room");
              }}
            >
              Rooms
            </button>
            <button
              onClick={() => {
                setComponent("bookcase");
                setMethod("add_bookcase");
              }}
            >
              Bookcases
            </button>
            <button
              onClick={() => {
                setComponent("book");
                setMethod("add_book");
              }}
            >
              Books
            </button>
          </div>
          <div className="method-buttons">
            <button onClick={() => setMethod("add_" + component)}>Add</button>
            <button onClick={() => setMethod("update_" + component)}>
              Update
            </button>
          </div>
        </div>
        <div className="main-container">
          <div className="type-container">{renderType()}</div>
          <div className="method-container">{renderMethod()}</div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
