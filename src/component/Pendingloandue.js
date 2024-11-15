import React, { useState } from 'react';
import Axios from "../Axios";
import '../component/pendingloandue.css';
import Sidebar from './Sidebar';
import { DownOutlined } from '@ant-design/icons'; 
import { Button, TextField } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import DownloadIcon from '@mui/icons-material/GetApp';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

const Loandue = () => {
    const [cities, setCities] = useState([]);
    const [expandedCity, setExpandedCity] = useState(null);
    const [fromDate, setFromDate] = useState('2024-11-01'); // Default date
    const [toDate, setToDate] = useState('2024-11-01'); // Default date
    const [isSidebarExpanded, setSidebarExpanded] = useState(true);
    const navigate = useNavigate();

    const fetchLoanData = async () => {
        const requestData = { from_date: fromDate, to_date: toDate };
        try {
            const response = await Axios.post('/pending-loans-with-user-city', requestData);

            // Remove any duplicate loans based on loan_id
            const uniqueCities = response.data.data.map(cityData => ({
                ...cityData,
                loans: cityData.loans.filter((loan, index, self) =>
                    index === self.findIndex(l => l.loan_id === loan.loan_id)
                ),
            }));

            setCities(uniqueCities);
        } catch (error) {
            console.error('Error fetching loan data:', error.message);
        }
    };

    const handleFetchLoans = () => {
        fetchLoanData();
    };

    const handleToggleExpand = (city) => {
        setExpandedCity(expandedCity === city ? null : city);
    };

    const handleEditClick = (loan) => {
        navigate('/loandue', { state: { loanId: loan.loan_id } });
    };

    const handleDownload = async (loanId) => {
        try {
            const response = await Axios.get(`/loan/${loanId}/dues`);
            const loanData = response.data.loan_dues.map(loan => ({
                LoanId: loan.loan_id,
                UserID: loan.user_id,
                DueAmount: loan.due_amount,
                PaidAmount: loan.paid_amount,
                Status: loan.status,
                DueDate: loan.due_date,
                PaidDate: loan.paid_on,
                CollectionBy: loan.collection_by,
            }));

            const worksheet = XLSX.utils.json_to_sheet(loanData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Loan Data");
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `Loan_${loanId}_Data.xlsx`);
        } catch (error) {
            console.error('Error downloading loan data:', error);
        }
    };

    const handleDownloadCityLoans = (cityData) => {
        try {
            const loanData = cityData.loans.map(loan => ({
                LoanId: loan.loan_id,
                UserID: loan.user_id,
                DueAmount: loan.due_amount,
                PaidAmount: loan.paid_amount,
                PendingAmount: loan.pending_amount,
                Status: loan.status,
                DueDate: loan.due_date,
                PaidDate: loan.paid_on,
                CollectionBy: loan.collection_by,
            }));

            const worksheet = XLSX.utils.json_to_sheet(loanData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, `Loans_${cityData.city}`);
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `Loans_${cityData.city}_Data.xlsx`);
        } catch (error) {
            console.error('Error downloading city loans:', error);
        }
    };

    return (
        <div className="employeecontainer">
            <Sidebar 
                isSidebarExpanded={isSidebarExpanded} 
                setSidebarExpanded={setSidebarExpanded} 
            />

            <div className="main-content">
                <div className="date-input-container">
                    <div className="date-input-label">
                        <label className="from-label">From Date</label>
                        <label className="to-label">To Date</label>
                    </div>
                    <div className="date-input-wrapper">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="date-input"
                        />
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="date-input"
                        />
                    </div>
                    <Button 
                        className="ok-button" 
                        onClick={handleFetchLoans}
                        variant="contained"
                    >
                        OK
                    </Button>
                </div>

                <div className="table-container">
                    {cities.length > 0 ? (
                        cities.map(cityData => (
                            <div key={cityData.city} className="city-group">
                                <div
                                    className="city-header"
                                    onClick={() => handleToggleExpand(cityData.city)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                >
                                    <h4 style={{ margin: 0 }}>City: {cityData.city}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Button
                                            style={{ marginRight: 8 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadCityLoans(cityData);
                                            }}
                                            startIcon={<DownloadIcon />}
                                            variant="contained"
                                            color="primary"
                                        />
                                        <DownOutlined />
                                    </div>
                                </div>

                                {expandedCity === cityData.city && (
                                    <div>
                                        {cityData.loans.length > 0 ? (
                                            <table className="loan-table">
                                                <thead>
                                                    <tr>
                                                        <th>Loan ID</th>
                                                        <th>User ID</th>
                                                        <th>Due Date</th>
                                                        <th>Due Amount</th>
                                                        <th>Paid Amount</th>
                                                        <th>Pending Amount</th>
                                                        <th>Status</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {cityData.loans.map(loan => (
                                                        <tr key={loan.loan_id}>
                                                            <td>{loan.loan_id}</td>
                                                            <td>{loan.user_id}</td>
                                                            <td>{loan.due_date}</td>
                                                            <td>{loan.due_amount}</td>
                                                            <td>{loan.paid_amount}</td>
                                                            <td>{loan.pending_amount}</td>
                                                            <td>{loan.status}</td>
                                                            <td>
                                                                <a title="Edit" onClick={() => handleEditClick(loan)} style={{ cursor: 'pointer' }}>
                                                                    <EditIcon />
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <p>No loans found for this city.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No cities with pending loans found for the selected date range.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Loandue;
