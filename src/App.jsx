import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HowItWorks from "./pages/HowItWorks";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard_warehouse from "./pages/Dashboard_warehouse";
import AdminDashboard from "./pages/AdminDashboard";
import EnAttente from "./pages/EnAttente";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HowItWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/en-attente" element={<EnAttente />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard_warehouse />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRole="ADMINISTRATEUR">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;