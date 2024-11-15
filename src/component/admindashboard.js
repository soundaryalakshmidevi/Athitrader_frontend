import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import History from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Sidebar from "./Sidebar"; 
import Axios from "../Axios";
import { Link } from 'react-router-dom';
import { CircularProgress } from "@mui/material";
import '../component/admindashboard.css';
const DashboardPage = () => {
  const [totalCollection, setTotalCollection] = useState(0); 
  const [TotalLoan, setTotalLoan] = useState(0); 
  const [TotalCustomer, setTotalCustomer] = useState(0); 
  const [TotalEmployee, setTotalEmployee] = useState(0); 
  const [TotalCollectionbyemp, setTotalCollectionbyemp] = useState(0); 
  const [Totaldue, setTotaldue] = useState(0); 
  const [Totalloandue, setTotalloandue] = useState(0);
  const [loans, setLoans] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loanData, setLoanData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarExpanded, setSidebarExpanded] = useState(true);
    const navigate = useNavigate();
  useEffect(() => {
    // Get userId from localStorage
    const userId = localStorage.getItem('user_id'); // Ensure 'storedUserId' is the correct key
  
    // Log userId to check its value
    console.log("User ID found:", userId);
  
    // Check if the userId exists
    if (userId) {
      // fetchCollectionbyemp(userId);  // Pass the userId to the function
    } else {
      // console.error('User ID not found in localStorage');
    }
  }, []);
  const handleAvatarClick = () => {
    navigate('/history'); // Redirect to the /history route
};

