import React, { useState, useEffect } from 'react';
import Axios from "../Axios";
import '../component/Loan.css';
import Sidebar from './Sidebar';
import { Box, Typography, IconButton } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button,Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DownOutlined, SearchOutlined } from '@ant-design/icons'; // Import Search Icon
import imageCompression from 'browser-image-compression';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router-dom';
import { CircularProgress } from "@mui/material";
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const commonStyles = {
    backgroundColor: 'rgba(60, 179, 113, 0.3)', // Medium Sea Green with 30% opacity
    padding: '5px', // Padding around the text
    borderRadius: '4px', // Rounded corners
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)', // Subtle shadow effect
    color: '#000', // Black text color
    fontWeight: 'bold', // Bold text
   
};
const addWeeks = (date, weeks) => {
    const result = new Date(date);
    result.setDate(result.getDate() + weeks * 7);
    return result;
};

const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};

const Loan = () => {
    const [loans, setLoans] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingLoan, setEditingLoan] = useState(null);
    const [expandedLoanId, setExpandedloanId] = useState(null);
    // const [expandedLoanId, setExpandedLoanId] = useState(null);
    const [loanCategories, setLoanCategories] = useState([]);
    const [users, setUsers] = useState([]); // State to hold user list
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // Search term state
    const [formData, setFormData] = useState({
        // loan_id: '',
        category_id: '',
        user_id: '',
        loan_amount: '',
        loan_date: '',
        loan_closed_date: '',
        employee_id: '',
        status: '',
        image:'',
    });
    const [isSidebarExpanded, setSidebarExpanded] = useState(true);
    const [status, setStatus] = useState(); 
    const [loanDetails, setLoanDetails] = useState(null);
    const navigate = useNavigate();
    const [loanItem, setLoanItem] = useState(null);
    const fetchLoanDetails = async (loan_id) => {
        try {
            const response = await Axios.get(`/loandetails/${loan_id}`);
            setLoanDetails(response.data.loan);
        } catch (error) {
            console.error("Failed to fetch loan details:", error);
        }
    };
    const handleExpand = (loanId) => {
        if (expandedLoanId === loanId) {
            // Collapse the current loan if it's already expanded
            setExpandedloanId(null);
            setLoanDetails(null);
        } else {
            // Expand the selected loan and fetch details
            setExpandedloanId(loanId);
            fetchLoanDetails(loanId);
        }
    };
    
    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        if (userId) {
            console.log("User ID from localStorage:", userId); // Log the user ID
            setFormData((prevData) => ({
                ...prevData,
                employee_id: userId,
            }));
        } else {
            console.log("No user ID found in localStorage.");
        }
    }, []);
    
    

    // Fetch loan categories and loans when the component mounts
    useEffect(() => {
        fetchLoanCategories();
        fetchLoan();
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await Axios.get('/all-users');
            
            // Check if the response contains an array of users in 'message'
            if (Array.isArray(response.data.message)) {
                setUsers(response.data.message); // Store users in state
            } else {
                console.error('Expected array but got:', response.data);
            }
        } catch (error) {
            // alert('Error fetching user details: ' + error.message);
        }
    };
    

    const fetchLoanCategories = async () => {
        try {
            const response = await Axios.get('/loan-category');

            // Access the 'message' field which contains the actual loan categories
            if (Array.isArray(response.data.message)) {
                setLoanCategories(response.data.message); // Use 'message' field
            } else {
                setLoanCategories([]); // Handle unexpected response
                console.error('Expected array but got:', response.data);
            }
        } catch (error) {
            // alert('Error fetching loan categories: ' + error.message);
        }
    };

   
    const fetchLoan = async () => {
        try {
            const response = await Axios.get('/loan'); // Fetch loans
            console.log(response.data); // Inspect the response
    
            if (response.data.loans && Array.isArray(response.data.loans)) {
                console.log("All Loans:", response.data.loans);
                setLoans(response.data.loans); // Set the loans state
    
                // Fetch user details for each loan
                const loanWithUserDetails = await Promise.all(response.data.loans.map(async (loan) => {
                    try {
                        const userResponse = await Axios.get(`/profile/${loan.user_id}`); 
                        console.log(`User details for loan ${loan.id}:`, userResponse.data);
                        return { ...loan, userDetails: userResponse.data.message }; 
                     
                    } catch (userError) {
                        console.error(`Error fetching user details for loan ${loan.id}:`, userError);
                        return { ...loan, userDetails: null }; // Handle error case, set userDetails as null
                    }
                }));
    
                // Update state with loan data along with user details
                setLoans(loanWithUserDetails);
            } else {
                console.error("Loans data is not an array or is undefined");
            }
        } catch (error) {
            // alert('Error fetching loan: ' + error.message);
        }
    };
    
    // useEffect(() => {
    //     fetchLoan(); // Fetch loans and user details when component mounts
    // }, []);
    
    

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this loan?')) {
            try {
                await Axios.delete(`loan/${id}`);
                setLoans(loans.filter(l => l.id !== id));
                alert('Loan deleted successfully!');
            } catch (error) {
                alert('Error deleting loan: ' + error.message);
            }
        }
    };

    const handleEdit = (loan) => {
        setEditingLoan(loan);
        setFormData({
            loan_id: loan.loan_id || '',                 // Keep loan ID if it exists
            category_id: loan.loan_category_id || '',// Keep loan category ID if it exists
            user_id: loan.user_id || '',             // Keep user name if it exists
            loan_amount: loan.loan_amount || '',         // Keep loan amount if it exists
            loan_date: loan.loan_date || '',             // Keep loan date if it exists
            loan_closed_date: loan.loan_closed_date || '', // Keep loan close date if it exists
            employee_id: loan.employee_id || '',         // Keep employee ID if it exists
            // image: loan.image || '',  
            status: loan.status || 'pending',             // Default to 'active' if status is not provided
        });
        
        setShowForm(true);
    };

    const handleAdd = () => {
        setEditingLoan(null);
        setFormData({
            // loan_id: '',               // Reset loan ID
            category_id: '',      // Reset loan category ID
            user_id: '',             // Reset user name
            loan_amount: '',           // Reset loan amount
            loan_date: '',             // Reset loan date
            loan_closed_date: '',       // Reset loan close date
            employee_id: '',   
            // image :'',       // Reset employee ID
            status: 'pending',          // Reset status to 'active'
        });
        
        setShowForm(true);
    };
   

    const handleChange = async (e) => {
        const { name, value, files } = e.target;
    
        // Handle image or profile photo uploads with compression
        if (name === 'image') {
            const file = files[0];
            if (file && file.type.startsWith('image/')) {
                try {
                    // Set compression options
                    const options = {
                        maxSizeMB: 1,  // Max size in MB
                        maxWidthOrHeight: 800,  // Resize to max width/height
                        useWebWorker: true  // Enable web workers for better performance
                    };
    
                    // Compress the image file
                    const compressedFile = await imageCompression(file, options);
    
                    // Read compressed image as Base64 and update formData
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setFormData((prevData) => ({
                            ...prevData,
                            [name]: reader.result // Store Base64 of compressed image
                        }));
                    };
                    reader.readAsDataURL(compressedFile); // Read the compressed image file
                } catch (error) {
                    console.error('Error compressing image', error);
                }
            }
        } else {
            // Update form data for other fields
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    
        // Handle category selection
        if (name === 'category_id') {
            const selected = loanCategories.find(category => category.id === parseInt(value));
            console.log("selectedCategory", selected);
            setSelectedCategory(selected);
        }
    
        // Handle loan date calculations
        if (name === 'loan_date' && selectedCategory) {
            const loanDate = new Date(value);
            let loanCloseDate;
    
            if (selectedCategory.category_type === 'weekly') {
                loanCloseDate = addWeeks(loanDate, selectedCategory.duration);
            } else if (selectedCategory.category_type === 'monthly') {
                loanCloseDate = addMonths(loanDate, selectedCategory.duration);
            }
    
            setFormData((prevData) => ({
                ...prevData,
                loan_date: value,
                loan_closed_date: loanCloseDate ? loanCloseDate.toISOString().split('T')[0] : ''
            }));
        }
    };
    
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLoan) {
                await Axios.put(`/loan/${editingLoan.loan_id}`, formData);
                alert('Loan updated successfully!');
            } else {
                await Axios.post('/loans', formData);
                alert('Loan added successfully!');
            }
            setShowForm(false);
            fetchLoan(); // Refresh loan list
        } catch (error) {
            if (error.response && error.response.data.errors) {
                alert('Validation Error: ' + JSON.stringify(error.response.data.errors));
            } else {
                alert('Error saving loan: ' + error.message);
            }
        }
        
    };
    const handleStatusChange = async (loan_id, event) => {
        const newStatus = event.target.value;
        setStatus(newStatus);  // Update the local state with new status
    
        try {
            // Make the API call to update the loan status
            const response = await Axios.put(`loan/${loan_id}/status`, {
                status: newStatus,
            });
    
            // Handle success response (you can do any success actions here)
            alert('Loan status updated successfully!');
            window.location.reload();
        } catch (error) {
            // Handle error response
            alert('Error updating loan status: ' + error.response?.data?.message || error.message);
        }
    };
    
    // Function to handle search input
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter loans and users based on search input
    const filteredLoans = loans.filter((loan) => {
        const user = loan.userDetails || {};
        const searchText = searchTerm.toLowerCase();
        return (
            loan.loan_id.toLowerCase().includes(searchText) || // Search in loan_id
            (user.user_name && user.user_name.toLowerCase().includes(searchText)) || // Search in user_name
            (user.city && user.city.toLowerCase().includes(searchText)) // Search in city
        );
    });

    

    const handleToggleExpand = (loanId) => {
        if (expandedLoanId === loanId) {
            // Collapse the current loan if it's already expanded
            setExpandedloanId(null);
            setLoanDetails(null);
        } else {
            // Expand the selected loan and fetch details
            setExpandedloanId(loanId);
            fetchLoanDetails(loanId);
        }
        // setExpandedloanId(expandedLoanId === loanId ? null : loanId);
    };

  
    
    const handleViewLoan = (loanItem) => {
        console.log("loanItem:", loanItem);
    
        // Check if loanItem is a string and split it into parts
        let loan_id;
        if (typeof loanItem === 'string') {
            // Assuming the string format is something like "AT0002" and needs to be split
            const stringPart = loanItem.substring(0, 2);  // Example: 'AT'
            const numberPart = loanItem.substring(2);    // Example: '0002'
            loan_id = `${stringPart}${numberPart}`;
        } else if (loanItem?.loan_id?.stringPart && loanItem.loan_id.numberPart) {
            // If loanItem is an object with loan_id structure
            const stringPart = loanItem.loan_id.stringPart;
            const numberPart = loanItem.loan_id.numberPart;
            loan_id = `${stringPart}${numberPart}`;
        } else {
            console.error("Loan ID parts are missing.");
            return;
        }
    
        // Proceed to navigate with the constructed loan_id
        console.log("Navigating with loan_id:", loan_id);
         navigate('/particular-loan-due', { state: { loan_id } });
    };
    
    return (
        <div className="employeecontainer">
             <Sidebar 
                isSidebarExpanded={isSidebarExpanded} 
                setSidebarExpanded={setSidebarExpanded} 
            />
            <div className="main-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="small-button" onClick={() => setShowForm(true)}>Add Loan</button>

                    {/* Search Bar */}
                        <div className='searchbox' style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search by User Name, City or Loan ID"
                                style={{ padding: '5px 10px', marginRight: '10px' }}
                            />
                            <SearchOutlined style={{ fontSize: '24px', cursor: 'pointer' }} />
                        </div>
                </div>

                {/* Loan Table */}
                <div className="table-container-loan">
            {filteredLoans.length > 0 ? (
                filteredLoans.map((loanItem) => (
                    <div key={loanItem.id} className={`employee-card-loan ${expandedLoanId === loanItem.id ? 'expanded' : ''}`}>
                        <div className='maincard'>
                            <div 
                                className="employee-header" 
                                onClick={() => handleToggleExpand(loanItem.loan_id)}  
                                style={{ padding: '10px 0', display: 'flex', alignItems: 'left' }}
                            >
                                <div style={{ marginRight: '5px' }}>
                                    <span className="employee-name">Loan ID: {loanItem.loan_id}</span>
                                </div>
                                <div style={{ marginRight: '5px' }}>
                                    <span className="employee-name">
                                        {loanItem.userDetails?.user_name || 'No username'}
                                    </span>
                                </div>
                                <div style={{ marginRight: '5px' }}>
                                    <span className="employee-city">
                                        {loanItem.userDetails?.city || 'No city'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                   
                                <div style={{ display: 'flex', alignItems: 'center' ,marginRight:'10px'}}>
      <span
        onClick={() => handleViewLoan(loanItem.loan_id)}
        style={{ cursor: 'pointer', marginRight: '5px' }}
      >
        {/* Eye Icon */}
        <VisibilityIcon />
      </span>
    </div>


                                    <span className={`expand-icon ${expandedLoanId === loanItem.id ? 'rotate' : ''}`}>
                                        <DownOutlined />
                                    </span>
                                </div>
                            </div>

                            {expandedLoanId === loanItem.loan_id && loanDetails && loanDetails.loan_id === loanItem.loan_id && (
  <div className="employee-details-loan">
  <div className="details-columns">
  <Grid container spacing={1}>  
      {/* Left column with the first seven items */}
      <Grid item xs={12} sm={6}>
    <Typography variant="body2" color="textSecondary">Amount:</Typography>
    <Typography variant="subtitle1">
        <span style={commonStyles}>{loanDetails.loan_amount || 'N/A'}</span>
    </Typography>

    <Typography variant="body2" color="textSecondary">Total Amount:</Typography>
    <Typography variant="subtitle1">
        <span style={commonStyles}>{loanDetails.total_amount || 'N/A'}</span>
    </Typography>

    <Typography variant="body2" color="textSecondary">Category:</Typography>
    <Typography variant="subtitle1">
        <span style={commonStyles}>{loanDetails.loan_category || 'N/A'}</span>
    </Typography>

    <Typography variant="body2" color="textSecondary">Loan Date:</Typography>
    <Typography variant="subtitle1">
        <span style={commonStyles}>{loanDetails.loan_date || 'N/A'}</span>
    </Typography>

    <Typography variant="body2" color="textSecondary">Closed Date:</Typography>
    <Typography variant="subtitle1">
        <span style={commonStyles}>{loanDetails.loan_closed_date || 'N/A'}</span>
    </Typography>

    <Typography variant="body2" color="textSecondary">Status:</Typography>
    <Typography variant="subtitle1">
        {/* <span style={commonStyles}>{loanDetails.status || 'N/A'}</span> */}
        <FormControl fullWidth style={{ marginBottom: '15px' }}>
      <InputLabel>Status</InputLabel>
      <Select
        value={loanDetails.status}
        onChange={(e) => handleStatusChange(loanDetails.loan_id, e)}
        label="Status"
        required
        style={{ width: '100%' }}
      >
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="inprogress">In Progress</MenuItem>
        <MenuItem value="preclose">Preclose</MenuItem>
        <MenuItem value="completed">Completed</MenuItem>
        <MenuItem value="cancelled">Cancelled</MenuItem>
      </Select>
    </FormControl>
    </Typography>

    <Typography variant="body2" color="textSecondary">Customer ID:</Typography>
    <Typography variant="subtitle1">
    <span style={commonStyles}>
        {`${loanDetails.user_id || 'N/A'} - ${loanDetails.customer_name || 'N/A'}`}
    </span>
</Typography>

</Grid>



      {/* Right column with the remaining items */}
      <Grid item xs={12} sm={6}>
    <Typography variant="body2" color="textSecondary">Employee ID:</Typography>
    <Typography variant="subtitle1">
        <span style={commonStyles}>{loanDetails.employee_id || 'N/A'}</span>
    </Typography>

    <Typography variant="body2" color="textSecondary">Category ID:</Typography>
    <Typography variant="subtitle1">
        <span style={commonStyles}>{loanDetails.category_id || 'N/A'}</span>
    </Typography>

    <Typography variant="body2" color="textSecondary">Employee Name:</Typography>
    <Typography variant="subtitle1">
        <span style={commonStyles}>{loanDetails.employee_name || 'N/A'}</span>
    </Typography>

    {/* <Typography variant="body2" color="textSecondary">Customer Name:</Typography>
    <Typography variant="subtitle1">
        <span style={commonStyles}>{loanDetails.customer_name || 'N/A'}</span>
    </Typography> */}

    <Typography variant="body2" color="textSecondary">City:</Typography>
    <Typography variant="subtitle1">
        <span style={commonStyles}>{loanDetails.city || 'N/A'}</span>
    </Typography>

    <Typography variant="body2" color="textSecondary">Added On:</Typography>
    <Typography variant="subtitle1">
        <span style={commonStyles}>{loanDetails.added_on || 'N/A'}</span>
    </Typography>

    <Typography variant="body2" color="textSecondary">Email:</Typography>
    <Typography variant="subtitle1">
        <span style={commonStyles}>{loanDetails.email || 'N/A'}</span>
    </Typography>
</Grid>
</Grid>
  </div>

  {/* Horizontal line */}
  <hr className="divider" />

  {/* Profile and sign photos */}
  <div className="profile-photos">
      {/* <div className="employee-detail-item-image">
          <span>Profile Photo:</span>
          {loanDetails.profile_photo ? (
              <img src={loanDetails.profile_photo} alt="Profile" className="profile-image" />
          ) : (
              "N/A"
          )}
      </div>
      <div className="employee-detail-item-image">
          <span>Sign Photo:</span>
          {loanDetails.sign_photo ? (
              <img src={loanDetails.sign_photo} alt="Signature" className="sign-image" />
          ) : (
              "N/A"
          )}
      </div> */}
      <div className="employee-detail-item-image">
          <span>Transaction Proof:</span>
          {loanDetails.image ? (
              <img src={loanDetails.image} alt="transactionimage" className="image" />
          ) : (
              "N/A"
          )}
      </div>
  </div>
</div>



)}

                        </div>
                    </div>
                ))
            ) : (
                <div>No loans available.</div>
            )}
        </div>
  
       
    
              {/* Modal for adding/editing loan */}
<Dialog open={showForm} onClose={() => setShowForm(false)} fullWidth maxWidth="sm">
    <DialogContent>
        <h3>{editingLoan ? 'Edit Loan' : 'Add Loan'}</h3>
        <form onSubmit={handleSubmit}>
            {/* Loan Category */}
            <div>
                <label>Loan Category</label>
                <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    className="form-field"
                    disabled={editingLoan} // Disable when editing
                >
                    <option value="">Select a Category</option>
                    {loanCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.category_name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Customer Name */}
            <div>
                <label>Customer Name</label>
                <select
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    required
                    className="form-field"
                    disabled={editingLoan} // Disable when editing
                >
                    <option value="">Select a Customer</option>
                    {users.length > 0 ? (
                        users
                            .filter(user => user.user_type === 'user')
                            .map((user) => (
                                <option key={user.id} value={user.user_id}>
                                    {user.user_name}
                                </option>
                            ))
                    ) : (
                        <option disabled>No Users Available</option>
                    )}
                </select>
            </div>

            {/* Loan Amount */}
            <div>
                <label>Loan Amount</label>
                <input 
                    type="text" 
                    name="loan_amount" 
                    value={formData.loan_amount} 
                    onChange={handleChange} 
                    required 
                    className="form-field"
                    readOnly={editingLoan} // Set as readonly when editing
                />
            </div>

            {/* Next Due Date */}
            <div>
                <label>Next Due Date</label>
                <input
                    type="date"
                    name="loan_date"
                    value={formData.loan_date}
                    onChange={handleChange}
                    required
                    className="form-field"
                    readOnly={editingLoan} // Set as readonly when editing
                />
            </div>

            {/* Loan Close Date */}
            <div>
                <label>Loan Close Date</label>
                <input
                    type="date"
                    name="loan_closed_date"
                    value={formData.loan_closed_date}
                    onChange={handleChange}
                    required
                    className="form-field"
                    readOnly={editingLoan} // Set as readonly when editing
                />
            </div>

            {/* Employee Id */}
            <div>
                <label>Employee Id</label>
                <input 
                    type="text" 
                    name="employee_id" 
                    value={formData.employee_id}
                    onChange={handleChange} 
                    required 
                    className="form-field"
                    readOnly={editingLoan} // Set as readonly when editing
                />
            </div>

            {/* Status (editable) */}
            <div>
                <label>Status</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="form-field"
                >
                    <option value="">Choose status</option>
                    <option value="pending">Pending</option>
                    <option value="inprogress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="preclose">Preclose</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Transaction Proof */}
            <div>
                <label>Transaction Proof:</label>
                <input 
                    type="file" 
                    name="image" 
                    onChange={handleChange} 
                    accept="image/*"
                    disabled={editingLoan} // Disable when editing
                />
            </div>

            {/* Action Buttons */}
            <div className="button-container">
                <button type="submit" className="loan-add" disabled={editingLoan}>
                    {editingLoan ? 'Update' : 'Add'}
                </button>
                <button 
                    type="button" 
                    className="loan-cancel" 
                    onClick={() => setShowForm(false)}
                >
                    Cancel
                </button>
            </div>
        </form>
    </DialogContent>
</Dialog>


            </div>
        </div>
    );
    
};

export default Loan;
