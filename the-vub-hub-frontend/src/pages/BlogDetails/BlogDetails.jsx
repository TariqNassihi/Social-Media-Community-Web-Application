import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa";
import { SlDislike, SlLike } from "react-icons/sl";
import { MdEmail } from "react-icons/md";
import "./blogDetails.css";

const API_URL = "http://localhost:8000"; // Backend URL

const BlogDetails = () => {
  // UseParams is used for extracting postId from URL
  const { blogId } = useParams();

  const { userData } = useContext(AppContext);
  const navigate = useNavigate();

  // State initialization
  const [post, setPost] = useState([]);
  const [author, setAuthor] = useState([]);
  const [commentAuthor, setCommentAuthor] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [commentLikes, setCommentLikes] = useState(0);
  const [commentDislikes, setCommentDislikes] = useState(0);
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true); // tracks wether data is still being fetched
  const [error, setError] = useState(null); // Holds any error messages if the data fetching fails.

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newTag, setNewTag] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [editFlag, setEditFlag] = useState(false);

  // Idea? Pagination for comments, fetching comments incrementally
  // Fetching post details (post, comments, likes/dislikes)
  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const postResponse = await axios.get(
          `${API_URL}/posts/postId/${blogId}`
        );
        setPost(postResponse.data);

        const userResponse = await axios.get(
          `${API_URL}/user/${postResponse.data.authorId}`
        );
        setAuthor(userResponse.data);

        const commentsResponse = await axios.get(
          `${API_URL}/comments/${blogId}`
        );
        setComments(commentsResponse.data);
        const likesResponse = await axios.get(
          API_URL + `/react/count/${blogId}`
        );
        setLikes(likesResponse.data.likes);
        const dislikesResponse = await axios.get(
          API_URL + `/react/count/${blogId}`
        );
        setDislikes(dislikesResponse.data.dislikes);

        // fetch reaction-count for each comment
        const reactionsPromises = commentsResponse.data.map((comment) =>
          axios
            .get(`${API_URL}/react/comments/reaction-count/${comment.id}`)
            .then((res) => ({
              commentId: comment.id,
              likes: res.data.likes,
              dislikes: res.data.dislikes,
            }))
        );

        const reactionsData = await Promise.all(reactionsPromises);
        // Map reactions to comment IDs
        const reactionsMap = {};
        reactionsData.forEach((reaction) => {
          reactionsMap[reaction.commentId] = {
            likes: reaction.likes,
            dislikes: reaction.dislikes,
          };
        });
        setReactions(reactionsMap);
      } catch (err) {
        console.error("Error fetching post details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetails();
  }, [blogId, editFlag, reactions]); // Dependancy array, useEffect will only run when postId changes, thus it won't run for every rendering which isn't performant. [] empty means that it will only run one time.

  // share function
  const postUrl = `${window.location.origin}/blogs/${blogId}`;
  const postTitle = encodeURIComponent(post.title);

  // Adding a new comment
  const handleAddComment = async () => {
    // validation of input
    if (!newComment.trim()) {
      alert("Comment cannot be empty.");
      return;
    }
    try {
      // send data to backend
      const response = await axios.post(`${API_URL}/comments/post/${blogId}`, {
        content: newComment,
      });
      // update comment section and setting input field for next comment
      setComments([...comments, response.data]);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // Removing a comment
  const handleRemoveComment = async (commentId) => {
    try {
      //console.log(commentId);
      await axios.delete(`${API_URL}/comments/${blogId}/${commentId}`);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.commentId !== commentId)
      );
    } catch (err) {
      console.error("Error removing comment:", err);
      alert("Failed to remove comment. Please try again.");
    }
  };

  // handling of likes
  const handleLike = async () => {
    try {
      // Check if the user has already reacted
      const reactionResponse = await axios.get(
        `${API_URL}/react/reaction/${blogId}`
      );

      if (reactionResponse.data.reaction === "like") {
        // User has already liked the post, so remove the like
        await axios.delete(`${API_URL}/react/${blogId}`); // remove like
        setLikes((prev) => prev - 1); // Decrement likes count locally
      } else if (reactionResponse.data.reaction === "dislike") {
        // User has disliked, so add a like and decrement dislikes
        await axios.post(`${API_URL}/react/like/${blogId}`); // add like
        setLikes((prev) => prev + 1); // Increment likes count locally
        setDislikes((prev) => prev - 1); // Decrement dislikes count locally
      } else {
        // There isn't an existing reaction (user has not liked or disliked)
        await axios.post(`${API_URL}/react/like/${blogId}`); // add like
        setLikes((prev) => prev + 1); // Increment likes count locally
      }
    } catch (err) {
      if (err.response?.status == 404) {
        // Handle case where is no reaction found in database
        console.log("No reaction found, proceeding with adding like.");
        await axios.post(`${API_URL}/react/like/${blogId}`);
        setLikes((prev) => prev + 1);
      } else {
        console.error("Error toggling like:", err);
      }
    }
  };

  // handling of dislikes
  const handleDislike = async () => {
    try {
      // Check if the user has already reacted
      const reactionResponse = await axios.get(
        `${API_URL}/react/reaction/${blogId}`
      );

      if (reactionResponse.data.reaction === "dislike") {
        // User has already disliked the post, so remove the dislike (decrement)
        await axios.delete(`${API_URL}/react/${blogId}`); // remove dislike
        setDislikes((prev) => prev - 1); // Decrement dislikes count locally
      } else if (reactionResponse.data.reaction === "like") {
        // User has liked, so add a dislike and decrement likes
        await axios.post(`${API_URL}/react/dislike/${blogId}`); // add dislike
        setDislikes((prev) => prev + 1); // Increment dislikes count locally
        setLikes((prev) => prev - 1); // Decrement likes count locally
      } else {
        // There isn't an existing reaction (user has not liked or disliked)
        await axios.post(`${API_URL}/react/dislike/${blogId}`); // add dislike
        setDislikes((prev) => prev + 1); // Increment dislikes count locally
      }
    } catch (err) {
      if (err.response?.status == 404) {
        // Handle case when no reaction found in database
        console.log("No reaction found, proceeding with adding like.");
        await axios.post(`${API_URL}/react/dislike/${blogId}`);
        setDislikes((prev) => prev + 1);
      } else {
        console.error("Error toggling like:", err);
      }
    }
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_URL}/posts/${blogId}`, {
        title: newTitle,
        content: newContent,
        image_url: newImage,
        tags: newTag,
      });
      if (response.status === 200) {
        // Close mform and change editFlag to refresh post so that it shows the change
        setEditingPost(null);
        if (editFlag) {
          setEditFlag(false);
        } else setEditFlag(true);
      }
    } catch (err) {
      console.error("Error editing post:", err);
    }
  };

  const handleDeletePost = async (e) => {
    try {
      const response = await axios.delete(`${API_URL}/posts/${e}`);
      navigate("/Threads");
    } catch (err) {
      console.error("Error removing post:", err);
      alert("Failed to remove post. Please try again.");
    }
  };

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (error) {
    return <div className="error">Error fetching post: {error}</div>;
  }

  const handleReact = async (commentId, reactionType) => {
    if (!commentId) {
      console.error("Comment ID is undefined.");
      return;
    }

    try {
      const reactionResponse = await axios.get(
        `${API_URL}/react/comments/reaction/${commentId}`
      );

      // If already reacted with the same type, remove the reaction
      if (reactionResponse.data.reaction === reactionType) {
        await axios.delete(`${API_URL}/react/comments/reaction/${commentId}`);
        setReactions((prevReactions) => ({
          ...prevReactions,
          [commentId]: {
            ...prevReactions[commentId],
            [reactionType]: (prevReactions[commentId]?.[reactionType] || 0) - 1,
          },
        }));
      } else {
        // Update the reaction in the backend
        await axios.post(`${API_URL}/react/comments/react/${commentId}`, {
          reaction: reactionType,
        });

        // Increment the new reaction and decrement the old one if it exists
        setReactions((prevReactions) => ({
          ...prevReactions,
          [commentId]: {
            likes:
              reactionType === "like"
                ? (prevReactions[commentId]?.likes || 0) + 1
                : prevReactions[commentId]?.dislikes || 0,
            dislikes:
              reactionType === "dislike"
                ? (prevReactions[commentId]?.dislikes || 0) + 1
                : prevReactions[commentId]?.likes || 0,

            // Decrement de vorige reactie
            ...(prevReactions[commentId]?.reaction &&
            prevReactions[commentId]?.reaction !== reactionType
              ? {
                  [prevReactions[commentId]?.reaction]:
                    prevReactions[commentId]?.[
                      prevReactions[commentId]?.reaction
                    ] - 1,
                }
              : {}),
          },
        }));
      }
    } catch (err) {
      if (err.response?.status == 404) {
        // Handle case where no reaction found in database
        console.log("No reaction found, proceeding with adding like.");
        await axios.post(`${API_URL}/react/comments/react/${commentId}`, {
          reaction: reactionType,
        });
        setReactions((prevReactions) => ({
          ...prevReactions,
          [commentId]: {
            likes:
              reactionType === "like"
                ? (prevReactions[commentId]?.likes || 0) + 1
                : prevReactions[commentId]?.likes || 0,
            dislikes:
              reactionType === "dislike"
                ? (prevReactions[commentId]?.dislikes || 0) + 1
                : prevReactions[commentId]?.dislikes || 0,
          },
        }));
      } else {
        console.error("Error toggling like:", err);
      }
    }
  };

  //console.log(comments);
  //console.log(userData.image_profile_url);

  return (
    <div className="post-detail-container">
      {post && (
        <div className="post-detail">
          {/* post header */}
          <div className="post-header">
            <div className="post-author">
              <img
                className="author-profile-pic"
                src={author.image_profile_url}
                alt={`${author.name}'s profile`}
              />
              <span className="author-name">{author.name}</span>
            </div>
          </div>

          {editingPost && (
            <div className="edit-post-modal">
              <form onSubmit={handleEditPost}>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Edit title"
                />
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Edit content"
                ></textarea>
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
                <button type="submit">Save Changes</button>
                <button onClick={() => setEditingPost(null)}>Cancel</button>
              </form>
            </div>
          )}

          {/* Post Body */}
          <div className="post-body">
            {/* Post Content and Image */}
            <div className="content-section">
              {/* Post Title */}
              <h1 className="post-title">{post.title}</h1>
              {/* post tag */}
              <span
                className="badge"
                style={{ backgroundColor: "#34495e", color: "white" }}
              >
                {post.tags}
              </span>
              {/* Post Content */}
              <p className="post-content">{post.content}</p>
            </div>
            {post.image_url && (
  <div className="image-section">
    <img
      className="post-image"
      src={post.image_url}
      alt="Post image"
    />
  </div>
)}
          </div>

          {/* Post footer */}
          <div className="post-footer">
            <span className="post-date">
              Posted on: {new Date(post.created_at).toLocaleDateString()}
            </span>
            <div className="post-reactions">
              <button className="like-button" onClick={handleLike}>
                👍 {likes}
              </button>
              <button className="dislike-button" onClick={handleDislike}>
                👎 {dislikes}
              </button>
            </div>
            <div className="social-share-buttons">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${postUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon facebook"
              >
                <FaFacebookF />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${postTitle}&url=${postUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon twitter"
              >
                <FaTwitter />
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${postUrl}&title=${postTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon linkedin"
              >
                <FaLinkedinIn />
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${postTitle}%20${postUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon whatsapp"
              >
                <FaWhatsapp />
              </a>
              <a
                href={`mailto:?subject=${postTitle}&body=Check%20this%20out:%20${postUrl}`}
                className="social-icon email"
              >
                <MdEmail />
              </a>
            </div>
          </div>

          {/* Comments Section */}
          <div className="comments-section">
            <h2>Comments</h2>
            {comments.length > 0 ? (
              <ul className="comments-list">
                {comments.map((comment, idx) => (
                  <li key={idx} className="comment-item">
                    <img
                      className="author-profile-pic-comment"
                      src={comment.user_image}
                      alt={`${comment.user_name}'s profile`}
                    />
                    <span className="author-name">{comment.user_name}</span>
                    <p className="comment-content">{comment.content}</p>
                    {comment.user_id === userData.id && (
                      <button
                        className="delete-comment-button"
                        onClick={() => handleRemoveComment(comment.id)}
                      >
                        Delete
                      </button>
                    )}
                    <div className="comment-reactions">
                      <button onClick={() => handleReact(comment.id, "like")}>
                        👍 {reactions[comment.id]?.likes || 0}
                      </button>
                      <button
                        onClick={() => handleReact(comment.id, "dislike")}
                      >
                        👎 {reactions[comment.id]?.dislikes || 0}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No comments yet. Be the first to comment!</p>
            )}

            {/* Add New Comment */}
            <div className="add-comment">
              <textarea
                className="comment-input"
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment..."
              ></textarea>
              <button className="add-comment-button" onClick={handleAddComment}>
                Add Comment
              </button>
              {/* edit and delete button */}
              {post.authorId === userData.id && (
                <div>
                  <button
                    className="delete-button"
                    onClick={() => setEditingPost(post.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="create-thread-button"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetails;
