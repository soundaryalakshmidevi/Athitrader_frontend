import React, { useState, useEffect } from "react";
import Axios from "../Axios";
import "../Employee.css"; // Assuming you have a CSS file for styling
import Sidebar from "./Sidebar";
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add'; // Import your icon
import { useMediaQuery } from '@mui/material';
import { DownOutlined } from "@ant-design/icons"; // Import the DownOutlined icon from Ant Design
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Switch,Select,MenuItem, FormControl, InputLabel } from "@mui/material";
import Resizer from 'react-image-file-resizer';
import CircularProgress from '@mui/material/CircularProgress';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box, Card, CardContent, Typography, Grid,Divider ,IconButton 
} from "@mui/material";
import {} from '@mui/material';
import {InputAdornment, TextField, Autocomplete } from "@mui/material";
import { Pin } from "@mui/icons-material";


import { Visibility, VisibilityOff } from '@mui/icons-material';

const Employee = () => {
  const [employeesfirst, setEmployeesfirst] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [errors, setErrors] = useState({});
  const [cities, setCities] = useState([]); // State to store cities
  const city = [];
  const [formData, setFormData] = useState({
    user_id: "",
    user_name: "",
    aadhar_number: "",
    address: "",
    city: "",
    pincode: "",
    district: "",
    user_type: "employee",
    status: "active", // Default status
    mobile_number: "",
    email: "",
    qualification: "",
    password: "",
    confirmPassword: "", // Added confirm password
    added_by: "",
    profile_photo: "", // For profile photo
    designation: "", // Designation
    landmark: "", // Landmark
    alter_mobile_number: "", // Alternate Number
    ref_name: "", // Reference Number
    ref_user_id: "", // Reference User ID
    ref_aadhar_number: "", // Reference Aadhar Number
    sign_photo: "", // For signature photo
  });
  const [showDetails, setShowDetails] = useState(false);
  const [originalPhotos, setOriginalPhotos] = useState({
    profile_photo: null,
    sign_photo: null,
  });
  const options = [...cities, { city_name: "Others" }]; // Include "Others" in the options
  const [loading, setLoading] = useState(false);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null); // State to manage expanded employees
  const [showNewCityInput, setShowNewCityInput] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const commonStyles = {
    backgroundColor: 'rgba(60, 179, 113, 0.3)', // Medium Sea Green with 30% opacity
    padding: '5px', // Padding around the text
    borderRadius: '4px', // Rounded corners
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)', // Subtle shadow effect
    color: '#000', // Black text color
    fontWeight: 'bold', // Bold text
   
};

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const reference_name = localStorage.getItem("ref_name");
    const reference_aadhar_number = localStorage.getItem("ref_aadhar_number");
    console.log("ref_name", reference_name);

    if (userId) {
      setFormData((prevData) => ({
        ...prevData,
        added_by: userId,
        ref_user_id: userId,
        ref_name: reference_name,
        ref_aadhar_number: reference_aadhar_number,
      }));
    }
  }, []);



  const fetchEmployees = async () => {
    try {
      const response = await Axios.get("/employees");
      setEmployeesfirst(response.data.message);
      
      if (response.data.message.profile_photo) {
        const base64String = response.data.message.profile_photo;

        if (!base64String.startsWith("data:image")) {
          const base64Image = `data:image/jpeg;base64,${base64String}`;
          console.log("base64Photo:", base64Image);
          setProfilePhoto(base64Image);
        } else {
          setProfilePhoto(base64String);
        }
      }

      console.log(response.data);
    } catch (error) {
      // console.error("Error fetching employees:", error.message);
    }
    setLoading(true); 
  };

    // Fetch employees when the component mounts
    useEffect(() => {
      fetchEmployees();
    }, []);
    
    const handleDelete = async (id) => {
      console.log("Employees list before delete:", employees);
      
      // Confirm the deletion action
      if (window.confirm("Are you sure you want to delete this employee?")) {
        try {
          // Attempt to delete the employee from the server
          await Axios.delete(`/user/${id}`);
          
          // Ensure that `employees` is an array before filtering
          if (Array.isArray(employees)) {
            setEmployees(employees.filter((employee) => employee.user_id !== id));
            alert("Employee deleted successfully!");
            window.location.reload();
          } else {
            // throw new Error("Employees list is not an array");
          }
        } catch (error) {
          // Handle errors by displaying the error message
          alert("Error deleting employee: " + error.message);
        }
      }
    };
    
    

