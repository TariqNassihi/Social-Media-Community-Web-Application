
import "./Home.css";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

import { AppContext } from "../../context/AppContext";


// used code from https://react-bootstrap.netlify.app/docs/components/accordion

const Home = () => {

  const {url} = useContext(AppContext);
  const [blogs, setBlogs] = useState([]); // Stores posts data
  const [populairPosts, setPopulairPosts] = useState([]); // Stores popular posts
  const [routing, setRouting] = useState(null); 
  const [map, setMap] = useState(null); // Map variabel
  const [startAddress, setStartAddress] = useState(""); // Start address for routing

  const navigate = useNavigate();

  // Function to format ISO dates into readable strings
  const formatDate = (isodate) => {
    const date = new Date(isodate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fetches posts data with locations 
  const handleBlogs = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/posts/post-with-locations"
      );
      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching posts with locations:", error);
    }
  };


  // Fetches popular posts 
  const handlePopularPosts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/posts/popular-posts"
      );
      setPopulairPosts(response.data);
    } catch (error) {
      console.error("Error fetching popular posts:", error);
    }
  };


  useEffect(() => {
    handleBlogs();
    handlePopularPosts();
  }, []);


  // Adds routing control to map instance
  useEffect(() => {
    if (map) {
      const control = L.Routing.control({}).addTo(map);
      setRouting(control);
    }
  }, [map]);




  // Geocodes address and sets waypoints for routing
  const geocodeAddress = async (address, blog) => {
    const apiKey = 'ad02d4071783442e8bde106c21af1d9c';
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        routing.setWaypoints([
          L.latLng(lat, lng),
          L.latLng(blog.location.lat, blog.location.lng),
        ])
      } else {
        alert("Adres niet gevonden. Probeer een ander adres.");
      }
    } catch (error) {
      console.error("Error tijdens geocoding:", error);
      alert("Er ging iets mis met het vinden van het adres.");
    }
  };



  return (
    <div className="container py-5">
      {/* Popular Posts Section */}
      <div className="popular-container mb-4">
        <h2 className="text-center mb-4">Popular Posts</h2>
        <div className="d-flex overflow-auto scroll">
          {populairPosts.slice(0,10).map((blog) => (
            <div
              className="card me-4 shadow-sm hover-card border"
              key={blog.id}
              style={{
                minWidth: "300px",
                flex: "0 0 auto",
                overflow: "hidden",
              }}
            >
              <div className="card-body">
                <img
                  src={blog.profile_img}
                  alt={`${blog.username}'s profile`}
                  className="rounded-circle me-2"
                  style={{ width: "30px", height: "30px", objectFit: "cover" }}
                />
                <span onClick={() => navigate(`/profile/${blog.user_id}`)} className="text-secondary fw-bold mb-4">
                  {blog.username}
                </span>
                <h5 className="card-title" style={{ color: "#2c3e50" }}>
                  {blog.title}
                </h5>
                <p className="card-text">{blog.content}</p>
                <Link to={`/blogs/${blog.id}`} className="read-more">
                  View post
                </Link>
                <span className="d-block text-muted small mb-2">
                  {formatDate(blog.created_at)}
                </span>
                <span
                  className="badge"
                  style={{ backgroundColor: "#34495e", color: "white" }}
                >
                  {blog.tags}
                </span>
              </div>
              {blog.image_url && (
                <img
                  src={blog.image_url}
                  alt={blog.title}
                  className="card-img-bottom"
                  style={{ height: "200px", objectFit: "cover", width: "100%" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Latest Posts Section */}
      <div className="latest-container mb-5">
        <h2 className="text-center mb-4">Latest Posts</h2>
        <div className="d-flex overflow-auto">
          {blogs.slice(0, 10).map((blog) => (
            <div
              className="card me-4 shadow-sm hover-card border"
              key={blog.id}
              style={{
                minWidth: "300px",
                flex: "0 0 auto",
                overflow: "hidden",
              }}
            >
              <div className="card-body">
                <img
                  src={blog.profile_img}
                  alt={`${blog.username}'s profile`}
                  className="rounded-circle me-2"
                  style={{ width: "30px", height: "30px", objectFit: "cover" }}
                />
                <span onClick={() => navigate(`/profile/${blog.user_id}`)} className="text-secondary fw-bold">{blog.username}</span>
                <h5 className="card-title" style={{ color: "#2c3e50" }}>
                  {blog.title}
                </h5>
                <p className="card-text">{blog.content}</p>
                <Link to={`/blogs/${blog.id}`} className="read-more">
                  View post
                </Link>
                <span className="d-block text-muted small mb-2">
                  {formatDate(blog.created_at)}
                </span>
                <span
                  className="badge"
                  style={{ backgroundColor: "#34495e", color: "white" }}
                >
                  {blog.tags}
                </span>
              </div>
              {blog.image_url && (
                <img
                  src={blog.image_url}
                  alt={blog.title || "Blog Post"}
                  className="card-img-bottom"
                  style={{ height: "200px", objectFit: "cover", width: "100%" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Map Section */}
      <div className="map-container mb-5">
        <h2 className="text-center mb-4">Explore the Map</h2>
        <MapContainer
          center={[50.8503, 4.3517]}
          zoom={12}
          style={{ height: "500px", borderRadius: "8px" }}
          scrollWheelZoom={false}
          ref={setMap}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {blogs.map((blog) =>
            blog.location ? (
              <Marker
                key={blog.id}
                position={[blog.location.lat, blog.location.lng]}
                icon={L.icon({
                  iconUrl: blog.profile_img,
                  popupAnchor: [0, -40],
                  className: "custom-marker",
                })}
              >
                <Popup>
                  <div style={{ textAlign: "center" }}>
                    <strong
                      style={{
                        fontSize: "16px",
                        display: "block",
                        marginBottom: "10px",
                      }}
                    >
                      {blog.title}
                    </strong>
                    {blog.content && (
                      <p style={{ fontSize: "14px", lineHeight: "1.5" }}>{blog.content}</p>
                    )}
                  {blog.image_url && (
                  <img
                    src={blog.image_url}
                    alt={blog.title || "No Image"}
                    className="card-img-bottom"
                    style={{ height: "200px", objectFit: "cover", width: "100%" }}
                  />
                )}
         <div className="input-group mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Enter start address"
            value={startAddress}
            onChange={(e) => setStartAddress(e.target.value)}
          />
           </div>
                    <button
                      className="btn btn-sm btn-primary mt-2"
                      onClick={() => geocodeAddress(startAddress,blog)}
                    >
                      Go There
                    </button>
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>

      <div className="hero-section text-center py-5 bg-light">
        <div className="hero-description">
          <h2> Discover, Share and Connect </h2>
          <p>
            Join a community of VUB students that value your input and are
            passionate about sharing knowledge, experiences and campus updates.
            <br />
            Start exploring or add your voice to the conversation.
          </p>
        </div>
        <button
          onClick={() => {
            navigate("/followedPosts/");
          }}
          className="btn btn-primary mt-3"
        >
          Explore Now
        </button>
      </div>
    </div>
  );
};

export default Home;