const fetchCollectionbyemp = async () => {
  try {
    const userId = localStorage.getItem('user_id'); // Ensure 'storedUserId' is the correct key
  
    // Log userId to check its value
    console.log("User ID found:", userId);
    console.log("Fetching collection for userId:", userId); // Log userId

    const response = await Axios.post(
      `/fetchLoanByEmpPaidDate`,
      { collection_by: userId },  // Send userId in the request body
      {
        headers: {
          'Content-Type': 'application/json', // Ensure Content-Type is JSON
        }
      }
    );

    if (response.data) {
      setTotalCollectionbyemp(response.data.message);
      console.log("Total collected amount by employee:", response.data.message);
    }
  } catch (error) {
    // console.error("Error fetching total collection:", error);
  }
};

  // Function to fetch total collection
  const fetchTotalCollection = async () => {
    try {
      const response = await Axios.get('/fetch-loan-by-current-date');
      if (response.data) {
        setTotalCollection(response.data.total_income); // Assuming 'total_income' is the field returned from API
        setTotaldue(response.data.total_due_amount);
        console.log("total income:", response.data.total_income);
      }
    } catch (error) {
      // console.error("Error fetching total collection:", error);
    }
  };

  const fetchTotalLoandues = async () => {
    try {
      const response = await Axios.get('/totalloandue');
      if (response.data) {
        // setTotalCollection(response.data.total_income); // Assuming 'total_income' is the field returned from API
        setTotalloandue(response.data.total_due_amount);
        console.log("total income:", response.data.total_due_amount);
      }
    } catch (error) {
      // console.error("Error fetching total collection:", error);
    }
  };

  // Fetch loan count
  const fetchLoanCount = async () => {
    try {
      const response = await Axios.get('/loans/count-pending-inprogress');
      setTotalLoan(response.data.count); // Assuming the API returns the total loan count
    } catch (error) {
      // console.error("Error fetching loan count:", error);
    }
  };

  // Fetch customer count
  const fetchCustomerCount = async () => {
    try {
      const response = await Axios.get('/customer-count');
      setTotalCustomer(response.data.customer_count); // Assuming you have a state to hold the customer count
    } catch (error) {
      // console.error("Error fetching customer count:", error);
    }
  };

  // Fetch employee count
  const fetchEmployeeCount = async () => {
    try {
      const response = await Axios.get('/employee-count');
      setTotalEmployee(response.data.employee_count); // Assuming you have a state to hold the employee count
      console.log(response.data.employee_count);
    } catch (error) {
      // console.error("Error fetching employee count:", error);
    }
  };

  // Fetch loans
  const fetchLoans = async () => {
    try {
      const response = await Axios.get('/indexweb');
      // const sortedLoans = response.data.loans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by date in descending order
      setLoans( response.data.loans); // Set the sorted loans data
    } catch (error) {
      // console.error("Error fetching loans data:", error);
    }
  };
  

    const fetchLoanData = async () => {
        try {
            const response = await Axios.get('/loan-due');
            setLoanData(response.data.loan_details);
        } catch (error) {
            // console.error('Error fetching loan data:', error);
        } finally {
            setLoading(false);
        }
    };

  // Fetch total collection on component mount
  useEffect(() => {
    fetchLoanData();
    fetchTotalCollection();
    fetchLoanCount();
    fetchCustomerCount();
    fetchEmployeeCount();
    fetchLoans();
    fetchTotalLoandues();
fetchCollectionbyemp();
  }, []);

 
    return (
      <Box display="flex">
        {/* Sidebar */}
        <Sidebar 
                isSidebarExpanded={isSidebarExpanded} 
                setSidebarExpanded={setSidebarExpanded} 
            />
  
        {/* Main content */}
        <Box component="main" className="dashboard-main">
          
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} className="dashboard-header">
            <Typography variant="h4" className="header-title">
              
            </Typography>
            <Box display="flex" alignItems="left">
            <Avatar className="header-avatar" onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
                <History />
              </Avatar>
            </Box>
          </Box>
  
          {/* Statistics Cards */}
          <Grid container spacing={3} mb={3}>
            {[
              { label: "Loan", value: TotalLoan || 0 },
              { label: "Customer", value: TotalCustomer || 0 },
              { label: "Employees", value: TotalEmployee || 0 },
              { label: "Due Amount", value: Totalloandue || 0 },
              { label: "Total Collection", value: totalCollection || 0 },
            ].map((stat, index) => (
              <Grid item xs={12} md={2} key={index}>
                <Paper className="stat-card">
                  <Typography variant="h6" className="stat-value">{stat.value}</Typography>
                  <Typography className="stat-label">{stat.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
  
          {/* Loan Summary and Total Collection Bar Chart */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <Paper className="chart-card">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" className="chart-title">
                    Total Collection for Current Date
                  </Typography>
                  
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[{ name: "Total Collection", value: totalCollection }]}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#188b3E" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
    <Paper className="chart-card">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" className="chart-title">
          Loan Summary
        </Typography>
        <Link to="/loan" className="view-more-link">
          <Typography>View More</Typography>
        </Link>
      </Box>

      {loading ? (
        <Box className="loading-spinner">
          <CircularProgress color="inherit" />
        </Box>
      ) : (
        <Box className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee Name</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Place</TableCell>
                <TableCell>Loan Issue Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans && loans.length > 0 ? (
                loans.map((loan, index) => (
                  <TableRow key={index}>
                    <TableCell>{loan.employee_id}, {loan.employee_name}</TableCell>
                    <TableCell>{loan.customer_name}</TableCell>
                    <TableCell>{loan.city}</TableCell>
                    <TableCell>{loan.loan_date}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No loans available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  </Grid>
          </Grid>
  
          {/* Employee Summary */}
          <Grid container spacing={2}>
         

          <Grid item xs={12}>
  <Paper className="employee-summary">
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        sx={{ 
          // Add some responsive padding/margin for smaller screens
          padding: { xs: '8px', sm: '16px' } 
        }}
      >
        <Typography
          variant="h6"
          className="employee-title"
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, // Smaller font size for smaller screens
            textAlign: { xs: 'center', sm: 'left' }  // Center text on smaller screens
          }}
        >
          Employee Summary
        </Typography>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress color="inherit" />
        </Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>  {/* Make the table horizontally scrollable on small screens */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee Name</TableCell>
                <TableCell>Visited Customer Count</TableCell>
                <TableCell>Due Amount</TableCell>
                <TableCell>Collection Amount</TableCell>
                <TableCell>Pending Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loanData && loanData.length > 0 ? (
                loanData.map((loan, index) => (
                  <TableRow key={index}>
                    <TableCell>{`${loan.collection_by}, ${loan.username || 'N/A'}`}</TableCell>
                    <TableCell>{loan.loan_count}</TableCell>
                    <TableCell>{loan.total_due_amount}</TableCell>
                    <TableCell>{loan.total_paid_amount}</TableCell>
                    <TableCell>{loan.total_pending_due_amount}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No loans available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  </Paper>
</Grid>


          </Grid>
        </Box>
      </Box>
    );
  };
  
  export default DashboardPage;
  