// Helper function to convert Base64 string to File
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
    // Extract MIME type and Base64 content from the string
    const [metadata, base64Content] = base64String.split(',');
    const mimeType = metadata.split(':')[1].split(';')[0];  // Extract MIME type dynamically

    // Decode the base64 content into byte characters
    const byteCharacters = atob(base64Content);
    const byteArrays = [];

    // Convert each chunk of base64 data to byte arrays
    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      byteArrays.push(new Uint8Array(byteNumbers)); // Push byte array to the array of byte arrays
    }

    // Create a blob from the byte arrays and set the correct MIME type
    const blob = new Blob(byteArrays, { type: mimeType });

    // Create the File object
    const file = new File([blob], fileName, { type: mimeType });

    // Log the File object to the console
    console.log(file);

    // Return the File object
    return file;

  } catch (error) {
    console.error("Error converting base64 to file:", error);
    return null; // Return null if an error occurs
  }
};



const handleEdit = async (employees) => {
  console.log("Employee data received for editing:", employees);

  setEditingEmployee(employees); // For reference in the edit state

  // If profile photo is Base64, convert it to File
  const profilePhotoFile = employees.profile_photo ? base64ToFile(employees.profile_photo, 'profile_photo.jpg') : null;
  const signPhotoFile = employees.sign_photo ? base64ToFile(employees.sign_photo, 'sign_photo.jpg') : null;

  setFormData({
    user_id: employees.user_id || "",
    user_name: employees.user_name || "",
    aadhar_number: employees.aadhar_number || "",
    address: employees.address || "",
    city: employees.city || "",
    pincode: employees.pincode || "",
    district: employees.district || "",
    user_type: employees.user_type || "employee", // Default to "employee" if not found
    status: employees.status || "active", // Default to "active" if not found
    mobile_number: employees.mobile_number || "",
    email: employees.email || "",
    qualification: employees.qualification || "",
    password: "", // Keep password empty for editing
    confirmPassword: "", // Keep confirm password empty for editing

    designation: employees.designation || "",
    landmark: employees.landmark || "",
    alter_mobile_number: employees.alter_mobile_number || "",
    ref_user_id: employees.ref_user_id || localStorage.getItem("user_id"), // Default to localStorage user_id if ref_user_id is missing
    ref_aadhar_number: employees.ref_aadhar_number || "",

    // Set the profile and sign photo if available or keep null if no new photo is selected
    profile_photo: profilePhotoFile || null,
    sign_photo: signPhotoFile || null,
  });

  setShowForm(true); // Open the form for editing
};


