import React, { useState, useEffect } from 'react';
import { DownOutlined } from '@ant-design/icons';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    Snackbar
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/GetApp';

import Axios from "../Axios";
import '../component/Todayloandue.css';
import Sidebar from './Sidebar';
import * as XLSX from 'xlsx'; // Import xlsx
import { saveAs } from 'file-saver'; // Import file-saver
import { useNavigate } from 'react-router-dom';
const CitiesWithDueLoans = () => {
    const [cities, setCities] = useState([]);
    const [expandedCity, setExpandedCity] = useState(null);
    const [groupedLoans, setGroupedLoans] = useState({});
    const [expandedLoanId, setExpandedLoanId] = useState(null);
    const [isFormOpen, setFormOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null); // Track selected city
    const [isSidebarExpanded, setSidebarExpanded] = useState(true);
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (isFormOpen) {
            const userId = localStorage.getItem('user_id'); // Fetch user ID from localStorage
            // Set the Collection By field with the fetched user ID
            setSelectedEmployee((prev) => ({
                ...prev,
                collection_by: userId || '', // Default to empty if userId is null
            }));
        }
    }, [isFormOpen, setSelectedEmployee]);

    useEffect(() => {
        // Fetch cities with due loans
        Axios.get('/fetchCitiesWithDueLoansArray')
            .then(response => {
                setCities(response.data.cities);
            })
            .catch(error => {
                console.error("Error fetching cities", error);
            });
    }, []);


   

    const handleToggleExpand = (city) => {
        setSelectedCity(city); // Store the selected city for use
        console.log("selected city is", city);
        
        setExpandedCity(expandedCity === city ? null : city);
    
        if (expandedCity !== city) {
            // Fetch loan details for the selected city when expanding
            Axios.get(`/fetchCitiesWithDueLoans/${city}`)
                .then(response => {
                    const loanData = response.data.customers.reduce((acc, customer) => {
                        if (!acc[customer.loan_id]) acc[customer.loan_id] = [];
                        acc[customer.loan_id].push(customer);
                        return acc;
                    }, {});
                    setGroupedLoans(loanData);
                    // Also set city information on selectedEmployee when expanding
                    setSelectedEmployee(prevState => ({
                        ...prevState,
                        city: city // Add city to the selectedEmployee
                    }));
                })
                .catch(error => {
                    console.error("Error fetching loan details", error);
                });
        }
    };
    

    const handleToggleLoanExpand = (loanId) => {
        setExpandedLoanId(expandedLoanId === loanId ? null : loanId);
    };

    const handleInputChange = (loanId, employee, field, value) => {
        // Handle input changes for fields like paid_amount, paid_date, etc.
        console.log(`Updated ${field} for loanId ${loanId} and userId ${employee.user_id}: ${value}`);
    };

    const handleDelete = (loanId) => {
        // Handle delete action for loan
        console.log(`Delete loan with ID: ${loanId}`);
    };

    const handleEditClick = (employee) => {
        setSelectedEmployee(employee);
        setFormOpen(true);
    };
    // const handleEditClick = (employee) => {
    //     // Navigate to LoanDue page and pass loanId as state
    //     navigate('/loandue', { state: { loanId: employee.loan_id } });
    // };
    const handleCloseForm = () => {
        setFormOpen(false);
        setSelectedEmployee(null);
    };

    const handleSubmiteditform = async (e) => {
        e.preventDefault();
    
        const { loan_id, due_amount, paid_amount, due_date, paid_on, collection_by } = selectedEmployee;
        let { city } = selectedEmployee; 
    
        if (!city) {
            city = selectedCity;
            console.log("city is set");
        }
    
        if (!city || !loan_id) {
            console.error('City or Loan ID is missing');
            return; 
        }
    
        try {
            const response = await Axios.put(`/update-future-date/${loan_id}`, {
                due_amount,
                paid_amount,
                due_date,
                paid_on,
                collection_by,
            });
            console.log('Update successful:', response.data);
            
            handleCloseForm(); // Close the dialog after successful submission
            window.location.reload();
        } catch (error) {
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors); // Store errors in state
            } else {
                console.error('Error updating entry:', error);
            }
        }
    };
    
    
    

    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement form submission logic here
        console.log("Submitting form for: ", selectedEmployee);
        handleCloseForm();
    };


    // const handleToggleExpandnew = (city) => {
    //     setSelectedCity(city); 
        
    //     console.log("selected city is", city);
    // };

    // const handleDownload = async () => {
    //     try {
    //         // Fetch the data to download
    //         const response = await Axios.get('/fetchCitiesWithDueLoansArray');
    //         const loansData = [];

    //         // Process the cities and their respective loan details
    //         for (const city of response.data.cities) {
    //             const loansResponse = await Axios.get(`/fetchCitiesWithDueLoans/${city}`);
    //             loansResponse.data.customers.forEach(customer => {
    //                 loansData.push({
    //                     City: city,
    //                     loanId: customer.loan_id,
    //                     UserID: customer.user_id,
    //                     DueAmount: customer.due_amount,
    //                     PaidAmount: customer.paid_amount,
    //                     DueDate: customer.due_date,
    //                     PaidDate: customer.paid_on,
    //                     Status: customer.status,
    //                     CollectionBy: customer.collection_by,
    //                 });
    //             });
    //         }

    //         // Convert the JSON data to a worksheet
    //         const worksheet = XLSX.utils.json_to_sheet(loansData);
    //         const workbook = XLSX.utils.book_new();
    //         XLSX.utils.book_append_sheet(workbook, worksheet, "Loans Data");

    //         // Generate the Excel file and trigger download
    //         const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    //         const blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    //         saveAs(blob, "Cities_Loans_Data.xlsx");
    //     } catch (error) {
    //         console.error('Error downloading Excel:', error);
    //     }
    // };


    
    const handleDownload = async () => {
        try {
            // Get current day (Monday, Tuesday, etc.)
            const today = new Date();
            const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' }); // Get full weekday name (e.g., "Monday")
            
            // Fetch the data to download
            const response = await Axios.get('/fetchCitiesWithDueLoansArray');
            const loansData = [];
            let currentIndex = 1;
    
            // Process the cities and their respective loan details
            for (const city of response.data.cities) {
                const loansResponse = await Axios.get(`/fetchCitiesWithDueLoans/${city}`);
                let cityData = [];
                let cityIndex = currentIndex;
    
                // Add the city name as a row without column splitting, and center the text
                loansData.push([
                    {
                        v: `${city} - Main Road`,
                        s: {
                            alignment: { horizontal: "center" },
                            font: { bold: true }
                        }
                    }
                ]);
    
                // Log the response to debug the structure of customers
                console.log(`Loans response for city ${city}:`, loansResponse.data);
    
                // Loop through the object keys (city codes)
                for (const cityCode in loansResponse.data) {
                    let customers = loansResponse.data[cityCode] || []; // Default to an empty array if not valid
    
                    // Check if customers is a number (like total_customer_count is 20)
                    if (typeof customers === 'number') {
                        console.warn(`Warning: customers for city ${cityCode} is a number (${customers}) instead of an array or object.`);
                        continue; // Skip this entry or handle it differently
                    }
    
                    // Check if the customers data is an array or an object with arrays
                    if (Array.isArray(customers)) {
                        // If customers is an array, process each customer
                        customers.forEach(customer => {
                            const customerData = [
                                cityIndex, // S. No column
                                customer.loan_id, // Acc. No
                                customer.user_name, // Name
                                customer.contact_no, // Contact No.
                                formatDate(customer.due_date), // Issue Date
                                customer.due_number, // Week
                                customer.due_amount, // Amount
                                customer.status, // Status
                            ];
                            cityData.push(customerData);
                            cityIndex++; // Increment serial number for each customer
                        });
                    } else if (typeof customers === 'object') {
                        // If customers is an object with keys (e.g., AT0015: Array(10)), process each key
                        for (const customerKey in customers) {
                            const customerList = customers[customerKey];
                            if (Array.isArray(customerList)) {
                                customerList.forEach(customer => {
                                    const customerData = [
                                        cityIndex, // S. No column
                                        customer.loan_id, // Acc. No
                                        customer.user_name, // Name
                                        customer.contact_no, // Contact No.
                                        formatDate(customer.due_date), // Issue Date
                                        getWeek(customer.due_date), // Week
                                        customer.due_amount, // Amount
                                        customer.status, // Status
                                    ];
                                    cityData.push(customerData);
                                    cityIndex++; // Increment serial number for each customer
                                });
                            }
                        }
                    } else {
                        console.error(`Error: customers for city ${cityCode} is neither an array nor an object`, customers);
                    }
                }
    
                // Add the customer data for the city
                if (cityData.length > 0) {
                    loansData.push(...cityData);
                }
                currentIndex = cityIndex; // Update the index for the next city
            }
    
            // Define headers for the Excel sheet
            const headers = ['S. No', 'Acc. No', 'Name', 'Contact No.', 'Issue Date', 'Week', 'Amount', 'Status'];
    
            // Convert the JSON data to a worksheet (Array of Arrays)
            const worksheet = XLSX.utils.aoa_to_sheet([headers, ...loansData]);
    
            // Merge cells for the city name rows to ensure no column split
            let cityRowIndex = 0;
            for (let rowIndex = 0; rowIndex < loansData.length; rowIndex++) {
                if (Array.isArray(loansData[rowIndex][0]) && loansData[rowIndex][0][0].v.includes(" - Main Road")) {
                    // Merge the cells in the row that contains the city name
                    worksheet['!merges'] = worksheet['!merges'] || [];
                    worksheet['!merges'].push({
                        s: { r: rowIndex, c: 0 },  // Start at first column
                        e: { r: rowIndex, c: headers.length - 1 }  // End at last column
                    });
                    cityRowIndex = rowIndex;
                }
            }
    
            // Format the columns (optional)
            const columns = worksheet['!cols'] || [];
            columns.push(
                { width: 10 }, // SNo column width
                { width: 15 }, // AccNo column width
                { width: 30 }, // Name column width
                { width: 20 }, // Contact No. column width
                { width: 15 }, // Issue Date column width
                { width: 10 }, // Week column width
                { width: 15 }, // Amount column width
                { width: 15 }  // Status column width
            );
            worksheet['!cols'] = columns;
    
            // Create a workbook and append the worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Loans Data");
    
            // Generate the Excel file and trigger download
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    
            // Save the file with dynamic name based on the day of the week
            const fileName = `Athi_${dayOfWeek}_Collection.xlsx`; // Dynamic filename
            saveAs(blob, fileName);
        } catch (error) {
            console.error('Error downloading Excel:', error);
        }
    };
    

    
    
    
    
    
    
    // Helper function to format date as dd-mm-yyyy
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    
    // Helper function to get the week number from a given date
    const getWeek = (dateString) => {
        const date = new Date(dateString);
        const startDate = new Date(date.getFullYear(), 0, 1);
        const diffInTime = date - startDate;
        const oneWeekInMilliseconds = 1000 * 60 * 60 * 24 * 7;
        return Math.ceil(diffInTime / oneWeekInMilliseconds);
    };
    
 

    const handleDownloadparticularcity = async (city) => {
        try {
            const response = await Axios.get(`/fetchCitiesWithDueLoans/${city}`);
            
            if (response.data.customers.length > 0) {
                // Prepare custom headers for the Excel sheet (City as first row)
                const cityHeader = [{ City: `Loans Data for ${city}` }];
                const headers = [
                    { loan_id: "Loan ID", address: "Address", city: "City", due_amount: "Due Amount", 
                      paid_amount: "Paid Amount", due_date: "Due Date", paid_on: "Paid On", 
                      collection_by: "Collection By", status: "Status", due_number: "Due Number" }
                ];
                
                // Map the customer data to the desired format
                const data = response.data.customers.map((item) => ({
                    loan_id: item.loan_id,
                    address: item.address,
                    city: item.city,
                    due_amount: item.due_amount,
                    paid_amount: item.paid_amount,
                    due_date: item.due_date,
                    paid_on: item.paid_on,
                    collection_by: item.collection_by,
                    status: item.status,
                    due_number: item.due_number
                }));
    
                // Combine the city header, general headers, and data
                const sheetData = [...cityHeader, ...headers, ...data];
                
                // Create a worksheet from the data
                const ws = XLSX.utils.json_to_sheet(sheetData, { skipHeader: true });
    
                // Set column widths for better readability
                ws['!cols'] = [
                    { wpx: 80 },  // Loan ID
                    { wpx: 100 }, // Address
                    { wpx: 80 }, // City
                    { wpx: 80 }, // Due Amount
                    { wpx: 80 }, // Paid Amount
                    { wpx: 80 }, // Due Date
                    { wpx: 80 }, // Paid On
                    { wpx: 80 }, // Collection By
                    { wpx: 80 },  // Status
                    { wpx: 80 }   // Due Number
                ];
    
                // Create a new workbook and add the worksheet
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, `Loans in ${city}`);
    
                // Save the Excel file with the city name
                XLSX.writeFile(wb, `Loan_Details_${city}.xlsx`);
            } else {
                alert("No data available to download.");
            }
        } catch (error) {
            console.error("Error fetching loans data", error);
            alert("Failed to download data.");
        }
    };
    
    
    
    return (
        <div className="employeecontainer" style={{ display: 'flex' }}>
           <Sidebar 
                isSidebarExpanded={isSidebarExpanded} 
                setSidebarExpanded={setSidebarExpanded} 
            />

            <div className="table-container-todaloandue">
                 {/* Download Icon */}
                 <div className="downloadcotainer">
                 <Button 
    onClick={handleDownload} 
    startIcon={<DownloadIcon />} 
    variant="contained" 
    color="primary" 
    className="download-button" // Add this class
>  </Button>        </div>
                {cities.length > 0 ? (
                    cities.map((city, index) => (
                        <div key={index} className="city-group">
                            <div 
                                className="city-header" 
                                onClick={() => handleToggleExpand(city)} 
                                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', justifyContent: 'space-between' }}
                            >
                                <h4 style={{ margin: 0 }}>City: {city}</h4>
                                

                                <span className={`expand-icon ${expandedCity === city ? 'rotate' : ''}`} style={{ marginLeft: '8px' }}>
                                           
                                                  <DownOutlined />
                                </span>
                            </div>
                            {expandedCity === city && (
    <div className="loan-details">
        <div className="downloadcontainer">
            <Button 
                onClick={() => handleDownloadparticularcity(city)} // Pass the city variable here
                startIcon={<DownloadIcon />} 
                variant="contained" 
                color="primary" 
                className="download-button"
            />
        </div>
        
        {Object.keys(groupedLoans).length > 0 ? (
            Object.keys(groupedLoans).map(loanId => (
                <div key={loanId} className="loan-group">
                    <div 
                        className="loan-header" 
                        onClick={() => handleToggleLoanExpand(loanId)} 
                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', justifyContent: 'space-between' }}
                    >
                        <h4>Loan ID: {loanId}</h4>
                        <span className={`expand-icon ${expandedLoanId === loanId ? 'rotate' : ''}`} style={{ marginLeft: '8px' }}>
                            <DownOutlined />
                        </span>
                    </div>
                    {expandedLoanId === loanId && (
                        <div className="user-list">
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                <thead>
                                    <tr>
                                        <th>User ID</th>
                                        <th>Due Amount</th>
                                        <th>Paid Amount</th>
                                        <th>Due Date</th>
                                        <th>Paid Date</th>
                                        <th>Status</th>
                                        <th>Collection By</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedLoans[loanId].map(employee => (
                                        <tr key={employee.id}>
                                            <td>{employee.user_id}</td>
                                            <td>{employee.due_amount}</td>
                                            <td>{employee.paid_amount}</td>
                                            <td>{employee.due_date}</td>
                                            <td>{employee.paid_on}</td>
                                            <td>{employee.status}</td>
                                            <td>{employee.collection_by}</td>
                                            <td>
                                                <a
                                                    title="Edit"
                                                    onClick={() => handleEditClick(employee)}
                                                    style={{
                                                        cursor: employee.status.toLowerCase() === "pending" || employee.status.toLowerCase() === "paid" ? "not-allowed" : "pointer",
                                                        pointerEvents: employee.status.toLowerCase() === "pending" || employee.status.toLowerCase() === "paid" ? "none" : "auto",
                                                        opacity: employee.status.toLowerCase() === "pending" || employee.status.toLowerCase() === "paid" ? 0.5 : 1
                                                    }}
                                                >
                                                    <EditIcon />
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))
        ) : (
            <div>No loans available for this city.</div>
        )}
    </div>
)}

                        </div>
                    ))
                ) : (
                    <p>No cities...</p>
                )}
<Dialog 
        open={isFormOpen} 
        onClose={handleCloseForm}
        sx={{ 
            '& .MuiDialogContent-root': {
                backgroundColor: 'rgb(209, 241, 221)', 
            },
        }}
    >
        <DialogTitle>Edit Employee Loan Details</DialogTitle>
        <DialogContent>
            {selectedEmployee && (
                <>
                    <TextField
                        label="User ID"
                        value={selectedEmployee.user_id || ''}
                        disabled
                        fullWidth
                        margin="normal"
                        InputProps={{
                            style: { 
                                backgroundColor: '#f0f0f0',
                                color: '#333',
                            },
                        }}
                    />
                    <TextField
                        label="Due Amount"
                        value={selectedEmployee.due_amount || ''}
                        disabled
                        fullWidth
                        margin="normal"
                        InputProps={{
                            style: { 
                                backgroundColor: '#f0f0f0',
                                color: '#333',
                            },
                        }}
                    />
                    <TextField
                        label="Paid Amount"
                        type="number"
                        value={selectedEmployee.paid_amount || ''}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, paid_amount: e.target.value })}
                        fullWidth
                        margin="normal"
                        error={!!errors.paid_amount} // Show error if exists
                        helperText={errors.paid_amount ? errors.paid_amount[0] : ''} // Display error message
                    />
                    <TextField
                        label="Due Date"
                        type="date"
                        value={selectedEmployee.due_date || ''}
                        disabled
                        fullWidth
                        margin="normal"
                        InputProps={{
                            style: { 
                                backgroundColor: '#f0f0f0',
                                color: '#333',
                            },
                        }}
                    />
                    <TextField
                        label="Paid Date"
                        type="date"
                        value={selectedEmployee.paid_on || ''}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, paid_on: e.target.value })}
                        fullWidth
                        margin="normal"
                        error={!!errors.paid_on} // Show error if exists
                        helperText={errors.paid_on ? errors.paid_on[0] : ''} // Display error message
                    />
                    <TextField
                        label="Collection By"
                        value={selectedEmployee.collection_by || ''}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, collection_by: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                </>
            )}
        </DialogContent>
        <DialogActions>
            <Button 
                onClick={handleCloseForm} 
                style={{ backgroundColor: '#3B82F6', color: 'white' }}
            >
                Cancel
            </Button>
            <Button 
                onClick={handleSubmiteditform} 
                style={{ backgroundColor: '#EF4444', color: 'white' }}
            >
                Save
            </Button>
        </DialogActions>
    </Dialog>



               
            </div>
        </div>
    );
};

export default CitiesWithDueLoans;


