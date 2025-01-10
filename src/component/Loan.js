import React, { useState, useEffect } from 'react';
import Axios from "../Axios";
import '../component/Loan.css';
import Sidebar from './Sidebar';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { PDFDocument, rgb ,StandardFonts} from 'pdf-lib';

// import pdfTemplate from 'public/asset/A4 SV.pdf';
import { FileDownload } from '@mui/icons-material'; // Download icon
import { Box, Typography, IconButton ,TextField} from '@mui/material';
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
    // backgroundColor: 'rgba(60, 179, 113, 0.3)',
    padding: '5px', // Padding around the text
    borderRadius: '4px', // Rounded corners
    // boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)', 
    color: '#000', // Black text color
    fontWeight: 'bold', // Bold text
   
};
const addWeeks = (date, weeks) => {
    const originalDate = new Date(date);
    originalDate.setDate(originalDate.getDate() + weeks * 7);

    // Format the result as "yyyy-MM-dd"
    const formattedDate = `${originalDate.getFullYear()}-${(originalDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${originalDate.getDate().toString().padStart(2, '0')}`;

    return formattedDate;
};


// const addMonths = (date, months) => {
//     const result = new Date(date);
//     result.setMonth(result.getMonth() + months);
//     return result;
// };

const addMonths = (date, monthsToAdd) => {
    // Parse the input date
    const originalDate = new Date(date);
    let day = originalDate.getDate();
    let month = originalDate.getMonth() + 1; // Months are 0-indexed
    let year = originalDate.getFullYear();

    // Add the months
    let newMonth = month + monthsToAdd;
    let newYear = year;

    // Adjust for years if the month exceeds 12
    if (newMonth > 12) {
        newYear += Math.floor((newMonth - 1) / 12);
        newMonth = ((newMonth - 1) % 12) + 1;
    }

    // Handle date overflows (e.g., Feb 30 -> Mar 2)
    const daysInNewMonth = new Date(newYear, newMonth, 0).getDate(); // Days in the target month
    if (day > daysInNewMonth) {
        day = daysInNewMonth; // Adjust to the last valid day of the month
    }

    // Construct the final date
    const result = new Date(newYear, newMonth - 1, day);

    // Format the result as "yyyy-MM-dd" manually
    const formattedDate = `${result.getFullYear()}-${(result.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${result.getDate().toString().padStart(2, '0')}`;

    console.log(
        `Input Date: ${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}, ` +
        `Months to Add: ${monthsToAdd}, Result: ${formattedDate}`
    );

    return formattedDate;
};














const Loan = () => {
    const [open, setOpen] = useState(false);
    const years = Array.from(
        { length: 30 },
        (_, index) => new Date().getFullYear() - index
      );
      const segments = ["Two Wheeler", "Three Wheeler-AUTO", "Three Wheeler-LOAD AUTO", "Four Wheeler"];
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [loans, setLoans] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingLoan, setEditingLoan] = useState(null);
    const [expandedLoanId, setExpandedloanId] = useState(null);
    // const [expandedLoanId, setExpandedLoanId] = useState(null);
    const [loanCategories, setLoanCategories] = useState([]);
    const [users, setUsers] = useState([]); // State to hold user list
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // Search term state
    const [showVehicleFields, setShowVehicleFields] = useState(false);
    const [makes, setMakes] = useState([]);
    const [segment, setsegment] = useState([]);
    const [selectedMake, setSelectedMake] = useState('');
    const [models, setModels] = useState([]);
    const [errors, setErrors] = React.useState({});
    
   
    const fetchMakes = async (segment) => {
        try {
            const response = await Axios.get(`/vehicle-makes`, {
                params: { segment }, // Send segment as a query parameter
            });
            setMakes(response.data); // Update makes list
        } catch (error) {
            console.error("Error fetching vehicle makes:", error);
        }
    };
    
     
//   useEffect(() => {
//     const fetchMakes = async () => {
//       try {
//         const response = await Axios.get('/vehicle/makes');
//         setMakes(response.data);
//       } catch (error) {
//         console.error('Error fetching vehicle makes:', error);
//       }
//     };

