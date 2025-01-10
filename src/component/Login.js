import React, { useState } from 'react';
import Axios from "../Axios";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import logoImage from '../asset/Srivari Logo.png'; 
import '../Login.css';
import { MdArrowForward } from 'react-icons/md';
import Spinner from '../Spinner.js'; 
import backgroundimage from '../asset/ATbackgroundnew.png'; 
import { Link } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { IconButton ,InputAdornment , TextField} from '@mui/material';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();
 const [showPassword, setShowPassword] = useState(false);
      
        const handleClickShowPassword = () => {
          setShowPassword(!showPassword);}
      

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            // Prepare login data based on the input
            const loginData = {
                email: email.includes('@') ? email : undefined,
                user_id: !email.includes('@') ? email : undefined,
                password: password,
            };
    
            // Attempt login
            const response = await Axios.post('/login', loginData);
            
            // Ensure you receive the expected response structure
            if (!response.data || !response.data.token || !response.data.user_id) {
                throw new Error('Invalid response structure'); // Force the catch block
            }
    
            // Store token and user_id in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_id', response.data.user_id);
    
            // Fetch user profile
            const loggedInUserId = response.data.user_id;
            const profileResponse = await Axios.get(`/profile/${loggedInUserId}`);
    
            if (!profileResponse.data || !profileResponse.data.message) {
                throw new Error('Profile data not found'); // Force the catch block
            }
    
            const userProfileData = profileResponse.data.message;
    
            // Navigate based on user role
            if (response.data.role === 'admin') {
                navigate('/admindashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            // Detailed error handling
            console.error('Login Error:', error);
            const errorMessage = error.response
                ? error.response.data.error || 'An error occurred during login.'
                : 'An unexpected error occurred. Please try again later.';
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };
    
    
    console.log(backgroundimage); // Add this line to check the URL


    return (
      <div
          className="container1"
          style={{
              height: '100vh',
              width: '100vw',
              backgroundColor: '#fff',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
          }}
      >
          <div className="login-container" style={{ position: 'relative', backgroundColor: '#07387A' }}>
              {loading && (
                  <div className="spinner-overlay" style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 100,
                  }}>
                      <Spinner style={{ color: '#07387A' }} />
                  </div>
              )}
              <img src={logoImage} alt="Athi Traders Logo" className="logo1" />
              <form onSubmit={handleSubmit} style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
                  <div className="form-group-login">
                      <label htmlFor="email" style={{ color: '#fff' }}>Employee Id</label>
                      <input
                          id="email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                      />
                  </div>
                  <div className="form-group-login">
                      <label htmlFor="password" style={{ color: '#fff' }}>Password</label>
                      <TextField
                          fullWidth
                          id="password"
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                          type={showPassword ? 'text' : 'password'}
                          variant="outlined"
                          style={{ backgroundColor: '#fff', borderRadius: '5px' }}
                          InputProps={{
                              endAdornment: (
                                  <InputAdornment position="end">
                                      <IconButton
                                          onClick={handleClickShowPassword}
                                          edge="end"
                                          aria-label="toggle password visibility"
                                          style={{ color: '#E8B701' }}
                                      >
                                          {showPassword ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                  </InputAdornment>
                              ),
                          }}
                          sx={{
                              height: 50,
                              '& .MuiInputBase-root': {
                                  height: '100%',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                  border: 'none',
                              },
                          }}
                      />
                  </div>
                  <div className="forgot-password-login">
                      <Link to="/forgotpassword" style={{ color: '#E8B701' }}>Forgot Password?</Link>
                  </div>
                  <button type="submit" disabled={loading} style={{ backgroundColor: '#E8B701' }}>
                      <span style={{ fontWeight: 'bold' }}>
                          SIGN IN <MdArrowForward />
                      </span>
                  </button>
              </form>
          </div>
      </div>
  );
};

export default Login;