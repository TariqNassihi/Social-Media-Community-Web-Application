import { useContext, useEffect, useState } from 'react';
import './Profile.css';
import avatar_icon from "../../assets/avatar.png";
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
axios.defaults.withCredentials = true;


const Profile = () => {
  const {userData, url, token} = useContext(AppContext);
//   console.log(userData);
  const navigate = useNavigate();

  const {id} = useParams();

  const [userProfile, setUserProfile] = useState(null);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [blogsCount, setBlogsCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchFollowCount = async () => {
    const userId = id || userData.id;

    const response = await axios.get(url + `user/${userId}`);
    // console.log(response.data);

    if(response.data) {
        setUserProfile(response.data);
      setFollowersCount(response.data.followers.length || 0);
      setFollowingCount(response.data.following.length || 0);
      setIsFollowing(response.data.followers.includes(userData.id));
    }

    const res = await axios.get(url + `posts/user/${userId}`);
    if(res.data) {
      setBlogsCount(res.data.length || 0);
    }
  }

  const handleFollow = async () => {
    try {
        if(isFollowing) {
            await axios.delete(url + `user/unfollow/${userProfile.name}`);
            setIsFollowing(false);
            setFollowersCount(followersCount - 1);
        } else {
            await axios.post(url + `user/follow/${userProfile.name}`);
            setIsFollowing(true);
            setFollowersCount(followersCount + 1);
        }
    } catch (error) {
        console.log(error);
    }
  }

  const handleLoggedInUser = () => {
    if(userProfile && userProfile.id === userData.id) {
            navigate('/my-profile');
        }
    }

  useEffect(() => {
    if(id || userData.id) {
      fetchFollowCount();
    }
    
    handleLoggedInUser();
  }, [id, userData, token, userProfile])

  return (
    <div className='profile-container'>
      <div className='profile-banner'>
        <div className='banner-img'></div>
        <div className='profile-avatar'>
          <div className='profile-pic'> <img src={userProfile?.image_profile_url || avatar_icon} alt="User profile picture" /> </div>
        </div>
        <button onClick={handleFollow} className='follow-button'> {isFollowing ? 'Unfollow' : 'Follow'} </button>
      </div>
      <div className='profile-details'>
        <p className='user-name'> {userProfile?.name} </p>
        <div className='follow-container'>
          <div>
              <p> Blogs </p>
              <span> {blogsCount} </span>
          </div>
          <div>
              <p> Followers </p>
              <span> {followersCount} </span>
          </div>
          <div>
              <p> Following </p>
              <span> {followingCount} </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile