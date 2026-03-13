import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import "./myFavourites.css";

const API_URL = "http://localhost:8000"; // Backend URL

const MyFavourites = () => {
  const [posts, setPosts] = useState([]); // State to store fetched posts
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [error, setError] = useState(null); // State to manage errors
  const { userData } = useContext(AppContext);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true); // Start loading
        const response = await axios.get(
          API_URL + `/posts/liked-posts/${userData.id}`
        );
        setPosts(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="posts-container">
      <h1 className="header">My Favorites</h1>
      {loading ? (
        <p className="loading">Loading your posts...</p>
      ) : error ? (
        <p className="error">Error fetching posts: {error}</p>
      ) : posts.length === 0 ? (
        <p className="no-posts">You have not liked any posts yet.</p>
      ) : (
        <ul className="posts-list">
          {posts.map((post) => (
            <li key={post.id} className="post-item">
              <img
                className="author-profile-pic"
                src={post.image_profile_url}
                alt={post.name}
              />
               <h2 className="post-name">{post.name}</h2>
              <h2 className="post-title">{post.title}</h2>
              <p className="post-content">
                {post.content.length > 100
                  ? `${post.content.substring(0, 100)}...`
                  : post.content}
              </p>
              <Link to={`/blogs/${post.id}`} className="read-more">
                Read More
              </Link>
              <span className="post-date">
                {/* Simulating a post date */}
                {new Date().toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyFavourites;
