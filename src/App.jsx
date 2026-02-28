import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HowItWorks from "./pages/HowItWorks";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard_warehouse";
import AdminDashboard from "./pages/AdminDashboard";
import EnAttente from "./pages/EnAttente"; // Import de la nouvelle page
import GoodsReceiptForm from "./components/forms/GoodsReceiptForm";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<HowItWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/en-attente" element={<EnAttente />} /> {/* Nouvelle route */}

        {/* Routes protégées */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
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

        <Route
          path="/goods-receipt"
          element={
            <PrivateRoute>
              <GoodsReceiptForm />
            </PrivateRoute>
          }
        />

        {/* Route par défaut pour les URLs non trouvées */}
        <Route path="*" element={<HowItWorks />} />
      </Routes>
    </Router>
  );
}

export default App;