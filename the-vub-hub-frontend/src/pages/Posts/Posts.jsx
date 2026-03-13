
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Posts.css";

// used code from https://react-bootstrap.netlify.app/docs/components/accordion

const FollowedPost = () => {
  const navigate = useNavigate(); 
  const { userData } = useContext(AppContext); 

 
  const [posts, setPosts] = useState([]); // All posts
  const [Followedposts, setFollowedposts] = useState([]); // Followed posts
  const [filteredPosts, setFilteredPosts] = useState([]); // Posts after filtering
  const [filter, setFilter] = useState("all"); // Active filter
  const [populairPosts, setPopulairPosts] = useState([]); // Popular posts

  // Function to format ISO date to a readable format
  const formatDate = (isodate) => {
    const date = new Date(isodate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fetch data when the component mounts or userData changes
  useEffect(() => {
    // fetch followed posts
    const fetchFollowedPosts = async () => {
      try {
        const response = await axios.get("http://localhost:8000/posts/followed-posts");
        setFollowedposts(response.data.posts); // Set followed posts
      } catch (error) {
        console.error("Error fetching followed posts:", error);
      }
    };

    // fetch popular posts
    const handlePopularPosts = async () => {
      try {
        const response = await axios.get("http://localhost:8000/posts/popular-posts");
        setPopulairPosts(response.data); // Set popular posts
      } catch (error) {
        console.error("Error fetching popular posts:", error);
      }
    };

  //fetch all posts
    const handleBlogs = async () => {
      try {
        const response = await axios.get("http://localhost:8000/posts/post-with-locations");
        setPosts(response.data); // Set all posts
      } catch (error) {
        console.error("Error fetching posts with locations:", error);
      }
    };

    if (userData) {
      fetchFollowedPosts(); // Fetch followed posts if user data exists
    }
    handlePopularPosts(); // Fetch popular posts
    handleBlogs(); // Fetch all posts
  }, [userData]);

  // Apply filters whenever the filter or posts change
  useEffect(() => {
    let filtered = posts;
    if (filter === "popular") {
      filtered = populairPosts; // Show popular posts
    } else if (filter === "withImage") {
      filtered = posts.filter((post) => post.image_url); // Posts with images
    } else if (filter === "withTags") {
      filtered = posts.filter((post) => post.tags && post.tags.length > 0); // Posts with tags
    } else if (filter === "followed") {
      filtered = Followedposts; // Show followed posts
    }
    setFilteredPosts(filtered); // Update filtered posts
  }, [filter, posts]);

  return (
    <div className="container mt-5">
      <div className="row">
        {/* Sidebar Filters */}
        <div className="col-md-3 mb-4">
          <div className="list-group">
            {/* Filter buttons */}
            <button
              className={`list-group-item list-group-item-action ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Posts
            </button>
            <button
              className={`list-group-item list-group-item-action ${filter === "followed" ? "active" : ""}`}
              onClick={() => setFilter("followed")}
            >
              Followed Posts
            </button>
            <button
              className={`list-group-item list-group-item-action ${filter === "popular" ? "active" : ""}`}
              onClick={() => setFilter("popular")}
            >
              Popular Posts
            </button>
            <button
              className={`list-group-item list-group-item-action ${filter === "withImage" ? "active" : ""}`}
              onClick={() => setFilter("withImage")}
            >
              Posts with Images
            </button>
            <button
              className={`list-group-item list-group-item-action ${filter === "withTags" ? "active" : ""}`}
              onClick={() => setFilter("withTags")}
            >
              Posts with Tags
            </button>
          </div>
        </div>

        {/* Posts Content */}
        <div className="col-md-9">
          <div className="row">
            {filteredPosts.slice(0, 50).length === 0 ? (
              <p className="text-center">No posts to display.</p> // Message for no posts
            ) : (
              filteredPosts.map((post) => (
                <div className="col-md-6 mb-4" key={post.id}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-header d-flex align-items-center">
                      {/* User profile image */}
                      <img
                        src={post.profile_img}
                        className="rounded-circle me-2"
                        alt={post.username}
                        style={{ width: "40px", height: "40px" }}
                      />
                      <span onClick={() => navigate(`/profile/${post.user_id}`)} className="text-secondary fw-bold">
                        {post.username}
                      </span>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title mb-3">{post.title}</h5> {/* Post title */}
                      <p className="card-text flex-grow-1 mb-3">{post.content}</p> {/* Post content */}
                    </div>
                    <span
                      className="badge"
                      style={{ backgroundColor: "#34495e", color: "white" }}
                    >
                      {post.tags} {/* Post tags */}
                    </span>
                    <Link to={`/blogs/${post.id}`} className="read-more">
                      View post
                    </Link>
                    <span className="d-block text-muted small mb-2">
                      {formatDate(post.created_at)} {/* Post creation date */}
                    </span>
                    {post.image_url && (
                      <img
                        src={post.image_url} // Post image
                        className="img-fluid w-100"
                        alt={post.title}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowedPost;
