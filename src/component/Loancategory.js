import React, { useState, useEffect } from 'react';
import Axios from "../Axios";
import '../component/Loancategory.css';
import Sidebar from './Sidebar';
import { Margin } from '@mui/icons-material';
import { DownOutlined } from '@ant-design/icons'; 
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button,Box, Typography, Grid  } from '@mui/material';

import { Switch } from '@mui/material';
import { CircularProgress } from "@mui/material";
const Loancategory = () => {
    const [category, setcategory] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingcategory, setEditingcategory] = useState(null);
    const [expandedcategoryId, setExpandedcategoryId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        loan_id:'',
        category_id: '',
        category_name: '',
        category_type: '',
        duration: '',
        interest_rate: '',
        status: 'active',
    });
    const [isSidebarExpanded, setSidebarExpanded] = useState(true);
    const [CategoryId, setCategoryId] = useState('');

    // Fetch employees when the component mounts
    useEffect(() => {
       
    }, []);

useEffect(() => {
    const fetchNextCategoryId = async () => {
        try {
          const response = await Axios.get('/getLastCategoryId'); // Replace with your actual API endpoint
          if (response.data && response.data.next_Category_id) {
            setCategoryId(response.data.next_Category_id);
            // setFormData((prevData) => ({
            //   ...prevData,
            //   user_id: response.data.next_user_id,
            // }));
          }
        } catch (error) {
          console.error('Error fetching next category ID:', error);
        }
      };
  
      fetchNextCategoryId();
    }, []);

    const fetchcategory = async () => {
        try {
            const response = await Axios.get('/loan-category');
            
            setcategory(response.data.message);
        } catch (error) {
            // alert('Error fetching category: ' + error.message);
        }
        setLoading(false);
    };
    useEffect(() => {
        fetchcategory();
    }, []);

    const handleDelete = async (category_id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await Axios.delete(`category/${category_id}`);
                setcategory(category.filter(category => category.category_id !== category_id));
                alert('Category deleted successfully!');
                window.location.reload(); 
            } catch (error) {
                alert('Error deleting category: ' + error.message);
            }
        }
    };
    

    const handleEdit = (loan) => {
        setEditingcategory(loan); 
        setFormData({
            loan_id:loan.loan_id,
            category_id: loan.category_id,
            category_name: loan.category_name,
            category_type: loan.category_type,
            duration: loan.duration,
            interest_rate: loan.interest_rate,
            status: loan.status,
        });
        setShowForm(true);
    };
    

    const handleAdd = () => {
        setEditingcategory(null);
        setFormData({
            loan_id:'',
            category_id: CategoryId,
            category_name: '',
            category_type: '',
            duration: '',
            interest_rate: '',
            status: 'active', // Set default status if necessary
        });
        setShowForm(true);
    };
    

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingcategory) {
                // Update category using category_id instead of id
                await Axios.put(`/loan-category/${editingcategory.category_id}`, formData);
                alert('Category updated successfully!');
            } else {
                // Add new category
                await Axios.post('/loan-category', formData);
                alert('Category added successfully!');
            }
            setShowForm(false);
            fetchcategory(); 
        } catch (error) {
            alert('Error saving category: ' + error.message);
        }
    };
    
    const handleToggleExpand = (id) => {
        setExpandedcategoryId(expandedcategoryId === id ? null : id);
    };

    const togglecategoryStatus = async (category) => {
        // Toggle the category's status
        const newStatus = category.status === 'active' ? 'inactive' : 'active';
    
        try {
            // Send the update request to the server
            await Axios.put(`/loan-category/${category.category_id}`, {
                ...category,
                status: newStatus
            });
    
            // Update local state after the server confirms the update
            setcategory(prevCategories => 
                prevCategories.map(c => 
                    c.category_id === category.category_id ? { ...c, status: newStatus } : c
                )
            );
    
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };
    
    
    return (
        <div className="employeecontainer">
          <Sidebar 
                isSidebarExpanded={isSidebarExpanded} 
                setSidebarExpanded={setSidebarExpanded} 
            />

            <div className="main-content">
                
                
                {loading ? ( // Conditional rendering for loading state
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <CircularProgress />
                    </div>
                ) : (
                    <div className="table-container-loancategory">
                    <button className="small-button" onClick={handleAdd}>Add Loan Category</button>
                    {Array.isArray(category) && category.map((category) => (
                        <Box key={category.id} className='maincard' sx={{ mb: 2 }}>
                            <Box className={`employee-card-loancategory ${expandedcategoryId === category.id ? 'expanded' : ''}`}>
                                <Box className="employee-header" onClick={() => handleToggleExpand(category.id)} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <Typography variant="h6" className="employee-name">{category.category_name}</Typography>
                                    <DownOutlined className={`expand-icon ${expandedcategoryId === category.id ? 'rotate' : ''}`} />
                                </Box>
                
                                {expandedcategoryId === category.id && (
                                    // <Box className="employee-details-loancategory" sx={{ mt: 1 }}>
                                        <Box className="employee-details-loancategory" sx={{ 
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Light white background
                                        padding: '16px', // Add some padding
                                        borderRadius: '8px', // Optional: for rounded corners
                                        boxShadow: 2, // Optional: to add a subtle shadow
                                        mt: 2 // Optional: margin-top for spacing
                                    }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="body1"><strong>Category Type:</strong> {category.category_type}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="body1"><strong>Duration:</strong> {category.duration} {category.category_type}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="body1"><strong>Interest Rate:</strong> {category.interest_rate}%</Typography>
                                            </Grid>
                                        </Grid>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <EditIcon style={{ color: "green", cursor: 'pointer' }} onClick={() => handleEdit(category)} />
                                            <DeleteIcon style={{ color: "red", cursor: 'pointer' }} onClick={() => handleDelete(category.id)} />
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    ))}
                </div>
                )}





<Dialog open={showForm} onClose={() => setShowForm(false)} fullWidth maxWidth="sm">
    <DialogContent style={{ backgroundColor: '#fff', padding: '20px' }}>
        <h3 style={{ marginBottom: '20px', color: '#07387A' }}>{editingcategory ? 'Edit Loan Category' : 'Add Loan Category'}</h3>
        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Category Id</label>
                <input 
                    type="text" 
                    name="category_id" 
                    value={formData.category_id} readOnly
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Category Name</label>
                <input 
                    type="text" 
                    name="category_name" 
                    value={formData.category_name} 
                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
            </div>
            <div className="employee-detail-item" style={{ marginBottom: '15px' }}>
                <label htmlFor="category_type" style={{ display: 'block', marginBottom: '5px' }}>Category Type</label>
                <select
                    name="category_type"
                    value={formData.category_type}
                    onChange={(e) => setFormData({ ...formData, category_type: e.target.value })}
                    required
                    className="category-type"
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px',backgroundColor:'#fff',color:'#000' }}
                >
                    <option value="">Select category type</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="daily">Daily</option>
                </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Duration</label>
                <input 
                    type="number" 
                    name="duration" 
                    value={formData.duration} 
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Interest Rate</label>
                <input 
                    type="number" 
                    name="interest_rate" 
                    value={formData.interest_rate} 
                    onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
            </div>
            <div style={{ marginBottom: '15px' }}>
  <label style={{ display: 'block', marginBottom: '5px' }}>Status</label>
  <select 
    name="status" 
    value={formData.status} 
    onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
    required 
    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px',backgroundColor:'#fff',color:'#000' }}
  >
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </select>
</div>

            {/* <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Status</label>
                <input 
                    type="text" 
                    name="status" 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
            </div> */}
        </form>
    </DialogContent>
    <DialogActions>
        <Button 
            type="submit" 
            onClick={handleSubmit} 
            style={{ backgroundColor: '#07387A', color: 'white', padding: '5px 5px', border: 'none', borderRadius: '4px', marginRight: '5px' }}
        >
            {editingcategory ? 'Update' : 'Add'}
        </Button>
        <Button 
            onClick={() => setShowForm(false)} 
            style={{ backgroundColor: '#EF4444', color: 'white', padding: '5px 5px', border: 'none', borderRadius: '4px' }}
        >
            Cancel
        </Button>
    </DialogActions>
</Dialog>


            </div>
        </div>
    );
    
};

export default Loancategory;
