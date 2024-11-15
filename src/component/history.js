import React, { useEffect, useState } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Paper, Typography, CircularProgress, Box, TextField } from '@mui/material';
import Sidebar from './Sidebar'; // Ensure the path is correct
import Axios from "../Axios";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Fetch transactions data
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await Axios.get('/alltransaction');
        if (response.data.success) {
          setTransactions(response.data.data);
          setFilteredTransactions(response.data.data); // Initially, display all transactions
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        setError('Failed to fetch transactions.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value;  // Keep the query as is without converting to lowercase

    setSearchQuery(query);

    const filtered = transactions.filter((transaction) => {
      const loanId = transaction.loan_id ? transaction.loan_id : ''; 
      const userId = transaction.user_id ? transaction.user_id.toString() : ''; 
      const employeeId = transaction.employee_id ? transaction.employee_id.toString() : ''; 
      const categoryId = transaction.category_id ? transaction.category_id.toString() : ''; 
      const loanDate = transaction.loan_date ? transaction.loan_date : '';

      return (
        loanId.includes(query) ||
        userId.includes(query) ||
        employeeId.includes(query) ||
        categoryId.includes(query) ||
        loanDate.includes(query)
      );
    });

    setFilteredTransactions(filtered);
  };

  return (
    <div className="main-content">
      <Box sx={{ display: 'block' }}>
        <Sidebar isSidebarExpanded={isSidebarExpanded} setSidebarExpanded={setSidebarExpanded} />
        <Box
          component={Paper}
          sx={{
            flexGrow: 1,
            padding: 3,
            marginLeft: isSidebarExpanded ? '240px' : '60px',
            overflow: 'auto',
            height: '100vh',
          }}
        >
          <Typography variant="h5" gutterBottom>
            Transactions
          </Typography>

          {/* Search Box */}
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearch}
            fullWidth
            sx={{ marginBottom: 2 }}
          />

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Loan ID</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Category ID</TableCell>
                  <TableCell>Loan Amount</TableCell>
                  <TableCell>Loan Category</TableCell>
                  <TableCell>Loan Date</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Loan Closed Date</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>{transaction.loan_id}</TableCell>
                    <TableCell>{transaction.user_id}</TableCell>
                    <TableCell>{transaction.employee_id}</TableCell>
                    <TableCell>{transaction.category_id}</TableCell>
                    <TableCell>{transaction.loan_amount}</TableCell>
                    <TableCell>{transaction.loan_category}</TableCell>
                    <TableCell>{transaction.loan_date}</TableCell>
                    <TableCell>{transaction.total_amount}</TableCell>
                    <TableCell>{transaction.status}</TableCell>
                    <TableCell>{transaction.loan_closed_date}</TableCell>
                    <TableCell>{transaction.payment_status}</TableCell>
                    <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default Transactions;
