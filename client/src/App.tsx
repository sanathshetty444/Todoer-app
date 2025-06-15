import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Categories from "./pages/Categories";
import Register from "./pages/Register";

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Default route redirects to login */}
                    <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                    />

                    {/* Login route */}
                    <Route path="/login" element={<Login />} />

                    {/* Dashboard route */}
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Categories route */}
                    <Route path="/categories" element={<Categories />} />

                    {/* Placeholder for register route */}
                    <Route path="/register" element={<Register />} />
                </Routes>

                {/* Toast Container for notifications */}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </div>
        </Router>
    );
}

export default App;
