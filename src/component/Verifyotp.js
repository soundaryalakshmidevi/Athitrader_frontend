// src/component/VerifyOtp.js
import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import backgroundImage from '../asset/ATbackgroundnew.png';
import Axios from "../Axios"; 

function VerifyOtp() {
  const location = useLocation(); // Use useLocation to access passed state
  const navigate = useNavigate(); // Use useNavigate for navigation
  const { email } = location.state || {}; // Retrieve email from state
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError(true);
      return;
    }
    setError(false);

    try {
      // Call your OTP verification API
      const response = await Axios.post('/verify-account', {
        email: email,
        otp: otp,
      });

      // Check if the response indicates OTP verification success
      if (response.data.message === "OTP verified successfully") {
        // Redirect to the reset password page on success
        navigate('/reset-password', { state: { email: email } });
      } else {
        // Handle error if OTP verification fails
        console.error("OTP verification failed:", response.data.message);
        setError(true); // You can set a more specific error message here if needed
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError(true); // Handle any API or network errors
    }
  };

  return (
    <Box
      sx={{
        // backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            backgroundColor: '#07387A',
            padding: { xs: 2, sm: 3, md: 4 },
            borderRadius: 1,
            boxShadow: 3,
            textAlign: 'center',
            width: '100%',
            maxWidth: { xs: 300, sm: 350, md: 400 },
          }}
        >
          <Typography variant="h5" gutterBottom sx={{color:'#fff'}}>
            Verify OTP
          </Typography>
          <TextField
            variant="outlined"
            label="Email"
            fullWidth
            value={email || ''} // Fill the email field if available
            InputProps={{
              readOnly: true, // Make the field read-only
            }}
            sx={{
              marginBottom: 2,
              '& .MuiInputBase-input': {
                color: '#fff',
              },
            }}
          />
          <TextField
            variant="outlined"
            label="Enter your OTP"
            fullWidth
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            error={error && !otp}
            helperText={error && !otp ? "OTP is required" : ""}
            sx={{
              marginBottom: 2,
              '& .MuiInputBase-input': {
                color: '#fff',
              },
            }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleVerifyOtp}
            sx={{
              marginTop: 2,
              backgroundColor: '#E8B701',
                color: '#fff',
              '&:hover': {
                backgroundColor: '#E8B701',
                color: '#fff',
              },
            }}
          >
            Verify OTP
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default VerifyOtp;
