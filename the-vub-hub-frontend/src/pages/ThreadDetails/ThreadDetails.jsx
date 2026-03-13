import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import "./threadDetails.css";
import { AppContext } from "../../context/AppContext";
axios.defaults.withCredentials = true;

const API_URL = "http://localhost:8000"; // Backend URL

const ThreadDetailPage = () => {
  const { threadId } = useParams(); // Extract thread ID from URL
  const { userData } = useContext(AppContext);
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // post state
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newTag, setNewTag] = useState("");
  const [thread, setThread] = useState(null);

  // Thread state
  const [posts, setPosts] = useState([]);

  // Opens the form for creating a new thread
  const openForm = () => setIsFormOpen(true);

  // Closes the form after creating a new thread
  const closeForm = () => {
    setIsFormOpen(false);
    //setNewThreadTitle(""); // resetting form
  };

  // Retrieving the posts for a thread
  useEffect(() => {
    const fetchThreadDetails = async () => {
      try {
        const threadResponse = await axios.get(
          API_URL + `/threads/${threadId}`
        );
        const postsResponse = await axios.get(
          API_URL + `/posts/thread/${threadId}`
        );
        setThread(threadResponse.data);
        console.log(threadResponse.data);
        setPosts(postsResponse.data);
        console.log(postsResponse.data);
      } catch (error) {
        console.error("Error fetching thread details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreadDetails();
  }, [threadId]);

  // Posting a post
  const handleCreatePost = async (e) => {
    e.preventDefault();

    try {
      
      if (!userData) {
        alert("You must be logged in to create a thread.");
        return;
      }

      const response = await axios.post(API_URL + "/posts/", {
        title: newPostTitle,
        content: newPostContent,
        image: newImage,
        tags: newTag,
        //reading_time: null, // Is this necessary????
        threadId: threadId,
      });

      // Status of 201 indicates succession
      if (response.status === 201) {
        // Destructuring the response into variables
        const { postId, title, content, image, tags, authorId, threadId } =
          response.data;
      
        setPosts([
          ...posts,
          { id: postId, title, content, image, tags, authorId, threadId,author_name:userData.name, author_image: userData.image_profile_url},
        ]);
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


  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="thread-detail-page">
      {thread && (
        <>
          <header>
            {/* thread object is given in an array */}
            <h1>{thread[0].title}</h1>
            <button className="create-post-button" onClick={openForm}>
              Create post
            </button>
          </header>
          <div>
            <h2>Posts in this Thread</h2>
            <ul className="posts-list">
              {posts.map((post) => (
                <li key={post.id} className="post-item">
                  <img
                    className="author-profile-pic"
                    src={post.author_image}
                    alt={`${post.author_name}'s profile`}
                  />
                  <span onClick={() => navigate(`/profile/${post.user_id}`)} className="text-secondary fw-bold">{post.author_name}</span>
                  <h2 className="post-title">{post.title}</h2>
                  <p className="post-content">
                    {post.content.length > 100
                      ? `${post.body.substring(0, 100)}...`
                      : post.content}
                  </p>
                  <Link to={`/blogs/${post.id}`} className="read-more">
                    View post
                  </Link>
                  <span className="post-date">
                    Posted on: {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      {/* Form for creating a new thread */}
      {isFormOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>New Post</h2>
            <form onSubmit={handleCreatePost}>
              <input
                type="text"
                placeholder="Post title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
              />
              <textarea
                placeholder="Post content"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                required // Backend requires content
              />
              <input
                type="text"
                placeholder="tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <input
                type="text"
                placeholder="image URL"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
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

export default ThreadDetailPage;
