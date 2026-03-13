import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { url } from "../Api";
import { jwtDecode } from "jwt-decode";

// Configure Axios to include credentials with every request
axios.defaults.withCredentials = true;


export const AppContext = createContext();
export const AppContextProvider = (props) => {


  const [userData, setUserData] = useState(() => JSON.parse(sessionStorage.getItem('userData')) || "");
  const [token, setToken] = useState('');
  const [users, setUsers] = useState([]);

  // Function to fetch user data if the token is available
  const fetchUserData = async () => {
    if (!token) return; // Exit if there is no token

    try {
      const { data } = await axios.get(url + 'auth/login/status'); // Call API to check login status
      if (data.code == 200) { 
        setUserData(data.user); // Set user data in state
        sessionStorage.setItem('userData', JSON.stringify(data.user)); // Save user data in sessionStorage
      }
    } catch (error) {
      console.log(error); 
    }
  };



  // Function to update the avatar in user data
  const updateAvatar = (newAvatar) => {
    setUserData((prev) => ({ ...prev, image: newAvatar })); // Update the image field in user data
  };


  // Context value to provide data and functions to other components
  const value = {
    userData, // User data
    setUserData, // Function to update user data
    updateAvatar, // Function to update avatar
    token, // Authentication token
    setToken, // Function to update the token
    url, // API base URL
  };

  // useEffect to fetch user data and details whenever the token changes
  useEffect(() => {
    if (token) { // Check if token is available
      fetchUserData(); // Fetch user data
    }
  }, [token]);

 
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};


AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired, 
};
