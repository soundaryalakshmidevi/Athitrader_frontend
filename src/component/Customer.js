import React, { useState, useEffect , useCallback} from 'react';
import _ from 'lodash'; // For debouncing
import Axios from "../Axios";
import { Pagination } from '@mui/material'; // Import the Pagination component
import Stack from '@mui/material/Stack';
import '../Employee.css'; // Assuming you have a CSS file for styling
import Sidebar from './Sidebar';
import { Dialog, DialogContent,Button } from '@mui/material';
import {  DialogActions,  DialogContentText, DialogTitle } from '@mui/material';
import { DownOutlined, SearchOutlined, } from '@ant-design/icons'; // Import the DownOutlined icon from Ant Design
import { Switch } from '@mui/material';
import { CircularProgress,Card, CardContent, Typography, Grid, IconButton,Divider } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { InputAdornment,TextField, Autocomplete } from "@mui/material";
import Resizer from 'react-image-file-resizer';
const Customer = () => {
    const [customerfirst, setcustomersfirst] = useState([]);
    const [customer, setcustomers] = useState([]);
    const [showForm, setShowForm] = useState(false); // Controls form visibility as popup
    const [editingcustomer, setEditingcustomer] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState('');
    const [userProfile, setUserProfile] = useState(null);
    const [formData, setFormData] = useState({
        user_id: '',
        user_name: '',
        aadhar_number: '',
        address: '',
        city: '',
        pincode: '',
        district: '',
        user_type: 'user',
        status: 'active', // Default status
        mobile_number: '',
        email: '',
        qualification: '',
        password: '',
        confirmPassword: '', // Added confirm password
        added_by: '',
       
        designation: '', // Designation
        landmark: '', // Landmark
        alter_mobile_number: '', // Alternate Number
        ref_name: '', 
        ref_user_id: '', // Reference User ID
        ref_aadhar_number: '', // Reference Aadhar Number
        profile_photo: '', // For profile photo
        sign_photo: '', // For signature photo
        nominee_photo: '', // For profile photo
        nominee_sign: '', // For signature photo
    });
    const [cities, setCities] = useState([]); // State to store cities
    const [showNewCityInput, setShowNewCityInput] = useState(false);
    const options = [...cities, { city_name: "Others" }]; // Include "Others" in the options
    const [expandedcustomerId, setExpandedcutomerId] = useState(null); 
    const [errors, setErrors] = useState({}); 
    const [isSidebarExpanded, setSidebarExpanded] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const itemsPerPage = 6;
    const limit = 10; // Number of items per page
    const [paginatedCustomers, setPaginatedCustomers] = useState([]);  // Store paginated dat
    const commonStyles = {
        backgroundColor: 'rgba(60, 179, 113, 0.3)', // Medium Sea Green with 30% opacity
        padding: '5px', // Padding around the text
        borderRadius: '4px', // Rounded corners
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)', // Subtle shadow effect
        color: '#000', // Black text color
        fontWeight: 'bold', // Bold text
       
    };
    const [searchQuery, setSearchQuery] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    const [hasMorePages, setHasMorePages] = useState(true);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
   const [  CustomerId ,setCustomerId ] = useState('');

    useEffect(() => {
        const fetchNextCustomerId = async () => {
          try {
            const response = await Axios.get('/getLastCustomerUserId'); // Replace with your actual API endpoint
            if (response.data && response.data.next_user_id) {
              setCustomerId(response.data.next_user_id);
              // setFormData((prevData) => ({
              //   ...prevData,
              //   user_id: response.data.next_user_id,
              // }));
            }
          } catch (error) {
            console.error('Error fetching next employee ID:', error);
          }
        };
    
        fetchNextCustomerId();
      }, []);
    // const handleSearchChange = (event) => {
    //     setSearchQuery(event.target.value);
    // };
    const filteredCustomers = Array.isArray(customerfirst)
    ? customerfirst.filter(customer =>
        customer.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.user_id.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];;
    
    useEffect(() => {
        const userId = localStorage.getItem('user_id'); 
        if (userId) {
            setFormData((prevData) => ({
                ...prevData,
                added_by: userId,
                ref_user_id: userId,
            }));
            // fetchUserProfile(userId);
        }
    }, []);

   
    useEffect(() => {
        fetchCustomers();
    }, [currentPage, searchTerm]);

    useEffect(() => {
        // Update the customers for the current page whenever currentPage or allCustomers changes
        const startIdx = (currentPage - 1) * itemsPerPage;
        const paginatedCustomers = customerfirst.slice(startIdx, startIdx + itemsPerPage);
        setcustomersfirst(paginatedCustomers);
    }, [currentPage, customerfirst]);

    const fetchCustomers = async () => {
        try {
            const response = await Axios.post('/search', {
                search: searchTerm || '',  // Send search term or empty string
                page: currentPage,         // Send current page
            });
    
            if (response.data) {
                const customers = response.data.data;
                const totalCustomers = customers.length;
                setTotalPages(Math.ceil(totalCustomers / itemsPerPage));
    
                // Slice the customers based on current page and items per page
                const startIdx = (currentPage - 1) * itemsPerPage;
                const paginatedData = customers.slice(startIdx, startIdx + itemsPerPage);
                setPaginatedCustomers(paginatedData);  // Update paginated data
            } else {
                console.error('Invalid data format');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };
    
    // const paginatedCustomers = customerfirst.slice(
    //     (currentPage - 1) * 10,
    //     currentPage * 10
    // );

// Handle search term change
const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);  // Reset to first page on new search
};

