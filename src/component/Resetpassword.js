import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Snackbar, Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Axios from '../Axios'; // Adjust the import path based on your project structure

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate for redirection
  const { email } = location.state || {};
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar open state

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError('');

    try {
      // Call the reset password API
      const response = await Axios.post('/reset-password', {
        email: email,
        newPassword: password,
      });

      // Check if the response indicates success
      if (response.data.message === "Password reset successfully") {
        setOpenSnackbar(true); // Show success snackbar
        // Optionally redirect after a timeout
        setTimeout(() => {
          navigate('/login'); // Redirect to login page after 2 seconds
        }, 2000);
      } else {
        setError("Error resetting password: " + response.data.message);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("Error resetting password");
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // Close the snackbar
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          backgroundColor: '#07387A',
          padding: { xs: 2, sm: 3, md: 4 },
          borderRadius: 4,
          boxShadow: 3,
          textAlign: 'center',
          width: '100%',
          maxWidth: { xs: 300, sm: 350, md: 400 },
          marginTop: '100px',
        }}
      >
        <Typography variant="h5" gutterBottom sx={{color:'#fff'}}> 
          Reset Password
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
          label="New Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            marginBottom: 2,
            '& .MuiInputBase-input': {
              color: '#fff',
            },
          }}
        />
        <TextField
          variant="outlined"
          label="Confirm Password"
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={Boolean(error)}
          helperText={error}
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
          onClick={handleResetPassword}
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
          Reset Password
        </Button>
      </Box>

      {/* Snackbar for success message */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Password has been reset successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ResetPassword;
