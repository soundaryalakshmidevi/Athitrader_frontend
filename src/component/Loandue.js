import React, { useState, useEffect } from 'react';
import Axios from "../Axios";
import '../Employee.css'; // Assuming you have a CSS file for styling
import Sidebar from './Sidebar';
import { DownOutlined } from '@ant-design/icons'; 
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; 
import DeleteIcon from '@mui/icons-material/Delete'; 
import { Dialog, DialogActions, DialogContent, DialogTitle, Button,TextField } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import '../loandue.css';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Import the eye icon
import * as XLSX from 'xlsx'; // Import xlsx
import { saveAs } from 'file-saver'; // Import file-saver
import DownloadIcon from '@mui/icons-material/GetApp';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useLocation } from 'react-router-dom'; 
const Loandue = (initialGroupedLoans) => {
    const [loans, setLoans] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [expandedLoanId, setExpandedLoanId] = useState(null);
    const [formData, setFormData] = useState({
        loan_id: '',
        user_id: '',
        due_amount: '',
        due_date: '',
        paid_on: '',
        paid_amount: '',
        collection_by: '',
        // future_date:'',
    });
    const [error, setError] = useState({
        paid_amount: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    //  const [groupedLoans, setGroupedLoans] = useState({});
    const [filterLoanId, setFilterLoanId] = useState('');
    const [LoansGroup, setLoansGroup] = useState(initialGroupedLoans);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    // const filteredEmployees = (employees ?? []).filter(employee =>
    //     employee.loan_id?.toString().toLowerCase().includes(filterLoanId?.toLowerCase() || '')
    // );
    const filteredEmployees = (employees ?? []).filter(employee => {
        const loanId = employee.loan_id?.toString().toUpperCase() || '';  // Convert loan_id to string and uppercase
        console.log(loanId);
        const searchTerm = filterLoanId?.toUpperCase() || '';  // Convert filterLoanId to uppercase
        console.log('Loan ID:', loanId, 'Search Term:', searchTerm);  // Debugging logs
        return loanId.startsWith(searchTerm);  // Match the start of loan_id with filterLoanId
    });
    
    
    
     
    
    const [currentDate, setCurrentDate] = useState('');
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const [successMessage, setSuccessMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const location = useLocation(); 
  const groupedLoans = groupLoansById(filteredEmployees);
//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
// };

// // Filter loans based on searchTerm
// const filteredLoans = loans.filter((loan) => {
//     const user = loan.userDetails || {}; // Ensure userDetails exists
//     const searchText = searchTerm.toLowerCase(); // Convert search term to lowercase for case-insensitive matching

//     return (
//         loan.loan_id.toString().toLowerCase().includes(searchText) || // Search in loan_id
//         (user.user_name && user.user_name.toLowerCase().includes(searchText)) || // Search in user_name
//         (user.city && user.city.toLowerCase().includes(searchText)) // Search in city
//     );
// });

const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setFilterLoanId(e.target.value); // Update filterLoanId to the search term
};

// Filter loans based on searchTerm (loanId)
const filteredLoans = Object.keys(groupedLoans).filter(loanId => {
    return loanId.toUpperCase().includes(filterLoanId?.toUpperCase() || '');
});



  // Filter employees based on loan_id
//   const filteredEmployees = (employees ?? []).filter(employee =>
//     employee.loan_id?.toString().includes(filterLoanId)
// );

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setSnackbarOpen(false);
      };

      useEffect(() => {
        // Check if loanId is passed from the previous page
        if (location.state && location.state.loanId) {
            setExpandedLoanId(location.state.loanId);
        }
    }, [location.state]);

    useEffect(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const day = String(today.getDate()).padStart(2, '0');
        setCurrentDate(`${year}-${month}-${day}`);  // Set the current date
    }, []);

    
    useEffect(() => {
        if (showForm) {
            const userId = localStorage.getItem('user_id'); // Fetch user ID from localStorage
            // Set the Collection By field with the fetched user ID
            setSelectedEmployee((prev) => ({
                ...prev,
                collection_by: userId || '', // Default to empty if userId is null
            }));
        }
    }, [showForm, setSelectedEmployee]);
    
    const fetchEmployees = async () => {
        try {
            const response = await Axios.get('/loan-due-index');
            const employeeData = response.data.data; // Assuming this is the correct path to your data
            console.log("Fetched Employees: ", employeeData); // Log the response data
            setEmployees(employeeData);  // Set employees data
        } catch (error) {
            console.error('Error fetching loan data:', error.message);
        }
    };
    
    
    useEffect(() => {
        console.log("Employees: ", employees); // Log employees after setting them
        fetchEmployees();
    }, []);
    

    const fetchLoan = async () => {
        try {
            const response = await Axios.get('/loan');
            setLoans(response.data.loans); // Store the fetched loans
        } catch (error) {
            // alert('Error fetching loan: ' + error.message);
        }
    };

    useEffect(() => {
        fetchLoan();
    }, []);

    const handleview= async (id) => {
        
    };

    const handleEdit = (employee) => {
        const userId = localStorage.getItem('user_id'); 
        setEditingEmployee(employee);
        setFormData({
            loan_id: employee.loan_id,
            user_id: employee.user_id,
            due_amount: employee.next_amount  !== null ? employee.next_amount : employee.due_amount,
            paid_amount:employee.paid_amount,
            due_date: employee.due_date,
            // future_date: employee.future_date,
            paid_on: employee.paid_on || new Date().toISOString().split('T')[0],
            collection_by: userId || employee.collection_by,
        });
        setShowForm(true);
    };

    const handleAdd = () => {
        setEditingEmployee(null);
        setFormData({
            loan_id: '',
            user_id: '',
            due_amount: '',
            paid_amount:'',
            due_date: '',
            paid_on: '',
            collection_by: '',
            // future_date: '',
        });
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleInputChange = (employeeId, employee, field, value) => {
        const updatedEmployee = {
            ...employee,
            [field]: value,
        };

        const paidAmount = parseFloat(updatedEmployee.paid_amount) || 0;
        const dueAmount = parseFloat(updatedEmployee.due_amount) || 0;

        if (paidAmount === dueAmount) {
            updatedEmployee.status = "paid";
        } else if (paidAmount < dueAmount) {
            updatedEmployee.status = "pending";
        } else {
            updatedEmployee.status = "unpaid";
        }

        setEmployees((prevEmployees) =>
            prevEmployees.map((emp) =>
                emp.id === employeeId ? updatedEmployee : emp
            )
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { loan_id, ...otherData } = formData;
    
        // Reset the error state before submitting
        setError({ paid_amount: '' });
    
        try {
            let response;
    
            if (editingEmployee) {
                // If editing, attempt to update the loan due
                response = await Axios.put(`/update-future-date/${loan_id}`, formData);
            } else {
                // If not editing, create a new loan due
                response = await Axios.post('/loan-due', formData);
            }
    
            // Handle success for both update and create
            if (response.status === 200) {
                setSuccessMessage('Loan due saved successfully!');
                setSnackbarOpen(true);
                window.location.reload();
            }
    
            // Close the form and refresh the data
            setShowForm(false);
            fetchEmployees(); // Refresh the data to reflect changes
        } catch (error) {
            // Handle validation errors (e.g., paid_amount required)
            if (error.response && error.response.data.errors) {
                const errors = error.response.data.errors;
                if (errors.paid_amount) {
                    setError({ paid_amount: errors.paid_amount[0] });
                }
            } else {
                // Handle other errors
                console.error('Error saving loan due:', error);
            }
        }
    };
    
    
    
    
    

    const handleToggleExpand = (id) => {
        setExpandedLoanId(expandedLoanId === id ? null : id);
    };

    function groupLoansById(employees) {
        return employees.reduce((groups, employee) => {
            const loanId = employee.loan_id;
            if (!groups[loanId]) {
                groups[loanId] = []; // Initialize as an array if it doesn't exist
            }
            groups[loanId].push(employee); // Group by loanId
            return groups;
        }, {});
    }
    
    // function groupLoansById(employees) {
    //     return employees.reduce((groups, employee) => {
    //         const { loan_id, due_date, status } = employee;
    
    //         if (!groups[loan_id]) {
    //             groups[loan_id] = { employees: [], lastDueDate: new Date(due_date), status };
    //         }
    
    //         // Add employee to the group
    //         groups[loan_id].employees.push(employee);
    
    //         // Update the last due date
    //         if (new Date(due_date) > groups[loan_id].lastDueDate) {
    //             groups[loan_id].lastDueDate = new Date(due_date);
    //         }
    
    //         return groups;
    //     }, {});
    // }

    
    const handleDownload = async (loanId) => {
        try {
            console.log('Fetching data for loan ID:', loanId); // Log the loan ID
            
            // Step 1: Fetch loan details (including loan_id and customer_name)
            const loanDetailsResponse = await Axios.get(`/loan`);
            console.log('Loan Details Response:', loanDetailsResponse.data);
            
            // Step 2: Fetch loan dues
            const dueResponse = await Axios.get(`/loan/${loanId}/dues`);
            console.log('API Response:', dueResponse.data); // Log the response to check data structure
            
            // Step 3: Map the loan dues and match customer_name from loan details
            const loanDetails = loanDetailsResponse.data.loans.find(loan => loan.loan_id === loanId);
            if (!loanDetails) {
                console.error('Loan details not found for the given loanId');
                return;
            }
            
            // Step 4: Create the header row with column names
            // const headerRow = [{
            //     LoanId: 'LoanId',
            //     CustomerName: 'CustomerName',
            //     UserID: 'UserID',
            //     DueAmount: 'DueAmount',
            //     PaidAmount: 'PaidAmount',
            //     Status: 'Status',
            //     DueDate: 'DueDate',
            //     PaidDate: 'PaidDate',
            //     CollectionBy: 'CollectionBy'
            // }];
            
            // Step 5: Create a row with LoanId and CustomerName in bold and large font
            const dataRow = [{
                LoanId: loanDetails.loan_id,
                CustomerName: loanDetails.customer_name,
                UserID: '',
                DueAmount: '',
                PaidAmount: '',
                Status: '',
                DueDate: '',
                PaidDate: '',
                CollectionBy: ''
            }];
            
            // Step 6: Map the loan dues for the remaining data
            const loanData = dueResponse.data.loan_dues.map((loan) => ({
                LoanId: loan.loan_id,
                UserID: loan.user_id,
                DueAmount: loan.due_amount,
                PaidAmount: loan.paid_amount,
                Status: loan.status,
                DueDate: loan.due_date,
                PaidDate: loan.paid_on,
                CollectionBy: loan.collection_by,
            }));
            
            console.log('Processed Loan Data:', loanData); // Log processed data
            
            // Step 7: Combine data rows
            const allData = [...dataRow,  ...loanData];
            
            // Step 8: Create a worksheet
            const worksheet = XLSX.utils.json_to_sheet(allData);
            
            // Step 9: Apply styles to the first row (LoanId and CustomerName)
            worksheet['A2'].s = {
                font: {
                    bold: true,  // Make text bold
                    sz: 20,      // Set font size to 20 (big size)
                },
            };
            
            worksheet['B2'].s = {
                font: {
                    bold: true,  // Make text bold
                    sz: 20,      // Set font size to 20 (big size)
                },
            };
            
            // Step 10: Apply styles to the header row (2nd row, no bold or size change)
            worksheet['A1'].s = {
                font: {
                    bold: false,  // Normal text (not bold)
                    sz: 10,       // Normal font size
                },
            };
            
            worksheet['B1'].s = {
                font: {
                    bold: false,  // Normal text (not bold)
                    sz: 10,       // Normal font size
                },
            };
            
            // Step 11: Add the data to the worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Loan Data");
            
            // Step 12: Generate the Excel file and trigger download
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(blob, `Loan_${loanId}_Data.xlsx`);
            
            console.log('Download triggered for Loan:', loanId); // Log download trigger
        } catch (error) {
            console.error('Error downloading Excel:', error);
            if (error.response) {
                console.error('Response data:', error.response.data); // Log additional error info
            }
        }
    };
    
    
    
    
   

    return (
        <div className="employeecontainer">
            <Sidebar 
                isSidebarExpanded={isSidebarExpanded} 
                setSidebarExpanded={setSidebarExpanded} 
            />
            <div className="main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* <button className="small-button" onClick={handleAdd}>Add Loan Due</button> */}
                     <div className="searchbox" style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search by Loan ID"
                    style={{ padding: '5px 10px', marginRight: '10px' }}
                />
                <SearchOutlined 
                    style={{ fontSize: '24px', cursor: 'pointer' }} 
                    onClick={() => console.log('Searching for:', searchTerm)} // Optional: for additional click behavior
                />
            </div>
                </div>

                <div className="table-container-loandue">
    {filteredLoans.length > 0 ? (
        filteredLoans.map(loanId => {
            return (
                <div key={loanId} className="loan-group-loandue">
                    <div className="seperate">
                        <div 
                            className="loan-header" 
                            onClick={() => handleToggleExpand(loanId)} 
                            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', justifyContent: 'space-between' }}
                        >
                            <h4 style={{ margin: 0 }}>Loan ID: {loanId}</h4>
                            
                            {groupedLoans[loanId] && groupedLoans[loanId].length > 0 && (
                                <h4 style={{ margin: 0 }}>
                                    User Name: {groupedLoans[loanId][0].user_name}
                                </h4>
                            )}
                            
                            <span 
                                className={`expand-icon ${expandedLoanId === loanId ? 'rotate' : ''}`} 
                                style={{ marginLeft: '8px', color: 'white' }}
                            >
                                <DownOutlined />
                            </span>
                        </div>

                        {expandedLoanId === loanId && (
    <div>
        {/* Download Button above the table */}
        <div className="download-container">
            <Button 
                onClick={() => handleDownload(loanId)} 
                startIcon={<DownloadIcon />} 
                variant="contained" 
                color="primary" 
                className="download-button"
            >
            </Button>
        </div>

        {/* Loan Details Table */}
        <table className="loan-table">
            <thead>
                <tr>
                    <th>S.No</th>
                    <th>Loan ID</th>
                    <th>User ID</th>
                    <th>Due Amount</th>
                    <th>Paid Amount</th>
                    <th>Pending Amount</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {/* Ensure groupedLoans[loanId] is an array */}
                {Array.isArray(groupedLoans[loanId]) && groupedLoans[loanId].map((employee, index) => {
                    const isPending = employee.status === 'pending';
                    const isPaid = employee.status === 'paid';
                    const isLastDue = index === groupedLoans[loanId].length - 1;
                    const canEdit = (isLastDue && isPending) || (!isPending && !isPaid);

                    return (
                        <tr key={employee.id} className={isLastDue && isPending ? 'pending-loan' : ''}>
                            <td>{index + 1}</td>
                            <td>{employee.loan_id}</td>
                            <td>{employee.user_id}</td>
                            <td>{employee.next_amount || employee.due_amount}</td>
                            <td>{employee.paid_amount}</td>
                            <td>{employee.pending_amount}</td>
                            <td>{employee.status}</td>
                            <td>{new Date(employee.due_date).toLocaleDateString()}</td>
                            <td>
                                <IconButton 
                                    onClick={() => handleEdit(employee)} 
                                    disabled={!canEdit}
                                >
                                    <EditIcon />
                                </IconButton>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
)}

                    </div>
                </div>
            );
        })
    ) : (
        <p>No loans found</p>
    )}
</div>



<Dialog open={showForm} onClose={() => setShowForm(false)}>
      <DialogTitle>{editingEmployee ? "Edit Loan Due" : "Add Loan Due"}</DialogTitle>
      <DialogContent style={{ backgroundColor: "rgb(209, 241, 221)" }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Loan ID:</label>
            <input
              type="text"
              name="loan_id"
              value={formData.loan_id}
              onChange={(e) => setFormData({ ...formData, loan_id: e.target.value })}
              required
              readOnly
            />
          </div>

          <div className="form-group">
            <label>User ID:</label>
            <input
              type="text"
              name="user_id"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              required
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Due Amount:</label>
            <input
              type="number"
              name="due_amount"
              value={formData.due_amount}
              onChange={(e) => setFormData({ ...formData, due_amount: e.target.value })}
              required
              readOnly
            />
          </div>

          <div className="form-group">
    <label>Paid Amount:</label>
    <input
        label="Paid Amount"
        type="text"
        value={formData.paid_amount}
        onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
        fullWidth
        margin="normal"
    />
    {error.paid_amount && (
        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
            {error.paid_amount}
        </div>
    )}
</div>


          <div className="form-group">
            <label>Due Date:</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Paid On:</label>
            <input
              type="date"
              name="paid_on"
              value={formData.paid_on}
              onChange={(e) => setFormData({ ...formData, paid_on: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Collection By:</label>
            <input
              type="text"
              name="collection_by"
              value={formData.collection_by}
              onChange={(e) => setFormData({ ...formData, collection_by: e.target.value })}
              readOnly
            />
          </div>
        </form>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setShowForm(false)}
          style={{ backgroundColor: "#3B82F6", color: "white" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          style={{ backgroundColor: "#EF4444", color: "white" }}
        >
          {editingEmployee ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>

            </div>
             {/* Snackbar component to show the success message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Position of the snackbar
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
        </div>
    );
};

export default Loandue;