const handleFileChange = (e) => {
  const { name, files } = e.target;
  const file = files[0]; // Get the selected file

  if (file) {
    // If a file is selected, convert it to Base64
    convertFileToBase64(file).then((base64Image) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: base64Image, // Set the Base64 string in the form data
      }));
    }).catch((err) => {
      console.error("Error converting file to Base64", err);
    });
  } else {
    // If no file is selected, retain the old value
    setFormData((prevState) => ({
      ...prevState,
      [name]: prevState[name], // Keep the existing value in the form data
    }));
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();

  // Check if passwords match
  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const formDataToSend = new FormData();

    // If profile photo is a File, convert it to base64 before sending
    if (formData.profile_photo instanceof File) {
      const base64ProfileImage = await convertFileToBase64(formData.profile_photo);
      formDataToSend.append('profile_photo', base64ProfileImage);  // Add base64 string to FormData
    } else {
      formDataToSend.append('profile_photo', formData.profile_photo);  // Otherwise, send the base64 string if already present
    }

    // If sign photo is a File, convert it to base64 before sending
    if (formData.sign_photo instanceof File) {
      const base64SignImage = await convertFileToBase64(formData.sign_photo);
      formDataToSend.append('sign_photo', base64SignImage);  // Add base64 string to FormData
    } else {
      formDataToSend.append('sign_photo', formData.sign_photo);  // Otherwise, send the base64 string if already present
    }

    // Append all other form data to FormData object
    for (const key in formData) {
      if (formData.hasOwnProperty(key) && key !== 'profile_photo' && key !== 'sign_photo') {  // Skip profile_photo and sign_photo if already added
        formDataToSend.append(key, formData[key]);
      }
    }

    // API call for adding/updating employee
    const apiUrl = editingEmployee
      ? await Axios.put(`/employees/${formData.user_id}`, formDataToSend)
      : await Axios.post("/register", formDataToSend);

    alert("Employee submitted successfully!");
   
    setErrors({}); // Clear errors on successful submission
    window.location.reload();
  } catch (error) {
    if (error.response && error.response.data.errors) {
      setErrors(error.response.data.errors);
    } else {
      setErrors({ general: ["An error occurred. Please try again."] });
    }
  }
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

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      user_id: "",
      user_name: "",
      aadhar_number: "",
      address: "",
      city: "",
      pincode: "",
      district: "",
      user_type: "employee",
      status: "active", // Default status
      mobile_number: "",
      email: "",
      qualification: "",
      password: "",
      confirmPassword: "", // Keep confirm password empty
      added_by: localStorage.getItem("user_id"),
      profile_photo: "", // For profile photo
      designation: "", // Designation
      landmark: "", // Landmark
      alter_mobile_number: "", // Alternate Number
      ref_name: "", // Reference Number
      ref_user_id: localStorage.getItem("user_id"), // Default to localStorage user_id
      ref_aadhar_number: "", // Reference Aadhar Number
      sign_photo: "", // For signature photo
    });
    setShowForm(true);
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
    if (files && files.length > 0 && (name === "profile_photo" || name === "sign_photo")) {
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




  const handlePincodeChange = (event) => {
    setFormData({
      ...formData,
      pincode: event.target.value,
    });
  };


  // Function to toggle employee details
  // const handleToggleExpand = (id) => {
  //   setExpandedEmployeeId(expandedEmployeeId === id ? null : id);
  // };
  // const handleToggleExpand = async ({ id, user_id }) => {
  //   const newExpandedId = expandedEmployeeId === user_id ? null : user_id;
  //   setExpandedEmployeeId(newExpandedId);
  
  //   if (newExpandedId) {
  //     try {
  //       const response = await Axios.post(`/employees_userid`, {user_id });
  //       console.log("Employee details:", response.data.users); // Check if this logs the expected employee object
  //       // console.log("status",response.data.user.status);
  //       setEmployees(response.data.users); // Make sure this is an employee object, not an array
  //     } catch (error) {
  //       console.error("Error fetching employee details:", error);
  //     }
  //   }
  // };
 
  const handleToggleExpand = async ({ id, user_id }) => {
    const newExpandedId = expandedEmployeeId === user_id ? null : user_id;
    setExpandedEmployeeId(newExpandedId); // Ensure setExpandedCustomerId is defined

    if (newExpandedId) {
        try {
            const response = await Axios.post(`/employees_userid`, {user_id });
            console.log("Customer details:", response.data.users);
            setEmployees(response.data.users); // Ensure setCustomers is defined and response data format is correct
        } catch (error) {
            // console.error("Error fetching customer details:", error);
        }finally {
                setLoading(false); // End loading
            }
    }
}
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

  return (
    <div className="employeecontainer">
        <Sidebar 
                isSidebarExpanded={isSidebarExpanded} 
                setSidebarExpanded={setSidebarExpanded} 
            />
      <div  className="main-content">
        
          <>
            {/* <button className="small-button" onClick={handleAdd}>
              Add Employee
            </button> */}
            {/* {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                  <CircularProgress color="inherit" />
                </Box>
              ) : ( */}
<div className="table-container-employee">
        <button className="small-button" onClick={handleAdd}>
              Add Employee
            </button>
  {Array.isArray(employeesfirst) &&
    employeesfirst.map((employeesfirst) => (
      <div className="maincard" key={employeesfirst.id}>
        <div className={`employee-card-employee ${expandedEmployeeId === employeesfirst.user_id ? "expanded" : ""}`}>
        <div className="employee-header" onClick={() => handleToggleExpand({ id: employeesfirst.id, user_id: employeesfirst.user_id })}>
  <div>
    <img
      src={employeesfirst.profile_photo}
      alt="Profile"
      style={{
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        objectFit: "cover",
        marginRight: "15px",
      }}
    />
  </div>
  <div style={{ marginRight: "15px" }}> {/* Add right margin */}
    <span className="employee-user-id">{employeesfirst.user_id}</span>
  </div>
  <div style={{ marginRight: "15px" }}> {/* Add right margin */}
    <span className="employee-name">{employeesfirst.user_name}</span>
  </div>
  <span className={`expand-icon ${expandedEmployeeId === employeesfirst.user_id ? "rotate" : ""}`}>
    <DownOutlined />
  </span>
</div>


{expandedEmployeeId === employeesfirst.user_id && (
  <div className="employee-details">
    {loading ? (
      // Show CircularProgress while loading
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <CircularProgress color="primary" />
      </div>
    ) : !employees || Object.keys(employees).length === 0 ? (
      // Show CircularProgress if data is empty and loading is false
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <CircularProgress color="primary" />
      </div>
    ) : (
      <Card variant="outlined" style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(209, 241, 221, 1)' }}>
        <CardContent>
          <Grid container spacing={2}>
            {/* Action Buttons */}
            <Grid item xs={12} container justifyContent="flex-end" spacing={1}>
              <Grid item>
                <IconButton onClick={() => handleEdit(employees)} color="primary">
                  <EditIcon style={{ color: "green" }} />
                </IconButton>
              </Grid>
              <Grid item>
                <IconButton onClick={() => handleDelete(employeesfirst.user_id)} color="secondary">
                  <DeleteIcon style={{ color: "red" }} />
                </IconButton>
              </Grid>
            </Grid>

            {/* Split Content into Left and Right Columns */}
            <Grid container spacing={2}>
              {/* Left Column */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Mobile Number:</Typography>
                <Typography variant="subtitle1">
                    <span style={commonStyles}>
                        {employees.mobile_number || 'null'}
                    </span>
                </Typography>

                <Typography variant="body2" color="textSecondary">Aadhar Number:</Typography>
                <Typography variant="subtitle1">
                    <span style={commonStyles}>
                        {employees.aadhar_number || 'null'}
                    </span>
                </Typography>

                <Typography variant="body2" color="textSecondary">Address:</Typography>
                <Typography variant="subtitle1">
                    <span style={commonStyles}>
                        {employees.address || 'null'}
                    </span>
                </Typography>

                <Typography variant="body2" color="textSecondary">Landmark:</Typography>
                <Typography variant="subtitle1">
                    <span style={commonStyles}>
                        {employees.landmark || 'null'}
                    </span>
                </Typography>

                <Typography variant="body2" color="textSecondary">City:</Typography>
                <Typography variant="subtitle1">
                    <span style={commonStyles}>
                        {employees.city || 'null'}
                    </span>
                </Typography>

                <Typography variant="body2" color="textSecondary">Pincode:</Typography>
                <Typography variant="subtitle1">
                    <span style={commonStyles}>
                        {employees.pincode || 'null'}
                    </span>
                </Typography>

                <Typography variant="body2" color="textSecondary">District:</Typography>
                <Typography variant="subtitle1">
                    <span style={commonStyles}>
                        {employees.district || 'null'}
                    </span>
                </Typography>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Status:</Typography>
                <Typography variant="subtitle1">
                    <span style={commonStyles}>{employees.status || 'null'}</span>
                </Typography>

                <Typography variant="body2" color="textSecondary">Email:</Typography>
                <Typography variant="subtitle1">
                    <span style={commonStyles}>{employees.email || 'null'}</span>
                </Typography>

                <Typography variant="body2" color="textSecondary">Reference Name:</Typography>
                <Typography variant="subtitle1">
                    <span style={commonStyles}>
                        {employees.ref_name || 'null'}, {employees.ref_user_id || 'null'}
                    </span>
                </Typography>

                <Typography variant="body2" color="textSecondary">Qualification:</Typography>
                <Typography variant="subtitle1">
                    <span style={commonStyles}>{employees.qualification || 'null'}</span>
                </Typography>

                <Typography variant="body2" color="textSecondary">Designation:</Typography>
                <Typography variant="subtitle1">
                    <span style={commonStyles}>{employees.designation || 'null'}</span>
                </Typography>

                <Typography variant="body2" color="textSecondary">Added By:</Typography>
                <Typography variant="subtitle1">
                    <span style={commonStyles}>{employees.added_by || 'null'}</span>
                </Typography>
              </Grid>
            </Grid>

            {/* Divider Line */}
            <Grid item xs={12}>
              <Divider style={{ margin: '20px 0' }} />
            </Grid>

            {/* Photo Section */}
            <Grid container spacing={2} style={{ marginTop: '20px' }}>
              {/* Profile Photo Section */}
              <Grid item xs={12} sm={6} container direction="column" alignItems="center">
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: '8px' }}>Employee Photo</Typography>
                <img 
                  src={employees.profile_photo || "default_profile_photo_url"} 
                  alt="Profile" 
                  style={{ width: '100px', height: '100px', borderRadius: '8px' }} 
                />
              </Grid>

              {/* Signature Photo Section */}
              <Grid item xs={12} sm={6} container direction="column" alignItems="center">
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: '8px' }}>Signature Photo</Typography>
                <img 
                  src={employees.sign_photo || "default_sign_photo_url"} 
                  alt="Signature" 
                  style={{ width: '100px', height: '100px', borderRadius: '8px' }} 
                />
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )}
  </div>
)}

        </div>
      </div>
    ))}
