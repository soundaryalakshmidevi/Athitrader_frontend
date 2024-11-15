// // src/Axios.js
// import axios from 'axios';

// const Axios = axios.create({
//     baseURL: 'http://127.0.0.1:8000/api', // Replace with your actual API base URL
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// export default Axios;
import axios from "axios";
import Swal from "sweetalert2";
import { redirectToLogin } from './Pages/Navigation';

const Axios = axios.create({

// baseURL: "http://192.168.1.13:8000/api",
// baseURL: 'http://127.0.0.1:8000/api',
// baseURL: ' https://reiosglobal.com/Athitraders_Backend/api',
baseURL: ' https://athitraders.com/Athitraders_Backend/api',
headers: {
  'Content-Type': 'application/json',
},
});

Axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    else if (config.url !== '/login') {
      // Swal.fire({
      //  title: "Error",
        // text: "Session expired. Please log in again.",
      //  text: "No token found.",
        // icon: "error",
        // confirmButtonText: "OK"
      // }).then(() => {
        redirectToLogin();
      // });
      // redirectToLogin();
       throw new axios.Cancel('No token found'); // Cancel the request
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

Axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    if (response.status === 401) {
     // Swal.fire("Error", "Session expired. Please log in again.", "error");
      // Swal.fire("Error", "No token found");
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export default Axios;