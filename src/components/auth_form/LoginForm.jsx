import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "../../styles/auth.css";

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", { 
        email: email.trim(), 
        password 
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("email", response.data.email || email);
      localStorage.setItem("estActif", response.data.estActif);
      
      if (response.data.nom) localStorage.setItem("nom", response.data.nom);
      if (response.data.prenom) localStorage.setItem("prenom", response.data.prenom);

      if (!response.data.estActif) {
        navigate("/en-attente");
      } else {
        response.data.role === "ADMINISTRATEUR" ? navigate("/admin") : navigate("/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-nexus-core">
      <div className="w-portal-frame">
        <div className="w-gate-control">
          <div className="w-nav-revert" onClick={() => navigate("/")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </div>

          <div className="w-id-brand">WARE<span>HOUSE</span></div>

          <h2>Welcome Back</h2>
          <p className="w-meta-label">Identifiez-vous pour gérer vos opérations.</p>
          
          {error && <div className="w-alert-signal">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="w-input-row">
              <label>Email Address</label>
              <input type="email" placeholder="prenom@entreprise.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>

            <div className="w-input-row">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
            </div>

            <button type="submit" className="w-trigger-action" disabled={loading}>
              {loading ? "Chargement..." : "Login to Dashboard"}
            </button>
          </form>

          <p className="w-anchor-route">
            Pas encore de compte ? <Link to="/signup">S'inscrire</Link>
          </p>
        </div>

        <div className="w-visual-sector">
          <div className="w-sector-overlay">
            <div className="w-status-tag">Smart Logistics 2026</div>
            <h3 style={{fontSize: '2rem', marginBottom: '10px'}}>Faster, Smarter.</h3>
            <p style={{color: '#cbd5e1'}}>Optimisez votre chaîne logistique avec notre solution WMS entreprise.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;