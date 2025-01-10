import React from 'react';
import { BrowserRouter , Routes, Route } from 'react-router-dom';
import GetStarted from './GetStarted';
import Login from './component/Login'; 
import Sidebar from './component/Sidebar';
import Admin from './component/admindashboard';
import Employee  from './component/Employee';
import Customer  from './component/Customer';
import Loandue from './component/Loandue';
import Loancategory from './component/Loancategory';
import Loan from './component/Loan';
import Todayloandue from './component/Todayloandue';
import Admindashboard from './component/admindashboard';
import Pendingloandue from './component/Pendingloandue';
import ParticularLoanDue from './component/ParticularLoanDue';
import History from './component/history';
import ForgotPassword from './component/Forgotpassword';
import VerifyOtp from './component/Verifyotp';
import ResetPassword from './component/Resetpassword';
const App = () => {
    return (
    <div className='app'>
        <BrowserRouter basename="/SriVariFinance">
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="" element={<GetStarted />} />
                <Route path="/sidebar" element={<Sidebar />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/employee" element={<Employee />} />
                <Route path="/customer" element={<Customer />} />
                <Route path="/loandue" element={<Loandue />} />
                <Route path="/loancategory" element={<Loancategory />} />
                <Route path="/loan" element={<Loan />} />
                <Route path="/todayloandue" element={<Todayloandue/>} />
                <Route path="/admindashboard" element={<Admindashboard/>} />
                <Route path="/pendingloandue" element={<Pendingloandue/>} />
                <Route path="/particular-loan-due" element={<ParticularLoanDue />} />
                <Route path="/history" element={<History/>} />
                <Route path="/forgotpassword" element={<ForgotPassword/>} />
                <Route path="/verify-otp" element={<VerifyOtp/>} />
                <Route path="/reset-password" element={<ResetPassword/>} />
            </Routes>
            </BrowserRouter>
            </div>
    );
};

export default App;

