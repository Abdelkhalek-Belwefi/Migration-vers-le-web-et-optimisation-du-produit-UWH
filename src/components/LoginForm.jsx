import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "../styles/auth.css";

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
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        { email: email.trim(), password }
      );

      // Stocker toutes les informations
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("email", response.data.email || email);
      localStorage.setItem("estActif", response.data.estActif);
      
      if (response.data.nom) localStorage.setItem("nom", response.data.nom);
      if (response.data.prenom) localStorage.setItem("prenom", response.data.prenom);

      // Vérifier si le compte est actif
      if (!response.data.estActif) {
        // Rediriger vers la page d'attente si le compte n'est pas activé
        navigate("/en-attente");
      } else {
        // Rediriger vers le dashboard approprié selon le rôle
        if (response.data.role === "ADMINISTRATEUR") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      // Gestion des erreurs spécifiques
      const errorMessage = error.response?.data?.message;
      
      if (errorMessage === "Votre compte est en attente de validation par l'administrateur") {
        setError("Votre compte est en attente de validation. Veuillez patienter ou contacter l'administrateur.");
      } else {
        setError(errorMessage || "Email ou mot de passe incorrect");
      }
      
      console.error("Erreur de connexion:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Connexion</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="auth-link">
          Pas encore de compte? <Link to="/signup">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;