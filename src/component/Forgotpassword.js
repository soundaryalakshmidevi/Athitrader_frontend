import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import Axios from "../Axios"; 
import backgroundImage from '../asset/ATbackgroundnew.png';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const handleSendOtp = async () => {
    if (!email) {
      setError(true);
      return;
    }
    setError(false);
    setLoading(true);

    try {
      const response = await Axios.post('/send-otp', {
        email: email,
      });
      console.log("OTP sent successfully:", response.data);
      // Redirect to VerifyOtp page with email as state
      navigate('/verify-otp', { state: { email } });
    } catch (error) {
      console.error("Error sending OTP:", error);
    } finally {
      setLoading(false);
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
            backgroundColor: '#06387A',
            padding: { xs: 2, sm: 3, md: 4 },
            borderRadius: 1,
            boxShadow: 3,
            textAlign: 'center',
            position: 'relative',
            width: '100%',
            maxWidth: { xs: 300, sm: 350, md: 400 },
          }}
        >
          {loading && (
            <CircularProgress
              size={60}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}
          <Typography variant="h5" gutterBottom sx={{
              marginTop: 2,
              color: '#fff'}}>
            Forgot Password
          </Typography>
          <TextField
            variant="outlined"
            label="Enter your email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error && !email}
            helperText={error && !email ? "Email is required" : ""}
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
            onClick={handleSendOtp}
            sx={{
              marginTop: 2,
              backgroundColor: '#E8B701',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#E8B701',
              },
            }}
            disabled={loading}
          >
            Send OTP
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default ForgotPassword;
