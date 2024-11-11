import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from "./component/Authentication/Login.jsx";
import Home from "./component/Shared/Home.jsx";
import RegisterPage from "./component/Authentication/Register.jsx";
import LandingPage from "./component/LandingPage.jsx";
import ChangePassword from "./component/Authentication/ChangePassword.jsx";
import ProfileCRUD from "./component/Profile.jsx";
import WarehouseList from "./component/WarehouseList.jsx";
import CRMDashboard from "./component/Management/Crm.jsx";
import DashboardPage from "./component/Management/DashboardPage.jsx";
import CustomersPage from "./component/Management/User/CustomersPage.jsx"; // Assuming you have a Dashboard component

function App() {
    return (
        <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset" element={<ChangePassword />} />
            <Route path="/profile" element={<ProfileCRUD />} />
            <Route path="/warehouse" element={<WarehouseList />} />
            <Route path="/whDetail" element={<WarehouseList />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/user" element={<CustomersPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Navigate to="/landing" replace />} />
        </Routes>
    );
}

export default App;