</div>



 {/* )} */}
          </>
   
        
          <Dialog
  open={showForm}
  onClose={() => setShowForm(false)}
  fullWidth
  maxWidth="md"
  sx={{
    '& .MuiDialog-paper': {
      minWidth: '400px',
      maxWidth: '400px',
      margin: '16px', // Margin around the dialog
      padding: '16px', // Padding inside the dialog
      backgroundColor: 'rgb(209, 241, 221)', // Background color for the dialog
    },
  }}
>
  <DialogTitle>
    {editingEmployee ? "Edit Employee" : "Add Employee"}
  </DialogTitle>
  <DialogContent>
    <form onSubmit={handleSubmit}>
      <div>
        <label>Employee ID:</label>
        <input
          type="text"
          name="user_id"
          value={formData.user_id}
          onChange={handleChange}
        />
        {errors.user_id && (
          <span className="error">{errors.user_id[0]}</span>
        )}
      </div>
      <div>
        <label>Employee Name:</label>
        <input
          type="text"
          name="user_name"
          value={formData.user_name}
          onChange={handleChange}
        />
        {errors.user_name && (
          <span className="error">{errors.user_name[0]}</span>
        )}
      </div>
      <div>
        <label>Aadhar Number:</label>
        <input
          type="text"
          name="aadhar_number"
          value={formData.aadhar_number}
          onChange={handleChange}
        />
        {errors.aadhar_number && (
          <span className="error">{errors.aadhar_number[0]}</span>
        )}
      </div>
      <div>
        <label>Address:</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
        {errors.address && (
          <span className="error">{errors.address[0]}</span>
        )}
      </div>

      <div>
        <Autocomplete
          options={options} // Use the populated cities array
          getOptionLabel={(options) => options.city_name}
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
            value={formData.cityInput}
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
  >
    <option value="tirunelveli">Tirunelveli</option>
    <option value="tenkasi">Tenkasi</option>
    <option value="Virudhunagar">Virudhunagar</option>
    <option value="kerala">Kerala</option>
    <option value="others">Others</option>
  </select>
  {errors.district && (
    <span className="error">{errors.district[0]}</span>
  )}
