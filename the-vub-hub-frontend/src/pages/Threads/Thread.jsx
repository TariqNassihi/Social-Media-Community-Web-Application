import { useState, useEffect } from "react";
import axios from "axios";
import "./thread.css";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:8000"; // Backend URL

// Threads also need to be able to be deleted but only by the creator

const initialState = {
  titel: "",
};

const ThreadPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false); // Management of the forum where a user creates a new thread
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [threads, setThreads] = useState([]);
  const [state, setState] = useState(initialState); // State of the form

  // Opens the form for creating a new thread
  const openForm = () => setIsFormOpen(true);

  // Closes the form after creating a new thread
  const closeForm = () => {
    setIsFormOpen(false);
    setNewThreadTitle(""); // resetting form
  };

  // fetching threads
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await axios.get(API_URL + "/threads/");
        setThreads(response.data); // Update the state with the fetched threads
      } catch (error) {
        console.error("Error fetching threads:", error);
        alert("Er ging iets mis bij het ophalen van de threads.");
      }
    };

    fetchThreads();
  }, []); // Empty dependency array means this runs only once when the component mounts

  // When changing a field in the form
  const handleChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  // Sending a new thread
  const handleCreateThread = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(API_URL + "/threads/", {
        title: newThreadTitle,
      });
      if (response.status === 201) {
        const { threadId, title } = response.data;
        setThreads([...threads, { id: threadId, title }]);
        closeForm(); // close form after creating thread
      }
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.error || "Er ging iets mis");
      } else {
        console.error("Fout bij het maken van de thread:", error);
        alert("Er ging iets mis bij het verbinden met de server.");
      }
    }
  };

  return (
    <div className="thread-page">
      <header className="thread-header">
        <h1>Thread Summary</h1>
        <button className="create-thread-button" onClick={openForm}>
          Create thread
        </button>
      </header>

      <main className="thread-list">
        <h2>Existing Threads</h2>
        <ul>
          {threads.map((thread) => {
            return (
              <li key={thread.id} className="thread-item">
                <h3>{thread.title}</h3>
                <Link to={`/threadDetail/${thread.id}`}>
                  <button className="view-thread-button">View Thread</button>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>

      {/* Form for creating a new thread */}
      {isFormOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>New Thread</h2>
            <form onSubmit={handleCreateThread}>
              <input
                type="text"
                placeholder="Thread title"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                required
              />
              <div className="modal-actions">
                <button type="submit">Create</button>
                <button type="button" onClick={closeForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadPage;
