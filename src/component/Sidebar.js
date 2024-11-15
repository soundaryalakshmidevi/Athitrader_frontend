import React from 'react';
import { List, ListItem, ListItemText, Drawer, AppBar, Toolbar, Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Person, People, CardGiftcard, Star, Savings, Menu, Dashboard, EventAvailable, PendingActions } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu'; // Hamburger icon
import '../Sidebar.css';
import Swal from 'sweetalert2';
// import logoImagenew from '../asset/Group34031.png';
import logoImagenew from '../asset/Ab Logo.png'; // Adjusted relative path

import { useMediaQuery } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
const Sidebar = ({ isSidebarExpanded, setSidebarExpanded }) => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:600px)'); // Define mobile view breakpoint

    const menuItems = [
        { text: 'Dashboard', path: '/admindashboard', icon: <Dashboard /> },
        { text: 'Employee', path: '/employee', icon: <People /> },
        { text: 'Customer', path: '/customer', icon: <Person /> },
        { text: 'Loan Category', path: '/loancategory', icon: <Star /> },
        { text: 'Loan', path: '/loan', icon: <CardGiftcard /> },
        { text: 'Loan Due', path: '/loandue', icon: <Savings /> },
        { text: 'Today Loan Due', path: '/todayloandue', icon: <EventAvailable /> },
        { text: 'Pending Loan Due', path: '/pendingloandue', icon: <PendingActions /> },
    ];

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to log out?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#188b3E',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'No, stay'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                // Swal.fire(
                //     'Logged out!',
                //     'You have been logged out successfully.',
                //     'success'
                // );
                navigate("/login");
            }
        });
    };

    const toggleSidebarExpansion = () => {
        setSidebarExpanded(!isSidebarExpanded);
    };

    return (
        <div>
            <AppBar position="fixed" className="app-bar">
                <Toolbar className="toolbar">
                    <div className="logo-container">
                        <img src={logoImagenew} alt="Logo" className="logo" />
                        {/* <img src={`${process.env.PUBLIC_URL}/asset/Group34031.png`} alt="Logo" className="logo" /> */}

                    </div>
                    {/* Logout button in AppBar for larger screens */}
                    {!isMobile && (
                        <Button
                        color="inherit"
                        onClick={handleLogout}
                        className="logout-button"
                        startIcon={<LogoutIcon />}
                    >
                        Logout
                    </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                open={isSidebarExpanded}
                anchor="left"
                className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}
            >
                <div className="sidebar-header">
                    <IconButton onClick={toggleSidebarExpansion} className="expand-toggle">
                        <MenuIcon />
                    </IconButton>
                </div>

                <List>
                    {menuItems.map((item, index) => (
                        <ListItem button key={index} onClick={() => handleNavigation(item.path)} className="list-item">
                            {item.icon}
                            {isSidebarExpanded && <ListItemText primary={item.text} />}
                        </ListItem>
                    ))}
                </List>

                {/* Logout button positioned near the menu items only in mobile view */}
                {isMobile && (
                    
                    <IconButton
                    color="inherit"
                    onClick={handleLogout}
                  
                    sx={{
                        fontSize: '1rem',    // Adjust size of the icon
                        padding: '4px',      // Remove extra padding to reduce space around the icon
                        margin: 0            // Optional: Remove any margin if there's space around
                    }}
                >
                    <LogoutIcon sx={{ fontSize: 'inherit' }} />
                </IconButton>
                    
                )}
            </Drawer>

            <main
                className={`content ${isSidebarExpanded ? '' : 'collapsed'}`}
                style={{ flexGrow: 1, marginLeft: isSidebarExpanded ? '240px' : '60px' }} // Adjust based on sidebar width
            >
                {/* Your main content goes here */}
            </main>
        </div>
    );
};

export default Sidebar;