</div>

      <div>
        <label>Mobile Number:</label>
        <input
          type="text"
          name="mobile_number"
          value={formData.mobile_number}
          onChange={handleChange}
        />
        {errors.mobile_number && (
          <span className="error">{errors.mobile_number[0]}</span>
        )}
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && (
          <span className="error">{errors.email[0]}</span>
        )}
      </div>
      <div>
        <label>Qualification:</label>
        <input
          type="text"
          name="qualification"
          value={formData.qualification}
          onChange={handleChange}
        />
        {errors.qualification && (
          <span className="error">{errors.qualification[0]}</span>
        )}
      </div>
      <div>
        <label>Password:</label>
        <TextField
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          variant="outlined"
          sx={{
            width: '100%', // Set width to 100% to fit the container
            height: '56px', // Set the height to match other input fields (default Material-UI TextField height)
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
        {errors.password && (
          <span className="error">{errors.password[0]}</span>
        )}
      </div>

      <div>
        <label>Confirm Password:</label>
        <TextField
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          variant="outlined"
          sx={{
            width: '100%', // Set width to 100% to fit the container
            height: '56px', // Set the height to match other input fields
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
      </div>

      <div>
        <label>Designation:</label>
        <input
          type="text"
          name="designation"
          value={formData.designation}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Landmark:</label>
        <input
          type="text"
          name="landmark"
          value={formData.landmark}
          onChange={handleChange}
        />
      </div>

      <div>
        <FormControl fullWidth variant="outlined">
          <label>Status:</label>
          <Select
            labelId="status-label"
            name="status"
            value={formData.status}
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </div>

      <div>
  <label>Profile Photo:</label>
  <input
    type="file"
    name="profile_photo"
    onChange={handleFileChange} // Using handleFileChange here
    accept="image/*"
  />
   {errors.profile_photo && (
          <span className="profile_photo">{errors.profile_photo[0]}</span>
        )}
</div>

<div>
  <label>Signature Photo:</label>
  <input
    type="file"
    name="sign_photo"
    onChange={handleFileChange} // Using handleFileChange here
    accept="image/*"
  />
   {errors.sign_photo && (
          <span className="sign_photo">{errors.sign_photo[0]}</span>
        )}
</div>

<DialogActions
  sx={{
    position: 'sticky',
    bottom: 0, // This will ensure it's stuck to the bottom
    zIndex: 100, // Ensure it stays on top of any other content
    backgroundColor: 'white', // Optional: to ensure background color if content scrolls behind
    padding: '16px', // Adjust padding to match your layout
  }}
>
  <Button
    type="submit" // Ensure this is inside the form
    sx={{
      color: 'white', // Set text color to white
      backgroundColor: '#007bff', // Button color for "Add Employee" or "Update Employee"
      '&:hover': {
        backgroundColor: '#0056b3', // Darker shade on hover
      },
    }}
  >
    {useMediaQuery('(max-width:600px)') ? <AddIcon /> : (editingEmployee ? "Update" : "Add ")}
  </Button>

  <Button
    onClick={() => setShowForm(false)}
    sx={{
      color: 'white', // Set text color to white
      backgroundColor: 'red', // Button color for "Cancel"
      '&:hover': {
        backgroundColor: 'darkred', // Darker shade on hover
      },
    }}
  >
    {useMediaQuery('(max-width:600px)') ? <CancelIcon /> : "Cancel"}
  </Button>
</DialogActions>

      {/* <DialogActions>
        <Button
          type="submit" // Ensure this is inside the form
          sx={{
            color: 'white', // Set text color to white
            backgroundColor: '#007bff', // Button color for "Add Employee" or "Update Employee"
            '&:hover': {
              backgroundColor: '#0056b3', // Darker shade on hover
            },
          }}
        >
          {useMediaQuery('(max-width:600px)') ? <AddIcon /> : (editingEmployee ? "Update" : "Add ")}
        </Button>

        <Button
          onClick={() => setShowForm(false)}
          sx={{
            color: 'white', // Set text color to white
            backgroundColor: 'red', // Button color for "Cancel"
            '&:hover': {
              backgroundColor: 'darkred', // Darker shade on hover
            },
          }}
        >
          {useMediaQuery('(max-width:600px)') ? <CancelIcon /> : "Cancel"}
        </Button>
      </DialogActions> */}
    </form>
  </DialogContent>
</Dialog>

      </div>
    </div>
  );
};

export default Employee;