// Handle page change
const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
    }
};

    // Use filteredCustomers instead of paginatedCustomers in the JSX
const customersToDisplay = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
);
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
   // Handle page change
//    const handlePageChange = (event, value) => {
//     setCurrentPage(value);
//     fetchCustomers(searchTerm, value);
// };
  
    // const handleDelete = async (id) => {
    //     if (window.confirm('Are you sure you want to delete this customer?')) {
    //       try {
    //         // Send DELETE request
    //         const response = await Axios.delete(`/user/${id}`);
            
    //         // Check for different response messages
    //         if (response.data.message === "Employee deleted successfully!") {
    //           alert(response.data.message);  // Success message in alert box
    //           window.location.reload();
    //         } else if (response.data.message === "Loan status is not 'Completed', cannot delete user.") {
    //           alert("Loan is not 'Completed', cannot delete this user.");  // Custom error message
    //         } else {
    //           alert("An unexpected response was received.");
    //         }
      
    //         // Filter out the deleted customer from the list
    //         setcustomers(customer.filter(customer => customer.user_id !== id));
            
    //       } catch (error) {
    //         // Handle any unexpected error
    //         alert("Error deleting customer: " + (error.response?.data.message || error.message));
    //       }
    //     }
    //   };
    const handleClickOpen = (id) => {
        setSelectedId(id);
        setOpen(true);
      };
    
      const handleClose = () => {
        setOpen(false);
        setSelectedId(null);
      };
    const handleDelete = async () => {
        try {
          // Send DELETE request
          const response = await Axios.delete(`/user/${selectedId}`);
    
          // Check for different response messages
          if (response.data.message === "Employee deleted successfully!") {
            alert(response.data.message);  // Success message in alert box
            window.location.reload();
          } else if (response.data.message === "Loan status is not 'Completed', cannot delete user.") {
            alert("Loan is not 'Completed', cannot delete this user.");  // Custom error message
          } else {
            alert("An unexpected response was received.");
          }
    
          // Filter out the deleted customer from the list, checking if 'customer' is an array
          if (Array.isArray(customer)) {
            setcustomers(customer.filter(customer => customer.user_id !== selectedId));
          } else {
            console.error("Expected 'customer' to be an array, but got:", customer);
          }
        } catch (error) {
          // Handle any unexpected error without showing an alert if 'filter' error appears in the response
          const errorMessage = error.response?.data.message || error.message;
          if (!errorMessage.includes("filter")) {
            alert("Error deleting customer: " + errorMessage);
          } else {
            console.error("Filter error encountered: ", errorMessage);
          }
        }
        handleClose();
      };
      
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file); // Convert file to Base64
          reader.onload = () => resolve(reader.result); // Resolve with Base64 string
          reader.onerror = (error) => reject(error); // Reject on error
        });
      };
      
      const base64ToFile = (base64String, fileName) => {
        try {
          const [metadata, base64Content] = base64String.split(',');
          const mimeType = metadata.split(':')[1].split(';')[0];
          const byteCharacters = atob(base64Content);
          const byteArrays = [];
      
          for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
            const slice = byteCharacters.slice(offset, offset + 1024);
            const byteNumbers = new Array(slice.length);
      
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
      
            byteArrays.push(new Uint8Array(byteNumbers));
          }
      
          const blob = new Blob(byteArrays, { type: mimeType });
          const file = new File([blob], fileName, { type: mimeType });
          return file;
      
        } catch (error) {
          console.error("Error converting base64 to file:", error);
          return null;
        }
      };
            
      const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
      
        if (file) {
          convertFileToBase64(file)
            .then((base64Image) => {
              setFormData((prevState) => ({
                ...prevState,
                [name]: base64Image, // Set the Base64 string in the form data
              }));
            })
            .catch((err) => console.error("Error converting file to Base64", err));
        } else {
          setFormData((prevState) => ({
            ...prevState,
            [name]: prevState[name], // Retain old value
          }));
        }
      };
      
    const handleEdit = (customer) => {
        setEditingcustomer(customer);
        const profilePhotoFile = customer.profile_photo ? base64ToFile(customer.profile_photo, 'profile_photo.jpg') : null;
  const signPhotoFile = customer.sign_photo ? base64ToFile(customer.sign_photo, 'sign_photo.jpg') : null;
  const nomineePhotoFile = customer.profile_photo ? base64ToFile(customer.nominee_photo, 'profile_photo.jpg') : null;
  const nomineesignPhotoFile = customer.sign_photo ? base64ToFile(customer.nominee_sign, 'sign_photo.jpg') : null;

        setFormData({
            user_id: customer.user_id,
            user_name: customer.user_name,
            aadhar_number: customer.aadhar_number,
            address: customer.address,
            city: customer.city,
            pincode: customer.pincode,
            district: customer.district,
            user_type: customer.user_type,
            status: customer.status,
            mobile_number: customer.mobile_number,
            email: customer.email|| '',
            qualification: customer.qualification,
            password: '',
            confirmPassword: '',
           
            designation: customer.designation || '',
            landmark: customer.landmark || '',
            alter_mobile_number: customer.alter_mobile_number || '',
            ref_name: customer.ref_name || '',
            ref_user_id: customer.ref_user_id || localStorage.getItem('user_id'),
            ref_aadhar_number: customer.ref_aadhar_number || '',
            profile_photo: profilePhotoFile || null,
            sign_photo: signPhotoFile || null,
            nominee_photo:nomineePhotoFile || null,
            nominee_sign:nomineesignPhotoFile || null,
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setErrors({ password: ['Passwords do not match!'] });
            return;
        }
    
        try {
            const formDataToSend = new FormData();
    
            // Add profile photo, sign photo, nominee photo, and nominee sign directly
            if (formData.profile_photo instanceof File) {
                const base64ProfileImage = await convertFileToBase64(formData.profile_photo);
                formDataToSend.append('profile_photo', base64ProfileImage);
            } else {
                formDataToSend.append('profile_photo', formData.profile_photo);
            }
    
            if (formData.sign_photo instanceof File) {
                const base64SignImage = await convertFileToBase64(formData.sign_photo);
                formDataToSend.append('sign_photo', base64SignImage);
            } else {
                formDataToSend.append('sign_photo', formData.sign_photo);
            }
    
            if (formData.nominee_photo instanceof File) {
                const base64NomineePhoto = await convertFileToBase64(formData.nominee_photo);
                formDataToSend.append('nominee_photo', base64NomineePhoto);
            } else {
                formDataToSend.append('nominee_photo', formData.nominee_photo);
            }
    
            if (formData.nominee_sign instanceof File) {
                const base64NomineeSign = await convertFileToBase64(formData.nominee_sign);
                formDataToSend.append('nominee_sign', base64NomineeSign);
            } else {
                formDataToSend.append('nominee_sign', formData.nominee_sign);
            }
    
            // Append all other form fields to FormData
            Object.keys(formData).forEach((key) => {
                if (!['profile_photo', 'sign_photo', 'nominee_photo', 'nominee_sign'].includes(key)) {
                    formDataToSend.append(key, formData[key]);
                }
            });
    
            // Make the API call
            const apiUrl = editingcustomer ? `/employees/${formData.user_id}` : "/register";
            await Axios({
                method: editingcustomer ? "put" : "post",
                url: apiUrl,
                data: formDataToSend,
            });
    
            alert("Customer submitted successfully!");
            setErrors({}); // Clear errors on successful submission
            window.location.reload();
        } catch (error) {
            // Handle errors coming from the API response
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response && error.response.data.error) {
                // If the error is related to email already in use, set it on the email field
                if (error.response.data.error.includes("Email address already in use")) {
                    setErrors({ email: ["Email address already in use."] });
                } else {
                    setErrors({ general: ["An error occurred. Please try again."] });
                }
            } else {
                setErrors({ general: ["An error occurred. Please try again."] });
            }
        }
    };
    
    
    
    
      
      
    // const handleSubmit = async (e) => {
    //     e.preventDefault();
      
    //     if (formData.password !== formData.confirmPassword) {
    //       alert("Passwords do not match!");
    //       return;
    //     }
      
    //     try {
    //       const formDataToSend = new FormData();
      
    //       // Dynamic file handling logic
    //       const filesToConvert = [
    //         { name: 'profile_photo', label: 'Profile Photo' },
    //         { name: 'sign_photo', label: 'Sign Photo' },
    //         { name: 'nominee_photo', label: 'Nominee Photo' },
    //         { name: 'nominee_sign', label: 'Nominee Sign Photo' }
    //       ];
      
    //       for (const { name, label } of filesToConvert) {
    //         const file = formData[name];
      
    //         if (file instanceof File) {
    //           const base64File = await convertFileToBase64(file);
    //           formDataToSend.append(name, base64File);  // Append Base64 string
    //         } else if (file) {
    //           formDataToSend.append(name, file);  // Already a Base64 string
    //         }
    //       }
      
    //       if (formDataToSend.has('profile_photo') || formDataToSend.has('sign_photo') || formDataToSend.has('nominee_photo') || formDataToSend.has('nominee_sign')) {
    //         if (editingcustomer) {
    //           await Axios.put(`/employees/${formData.user_id}`, formDataToSend);
    //           alert('Customer updated successfully!');
    //         } else {
    //           await Axios.post('/register', formDataToSend);
    //           alert('Customer added successfully!');
    //         }
    //         setErrors({});
    //         setShowForm(false);
    //         fetchCustomers();
    //       } else {
    //         alert("No photos selected to submit!");
    //       }
      
    //     } catch (error) {
    //       if (error.response && error.response.data.errors) {
    //         setErrors(error.response.data.errors);
    //       } else {
    //         setErrors({ general: ['An error occurred. Please try again.'] });
    //       }
    //     }
    //   };

    const handleAdd = () => {
        setEditingcustomer(null);
        setFormData({
            user_id: CustomerId,
            user_name: '',
            aadhar_number: '',
            address: '',
            city: '',
            pincode: '',
            district: '',
            user_type: 'user',
            status: 'active',
            mobile_number: '',
            email: '',
            qualification: '',
            password: '',
            confirmPassword: '',
            added_by: localStorage.getItem('user_id'),
           
            designation: '',
            landmark: '',
            alter_mobile_number: '',
            ref_name: '',
            ref_user_id: localStorage.getItem('user_id'),
            ref_aadhar_number: '',
            profile_photo: '',
            sign_photo: '',
            nominee_photo:'',
            nominee_sign:'',
        });
        setShowForm(true);
    };

    useEffect(() => {
        const fetchCities = async () => {
          try {
            const response = await Axios.get("/cities");
            setCities(response.data); 
            // Assuming the response is an array of cities
          } catch (error) {
            console.error("Error fetching cities:", error.message);
          }
        };
        fetchCities();
      }, []);
    
  const handlePincodeChange = (event) => {
        setFormData({
          ...formData,
          pincode: event.target.value,
        });
      };
     
      const handleCityChange = (event, value) => {
        // If "Others" is selected, show the new city input field
        if (value && value.city_name === "Others") {
            setShowNewCityInput(true);
            setFormData((prevData) => ({
                ...prevData,
                city: "", // Clear the city field for custom input
                cityInput: "", // Clear the custom city input
            }));
        } else {
            setShowNewCityInput(false);
            const selectedCity = value ? value.city_name : "";
            const cityData = cities.find(city => city.city_name === selectedCity);
            
            setFormData((prevData) => ({
                ...prevData,
                city: selectedCity,
                cityInput: "", // Clear the custom city input if a city is selected
                pincode: cityData ? cityData.pincode : prevData.pincode, // Retain existing pincode if no city data is found
            }));
        }
    };
    
    
     

    const handleChange = async (e, newValue) => {
        const { name, files, value } = e.target;
    
        // Handle city and pincode selection
        if (newValue) {
            setFormData((prevData) => ({
                ...prevData,
                city: newValue.city_name,
                pincode: newValue.pincode,
            }));
        } else {
            // If no city is selected, retain current values
            setFormData((prevData) => ({
                ...prevData,
                city: prevData.city,
                pincode: prevData.pincode,
            }));
        }
    
        // Handle file uploads for specific fields
        if (files && files.length > 0 && (name === "profile_photo" || name === "nominee_sign" || name === "nominee_photo" || name === "sign_photo")) {
            const file = files[0];
    
            // Check if the selected file is an image
            if (file && file.type.startsWith('image/')) {
                // Use the image resizer to compress and resize the image
                Resizer.imageFileResizer(
                    file,
                    800, // Max width
                    600, // Max height
                    'JPEG', // Format
                    80, // Quality (0 to 100)
                    0, // Rotation
                    (uri) => {
                        // Set Base64 string in formData
                        setFormData((prevData) => ({
                            ...prevData,
                            [name]: uri // Set the compressed Base64 string
                        }));
                    },
                    'base64' // Output type
                );
            } else {
                console.error("Selected file is not an image.");
            }
        } else {
            // Handle text input change
            setFormData((prevData) => ({
                ...prevData,
                [name]: value // Set the text input value
            }));
        }
    };
 
 
    

    // const handleToggleExpand = (id) => {
    //     setExpandedcutomerId(expandedcustomerId === id ? null : id);
    // };

    const handleToggleExpand = async ({ id, user_id }) => {
        const newExpandedId = expandedcustomerId === user_id ? null : user_id;
        setExpandedcutomerId(newExpandedId); // Ensure setExpandedCustomerId is defined
    
        if (newExpandedId) {
            try {
                const response = await Axios.post(`/customers_userid`, {user_id });
                console.log("Customer details:", response.data.user);
                setcustomers(response.data.user); // Ensure setCustomers is defined and response data format is correct
            } catch (error) {
                // console.error("Error fetching customer details:", error);
            }finally {
                setLoading(false); // End loading
            }
        }
    }
    

    const toggleEmployeeStatus = async (employee) => {
        const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    
        try {
            await Axios.put(`/employees/${employee.user_id}`, {
                ...employee,
                status: newStatus
            });
    
            // Update local state
            setcustomers(prevcustomers => 
                prevcustomers.map(emp => 
                    emp.id === employee.id ? { ...emp, status: newStatus } : emp
                )
            );
    
        } catch (error) {
            // console.error('Error updating status:', error);
        }
    };

    return (
        <div className="employeecontainer">
            <Sidebar 
                isSidebarExpanded={isSidebarExpanded} 
                setSidebarExpanded={setSidebarExpanded} 
            />
            <div className="main-content">
              
                
            <div className="table-container-customer">
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button className="small-button" onClick={handleAdd}>Add Customers</button>
        <TextField
            label="Search by Customer name and id"
            variant="outlined"
            fullWidth
            value={searchTerm}
            
            onChange={handleSearchChange}
            InputProps={{
                startAdornment: (
                    <SearchOutlined 
                    className="searchcustomer" 
                    style={{ 
                      marginRight: 8, 
                      backgroundColor: "#fff", // No need for !important in inline styles
                    }} 
                  />
                  
                ),
            }}
            style={{ marginBottom: '20px' ,backgroundColor:"#fff"}}
        />
    </div>

    {/* Render paginated customers */}
    {/* {customerfirst.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((customerfirst) => ( */}
    {paginatedCustomers.map((customerfirst) => (
        <div key={customerfirst.user_id} className="maincard">
            <div className={`employee-card-customer ${expandedcustomerId === customerfirst.user_id ? 'expanded' : ''}`}>
                {/* <div style={{alignItems:"left"  }}  className="employee-header" onClick={() => handleToggleExpand(customerfirst)}>
                    <div style={{  }}><span className="employee-user-id">{customerfirst.user_id}</span></div>
                    <div style={{}}><div><span className="employee-name">{customerfirst.user_name}</span></div></div>
                    <span style={{ marginRight: "5px"}} className={`expand-icon ${expandedcustomerId === customerfirst.user_id ? 'rotate' : ''}`}>
                        <DownOutlined />
                    </span>
                </div> */}


<div 
    style={{ 
        display: "flex", 
        alignItems: "center", 
        padding: "10px" 
    }} 
    className="employee-header" 
    onClick={() => handleToggleExpand(customerfirst)}
>
    <div 
        style={{ 
            // marginRight: "15px", 
            // paddingRight: "10px", 
            width: "80px", /* Fixed width to align items consistently */
            textAlign: "left" /* Ensure text aligns to the left */
        }}
    >
        <span className="employee-user-id">{customerfirst.user_id}</span>
    </div>
    <div 
        style={{ 
            width: "100px",
            textAlign: "left" /* Align the text inside to the left */
        }}
    >
        <div>
            <span>{customerfirst.user_name}</span>
        </div>
    </div>

    <div 
        style={{ 
            width: "50px",
    
            textAlign: "left" /* Align the text inside to the left */
        }}
    >
        <div>
            <span>{customerfirst.city}</span>
        </div>
    </div>
    <span 
        style={{ 
            marginLeft: "auto", 
            marginRight: "5px", 
            transition: "transform 0.3s ease", 
            transform: expandedcustomerId === customerfirst.user_id ? "rotate(180deg)" : "none" 
        }}
        className="expand-icon"
    >
        <DownOutlined />
    </span>
</div>




                {expandedcustomerId === customerfirst.user_id && (
    <div className="employee-details">
        {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <CircularProgress color="primary" />
            </div>
        ) : (
            customer && Object.keys(customer).length > 0 ? (
                <Card variant="outlined" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#FBEFC6' }}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} container justifyContent="flex-end" spacing={1}>
                                <Grid item>
                                    <IconButton onClick={() => handleEdit(customer)} color="primary">
                                        <EditIcon style={{ color: "#07387A" }} />
                                    </IconButton>
                                </Grid>
                                <Grid item>
                                   
<div>
      {/* Delete IconButton */}
      <IconButton onClick={() => handleClickOpen(customerfirst.user_id)} color="secondary">
        <DeleteIcon style={{ color: "red" }} />
      </IconButton>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Customer</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this customer?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            No
          </Button>
          <Button onClick={handleDelete} color="secondary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
                                </Grid>
                            </Grid>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="textSecondary">Mobile Number:</Typography>
                                    <Typography variant="subtitle1">{customer.mobile_number || 'N/A'}</Typography>

                                    <Typography variant="body2" color="textSecondary">Aadhar Number:</Typography>
                                    <Typography variant="subtitle1">{customer.aadhar_number || 'N/A'}</Typography>

                                    <Typography variant="body2" color="textSecondary">Address:</Typography>
                                    <Typography variant="subtitle1">{customer.address || 'N/A'}</Typography>

                                    <Typography variant="body2" color="textSecondary">Landmark:</Typography>
                                    <Typography variant="subtitle1">{customer.landmark || 'N/A'}</Typography>

                                    <Typography variant="body2" color="textSecondary">City:</Typography>
                                    <Typography variant="subtitle1">{customer.city || 'N/A'}</Typography>

                                    <Typography variant="body2" color="textSecondary">Pincode:</Typography>
                                    <Typography variant="subtitle1">{customer.pincode || 'N/A'}</Typography>

                                    <Typography variant="body2" color="textSecondary">District:</Typography>
                                    <Typography variant="subtitle1">{customer.district || 'N/A'}</Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="textSecondary">Status:</Typography>
                                    <Typography variant="subtitle1">{customer.status || 'N/A'}</Typography>

                                    <Typography variant="body2" color="textSecondary">Reference Name:</Typography>
                                    <Typography variant="subtitle1">{customer.ref_name || 'N/A'}, {customer.ref_user_id || 'N/A'}</Typography>

                                    <Typography variant="body2" color="textSecondary">Reference Mobile Number:</Typography>
                                    <Typography variant="subtitle1">{customer.alter_mobile_number || 'N/A'}</Typography>

                                    <Typography variant="body2" color="textSecondary">Reference Aadhar Number:</Typography>
                                    <Typography variant="subtitle1">{customer.ref_aadhar_number || 'N/A'}</Typography>

                                    <Typography variant="body2" color="textSecondary">Qualification:</Typography>
                                    <Typography variant="subtitle1">{customer.qualification || 'N/A'}</Typography>

                                    <Typography variant="body2" color="textSecondary">Designation:</Typography>
                                    <Typography variant="subtitle1">{customer.designation || 'N/A'}</Typography>

                                    <Typography variant="body2" color="textSecondary">Added By:</Typography>
                                    <Typography variant="subtitle1">{customer.added_by || 'N/A'}</Typography>
                                </Grid>
                            </Grid>

                            <Grid container spacing={2} style={{ marginTop: '20px' }}>
                                <Grid item xs={12} sm={6} container direction="column" alignItems="center">
                                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: '8px' }}>Customer Photo</Typography>
                                    <img src={customer.profile_photo || "default_profile_photo_url"} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '8px' }} />
                                </Grid>
                                <Grid item xs={12} sm={6} container direction="column" alignItems="center">
                                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: '8px' }}>Signature Photo</Typography>
                                    <img src={customer.sign_photo || "default_sign_photo_url"} alt="Signature" style={{ width: '100px', height: '100px', borderRadius: '8px' }} />
                                </Grid>
                                <Grid item xs={12} sm={6} container direction="column" alignItems="center">
                                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: '8px' }}>Nominee Photo</Typography>
                                    <img src={customer.nominee_photo || "default_nominee_photo_url"} alt="Nominee" style={{ width: '100px', height: '100px', borderRadius: '8px' }} />
                                </Grid>
                                <Grid item xs={12} sm={6} container direction="column" alignItems="center">
                                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: '8px' }}>Nominee Signature Photo</Typography>
                                    <img src={customer.nominee_sign || "default_nominee_sign_photo_url"} alt="Nominee Signature" style={{ width: '100px', height: '100px', borderRadius: '8px' }} />
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            ) : (
                // Display CircularProgress if data is empty and loading is false
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                    <CircularProgress color="primary" />
                </div>
            )
        )}
    </div>
)}

            </div>
        </div>
    ))}

    {/* Pagination Controls */}
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
    <Stack spacing={2}>
        <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, value) => handlePageChange(value)}
            siblingCount={1}  // Adjust the number of pages to show around the current page
            boundaryCount={1}  // Show boundaries (1st and last pages)
            color="primary"
            showFirstButton
            showLastButton
        />
    </Stack>
