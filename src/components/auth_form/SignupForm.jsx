import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "../../styles/auth.css";

const SignupForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    numTelephone: "",
    email: "",
    password: "",
    repeatPassword: ""
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.repeatPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    const requestData = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      numTelephone: formData.numTelephone,
      password: formData.password
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/register",
        requestData,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("email", response.data.email);
        localStorage.setItem("nom", response.data.nom);
        localStorage.setItem("prenom", response.data.prenom);
        localStorage.setItem("estActif", response.data.estActif);
        
        navigate("/en-attente");
      } else {
        setError("Réponse invalide du serveur");
      }

    } catch (error) {
      if (error.response) {
        setError(error.response.data?.message || "Erreur lors de l'inscription");
      } else if (error.request) {
        setError("Le serveur ne répond pas. Vérifiez qu'il est bien lancé.");
      } else {
        setError("Erreur de connexion");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-nexus-core">
      <div className="w-portal-frame">
        <div className="w-gate-control">
          <div className="w-id-brand">WARE<span>HOUSE</span></div>
          <h2>Create Account</h2>
          <p className="w-meta-label">Rejoignez la transformation digitale.</p>
          
          {error && <div className="w-alert-signal">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            {/* Grid pour Nom et Prénom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="w-input-row">
                <label>Nom</label>
                <input 
                  type="text" 
                  name="nom" 
                  placeholder="Nom" 
                  value={formData.nom} 
                  onChange={handleChange} 
                  required 
                  disabled={loading} 
                />
              </div>
              <div className="w-input-row">
                <label>Prénom</label>
                <input 
                  type="text" 
                  name="prenom" 
                  placeholder="Prénom" 
                  value={formData.prenom} 
                  onChange={handleChange} 
                  required 
                  disabled={loading} 
                />
              </div>
            </div>

            {/* Champ Téléphone (Rétabli) */}
            <div className="w-input-row">
              <label>Téléphone</label>
              <input 
                type="tel" 
                name="numTelephone" 
                placeholder="Téléphone" 
                value={formData.numTelephone} 
                onChange={handleChange} 
                required 
                disabled={loading} 
              />
            </div>

            <div className="w-input-row">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                placeholder="email@exemple.com" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                disabled={loading} 
              />
            </div>

            <div className="w-input-row">
              <label>Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                minLength="6"
                disabled={loading} 
              />
            </div>

            <div className="w-input-row">
              <label>Repeat Password</label>
              <input 
                type="password" 
                name="repeatPassword" 
                placeholder="••••••••" 
                value={formData.repeatPassword} 
                onChange={handleChange} 
                required 
                disabled={loading} 
              />
            </div>

            <button type="submit" className="w-trigger-action" disabled={loading}>
              {loading ? "Création..." : "Start Transformation"}
            </button>
          </form>

          <p className="w-anchor-route">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>

        <div className="w-visual-sector">
          <div className="w-sector-overlay">
            <div className="w-status-tag">Operations Workflow</div>
            <h3 style={{fontSize: '2rem', marginBottom: '10px'}}>Digitize your logistics.</h3>
            <p style={{color: '#cbd5e1'}}>Améliorez la productivité de votre supply chain immédiatement.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;