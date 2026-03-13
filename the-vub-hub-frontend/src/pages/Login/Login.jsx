import "./Login.css";
import { useContext, useState } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";
import axios from "axios";
axios.defaults.withCredentials = true;
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";


const initialState = {
  email: "",
  password: "",
};

const Login = () => {
  const navigate = useNavigate();

  const { url, token, setToken} = useContext(AppContext);
  const [state, setState] = useState(initialState);

  const handleChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!state.email || !state.password) {
      toast.error("Please fill out all fields");
      return;
    }

    try {
      const response = await axios.post(url + 'auth/login', state);
      
      const data = await response.data;
      if (data.token) {
        setToken(data.token);
        toast.success('Logged in successfully!', {
          onClose: () => {
            navigate("/");
          },
        });
      } else {
        toast.error("Failed to login. Please check your credentials!");
      }
    } catch (error) {
      toast.error("Failed to login. Please check your credentials!");
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-group" method="post">
        <div>
          <h2> Welcome back </h2>
          <p> You can sign in to your page </p>
        </div>

        <div className="form-input">
          <p> Email address: </p>
          <input
            type="email"
            name="email"
            onChange={handleChange}
            value={state.email}
          />
          <p> Password: </p>
          <input
            type="password"
            name="password"
            onChange={handleChange}
            value={state.password}
          />
        </div>

        <button className="submit" type="submit">
          {" "}
          Login{" "}
        </button>

        <div>
          <p>
            {" "}
            New User?
            <span className="form-guide" onClick={() => navigate("/register")}>
              {" "}
              Create an account{" "}
            </span>
          </p>
        </div>
      </form>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </div>
  );
};

export default Login;
