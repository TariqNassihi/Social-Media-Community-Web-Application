import { useContext, useEffect, useState } from 'react';
import './myProfile.css';
import avatar_icon from "../../assets/avatar.png";
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { useNavigate } from "react-router-dom"
axios.defaults.withCredentials = true;

const MyProfile = () => {
  const {userData, setUserData, url, token} = useContext(AppContext);
  const navigate = useNavigate();

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [blogsCount, setBlogsCount] = useState(0);

  const [edit, setEdit] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
 
  const [newname, setNewname] = useState('');

  const handleImageChange = (e) => {
    const imageInput = e.target.value;
    setImageUrl(imageInput);
  }


  const saveImageChange = async () => {
    const isValidUrl = (str) => {
      try {
        new URL(str); 
        return true;
      } catch {
        return false;
      }
    };
  
    if (!isValidUrl(imageUrl)) {
      setImageUrl('');
      alert('Invalid image URL'); 
      return false;
    }

    try {
      const response = await axios.put(url + `user/update-profile-img`, { image_profile_url: imageUrl }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.data.code === 200) {
        const updatedImageUrl = response.data.image_profile_url;
        setUserData((prev) => ({ ...prev, image_profile_url: updatedImageUrl }));
        setImageUrl('');
      }
    } catch (error) {
      ImageUrl('');
      alert('url not valid', error);
    }
  };

  const handleNameChange = async () => {
    if (newname.length <= 3) {
      setNewname('');
      alert('Name must be at least 3 characters long');
      return;
    }
  
    try {
      const response = await axios.put(url + 'user/update-name', {
        name: newname,
      });
  
  
      if (response.status === 200) {
        setUserData((prev) => ({ ...prev, name: newname }));
        alert('Name updated successfully!');
        setEdit(false);
      } else {
        console.error('Unexpected status code:', response.status);
        alert('Could not update name. Please try again.');
        setEdit(false);
      }
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Error updating name. Please check your connection or try again later.');
      setEdit(false);
    }
  };
  
  

  const fetchFollowCount = async () => {
    const source = axios.CancelToken.source();
    try {
      const response = await axios.get(url + `user/${userData.id}`, { cancelToken: source.token });
      if (response.data) {
        setFollowersCount(response.data.followers.length || 0);
        setFollowingCount(response.data.following.length || 0);
      }

      const res = await axios.get(url + `posts/user/${userData.id}`, { cancelToken: source.token });
      if (res.data) {
        setBlogsCount(res.data.length || 0);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error(error);
        alert.error('Error fetching data');
      }
    }

    return () => source.cancel('Component unmounted, canceling requests');
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (isMounted && userData.id) {
        await fetchFollowCount();
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [userData, token]);

  return (
    <div className='my-profile-container'>
      <div className='my-profile-details'>
        <div className='my-profile-avatar'>
          {
            edit ? 
            (
              <>
                <div className='user-pic'> 
                  <img src={userData.image_profile_url || avatar_icon} alt="User profile picture" /> 
                </div>
                <div>
                  <input 
                    type="text" 
                    name="avatar" 
                    id='avatar' 
                    placeholder='Enter image url' 
                    value={imageUrl} 
                    onChange={handleImageChange}
                  />
                </div>
              </>
            ) : (
              <> 
                <div className='user-pic'> 
                  <img src={userData.image_profile_url || avatar_icon} alt="User profile picture" /> 
                </div> 
              </>
            )
          }
        </div>
        {
          edit 
          ? (
            <>
              <p className='user-name'> Name: </p>
              <input type='text' value={newname} onChange={e => setNewname(e.target.value)}/>
            </>
          ) : ( <p className='user-name'> {userData.name} </p> )
        }
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
        {
          edit 
          ? (
            <>
            <button onClick={async () => {
                const imageSuccess = imageUrl ? await saveImageChange() : true;
                const nameSuccess = newname ? await handleNameChange() : true;

                if (imageSuccess && nameSuccess) {
                  setEdit(false);
                }
                navigate("/");
              }} type="submit"> Save </button>
            </>
          ) : ( <button onClick={() => setEdit(true)} type='submit'> Edit Profile </button> )
        }
      </div>
    </div>
  );
};

export default MyProfile;
