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
import WarehouseDetail from "./component/WareHouseDetail.jsx";
import ContractModal from "./component/Management/Contract/ContractModal.jsx";
import {ContractPage} from "./component/Management/Contract/ContractPage.jsx";
import RentalPage from "./component/Rental/RentalPage.jsx";
import RequestPage from "./component/Management/Request/RequestPage.jsx";
import RentalDetail from "./component/Management/Rental_detail/RentalDetailPage.jsx";
import FeedBackPage from "./component/Management/Feedback/FeedbackPage.jsx";
import ChangePassForNotUser from "./component/Management/ChangePasswordNotUser.jsx";
import ProfileNotUser from "./component/Management/ProfileNotUser.jsx";
import RentalByCustomer from "./component/RentalByCustomer.jsx";
import MyAppointment from "./component/Myappointment.jsx";
import MyRequestPage from "./component/MyRequestPage.jsx";
import MyFeedBack from "./component/MyFeedback.jsx";

function App() {
    return (
        <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                <Route path="/resetForNotUser" element={<ProtectedRoute><ChangePassForNotUser /></ProtectedRoute>} />
            <Route path="/profileNotUser" element={<ProtectedRoute><ProfileNotUser /></ProtectedRoute>} />
            <Route path="/RentalByUser" element={<ProtectedRoute><RentalByCustomer /></ProtectedRoute>} />
            <Route path="/MyAppoinment" element={<ProtectedRoute><MyAppointment /></ProtectedRoute>} />
                <Route path="/MyRequest" element={<ProtectedRoute><MyRequestPage /></ProtectedRoute>} />
            <Route path="/MyFeedback" element={<ProtectedRoute><MyFeedBack /></ProtectedRoute>} />

            <Route path="/profile" element={<ProfileCRUD />} />
            <Route path="/warehouse" element={<WarehouseList />} />
            <Route path="/warehouse/:id" element={<WarehouseDetail />} />

            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /> </ProtectedRoute>} />
            <Route path="/user" element={<CustomersPage />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/kho" element={<ProtectedRoute><WarehousePage /> </ProtectedRoute>} />
            <Route path="/appointment" element={<ProtectedRoute><AppointmentPage /> </ProtectedRoute>} />
            <Route path="/lot" element={<ProtectedRoute><LotsPage /> </ProtectedRoute>} />
            <Route path="/contract" element={<ProtectedRoute><ContractPage/> </ProtectedRoute>} />
            <Route path="/rental" element={<ProtectedRoute><RentalPage/> </ProtectedRoute>} />
            <Route path="/rental_detail" element={<ProtectedRoute><RentalDetail/> </ProtectedRoute>} />
            <Route path="/request" element={<ProtectedRoute><RequestPage/> </ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><FeedBackPage/> </ProtectedRoute>} />

                <Route path="/" element={<Navigate to="/landing" replace />} />
        </Routes>
    );
}

export default App;