</div>
    {/* <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <Button
            variant="outlined"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
        >
            Previous
        </Button>
        <span style={{ margin: '0 10px' }}>Page {currentPage} of {totalPages}</span>
        <Button
            variant="outlined"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
        >
            Next
        </Button>
    </div> */}
</div>
<Dialog 
    open={showForm} 
    onClose={() => setShowForm(false)} 
    fullWidth 
    maxWidth="sm" 
    PaperProps={{
        style: { backgroundColor: '#fff' }
    }}
>
                    <DialogContent>
                        <h3 style={{color:"#07387A"}}>{editingcustomer ? 'Edit Customer' : 'Add Customer'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>Customer ID:</label>
                                <input type="text" name="user_id" value={formData.user_id} onChange={handleChange} readOnly />
                                {errors.user_id && <span className="error">{errors.user_id[0]}</span>}
                            </div>
                            <div>
                                <label>Customer Name:</label>
                                <input type="text" name="user_name" value={formData.user_name} onChange={handleChange}  />
                                {errors.user_name && <span className="error">{errors.user_name[0]}</span>}
                            </div>
                            {/* Add other form fields here */}
                            <div>
                                <label>Aadhar Number:</label>
                                <input type="text" name="aadhar_number" value={formData.aadhar_number} onChange={handleChange}  />
                                {errors.aadhar_number && <span className="error">{errors.aadhar_number[0]}</span>}

                            </div>
                            <div>
                                <label>Address:</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange}  />
                                {errors.address && <span className="error">{errors.address[0]}</span>}
                            </div>
                            <div>
                            <label>City:</label>
                <Autocomplete
                  options={options} // Use the populated cities array
                  getOptionLabel={(option) => option.city_name}
                  onChange={handleCityChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="City"
                      variant="outlined"
                      error={!!errors.city}
                      helperText={errors.city && errors.city[0]}
                      onChange={(e) => {
                        setFormData((prevData) => ({
                          ...prevData,
                          city: e.target.value, // Allow typing in the input
                        }));
                      }}
                      sx={{backgroundColor:"#fff",color:"#000"}}
                    />
                  )}
                  noOptionsText="No cities found"
                />
              </div>

              {/* Conditionally render the new city input field */}
              {showNewCityInput && (
                <div>
                  <label> City:</label>
                  <input
                    type="text"
                    name="cityInput"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        city: e.target.value, // Update the new city input
                      }))
                    }
                  />
                  {errors.cityInput && (
                    <span className="error">{errors.cityInput[0]}</span>
                  )}
                </div>
              )}
                            <div>
                <label>Pincode:</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handlePincodeChange}
                />
                {errors.pincode && (
                  <span className="error">{errors.pincode[0]}</span>
                )}
              </div>
              <div>
    <label>District:</label>
    <select 
        name="district" 
        value={formData.district} 
        onChange={handleChange}
        sx={{backgroundColor:"#fff"}}
    >
         <option sx={{backgroundColor:"#fff"}} value="">Select a district</option>
        <option  value="tirunelveli">Tirunelveli</option>
        <option value="tenkasi">Tenkasi</option>
        <option value="Virudhunagar">Virudhunagar</option>
        <option value="kerala">Kerala</option>

        <option value="others">Others</option> label="Virudhunagar" value="virudhunagar"
       
    </select>
    {errors.district && <span className="error">{errors.district[0]}</span>}
