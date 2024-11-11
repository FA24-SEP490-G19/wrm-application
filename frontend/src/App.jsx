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
import CustomersPage from "./component/Management/User/CustomersPage.jsx";
import WarehousePage from "./component/Management/Warehouse/WarehousePage.jsx";
import ProtectedRoute from "./component/Shared/ProtectedRoute.jsx";
import AppointmentPage from "./component/Management/Appointment/AppointmentPage.jsx";
import LotsPage from "./component/Management/Lot/LotsPage.jsx";
import WarehouseDetail from "./component/WareHouseDetail.jsx"; // Assuming you have a Dashboard component

function App() {
    return (
        <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/profile" element={<ProfileCRUD />} />
            <Route path="/warehouse" element={<WarehouseList />} />
            <Route path="/warehouse/:id" element={<WarehouseDetail />} />

            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /> </ProtectedRoute>} />
            <Route path="/user" element={<CustomersPage />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/kho" element={<ProtectedRoute><WarehousePage /> </ProtectedRoute>} />
            <Route path="/appointment" element={<ProtectedRoute><AppointmentPage /> </ProtectedRoute>} />
                <Route path="/lot" element={<ProtectedRoute><LotsPage /> </ProtectedRoute>} />

                <Route path="/" element={<Navigate to="/landing" replace />} />
        </Routes>
    );
}

export default App;