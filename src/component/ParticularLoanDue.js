import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar'; // Adjust the import according to your file structure
import Axios from "../Axios";
import EditIcon from '@mui/icons-material/Edit'; 
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import '../component/ParticularLoanDue.css';
import { Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

const ParticularLoanDue = () => {
    // const { loan_id } = useParams(); 
    const [loanDues, setLoanDues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({}); // For update
    const [showForm, setShowForm] = useState(false);
    const [currentDate, setCurrentDate] = useState('');
    const [isSidebarExpanded, setSidebarExpanded] = useState(true);
    const location = useLocation();
    const { loan_id } = location.state || {}; 
    
    
  useEffect(() => {
    console.log("Component has been loaded.");
    if (loan_id) {
      console.log("Loan ID is available:", loan_id);
    } else {
      console.log("Loan ID is not available.");
    }
  }, [loan_id]);
  
    useEffect(() => {
        const fetchLoanDues = async () => {
            try {
                const response = await Axios.get(`/loan/${loan_id}/dues`);
                setLoanDues(response.data.loan_dues);
            } catch (error) {
                console.error("Error fetching loan dues:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLoanDues();
    }, [loan_id]);

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
            setFormData((prev) => ({
                ...prev,
                paid_on: loanDues.paid_on || new Date().toISOString().split('T')[0],
                collection_by: userId || '', // Default to empty if userId is null
            }));
        }
    }, [showForm]);

    const handleEdit = (loanDue) => {
      
        setFormData(loanDue); // Set the current loan due data to the form
        setShowForm(true); // Show the edit form
    };

    const handleUpdate = async () => {
        try {
            await Axios.put(`/update-future-date/${loan_id}`, formData);
            // Optionally, refetch loan dues or update state accordingly
            // Example: fetchLoanDues();
            setShowForm(false); // Close the form
            window.location.reload(); 
        } catch (error) {
            console.error("Error updating loan due:", error);
             // Check if error response contains the specific message
        if (error.response && error.response.data.message === "First work on unpaid due") {
            alert("First work on unpaid due"); // Display the message in an alert
        } else {
            alert("An error occurred while updating the loan due. Please try again.");
        }
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Loading state
    }

    return (
        <div className="employeecontainer">
               <Sidebar 
                isSidebarExpanded={isSidebarExpanded} 
                setSidebarExpanded={setSidebarExpanded} 
            />
            <div className="main-content">
            <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
                color: '#7f223d',  // Custom color
                fontWeight: 'bold', // Bold text
                textAlign: 'center', // Center alignment
                marginBottom: 2      // Space below the heading
            }} 
        >
            Loan Dues for Loan ID: {loan_id}
        </Typography>


                <div className="table-container-particularloandue">
                {loanDues.length > 0 ? (
  <table className="loan-due-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Next Amount</th>
        <th>Due Amount</th>
        <th>Paid Amount</th>
        <th>Pending Amount</th>
        <th>Due Date</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {loanDues.map((loanDue, index) => {
        const isLastDue = index === loanDues.length - 1;
        const isPending = loanDue.status === 'pending';
        const isPaid = loanDue.status === 'paid';
        const rowClass = isLastDue && isPending ? 'pending-loan' : '';
        const canEdit = (isLastDue && isPending) || (!isPending && !isPaid);

        return (
          <tr key={loanDue.id} className={rowClass}>
            <td>{index + 1}</td> {/* Sequential ID */}
            <td>{loanDue.next_amount}</td>
            <td>{loanDue.due_amount}</td>
            <td>{loanDue.paid_amount}</td>
            <td>{loanDue.pending_amount}</td>
            <td>{new Date(loanDue.due_date).toLocaleDateString()}</td>
            <td>{loanDue.status}</td>
            <td>
              <IconButton 
                onClick={() => handleEdit(loanDue)} 
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
) : (
  <div>No dues available for this loan.</div>
)}

                </div>
                <Dialog open={showForm} onClose={() => setShowForm(false)}>
                    <DialogTitle>Edit Loan Due</DialogTitle>
                    <DialogContent>
                        <form>
                            <div className="form-group">
                                <label>Loan ID:</label>
                                <input
                                    type="text"
                                    name="loan_id"
                                    value={formData.loan_id || ''}
                                    readOnly
                                />
                            </div>
                            <div className="form-group">
                                <label>User ID:</label>
                                <input
                                    type="text"
                                    name="user_id"
                                    value={formData.user_id || ''}
                                    readOnly
                                />
                            </div>
                            <div className="form-group">
                                <label>Due Amount:</label>
                                <input
                                    type="number"
                                    name="due_amount"
                                    value={formData.due_amount || ''}
                                    readOnly
                                />
                            </div>
                            <div className="form-group">
                                <label>Paid Amount:</label>
                                <TextField
                                    label="Paid Amount"
                                    type="text"
                                    value={formData.paid_amount || ''}
                                    onChange={(e) => {
                                        const paidAmount = parseFloat(e.target.value) || 0;
                                        const dueAmount = parseFloat(formData.due_amount) || 0;

                                        let status = 'unpaid';
                                        if (paidAmount === dueAmount) {
                                            status = 'paid';
                                        } else if (paidAmount > 0 && paidAmount < dueAmount) {
                                            status = 'pending';
                                        }

                                        setFormData({
                                            ...formData,
                                            paid_amount: e.target.value,
                                            status: status
                                        });
                                    }}
                                    fullWidth
                                    margin="normal"
                                />
                            </div>
                            <div className="form-group">
                                <label>Due Date:</label>
                                <input
                                    type="date"
                                    name="due_date"
                                    value={formData.due_date || ''}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                    <label>Paid On:</label>
                    <input
                        type="date"
                        name="paid_on"
                        value={formData.paid_on}
                        onChange={(e) => setFormData({ ...formData, paid_on: e.target.value })}  // Update formData with paid_on
                        required
                    />
                </div>
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button onClick={handleUpdate}>Update</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
};

export default ParticularLoanDue;