</div>

         <div>
            <label>Mobile Number:</label>
            <input type="text" name="mobile_number" value={formData.mobile_number} onChange={handleChange}  />
            {errors.mobile_number && <span className="error">{errors.mobile_number[0]}</span>}
         </div>

     <div>
    <label>Email:</label>
    <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
    />
    {errors.email && <span className="error">{errors.email[0]}</span>}
</div>

                            <div>
                                <label>Qualification:</label>
                                <input type="text" name="qualification" value={formData.qualification} onChange={handleChange}  />
                                {errors.qualification && <span className="error">{errors.qualification[0]}</span>}
                            </div>
                            <div>
                <label>Password:</label>
                <TextField
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    variant="outlined"
                    style={{
                        width: '100%', // Set width to 100% to fit the container
                        height: '40px', // Adjust height as needed
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                {errors.password && <span className="error">{errors.password[0]}</span>}
            </div>
            <div>
                <label>Confirm Password:</label>
                <TextField
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    variant="outlined"
                    style={{
                        width: '100%', // Set width to 100% to fit the container
                        height: '40px', // Adjust height as needed
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword[0]}</span>}
            </div>

                            <div>
                                <label>Designation:</label>
                                <input type="text" name="designation" value={formData.designation} onChange={handleChange} />
                                {errors.designation && <span className="error">{errors.designation[0]}</span>}
                            </div>
                            <div>
                                <label>Landmark:</label>
                                <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} />
                                {errors.landmark && <span className="error">{errors.landmark[0]}</span>}
                            </div>
                          
                            <div>
                                <label>Nominee Name:</label>
                                <input type="text" name="ref_name" value={formData.ref_name} onChange={handleChange} />
                                {errors.ref_name && <span className="error">{errors.ref_name[0]}</span>}
                            </div>
                           
                            <div>
                                <label>Nominee Aadhar Number:</label>
                                <input type="text" name="ref_aadhar_number" value={formData.ref_aadhar_number} onChange={handleChange} />
                                {errors.ref_aadhar_number && <span className="error">{errors.ref_aadhar_number[0]}</span>}
                            </div> 
                             <div>
                                <label>Nominee Mobile Number:</label>
                                <input type="text" name="alter_mobile_number" value={formData.alter_mobile_number} onChange={handleChange}  />
                                {errors.alter_mobile_number && <span className="error">{errors.alter_mobile_number[0]}</span>}
                                
                            </div>
                            <div>
                                <label>Reference User ID:</label>
                                <input type="text" name="ref_user_id" value={formData.ref_user_id} onChange={handleChange} />
                                {errors.ref_user_id && <span className="error">{errors.ref_user_id[0]}</span>}
                            </div>
                            
                            <div class="customer-nominee-container">
   
    <div class="customer-section">
      
        <div>
            <label>Customer Photo:</label>
            <input type="file" name="profile_photo" onChange={handleFileChange} accept="image/*" />
            {errors.profile_photo && <span className="error">{errors.profile_photo[0]}</span>}
        </div>
        <div>
            <label>Customer Sign:</label>
            <input type="file" name="sign_photo" onChange={handleFileChange} accept="image/*" />
            {errors.sign_photo && <span className="error">{errors.sign_photo[0]}</span>}
        </div>
    </div>

  
    <div class="nominee-section">
        
        <div>
            <label>Nominee Photo:</label>
            <input type="file" name="nominee_photo" onChange={handleFileChange} accept="image/*" />
            {errors.nominee_photo && <span className="error">{errors.nominee_photo[0]}</span>}
        </div>
        <div>
            <label>Nominee Sign:</label>
            <input type="file" name="nominee_sign" onChange={handleFileChange} accept="image/*" />
            {errors.nominee_sign && <span className="error">{errors.nominee_sign[0]}</span>}
        </div>
    </div>
</div>

            <div style={{ 
               position: 'sticky', 
               bottom: 0, 
               backgroundColor: 'rgba(255, 255, 255, 0.7)', // Set a white background with 80% opacity
               padding: '16px', 
               zIndex: 1,
               display: 'flex', // Align buttons in a row
               justifyContent: 'flex-end', // Align buttons to the right
            }}>
                <Button
  type="submit"
  variant="contained"
  sx={{
    marginRight: 2, // Material-UI uses spacing units; 2 = 8px
    color: '#fff', // Text color
    backgroundColor: '#07387A', // Optional background color if desired
    '&:hover': {
      backgroundColor: '#D6A300', // Change background on hover
    },
  }}
>
  {editingcustomer ? 'Update Customer' : 'Add Customer'}
</Button>

                <Button 
                        type="button"  
                        style={{ 
                            backgroundColor: '#f44336', // Set your desired color (example: red)
                            color: 'white', // Ensure text is visible against the background
                            marginLeft: 8, // Optional: add spacing from the previous button
                            borderRadius: 4 // Optional: adjust border radius for a rounded look
                        }} 
                        onClick={() => setShowForm(false)}
                    >
                        Cancel
                    </Button>

                       </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Customer;
