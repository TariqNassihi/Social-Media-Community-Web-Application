
import "./news.css";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
axios.defaults.withCredentials = true; // Enable credentials for API requests
import 'bootstrap/dist/css/bootstrap.min.css';
import { AppContext } from "../../context/AppContext";


// used code from https://react-bootstrap.netlify.app/docs/components/accordion

const NewsTab = () => {
  
  const [newsData, setNewsData] = useState([]); // News articles data
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [comments, setComments] = useState({}); // Comments for articles
  const [newComments, setNewComments] = useState({}); // New comments being typed
  const {userData} = useContext(AppContext); 

  // Fetch news articles 
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get("http://localhost:8000/news");
        setNewsData(response.data); // Set the fetched news data
        setLoading(false); // Set loading to false after data is fetched
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("An error occurred while fetching the news."); 
        setLoading(false); 
      }
    };
    fetchNews();
  }, []);

  // Function to fetch comments for a specific article
  const fetchComments = async (articleId) => {
    try {
      const response = await axios.get(`http://localhost:8000/comments/article/${articleId}`);
      setComments((prevComments) => ({ 
        ...prevComments,             // Keep previous comments
        [articleId]: response.data, // Add new comments for this article
      }));
    } catch (err) {
      if (err.response?.status === 404) { 
        alert("No comments found for this article.");
        setComments((prevComments) => ({
          ...prevComments,
          [articleId]: [], // Set empty array if no comments are found
        }));
      } else {
        console.error(`Error fetching comments for article ${articleId}:`, err);
      }
    }
  };

  // Function to handle adding a comment to an article
  const handleAddComment = async (articleId) => {

    if (!userData || !userData.id) {
      alert("You need to be logged in to add a comment.");
      return;
    }

    const content = newComments[articleId]; // Get the new comment content
    if (!content || content.trim() === "") { // Validate the comment
      alert("Comment cannot be empty!");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8000/comments/article/${articleId}`, {
        user: userData.id, 
        content, 
      });

      setComments((prevComments) => ({ 
        ...prevComments, // Keep existing comments
        [articleId]: [
          ...(prevComments[articleId] || []), // Append to existing comments
          { 
            content: response.data.content, // Content of the new comment
            user_id: userData.id, // User ID of the commenter
            user_name: userData.name, // User name of the commenter
            image_profile: userData.image_profile_url, // User profile image
          },
        ],
      }));

      setNewComments((prevNewComments) => ({
        ...prevNewComments, // Keep other article comments unchanged
        [articleId]: "", // Clear the input for this article
      }));
    } catch (err) {
      console.error(`Error adding comment to article ${articleId}:`, err);
    }
  };


  if (loading) {
    return <div className="text-center">Loading...</div>;
  }


  if (error) {
    return <div className="text-center text-danger">{error}</div>;
  }

  return (
    <div className="container my-4">
      <div className="row">
        {newsData.map((article) => (
          <div key={article.id} className="col-md-4 mb-4">
            <div className="card h-100 custom-card">
              <img
                src={article.urlToImage} // Article image
                alt={article.title} // Alt text for the image
                className="card-img-top"
                style={{ height: "150px", objectFit: "cover" }} // Image styling
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{article.title}</h5> {/* Article title */}
                <p className="card-text">{article.description}</p> {/* Article description */}
                <a
                  href={article.url} // Link to the full article
                  target="_blank" // Open in a new tab
                  rel="noopener noreferrer"
                  className="btn btn-link text-primary p-0 mt-auto"
                  style={{ fontSize: "0.6rem" }}
                >
                  Read more
                </a>
              </div>
              <div className="card-footer bg-white">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => fetchComments(article.id)} // Fetch comments on click
                >
                  View comments
                </button>
                {comments[article.id] && comments[article.id].length > 0 && (
                  <ul className="list-unstyled mt-2">
                    {comments[article.id].map((comment, idx) => (
                      <li key={idx} className="border-bottom py-2 d-flex align-items-center">
                        <img
                          src={comment.image_profile} // Commenter's profile image
                          alt={comment.user_name} // Alt text for profile image to username
                          className="rounded-circle me-2"
                          style={{ width: "30px", height: "30px" }}
                        />
                        <div>
                          <p className="mb-0 fw-bold">
                            {comment.user_name}: {/* Commenter's name */}
                          </p>
                          <p className="mb-0">{comment.content}</p> {/* Comment content */}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {comments[article.id] && (
                  <textarea
                    className="form-control form-control-sm mt-2"
                    rows="2"
                    value={newComments[article.id] || ""} // Input value
                    onChange={(e) =>
                      setNewComments((prevNewComments) => ({
                        ...prevNewComments, // Keep other article inputs unchanged
                        [article.id]: e.target.value, // Update input for this article
                      }))
                    }
                    placeholder="Write a comment"
                  />
                )}
                {comments[article.id] && (
                  <button
                    className="btn btn-primary btn-sm mt-2"
                    onClick={() => handleAddComment(article.id)} // Add comment on click
                  >
                    Add comment
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsTab;
