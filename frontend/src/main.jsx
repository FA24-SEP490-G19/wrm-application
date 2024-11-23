import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.jsx'
import AuthProvider from "./context/AuthContext.jsx";
import {ToastProvider} from "./context/ToastProvider.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <ToastProvider>
        <Router>

            <App />
        </Router>
            </ToastProvider>
        </AuthProvider>
    </React.StrictMode>,
)