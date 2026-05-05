import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/auth.css';
import Navbar from '../components/home/Navbar';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
            setSuccess('Si cet email existe, un lien de réinitialisation vous a été envoyé.');
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="w-nexus-core">
                <div className="w-portal-frame">
                    <div className="w-gate-control">
                        <div className="w-nav-revert" onClick={() => window.location.href = '/'}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </div>

                        <div className="w-id-brand">WARE<span>HOUSE</span></div>

                        <h2>Mot de passe oublié</h2>
                        <p className="w-meta-label">Entrez votre email pour réinitialiser votre mot de passe.</p>

                        {error && <div className="w-alert-signal error">{error}</div>}
                        {success && <div className="w-alert-signal success">{success}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="w-input-row">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button type="submit" className="w-trigger-action" disabled={loading}>
                                {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                            </button>
                        </form>

                        <p className="w-anchor-route">
                            <Link to="/login">Retour à la connexion</Link>
                        </p>
                    </div>

                    <div className="w-visual-sector">
                        <div className="w-sector-overlay">
                            <div className="w-status-tag">Password Recovery</div>
                            <h3 style={{fontSize: '2rem', marginBottom: '10px'}}>Réinitialisation</h3>
                            <p style={{color: '#cbd5e1'}}>Un lien vous sera envoyé par email.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;