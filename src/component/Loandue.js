import React, { useState, useEffect } from 'react';
import Axios from "../Axios";
import '../Employee.css'; // Assuming you have a CSS file for styling
import Sidebar from './Sidebar';
import GetAppIcon from '@mui/icons-material/GetApp';
import { registerFontkit } from 'fontkit';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
// import pdfTemplate from 'public/asset/A4 SV.pdf';
import { FileDownload } from '@mui/icons-material'; // Download icon
import { DownOutlined } from '@ant-design/icons'; 
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; 
import DeleteIcon from '@mui/icons-material/Delete'; 
import { Dialog, DialogActions, DialogContent, DialogTitle, Button,TextField,Collapse  } from '@mui/material';
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
    const [expandedRows, setExpandedRows] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    //  const [groupedLoans, setGroupedLoans] = useState({});
    const [filterLoanId, setFilterLoanId] = useState('');
    const [LoansGroup, setLoansGroup] = useState(initialGroupedLoans);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    // const filteredEmployees = (employees ?? []).filter(employee =>
    //     employee.loan_id?.toString().toLowerCase().includes(filterLoanId?.toLowerCase() || '')
    // );
  
    
    const [currentDate, setCurrentDate] = useState('');
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const [successMessage, setSuccessMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const location = useLocation(); 

  const filteredEmployees = (employees ?? []).filter(employee => {
    const loanId = employee.loan_id?.toString().toUpperCase() || '';  // Convert loan_id to string and uppercase
    console.log(loanId);
    const searchTerm = filterLoanId?.toUpperCase() || '';  // Convert filterLoanId to uppercase
    console.log('Loan ID:', loanId, 'Search Term:', searchTerm);  // Debugging logs
    return loanId.startsWith(searchTerm);  // Match the start of loan_id with filterLoanId
});

const handleToggleExpandsmall = (dueDate) => {
    setExpandedRows((prev) => ({
        ...prev,
        [dueDate]: !prev[dueDate], // Toggle the visibility of records for this due_date
    }));
};
const groupLoansById = (employees) => {
    if (!Array.isArray(employees)) {
        return {};
    }
  
    return employees.reduce((acc, employee) => {
        const loanId = employee.loan_id;
        if (!acc[loanId]) {
            acc[loanId] = [];
        }
        acc[loanId].push(employee);
        return acc;
    }, {});
};
  const groupedLoans = groupLoansById(filteredEmployees);

  console.log("Grouped Loans: ", groupedLoans);

//   const fetchEmployees = async () => {
//     try {
//         const response = await Axios.get('/loan-due-index');
//         const employeeData = response.data.data; // Assuming this is the correct path to your data
//         console.log("Fetched Employees: ", employeeData); // Log the response data
//         setEmployees(employeeData);  // Set employees data
//     } catch (error) {
//         console.error('Error fetching loan data:', error.message);
//     }
// };

const fetchEmployees = async () => {
    try {
        const response = await Axios.get('/loan-due-index');
        // Check if the response contains data directly or within a data property
        const employeeData = Array.isArray(response.data) ? response.data : response.data.data;
        console.log('Fetched Employees:', employeeData); // Debugging logs
        setEmployees(employeeData);
    } catch (error) {
        console.error('Error fetching loan data:', error.message);
    }
};

useEffect(() => {
    console.log("Employees: ", employees); // Log employees after setting them
    fetchEmployees();
}, []);

// Filter loans based on searchTerm (loanId)
const filteredLoans = Object.keys(groupedLoans).filter(loanId => {
    return loanId.toUpperCase().includes(filterLoanId?.toUpperCase() || '');
});

// function groupLoansById(employees) {
//     return employees.reduce((groups, employee) => {
//         const loanId = employee.loan_id;
//         if (!groups[loanId]) {
//             groups[loanId] = []; // Initialize as an array if it doesn't exist
//         }
//         groups[loanId].push(employee); // Group by loanId
//         return groups;
//     }, {});
// }


const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setFilterLoanId(e.target.value); // Update filterLoanId to the search term
};





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
                // response = await Axios.put(`/update-future-date/${loan_id}`, formData);
                response = await Axios.put(`/checkloancategory/${loan_id}`, formData);
            } else {
                // If not editing, create a new loan due
                response = await Axios.post('/loan-due', formData);
            }
    
            // Handle success for both update and create
            if (response.status === 200) {
                setSuccessMessage('Loan due saved successfully!');
                setSnackbarOpen(true);
                // window.location.reload();
            }
            else if(response.status === 404)
                {
                     alert('Error saving loan: ' + response.status);
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
                alert('Error saving loan: ');
            }
        }
    };
    
    
    
    
    

    const handleToggleExpand = (id) => {
        setExpandedLoanId(expandedLoanId === id ? null : id);
    };

  
    
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

    
    // const handleDownload = async (loanId) => {
    //     try {
    //         console.log('Fetching data for loan ID:', loanId); // Log the loan ID
            
    //         // Step 1: Fetch loan details (including loan_id and customer_name)
    //         const loanDetailsResponse = await Axios.get(`/loan`);
    //         console.log('Loan Details Response:', loanDetailsResponse.data);
            
    //         // Step 2: Fetch loan dues
    //         const dueResponse = await Axios.get(`/loan/${loanId}/dues`);
    //         console.log('API Response:', dueResponse.data); // Log the response to check data structure
            
    //         // Step 3: Map the loan dues and match customer_name from loan details
    //         const loanDetails = loanDetailsResponse.data.loans.find(loan => loan.loan_id === loanId);
    //         if (!loanDetails) {
    //             console.error('Loan details not found for the given loanId');
    //             return;
    //         }
            
    //         // Step 4: Create the header row with column names
    //         // const headerRow = [{
    //         //     LoanId: 'LoanId',
    //         //     CustomerName: 'CustomerName',
    //         //     UserID: 'UserID',
    //         //     DueAmount: 'DueAmount',
    //         //     PaidAmount: 'PaidAmount',
    //         //     Status: 'Status',
    //         //     DueDate: 'DueDate',
    //         //     PaidDate: 'PaidDate',
    //         //     CollectionBy: 'CollectionBy'
    //         // }];
            
    //         // Step 5: Create a row with LoanId and CustomerName in bold and large font
    //         const dataRow = [{
    //             LoanId: loanDetails.loan_id,
    //             CustomerName: loanDetails.customer_name,
    //             UserID: '',
    //             DueAmount: '',
    //             PaidAmount: '',
    //             Status: '',
    //             DueDate: '',
    //             PaidDate: '',
    //             CollectionBy: ''
    //         }];
            
    //         // Step 6: Map the loan dues for the remaining data
    //         const loanData = dueResponse.data.loan_dues.map((loan) => ({
    //             LoanId: loan.loan_id,
    //             UserID: loan.user_id,
    //             DueAmount: loan.due_amount,
    //             PaidAmount: loan.paid_amount,
    //             Status: loan.status,
    //             DueDate: loan.due_date,
    //             PaidDate: loan.paid_on,
    //             CollectionBy: loan.collection_by,
    //         }));
            
    //         console.log('Processed Loan Data:', loanData); // Log processed data
            
    //         // Step 7: Combine data rows
    //         const allData = [...dataRow,  ...loanData];
            
    //         // Step 8: Create a worksheet
    //         const worksheet = XLSX.utils.json_to_sheet(allData);
            
    //         // Step 9: Apply styles to the first row (LoanId and CustomerName)
    //         worksheet['A2'].s = {
    //             font: {
    //                 bold: true,  // Make text bold
    //                 sz: 20,      // Set font size to 20 (big size)
    //             },
    //         };
            
    //         worksheet['B2'].s = {
    //             font: {
    //                 bold: true,  // Make text bold
    //                 sz: 20,      // Set font size to 20 (big size)
    //             },
    //         };
            
    //         // Step 10: Apply styles to the header row (2nd row, no bold or size change)
    //         worksheet['A1'].s = {
    //             font: {
    //                 bold: false,  // Normal text (not bold)
    //                 sz: 10,       // Normal font size
    //             },
    //         };
            
    //         worksheet['B1'].s = {
    //             font: {
    //                 bold: false,  // Normal text (not bold)
    //                 sz: 10,       // Normal font size
    //             },
    //         };
            
    //         // Step 11: Add the data to the worksheet
    //         const workbook = XLSX.utils.book_new();
    //         XLSX.utils.book_append_sheet(workbook, worksheet, "Loan Data");
            
    //         // Step 12: Generate the Excel file and trigger download
    //         const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    //         const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    //         saveAs(blob, `Loan_${loanId}_Data.xlsx`);
            
    //         console.log('Download triggered for Loan:', loanId); // Log download trigger
    //     } catch (error) {
    //         console.error('Error downloading Excel:', error);
    //         if (error.response) {
    //             console.error('Response data:', error.response.data); // Log additional error info
    //         }
    //     }
    // };
    
    const handleDownload = async (loanId) => {
        try {
            // Fetch loan details and dues
            const loanDetailsResponse = await Axios.get(`/loan`);
            const dueResponse = await Axios.get(`/loan/${loanId}/dues`);
    
            const loanDetails = loanDetailsResponse.data.loans.find(loan => loan.loan_id === loanId);
            if (!loanDetails) {
                console.error('Loan details not found for the given loanId');
                return;
            }
    
            const loanData = dueResponse.data.loan_dues.map((loan, index) => ({
                SNo: index + 1,
                DueDate: loan.due_date,
                DueAmount: loan.due_amount,
                PaidDate: loan.paid_on,
                PaidAmount: loan.paid_amount,
                Status: loan.status,
                CollectionBy: loan.collection_by,
            }));
    
            const pdfTemplate = '/asset/A4%20SV.pdf';
            const existingPdfBytes = await fetch(pdfTemplate).then((res) => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const page = pdfDoc.getPages()[0];
            const { width, height } = page.getSize();
    
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
            // Increase height (y-coordinate) for the text "Sri Vari Finance"
            const headerHeight = height - 300; // original height
            const increasedHeight = headerHeight - 10; // Decrease the y-coordinate to move text down
    
            page.drawText('Sri Vari Finance', { x: 50, y: increasedHeight, size: 24, font });
    
            // Increase height for other text as well
            page.drawText(`Loan No: ${loanDetails.loan_id}`, { x: width - 200, y: increasedHeight, size: 20, font });
    
            page.drawText('Due Chart', { x: width / 2 - 75, y: increasedHeight - 30, size: 16, font });
    
            const tableY = increasedHeight - 80; // Adjust padding after title
            const headers = ['S.no', 'Due Date', 'Due Amount', 'Paid Date', 'Paid Amount', 'Status', 'Collection By'];
            const headerX = 50;
    
            // Define lineY1 and lineY2
            const lineY1 = tableY - 5;
            const lineY2 = tableY - 35; // Increased height for the line
    
            // Instead of drawLine, use drawRectangle for the header line
            // page.drawRectangle({
            //     x: headerX,
            //     y: lineY2,
            //     width: width - headerX - 50, // Adjust the width to cover the page
            //     height: 5, // Increased height for a more visible line
            //     color: rgb(0, 0, 0),
            // });
    
            headers.forEach((_, index) => {
                const columnX = headerX + index * 90;
    
                // Instead of drawLine, use drawRectangle to simulate vertical column lines
                page.drawRectangle({
                    x: columnX,
                    y: lineY2,
                    width: 0, // Increased width for vertical lines
                    height: lineY1 - lineY2,
                    color: rgb(0, 0, 0),
                });
            });
    
            // Add loan data in the table
            loanData.forEach((loan, index) => {
                const yPosition = tableY - (index + 1) * 25;
                page.drawText(String(loan.SNo), { x: headerX, y: yPosition, size: 16, font });
                page.drawText(loan.DueDate ? loan.DueDate : 'N/A', { x: headerX + 90, y: yPosition, size: 12, font });
                page.drawText(loan.DueAmount !== null ? loan.DueAmount.toString() : 'N/A', { x: headerX + 180, y: yPosition, size: 12, font });
                page.drawText(loan.PaidAmount !== null ? loan.PaidAmount.toString() : 'N/A', { x: headerX + 270, y: yPosition, size: 12, font });
                page.drawText(loan.Status ? loan.Status : 'N/A', { x: headerX + 360, y: yPosition, size: 12, font });
                page.drawText(loan.CollectionBy ? loan.CollectionBy : 'N/A', { x: headerX + 450, y: yPosition, size: 12, font });
            });
    
            // Save and download the PDF
            const pdfBytes = await pdfDoc.save();
            saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), `Loan_${loanId}_Details.pdf`);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };
    
    
    
    
    
 
    
    // const handleDownloadloandue = async (loanId, dueDate) => {
    //     try {
    //         console.log('Starting receipt generation for Loan ID:', loanId);
    
    //         // Path to the PDF template in the public directory
    //         const pdfTemplate = '/asset/A4%20SV.pdf'; // Ensure the correct URL
    //         const existingPdfBytes = await fetch(pdfTemplate).then((res) => res.arrayBuffer());
    
    //         const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    //         // Use default font
    //         const defaultFont = await pdfDoc.embedStandardFont('Helvetica');
    
    //         const pages = pdfDoc.getPages();
    //         const page = pages[0];
    //         const { height } = page.getSize();
    
    //         // Fetch loan details
    //         const response = await Axios.post('/loan_due_receipt', { loan_id: loanId, due_date: dueDate });
    //         console.log('Loan details response:', response.data);
    
    //         if (response.status !== 200) {
    //             throw new Error('Failed to fetch loan details');
    //         }
    
    //         const loanDetails = response.data;
    
    //         // Draw header
    //         const title = 'Sri Vari Finance';
    //         page.drawText(title, { x: 70, y: height - 100, size: 20, font: defaultFont });
    
    //         // Loan details data with INR instead of ₹ symbol
    //         const loanDetailsData = [
    //             { label: 'Branch', value: loanDetails.branch || 'N/A' },
    //             { label: 'Amount Due', value: `INR ${loanDetails.amount || 'N/A'}` },  // Use INR instead of ₹
    //             // Add other fields as needed
    //         ];
    
    //         const xOffsetLeft = 70;
    //         const xOffsetRight = page.getWidth() - 270; // Right side offset for loan details
    //         const yOffsetStart = height - 220;
    
    //         loanDetailsData.forEach((item, index) => {
    //             const yOffset = yOffsetStart - index * 20;
    //             page.drawText(item.label, { x: xOffsetLeft, y: yOffset, size: 12, font: defaultFont });
    //             page.drawText(String(item.value), { x: xOffsetRight, y: yOffset, size: 12, font: defaultFont });
    //         });
    
    //         // Save and download the PDF
    //         const pdfBytes = await pdfDoc.save();
    //         const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    //         const url = URL.createObjectURL(blob);
    
    //         // Trigger file download
    //         const link = document.createElement('a');
    //         link.href = url;
    //         link.download = `loan_receipt_${loanId}.pdf`;
    //         link.click();
    //         URL.revokeObjectURL(url);
    
    //     } catch (error) {
    //         console.error('Error generating receipt:', error);
    //     }
    // };
    
    const handleDownloadloandue = async (loanId, dueDate) => {
        try {
            console.log('Starting receipt generation for Loan ID:', loanId);
    
            // Path to the PDF template in the public directory
            const pdfTemplate = '/asset/A4%20SV.pdf'; // Ensure the correct URL
    
            // Fetch the PDF template
            const existingPdfBytes = await fetch(pdfTemplate).then((res) => res.arrayBuffer());
            console.log('Fetched PDF template');
            
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
            const pages = pdfDoc.getPages();
            const page = pages[0];
            const { height } = page.getSize();
            console.log('PDF page size:', { height });
    
            // Fetch loan details
            const response = await Axios.post('/loan_due_receipt', { loan_id: loanId, due_date: dueDate });
            console.log('Loan details response:', response.data);
    
            if (response.status !== 200) {
                throw new Error('Failed to fetch loan details');
            }
    
            const loanDetails = response.data;
    
            // Draw title
            const title = 'Sri Vari Finance';
            page.drawText(title, { x: 70, y: height - 300, size: 22, font: boldFont });
            
            const padding1 = 10; 
             // Draw address after title (split the address to handle the "Tel" on a new line)
        const addressLine1 = '113A, Kariya Manicka Perumal Kovil Street, Melakadayanallur-627751.';
        const addressLine2 = 'Tel: +91 99621 92623 | Website: www.srivarifinance.in | CIN: S651979TN19BLC0068874.';
        page.drawText(addressLine1, { x: 70, y: height - 330, size: 16, font: regularFont });
        page.drawText(addressLine2, { x: 70, y: height - 330 - (16 + padding1), size: 16, font: regularFont });
           
    
           // Create space after the addressLine2
            const spaceAfterAddress = 20; // You can adjust this value to control the amount of space

            // Next element drawing (for example, the horizontal line after the address)
            page.drawLine({
                start: { x: 70, y: height - 350 - spaceAfterAddress },
                end: { x: page.getWidth() - 70, y: height - 350 - spaceAfterAddress },
                thickness: 1,
                color: rgb(0, 0, 0),
            });
                
           // Calculate final Y offset for signature (bottom of the page)
                const signatureYOffset = 40; // Distance from the bottom of the page
                const xSignaturePosition = page.getWidth() - 180; // Align to the right side

                // Draw Loan Details heading
                const loanDetailsHeading = 'Loan Details';
                page.drawText(loanDetailsHeading, { x: 70, y: height - 400, size: 20, font: boldFont });

                // Draw loan details (right side)
                const loanDetailsData = [
                    { label: 'Branch:', value: 'KOVILPATTI BRANCH' },
                    { label: 'Doc Type:', value: 'Loan Collection Cash' },
                    { label: 'Received With Thanks from Mr/Mrs.', value: loanDetails.user_name || 'N/A' },
                    { label: 'A sum of Rs.', value: loanDetails.paid_amount || 'N/A' },
                    { label: 'Employee Number:', value: loanDetails.employee_number || 'N/A' },
                    { label: 'Loan Number', value: loanId || 'N/A' },
                ];
                const spaceAfterAddress1 = height-100;
                page.drawLine({
                    start: { x: 70, y: height - 350 - spaceAfterAddress1 },
                    end: { x: page.getWidth() - 70, y: height - 350 - spaceAfterAddress1 },
                    thickness: 1,
                    color: rgb(0, 0, 0),
                });
                const xOffsetLeft = 70;
                const xOffsetRight = page.getWidth() - 270; 
                const yOffsetStart = height - 420;

                // Draw loan details dynamically
                let currentYOffset = yOffsetStart;
                const padding = 10;  // Adjust padding value as per your need
                loanDetailsData.forEach((item, index) => {
                    const text = `${item.label} ${item.value}`;
                    
                    // Draw the text on the page
                    page.drawText(text, { 
                        x: xOffsetLeft, 
                        y: currentYOffset, 
                        size: 16, 
                        font: regularFont 
                    });
                    
                    // Adjust currentYOffset with padding for spacing between rows
                    currentYOffset -= (15 + padding);  // Added padding between rows
                });


                // Draw signature at the bottom of the page
                page.drawText('Sri Vari Finance', { x: xSignaturePosition, y: signatureYOffset + 20, size: 16, font: regularFont });
                page.drawText('Authority Signatory', { x: xSignaturePosition, y: signatureYOffset, size: 16, font: regularFont });

                // Save and trigger download
                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                console.log('Blob URL:', url);

                // Trigger file download
                const link = document.createElement('a');
                link.href = url;
                link.download = 'loan_receipt.pdf';
                link.click();
                URL.revokeObjectURL(url);
                console.log('Download triggered');

    
            // Log action on the server
            const userId = localStorage.getItem('user_id');
            const isoDate = new Date().toISOString();
            const now = isoDate.slice(0, 19).replace('T', ' ');
    
            await Axios.post('/download_loan_receipt', {
                table_name: 'loan_due',
                modified_data: { receipt_type: 'loan_receipt' },
                modified_on: now,
                modified_by: userId,
            });
            console.log('Download action logged');
        } catch (error) {
            console.error('Error generating receipt:', error);
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
                        {/* <div 
                            className="loan-header" 
                            onClick={() => handleToggleExpand(loanId)} 
                            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', justifyContent: 'space-between' }}
                        >
                            <h4 style={{ margin: 0 }}>Loan ID: {loanId}</h4>
                            
                            {groupedLoans[loanId] && groupedLoans[loanId].length > 0 && (
                                <h4 style={{ margin: 0 }}>
                                    {groupedLoans[loanId][0].user_name}
                                </h4>
                            )}
                            
                            <span 
                                className={`expand-icon ${expandedLoanId === loanId ? 'rotate' : ''}`} 
                                style={{ marginLeft: '8px', color: 'white' }}
                            >
                                <DownOutlined />
                            </span>
                        </div> */}
                        <div 
                            className="loan-header" 
                            onClick={() => handleToggleExpand(loanId)} 
                            style={{
                                padding: '10px 0',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'flex-start', // Ensure all items are aligned to the left
                                flexWrap: 'wrap', // Ensures wrapping if necessary for small screens
                            }}
                        >
                             <div style={{ marginRight: '80px' }}>
                             <h4 style={{ margin: 0 }}>Loan ID: {loanId}</h4>
                                </div>
                           
                                <div style={{ textAlign: 'left' }}>
                                {groupedLoans[loanId] && groupedLoans[loanId].length > 0 && (
                                    <h4 style={{ margin: 0 }}>
                                        {groupedLoans[loanId][0].user_name}
                                    </h4>
                                )}
                            </div>

                           
                            
                            <span 
                                className={`expand-icon ${expandedLoanId === loanId ? 'rotate' : ''}`} 
                                style={{ color: 'white' }}
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
                 sx={{
                   '&:hover': {
                     backgroundColor: 'primary.main', // Ensure hover effect is primary color
                   },
                 }}
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
                    <th>Receipt</th>
                </tr>
            </thead>
            <tbody>
                {/* Ensure groupedLoans[loanId] is an array */}
                {/* {Array.isArray(groupedLoans[loanId]) && groupedLoans[loanId].map((employee, index) => {
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
                            
                            <td style={{
                                color: employee.status === 'paid' ? 'green' :
                                    employee.status === 'pending' ? 'yellow' :
                                    employee.status === 'unpaid' ? 'red' : 'black'
                            }}>
                                {employee.status}
                            </td>
                            

                            <td>{new Date(employee.due_date).toLocaleDateString()}</td>
                            <td>
                                <IconButton 
                                    onClick={() => handleEdit(employee)} 
                                    disabled={!canEdit}
                                >
                                    <EditIcon />
                                </IconButton>
                            </td>
                            <td>
                            {(employee.status === 'paid' || employee.status === 'pending') && (
                                <IconButton onClick={() => handleDownloadloandue(employee.loan_id, employee.due_date)}>
                                    <GetAppIcon />
                                </IconButton>
                            )}
                        </td>
                        </tr>
                    );
                })} */}
            {Array.isArray(groupedLoans[loanId]) && groupedLoans[loanId].map((employee, index) => {
    const isPending = employee.status === 'pending';
    const isPaid = employee.status === 'paid';
    const isLastDue = index === groupedLoans[loanId].length - 1;
    const canEdit = (isLastDue && isPending) || (!isPending && !isPaid);

    // Find if there are other records with the same due_date
    const sameDueDateCount = groupedLoans[loanId].filter(e => e.due_date === employee.due_date).length;
    
    // Apply different styles if more than one record has the same due_date
    const isMultipleSameDueDate = sameDueDateCount > 1;

    return (
        <tr 
            key={employee.id} 
            className={`
                ${isLastDue && isPending ? 'pending-loan' : ''} 
                ${isMultipleSameDueDate ? 'highlight-same-due-date' : ''}
            `}
        >
            <td>{index + 1}</td>
            <td>{employee.loan_id}</td>
            <td>{employee.user_id}</td>
            <td>{employee.next_amount || employee.due_amount}</td>
            <td>{employee.paid_amount}</td>
            <td>{employee.pending_amount}</td>
            
            <td style={{
                color: employee.status === 'paid' ? 'green' :
                    employee.status === 'pending' ? 'yellow' :
                    employee.status === 'unpaid' ? 'red' : 'black'
            }}>
                {employee.status}
            </td>
            
            <td>{new Date(employee.due_date).toLocaleDateString()}</td>
            <td>
                <IconButton 
                    onClick={() => handleEdit(employee)} 
                    disabled={!canEdit}
                >
                    <EditIcon />
                </IconButton>
            </td>
            <td>
                {(employee.status === 'paid' || employee.status === 'pending') && (
                    <IconButton onClick={() => handleDownloadloandue(employee.loan_id, employee.due_date)}>
                        <GetAppIcon />
                    </IconButton>
                )}
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
      <DialogContent style={{ backgroundColor: "#fff" }}>
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
          onClick={handleSubmit}
          style={{ backgroundColor: "#07387A", color: "white" }}
        >
          {editingEmployee ? "Update" : "Add"}
        </Button>
        <Button
          onClick={() => setShowForm(false)}
          style={{ backgroundColor: "red", color: "white" }}
        >
          Cancel
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
