import { useContext, useState } from "react";
import "./write.css";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const WritePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { url } = useContext(AppContext);

  const handleSubmit = async () => {
    const response = await axios.post(url + 'posts/');
    const data = await response.data;


    if (title.trim() === "" || content.trim() === "") {
      alert("Please fill out both the title and content!");
      return;
    }

    // Prepare data for submission by creating an object representing the new post
    // This is for the moment tailered to the JSONPlaceholder which expects these fields
    const newPost = {
      title,
      body: content,
      userId: 1,
    };

    try {
      // Sending the data
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost), //Contains the data that is send as a serialized JSON string
      });

      // Handle respons
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Succes handling
      const responseData = await response.json();
      console.log("Post submitted successfully:", responseData);
      alert("Post submitted successfully!");
      // Clear form when post is successfully submitted
      setTitle("");
      setContent("");
      //Error handling
    } catch (error) {
      console.error("Error submitting post:", error);
      alert("Failed to submit post. Please try again.");
    }
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    console.log("Post creation canceled.");
  };

  return (
    <div className="write-container">
      <h2 className="header">Create a blog</h2>
      <div className="inputContainer">
        <label htmlFor="post-title" className="label">
          Title
        </label>
        <input
          id="post-title"
          type="text"
          placeholder="Enter your post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
      </div>
      <div className="inputContainer">
        <label htmlFor="post-content" className="label">
          Content
        </label>
        <textarea
          id="post-content"
          placeholder="Write your post content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="textarea"
        />
      </div>
      <div className="buttonContainer">
        <button onClick={handleSubmit} className="submitButton">
          Post
        </button>
        <button onClick={handleCancel} className="cancelButton">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WritePage;
