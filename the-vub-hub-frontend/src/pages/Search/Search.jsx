import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SearchResultsPage = () => {
  const location = useLocation(); 
  const navigate = useNavigate(); 
  const { users = [], threads = [], posts = [] } = location.state || {}; //  state for users, threads, and posts

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Search Results</h1>

      {/* Users Section */}
      <div className="mb-5">
        <h2>Users</h2> {/* Section for displaying user search results */}
        {users.length > 0 ? (
          <div className="row">
            {users.map((user, index) => (
              <div className="col-md-4 mb-3" key={index}>
                <div className="card">
                  <div className="card-body">
                    <img
                      src={user.image_profile_url} // Display user profile image
                      className="rounded-circle me-2"
                      style={{ width: "30px", height: "30px", objectFit: "cover" }}
                    />
                    <h5 className="card-title">{user.name}</h5> {/* User's name */}
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/profile/${user.id}`)} // Navigate to user's profile page
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No users found.</p>
        )}
      </div>

      {/* Threads Section */}
      <div className="mb-5">
        <h2>Threads</h2> {/* Section for displaying thread search results */}
        {threads.length > 0 ? (
          <div className="row">
            {threads.map((thread, index) => (
              <div className="col-md-6 mb-3" key={index}>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{thread.title}</h5> {/* Thread title */}
                    <p className="card-text">{thread.description}</p> {/* Thread description */}
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/threadDetail/${thread.id}`)} // Navigate to thread details page
                    >
                      View Thread
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No threads found.</p> 
        )}
      </div>
      
      {/* Posts Section */}
      <div className="mb-5">
        <h2>Posts</h2> {/* Section for displaying post search results */}
        {posts.length > 0 ? (
          <div className="row">
            {posts.map((post, index) => (
              <div className="col-md-6 mb-3" key={index}>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{post.title}</h5> {/* Post title */}
                    <p className="card-text">{post.content}</p> {/* Post content */}
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/blogs/${post.id}`)} // Navigate to post details page
                    >
                      View Post
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No posts found.</p> 
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