//     fetchMakes();
//   }, []);

  // Fetch models and colors based on selected make
  const fetchModelsAndColors = async (make) => {
    try {
      const response = await Axios.get(`/vehicle/models-colors/${make}`);
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching vehicle models and colors:', error);
    }
  };

  // Handle make selection
  const handleMakeChange = (value) => {
    setFormData({ ...formData, vehicle_make: value, vehicle_model: '' });
    fetchModelsAndColors(value);
  };
    const [formData, setFormData] = useState({
        // loan_id: '',
      
        segment:'',
        vehicle_make:'',
        vehicle_model:'',
        year_of_manufacture:'',
        VIN_number:'',
        chassis_number:'',
        engine_number:'',
        vehicle_price:'',
        down_payment:'',
        vehicle_exterior_photo_front:'',
        vehicle_exterior_photo_back:'',
        vehicle_exterior_photo_left:'',
        vehicle_exterior_photo_right:'',
        odometer_reading_photo:'',
        VIN_plate_number_photo:'',
        engine_number_photo:'',
        chassis_number_photo:'',

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
                // const loanWithUserDetails = await Promise.all(response.data.loans.map(async (loan) => {
                //     try {
                //         const userResponse = await Axios.get(`/profile/${loan.user_id}`); 
                //         console.log(`User details for loan ${loan.id}:`, userResponse.data);
                //         return { ...loan, userDetails: userResponse.data.message }; 
                     
                //     } catch (userError) {
                //         console.error(`Error fetching user details for loan ${loan.id}:`, userError);
                //         return { ...loan, userDetails: null }; // Handle error case, set userDetails as null
                //     }
                // }));
    
                // setLoans(loanWithUserDetails);
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
            day: loan.day || '',    
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
            day:'',
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
        setsegment(value);
        fetchMakes(value); // Call API with the selected segment
        const imageFields = [
            'image',
            'vehicle_exterior_photo_front',
            'vehicle_exterior_photo_back',
            'vehicle_exterior_photo_left',
            'vehicle_exterior_photo_right',
            'odometer_reading_photo',
            'VIN_plate_number_photo',
            'engine_number_photo',
            'chassis_number_photo',
        ];
    
        if (imageFields.includes(name)) {
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
            setFormData((prevData) => {
                const updatedData = {
                    ...prevData,
                    [name]: value,
                };
                console.log('Updated Form Data:', updatedData); // Log the updated form data
                return updatedData;
            });
        }
    
        // Handle category selection
        if (name === 'category_id') {
            const selected = loanCategories.find(category => category.id === parseInt(value));
            console.log("selectedCategory", selected);
            setSelectedCategory(selected);
        }else
        {}
    
        if (name === "loan_date") {
            const [day, month, year] = value.split("/");
            const formattedValue = `${year}-${month}-${day}`;
            setFormData({ ...formData, loan_date: formattedValue });
        }



        // Handle loan date calculations
        if (name === 'loan_date' && selectedCategory) {
            const loanDate = new Date(value);
            let loanCloseDate;
    
            console.log('Selected Category Type:', selectedCategory.category_type);

            if (selectedCategory.category_type === "weekly") {
                console.log('Selected Category Type:addWeeks:', selectedCategory.category_type);
                loanCloseDate = addWeeks(loanDate, selectedCategory.duration);
            } else if (selectedCategory.category_type === "monthly") {
                console.log('Selected Category Type:addMonths:', selectedCategory.category_type);
                loanCloseDate = addMonths(loanDate, selectedCategory.duration);
            }
    
            setFormData((prevData) => ({
                ...prevData,
                loan_date: value,
                loan_closed_date: loanCloseDate
                //   loan_closed_date: loanCloseDate ? loanCloseDate.toISOString().split('T')[0] : ''
            }));
        }else{}
    };
  
    const handle_submit_vehicle_detail = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };
    
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLoan) {

                const newErrors = {};

                // Validate required fields
                if (!formData.segment) {
                  newErrors.segment = "Segment is required";
                }
                if (!formData.vehicle_make) {
                  newErrors.vehicle_make = "Vehicle Make is required";
                }
                if (!formData.vehicle_model) {
                  newErrors.vehicle_model = "Vehicle Model is required";
                }
           
                setErrors(newErrors);
                if (Object.keys(newErrors).length === 0) {
                await Axios.put(`/loan/${editingLoan.loan_id}`, formData);
                alert('Loan updated successfully!');
                }
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
            const UserId = localStorage.getItem('user_id');
            const response = await Axios.put(`loan/${loan_id}/status`, {
                employee_id:UserId,
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

    // const handleDownloadReceipt = async () => {
    //     try {
    //         // Replace with your PDF template URL or path
    //         // const pdfTemplate = '/path/to/your/template.pdf'; 
    
    //         // Fetch the existing PDF template
    //         const existingPdfBytes = await fetch(pdfTemplate).then((res) => res.arrayBuffer());
            
    //         // Load the PDF template
    //         const pdfDoc = await PDFDocument.load(existingPdfBytes);
    //         const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    //         // Get the first page of the PDF
    //         const pages = pdfDoc.getPages();
    //         const page = pages[0];
    
    //         // Define the content positions and text dynamically
    //         const { height } = page.getSize();
    //         const loanDetails = {
    //             email: '',
    //             loanAmount: '',
    //             loanDate: '',
    //             loanClosedDate: '',
    //         };
    
    //         // Add dynamic content to specific positions
    //        // Add bold text for "Sri Vari Finance"
    //     const text = 'Sri Vari Finance';
    //     const fontSize = 20;
    //     const x = 70;
    //     const y = height - 300;

    //     page.drawText(text, {
    //         x,
    //         y,
    //         size: fontSize,
    //         color: rgb(0, 0, 0),
    //         font: boldFont, // Bold font
    //     });

    //     // Calculate text width to draw the underline
    //     const textWidth = boldFont.widthOfTextAtSize(text, fontSize);
    //     const lineY = y - 2; // Adjust line position slightly below the text

    //     // Draw a blue underline
    //     page.drawLine({
    //         start: { x, y: lineY },
    //         end: { x: x + textWidth, y: lineY },
    //         thickness: 2, // Line thickness
    //         color: rgb(0, 0, 1), // Blue color
    //     });

    //         page.drawText(`Email: ${loanDetails.email}`, {
                
    //             x,
    //             y: height - 60,
    //             size: 12,
    //             color: rgb(0, 0, 0),
    //         });
    //         page.drawText(`Loan Amount: ${loanDetails.loanAmount}`, {
    //             x: 50,
    //             y: height - 100,
    //             size: 12,
    //             color: rgb(0, 0, 0),
    //         });
    //         page.drawText(`Loan Date: ${loanDetails.loanDate}`, {
    //             x: 50,
    //             y: height - 120,
    //             size: 12,
    //             color: rgb(0, 0, 0),
    //         });
    //         page.drawText(`Loan Closed Date: ${loanDetails.loanClosedDate}`, {
    //             x: 50,
    //             y: height - 140,
    //             size: 12,
    //             color: rgb(0, 0, 0),
    //         });
    
    //         // Serialize the updated PDF document
    //         const pdfBytes = await pdfDoc.save();
    
    //         // Create a Blob for download
    //         const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    //         const url = URL.createObjectURL(blob);
    
    //         // Trigger download of the PDF file
    //         const link = document.createElement('a');
    //         link.href = url;
    //         link.download = 'loan_receipt.pdf';
    //         link.click();
    
    //         // Clean up the URL object
    //         URL.revokeObjectURL(url);

      

    //     // Make an API call with user_id
    //     const userId = localStorage.getItem('user_id');
    //     const isoDate = new Date().toISOString(); // "2024-12-16T08:00:56.050Z"

    //     // Convert to MySQL-compatible format (YYYY-MM-DD HH:MM:SS)
    //     const now = isoDate.slice(0, 19).replace('T', ' '); // "2024-12-16 08:00:56"
    //     // Send the payload using Axios
    //     const apiResponse = await Axios.post('/download_loan_receipt', {
    //         table_name: 'loan_due',
            
    //         modified_data: { receipt_type: "loan_receipt" },  
           
    //         modified_on: now,
    //         modified_by: userId, // Include user_id from localStorage
    //     });

    //     // Handle API response
    //     if (apiResponse.ok) {
    //         const data = await apiResponse.json();
    //         console.log('API response:', data);
    //     } else {
    //         console.error('API call failed:', apiResponse.statusText);
    //     }
    
    //     } catch (error) {
    //         console.error('Error creating PDF:', error);
    //     }
    // };
    const handleDownloadReceipt = async (loanId) => {
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
            const response = await Axios.post('/loan_receipt', { loan_id: loanId });
            console.log('Loan details response:', response.data);
    
            if (response.status !== 200) {
                throw new Error('Failed to fetch loan details');
            }
    
            const loanDetails = response.data;
    
            // Draw title
            const title = 'Sri Vari Finance';
            page.drawText(title, { x: 70, y: height - 300, size: 24, font: boldFont });
    
             // Draw address after title (split the address to handle the "Tel" on a new line)
        const addressLine1 = '113A, Kariya Manicka Perumal Kovil Street, Melakadayanallur-627751.';
        const addressLine2 = 'Tel: +91 99621 92623 | Website: www.srivarifinance.in | CIN: S651979TN19BLC0068874.';
        page.drawText(addressLine1, { x: 70, y: height - 330, size: 16, font: regularFont });
        page.drawText(addressLine2, { x: 70, y: height - 350, size: 16, font: regularFont });
           
    
           // Create space after the addressLine2
            const spaceAfterAddress = 20; // You can adjust this value to control the amount of space

            // Next element drawing (for example, the horizontal line after the address)
            page.drawLine({
                start: { x: 70, y: height - 350 - spaceAfterAddress },
                end: { x: page.getWidth() - 70, y: height - 350 - spaceAfterAddress },
                thickness: 1,
                color: rgb(0, 0, 0),
            });
                
            // Draw Loan Details heading
            const loanDetailsHeading = 'Loan Details';
            page.drawText(loanDetailsHeading, { x: 70, y: height - 400, size: 20, font: boldFont });
    
            // Draw loan details (right side)
            const loanDetailsData = [
                { label: 'Branch', value: loanDetails.branch || 'N/A' },
                { label: 'Employee Number', value: loanDetails.employee_id || 'N/A' },
                { label: 'Loan Number', value: loanDetails.loan_id || 'N/A' },
                { label: 'Loan Amount', value: loanDetails.loan_amount || 'N/A' },
                { label: 'Due Amount', value: loanDetails.due_amount || 'N/A' },
                { label: 'Tenure', value: loanDetails.duration || 'N/A' },
            ];
    
            const xOffsetLeft = 70;
            const xOffsetRight = page.getWidth() - 270; // Right side offset for loan details
            const yOffsetStart = height - 420;
            
            // Draw loan details on the right
            loanDetailsData.forEach((item, index) => {
                const yOffset = yOffsetStart - index * 20;
                page.drawText(item.label, { x: xOffsetLeft, y: yOffset, size: 16, font: regularFont });
                page.drawText(String(item.value), { x: xOffsetRight, y: yOffset, size: 16, font: regularFont });


            });
    
            // Draw customer details after loan details (left side)
            const customerDetails = [
                { label: 'Customer No:', value: loanDetails.customer_id || 'N/A' },
                { label: 'Customer Name:', value: loanDetails.user_name || 'N/A' },
                { label: 'Mobile Number:', value: loanDetails.mobile_number || 'N/A' },
                { label: 'Guarantor Name:', value: loanDetails.ref_name || 'N/A' },
                { label: 'Guarantor Mobile:', value: loanDetails.alter_mobile_number || 'N/A' },
            ];
    
            const yOffsetCustomerDetails = yOffsetStart - (loanDetailsData.length * 20) - 30;
            
            customerDetails.forEach((item, index) => {
                const yOffset = yOffsetCustomerDetails - index * 20;
                page.drawText(item.label, { x: xOffsetLeft, y: yOffset, size: 16, font: regularFont });
                page.drawText(item.value, { x: xOffsetRight, y: yOffset, size: 16, font: regularFont });
            });
    
            // Draw horizontal line after customer details
            const yOffsetAfterCustomer = yOffsetCustomerDetails - customerDetails.length * 20 - 30;
            page.drawLine({
                start: { x: 70, y: yOffsetAfterCustomer },
                end: { x: page.getWidth() - 70, y: yOffsetAfterCustomer },
                thickness: 1,
                color: rgb(0, 0, 0),
            });
    
           // Draw Vehicle Details heading
const vehicleDetailsHeading = 'Vehicle Details';
page.drawText(vehicleDetailsHeading, { x: 70, y: yOffsetAfterCustomer - 30, size: 20, font: boldFont });

// Draw vehicle details (left side)
const vehicleDetailsLeft = [
    { label: 'Segment', value: loanDetails.segment || 'N/A' },
    { label: 'Vehicle Number', value: loanDetails.VIN_number || 'N/A' },
    { label: 'Make', value: loanDetails.vehicle_make || 'N/A' },
    { label: 'Model', value: loanDetails.vehicle_model || 'N/A' },
];

const xOffsetLeftVehicle = 70;
const xOffsetRightVehicle = page.getWidth() - 270;
const yOffsetStartVehicle = yOffsetAfterCustomer - 50;

vehicleDetailsLeft.forEach((item, index) => {
    const yOffset = yOffsetStartVehicle - index * 20;
    page.drawText(item.label, { x: xOffsetLeftVehicle, y: yOffset, size: 16, font: regularFont });
    page.drawText(item.value, { x: xOffsetRightVehicle, y: yOffset, size: 16, font: regularFont });
});

// Draw vehicle details (right side)
const vehicleDetailsRight = [
    { label: 'Year of Manufacture', value: loanDetails.year_of_manufacture || 'N/A' },
    { label: 'Chassis Number', value: loanDetails.chassis_number || 'N/A' },
];

const yOffsetStartVehicleRight = yOffsetStartVehicle - vehicleDetailsLeft.length * 20;
vehicleDetailsRight.forEach((item, index) => {
    const yOffset = yOffsetStartVehicleRight - index * 20;
    page.drawText(item.label, { x: xOffsetLeftVehicle, y: yOffset, size: 16, font: regularFont });
    page.drawText(item.value, { x: xOffsetRightVehicle, y: yOffset, size: 16, font: regularFont });
});

// Draw final signature and authority
// Calculate final Y-offset for the footer section
const footerYOffset = 200; // Distance from the bottom of the page
const pageBottomYOffset = footerYOffset;

page.drawText('Sri Vari Finance', { 
    x: page.getWidth() - 180, 
    y: pageBottomYOffset, 
    size: 16, 
    font: regularFont 
});

page.drawText('Authority Signatory', { 
    x: page.getWidth() - 180, 
    y: pageBottomYOffset - 20, 
    size: 14, 
    font: regularFont 
});
            // Save and trigger download
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            console.log('Blob URL:', url);
    
            // Trigger file download
            const link = document.createElement('a');
            link.href = url;
            link.download = 'loan_details.pdf';
            link.click();
            URL.revokeObjectURL(url);
            console.log('Download triggered');
    
            // Log action on the server
            const userId = localStorage.getItem('user_id');
            const isoDate = new Date().toISOString();
            const now = isoDate.slice(0, 19).replace('T', ' ');
    
            await Axios.post('/download_loan_receipt', {
                table_name: 'loan_due',
                modified_data: { receipt_type: 'loan_details' },
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
                            style={{
                                padding: '10px 0',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'flex-start', // Ensure all items are aligned to the left
                                flexWrap: 'wrap', // Ensures wrapping if necessary for small screens
                            }}
                        >
                            <div style={{ marginRight: '5px', flex: 1 }}>
                                <div style={{ textAlign: 'left' }}>
                                    <span className="employee-name">Loan ID: {loanItem.loan_id}</span>
                                </div>
                            </div>

                            <div style={{ marginRight: '5px', flex: 1, textAlign: 'left' }}>
                                <span className="employee-name">
                                    {loanItem.customer_name || 'No username'}
                                </span>
                            </div>
                            
                            <div style={{ marginRight: '5px', flex: 1, textAlign: 'left' }}>
                                <span className="employee-city">
                                    {loanItem.city || 'No city'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
                                    <span
                                        onClick={() => handleViewLoan(loanItem.loan_id)}
                                        style={{ cursor: 'pointer', marginRight: '5px' }}
                                    >
                                        {/* Eye Icon */}
                                        <VisibilityIcon />
                                    </span>
                                </div>


                                    <span className={`expand-icon ${expandedLoanId === loanItem.loan_id ? 'rotate' : ''}`}>
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
    <Button
  variant="contained"
  sx={{
    color: '#fff', // Text color
    backgroundColor: '#E8B701', // Background color
    width: '200px', // Adjusted width for better visibility
    '&:hover': {
      backgroundColor: '#D6A300', // Optional hover effect
    },
    padding: '5px 10px', // Optional padding for better spacing
  }}
  startIcon={<FileDownload />}
  onClick={() => handleDownloadReceipt(loanDetails.loan_id)} // Arrow function
>
  Loan Details
</Button>



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
      {/* <div className="employee-detail-item-image">
          <span>Transaction Proof:</span>
          {loanDetails.image ? (
              <img src={loanDetails.image} alt="transactionimage" className="image" />
          ) : (
              "N/A"
          )}
      </div> */}
     <div className="employee-detail-images">
  {/* Left Column */}
  <div className="employee-detail-column">
    {[
      { label: "Transaction Image", key: "image" },
      { label: "Vehicle Exterior Photo (Front)", key: "vehicle_exterior_photo_front" },
      { label: "Vehicle Exterior Photo (Back)", key: "vehicle_exterior_photo_back" },
      { label: "Vehicle Exterior Photo (Left)", key: "vehicle_exterior_photo_left" },
    ].map(({ label, key }) => (
      <div key={key} className="employee-detail-item-image">
        <span>{label}:</span>
        {loanDetails[key] ? (
          <img src={loanDetails[key]} alt={label.toLowerCase().replace(/\s+/g, "-")} className="image" />
        ) : (
          "N/A"
        )}
      </div>
    ))}
  </div>

  {/* Right Column */}
  <div className="employee-detail-column">
    {[
      { label: "Vehicle Exterior Photo (Right)", key: "vehicle_exterior_photo_right" },
      { label: "Odometer Reading Photo", key: "odometer_reading_photo" },
      { label: "VIN Plate Number Photo", key: "VIN_plate_number_photo" },
      { label: "Engine Number Photo", key: "engine_number_photo" },
      { label: "Chassis Number Photo", key: "chassis_number_photo" },
    ].map(({ label, key }) => (
      <div key={key} className="employee-detail-item-image">
        <span>{label}:</span>
        {loanDetails[key] ? (
          <img src={loanDetails[key]} alt={label.toLowerCase().replace(/\s+/g, "-")} className="image" />
        ) : (
          "N/A"
        )}
      </div>
    ))}
  </div>
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
<Dialog open={showForm} onClose={() => setShowForm(false)} fullWidth maxWidth="sm" PaperProps={{
        style: { backgroundColor: '#fff' }
    }}>
    <DialogContent>
        <h3 style={{color:'#07387A'}}>{editingLoan ? 'Edit Loan' : 'Add Loan'}</h3>
        <form onSubmit={handleSubmit}>
           
           

            <div>
                <label>Loan Category</label>
                <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    className="form-field"
                    disabled={editingLoan} 
                    sx={{backgroundColor:'#fff',color:'#000'}}
                >
                    <option value="">Select a Category</option>
                    {loanCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.category_name}
                        </option>
                    ))}
                </select>
            </div>

            
            <div>
                <label>Customer Name</label>
                <select
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    required
                    className="form-field"
                    disabled={editingLoan} 
                    sx={{backgroundColor:'#fff',color:'#000'}}
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


            <div>
                <Button
                    variant="contained"
                    style={{ backgroundColor: "#E8B701" }}
                    onClick={() => setShowVehicleFields(!showVehicleFields)}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <DirectionsCarIcon style={{ color: '#fff', marginRight: '10px' }} />
                    <h3 style={{ color: '#fff', margin: 0 }}>
                        {showVehicleFields ? ' Vehicle Details' : ' Vehicle Details'}
                    </h3>
                </div>
                </Button>
            </div>

            {showVehicleFields && (
                <div style={{ marginTop: '20px', backgroundColor: '#FFF9C4', padding: '20px', borderRadius: '8px' }}>
                    <h4>Vehicle Details</h4>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Segment"
                                select
                                fullWidth
                                required
                                error={!!errors.segment}
                                variant="outlined"
                                name="segment"
                                onChange={handleChange}
                            >
                                {segments.map((segment) => (
                                    <MenuItem key={segment} value={segment}>
                                        {segment}
                                    </MenuItem>
                                ))}
                                {/* {segment.map((make, index) => (
                                    <MenuItem key={index} value={segment}>
                                        {segment}
                                    </MenuItem>
                                ))} */}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Vehicle Make"
                                select
                                fullWidth
                                required
                                variant="outlined"
                                value={formData.vehicle_make}
                                onChange={(event) => handleMakeChange(event.target.value)}
                               
                            >
                                <MenuItem value="">
                                    <em>Select Vehicle Make</em>
                                </MenuItem>
                                {makes.map((make, index) => (
                                    <MenuItem key={index} value={make}>
                                        {make}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                        <TextField
                            label="Vehicle Model"
                            select
                            fullWidth
                            required
                            variant="outlined"
                            value={formData.vehicle_model}
                            onChange={(event) =>
                                setFormData({ ...formData, vehicle_model: event.target.value })
                            }
                        >
                            <MenuItem value="">
                                <em>Select Vehicle Model</em>
                            </MenuItem>
                            {models.map((modelObj, index) => (
                                <MenuItem key={index} value={modelObj.model}>
                                    {modelObj.model}_{modelObj.color}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Year of Manufacture"
                                select
                                required
                                fullWidth
                                variant="outlined"
                                name="year_of_manufacture"
                                onChange={handleChange}
                            >
                                {years.map((year) => (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Vehicle Identification Number (VIN)"
                                fullWidth
                                variant="outlined"
                                placeholder="17-character unique identifier"
                                name="vin"
                                onChange={handleChange}
                            />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                            <TextField
                                label="Chassis Number"
                                fullWidth
                                variant="outlined"
                                placeholder="Unique number identifying the vehicle's body"
                                name="chassis_no"
                                onChange={handleChange}
                            />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                            <TextField
                                label="Engine Number"
                                fullWidth
                                variant="outlined"
                                placeholder="Unique number engraved on the engine block"
                                name="engine_no"
                                onChange={handleChange}
                            />
                            </Grid>
                        
                            <Grid item xs={12} sm={6}>
                            <TextField
                                label="Vehicle Price (in USD)"
                                fullWidth
                                variant="outlined"
                                type="number"
                                name="vehicle_price"
                                onChange={handleChange}
                            />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                            <TextField
                                label="Down Payment (if applicable)"
                                fullWidth
                                variant="outlined"
                                type="number"
                                name="down_payment"
                                onChange={handleChange}
                            />
                            </Grid>

                        
                            <Grid item xs={12} sm={6}>
                            <TextField
                                label="Vehicle Exterior Photo-Front"
                                
                                type="file"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                name="vehicle_exterior_photo_front"
                                onChange={handleChange}
                            />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                            <TextField
                                label="Vehicle Exterior Photo-back"
                                type="file"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                name="vehicle_exterior_photo_back"
                                onChange={handleChange}
                            />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                            <TextField
                                label="Vehicle Exterior Photo-left"
                                type="file"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                name="vehicle_exterior_photo_left"
                                onChange={handleChange}
                            />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                            <TextField
                                label="Vehicle Exterior Photo-right"
                                type="file"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                name="vehicle_exterior_photo_right"
                                onChange={handleChange}
                            />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                            <TextField
                                label="Dashboard/Odometer Reading"
                                type="file"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                name="odometer_reading_photo"
                                onChange={handleChange}
                            />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                            <TextField
                                label="VIN Plate Photo"
                                type="file"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                name="VIN_plate_number_photo"
                                onChange={handleChange}
                            />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                            <TextField
                                label="Engine Number Photo"
                                type="file"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                name="engine_number_photo"
                                onChange={handleChange}
                            />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                            <TextField
                                label="Chassis Number Photo"
                                type="file"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                name="chassis_number_photo"
                                onChange={handleChange}
                            />
                            </Grid>
                                    </Grid>
                </div>
            )}
            {/* vehhicle details */}
            {/* <div>
      <Button variant="contained"      style={{ backgroundColor: "#E8B701" }}  onClick={handleOpen}>
        Add Vehicle Details
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Auto Finance Vehicle Information Form</DialogTitle>
        <DialogContent>
          
          <Grid container spacing={2}>
         
              <Grid item xs={12} sm={6}>
              <TextField
                label="Segment"
                select
                fullWidth
                variant="outlined"
                name="segment"
                onChange={handleChange}
              >
                {segments.map((segment) => (
                  <MenuItem key={segment} value={segment}>
                    {segment}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          
            <Grid item xs={12} sm={6}>
              <TextField
                label="Vehicle Make"
                fullWidth
                variant="outlined"
                
                placeholder="e.g., Toyota, Ford, Honda"
                name="vehicle_make"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Vehicle Model"
                fullWidth
                variant="outlined"
                placeholder="e.g., Corolla, Mustang, Accord"
                name="vehicle_model"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Year of Manufacture"
                select
                fullWidth
                variant="outlined"
                name="year_of_manufacture"
                onChange={handleChange}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Vehicle Identification Number (VIN)"
                fullWidth
                variant="outlined"
                placeholder="17-character unique identifier"
                name="vin"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Chassis Number"
                fullWidth
                variant="outlined"
                placeholder="Unique number identifying the vehicle's body"
                name="chassis_no"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Engine Number"
                fullWidth
                variant="outlined"
                placeholder="Unique number engraved on the engine block"
                name="engine_no"
                onChange={handleChange}
              />
            </Grid>
           
            <Grid item xs={12} sm={6}>
              <TextField
                label="Vehicle Price (in USD)"
                fullWidth
                variant="outlined"
                type="number"
                name="vehicle_price"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Down Payment (if applicable)"
                fullWidth
                variant="outlined"
                type="number"
                name="down_payment"
                onChange={handleChange}
              />
            </Grid>

           
            <Grid item xs={12} sm={6}>
              <TextField
                label="Vehicle Exterior Photo-Front"
                type="file"
                fullWidth
                InputLabelProps={{ shrink: true }}
                name="vehicle_front_photo"
                onChange={handleChange}
              />
            </Grid><Grid item xs={12} sm={6}>
              <TextField
                label="Vehicle Exterior Photo-back"
                type="file"
                fullWidth
                InputLabelProps={{ shrink: true }}
                name="vehicle_back_photo"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Vehicle Exterior Photo-left"
                type="file"
                fullWidth
                InputLabelProps={{ shrink: true }}
                name="vehicle_left_photo"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Vehicle Exterior Photo-right"
                type="file"
                fullWidth
                InputLabelProps={{ shrink: true }}
                name="vehicle_right_photo"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Dashboard/Odometer Reading"
                type="file"
                fullWidth
                InputLabelProps={{ shrink: true }}
                name="odometer_photo"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="VIN Plate Photo"
                type="file"
                fullWidth
                InputLabelProps={{ shrink: true }}
                name="vin_plate_photo"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Engine Number Photo"
                type="file"
                fullWidth
                InputLabelProps={{ shrink: true }}
                name="engine_number_photo"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Chassis Number Photo"
                type="file"
                fullWidth
                InputLabelProps={{ shrink: true }}
                name="chassis_photo"
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button   style={{ backgroundColor: "red",color:"white" }}  onClick={handleClose} >
            Cancel
          </Button>
          <Button
 
  onClick={handleClose}
  variant="contained"
>
  Submit
</Button>

        </DialogActions>
      </Dialog>
    </div> */}


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
            <div className="button-container" style={{
 position: 'sticky', 
 bottom: 0, 
 backgroundColor: 'rgba(255, 255, 255, 0.7)', // Set a white background with 80% opacity
paddingBottom:'0px',
marginBottom:'0px',
 zIndex: 1,
 display: 'flex', // Align buttons in a row
 justifyContent: 'flex-end', // Align buttons to the right
  }} >
                <button type="submit" className="loan-add" disabled={editingLoan}>
                    {editingLoan ? 'UPDATE' : 'ADD'}
                </button>
                <button 
                    type="button" 
                    className="loan-cancel" 
                    onClick={() => setShowForm(false)}
                >
                    CANCEL
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


