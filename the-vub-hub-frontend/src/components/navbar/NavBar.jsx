import "./navBar.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import {toast } from "react-toastify";
import "react-toastify/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from "axios";


// used code from https://react-bootstrap.netlify.app/docs/components/accordion

const NavBar = () => {
 
  const navigate = useNavigate();
  const location = useLocation();
  const {userData,setUserData, setToken, url} = useContext(AppContext);
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  // Function to handle search functionality
  const handleSearch = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const zoek = e.target.value;
      if (!zoek) return;
      try {
        // Sending a search query to the backend API
        const response = await axios.get('http://localhost:8000/search',{params: {
          query: zoek
        }
        });
        const { users, threads, posts } = response.data.results;
        // Navigating to search results page with the found data
        navigate("/search-results", { state: { users, threads, posts } });
      } catch (error) {
        console.error("Search failed:", error);
        toast.error("An error occurred during the search.");
      }
    }
  };


  // Function to handle user logout
  const handleLogout = async () => {
    try {
        const res = await axios.post('http://localhost:8000/auth/logout'); 
        setDropdownOpen(false);
        setToken(false);
        // Clearing user data from session storage
        sessionStorage.removeItem('userData');
        setUserData(false);
        // Redirecting to home page after logout
        navigate("/");
    } catch (err) {
      toast.error("An error occurred while logging out.");
    }
  };




  return (
    <body>
      {/* Navigation bar setup */}
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          {/* site name and home link if clicked on the name */}
          <a className="navbar-brand site-name" href="/">
            The VUB Hub
          </a>
          {/* Responsive navbar */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {/* Navigation links */}
              <li className="nav-item">
                <a className="nav-link" href="/">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/Threads">
                  Threads
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/news">
                  News
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/FollowedPosts">
                  Posts
                </a>
              </li>
            </ul>
            {/* Search form */}
            <form className="d-flex mx-auto">
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search"
                onKeyDown={handleSearch}
              />
            </form>

            <div className="login">
               {/* if user is logged-in */}
              {userData ? (
                <div className="dropdown">
                  {/* User profile avatar */}
                  <img
                    src={userData.image_profile_url}
                    alt="User profile avatar"
                    className="avatar"
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                    style={{ cursor: "pointer" }}
                  />
                   {/* if dropdown is open (user clicked on his image profile) */}
                  {isDropdownOpen && (
                    <ul className="custom-dropdown">
                      {/* Dropdown menu items */}
                      <li onClick={() =>{ setDropdownOpen(!isDropdownOpen);
                         navigate("my-profile");}}>Profile</li>
                      <li onClick={() => { setDropdownOpen(!isDropdownOpen);
                       navigate("my-blogs")}}>My Posts</li>
                      <li onClick={() => { setDropdownOpen(!isDropdownOpen);
                        navigate("my-favourites")}}>
                        My Favourites
                      </li>
                      <li onClick={handleLogout}>Logout</li>
                    </ul>
                  )}
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/register")}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </body>
  );
};

export default NavBar;
