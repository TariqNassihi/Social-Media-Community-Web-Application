import "./Register.css";
import { useState } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";
import 'react-toastify/ReactToastify.css';
import { url } from "../../Api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const initialState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
}

const Register = () => {
  const navigate = useNavigate();

  const [state, setState] = useState(initialState);

  const handleChange = (e) => {
    setState({...state, [e.target.name]: e.target.value});
  }

  const handleSubmit = async(e) => {
    e.preventDefault();

    try {
      const response = await axios.post(url + 'auth/register', state);


      if(!state.name || !state.email || !state.password || !state.confirmPassword) {
        toast.error('Please fill out all fields');
      } else if(state.password !== state.confirmPassword) {
        toast.error('Passwords do not match!');
      } else {
        toast.success('Account created successfully', {
            onClose: () => navigate('/login')
        });
      }
    } catch (error) {
      toast.error('error while registration');
      console.log(error)
    }
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-group" method="post">
        <div>
          <h2> Create account </h2>
          <p> You can create an account here </p>
        </div>

        <div className="form-input">
          <p> Name: </p>
          <input type="text" name="name" onChange={handleChange} value={state.name} />
          <p> Email address: </p>
          <input type="email" name="email" onChange={handleChange} value={state.email} />
          <p> Password: </p>
          <input type="password" name="password" onChange={handleChange} value={state.password} />
          <p> Confirm Password: </p>
          <input type="password" name="confirmPassword" onChange={handleChange} value={state.confirmPassword} />
        </div>

        <button className="submit" type="submit"> Create account </button>

        <div>
            <p>
              Already have an account?
              <span className="form-guide" onClick={() => navigate('/login')}> Sign in </span>
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

export default Register;
