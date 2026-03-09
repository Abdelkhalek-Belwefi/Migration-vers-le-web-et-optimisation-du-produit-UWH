import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HowItWorks from "./pages/HowItWorks";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard_warehouse from "./pages/Dashboard_warehouse";
import AdminDashboard from "./pages/AdminDashboard";
import EnAttente from "./pages/EnAttente";
import ArticleList from "./components/articles/ArticleList";
import StockList from "./components/stock/StockList";
import PrivateRoute from "./components/route/PrivateRoute";
import ReceptionList from './components/reception/ReceptionList';
import ReceptionForm from './components/reception/ReceptionForm';
import ReceptionDetail from './components/reception/ReceptionDetail';
import RangementList from './components/rangement/RangementList'; // ✅ AJOUTÉ

function App() {
  return (
    <Router>
      <Routes>
        {/* ===== ROUTES PUBLIQUES ===== */}
        <Route path="/" element={<HowItWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/en-attente" element={<EnAttente />} />

        {/* ===== ROUTES PROTÉGÉES ===== */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard_warehouse />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <PrivateRoute requiredRole="ADMINISTRATEUR">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* =====  ARTICLES ===== */}
        <Route
          path="/articles"
          element={
            <PrivateRoute>
              <ArticleList />
            </PrivateRoute>
          }
        />

        {/* =====  STOCKS ===== */}
        <Route
          path="/stock"
          element={
            <PrivateRoute>
              <StockList />
            </PrivateRoute>
          }
        />

        {/* =====  RÉCEPTION ===== */}
        <Route
          path="/reception"
          element={
            <PrivateRoute>
              <ReceptionList />
            </PrivateRoute>
          }
        />
        <Route
          path="/reception/nouvelle"
          element={
            <PrivateRoute>
              <ReceptionForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/reception/:id"
          element={
            <PrivateRoute>
              <ReceptionDetail />
            </PrivateRoute>
          }
        />

        {/*===== RANGEMENT ===== */}
        <Route
          path="/rangement"
          element={
            <PrivateRoute>
              <RangementList />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;