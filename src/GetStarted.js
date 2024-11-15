// src/GetStarted.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from './asset/Ab Logo.png'; // Adjust the path if necessary
import { MdArrowForward } from 'react-icons/md'; // Import arrow icon from react-icons
import backgroundimage from './asset/ATbackgroundnew.png'; // Import background image

const GetStarted = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login'); // Navigate to login page
    };

   

    return (
      
            
        <div style={styles.main}>
        <img src={logoImage} alt="Athi Traders Logo" style={styles.logo} /> 
       <button onClick={handleGetStarted} style={styles.button}>
          Get Started <MdArrowForward style={styles.icon} />
        </button>
      </div>
      
      
      
    );
};



const styles = {
    main: {
        // backgroundColor: 'black',
        backgroundImage: `url(${backgroundimage})`,
        backgroundSize: 'cover',  // Make the background cover the whole div
        backgroundPosition: 'center',  // Center the image
        height: '100vh',  // Full viewport height
        width: '100vw',  // Full viewport width
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    logo: {
        width: '300px',
        height: 'auto',
        marginBottom: '20px',
    },
    button: {
        width: '300px',
        height: '50px',
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#188B3E',
        color: '#fff',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.3s',
    },
    icon: {
        marginLeft: 'auto',
    },
};


export default GetStarted;
