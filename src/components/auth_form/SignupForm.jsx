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
        // Stocker toutes les informations
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("email", response.data.email);
        localStorage.setItem("nom", response.data.nom);
        localStorage.setItem("prenom", response.data.prenom);
        localStorage.setItem("estActif", response.data.estActif);
        
        // Rediriger vers la page d'attente (compte en attente de validation)
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
    <div className="auth-container">
      <div className="auth-box">
        <h2>Signup</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <input
            type="tel"
            name="numTelephone"
            placeholder="Téléphone"
            value={formData.numTelephone}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            disabled={loading}
          />

          <input
            type="password"
            name="repeatPassword"
            placeholder="Repeat Password"
            value={formData.repeatPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <button 
            type="submit" 
            disabled={loading}
          >
            {loading ? "Inscription..." : "Signup"}
          </button>
        </form>

        <p className="auth-link">
          Already have account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;