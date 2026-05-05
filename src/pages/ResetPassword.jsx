import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/auth.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tokenParam = queryParams.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            setError('Token de réinitialisation invalide.');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }
        
        if (newPassword.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post('http://localhost:8080/api/auth/reset-password', {
                token,
                newPassword
            });
            setSuccess('Votre mot de passe a été réinitialisé avec succès !');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue. Le lien est peut-être expiré.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-nexus-core">
            <div className="w-portal-frame">
                <div className="w-gate-control">
                    <div className="w-nav-revert" onClick={() => navigate('/')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </div>

                    <div className="w-id-brand">WARE<span>HOUSE</span></div>

                    <h2>Nouveau mot de passe</h2>
                    <p className="w-meta-label">Créez un nouveau mot de passe pour votre compte.</p>

                    {error && <div className="w-alert-signal error">{error}</div>}
                    {success && <div className="w-alert-signal success">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="w-input-row">
                            <label>Nouveau mot de passe</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={loading || !token}
                                minLength="6"
                            />
                        </div>

                        <div className="w-input-row">
                            <label>Confirmer le mot de passe</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading || !token}
                                minLength="6"
                            />
                        </div>

                        <button type="submit" className="w-trigger-action" disabled={loading || !token}>
                            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                        </button>
                    </form>

                    <p className="w-anchor-route">
                        <Link to="/login">Retour à la connexion</Link>
                    </p>
                </div>

                <div className="w-visual-sector">
                    <div className="w-sector-overlay">
                        <div className="w-status-tag">Security</div>
                        <h3 style={{fontSize: '2rem', marginBottom: '10px'}}>Mot de passe sécurisé</h3>
                        <p style={{color: '#cbd5e1'}}>Choisissez un mot de passe fort et unique.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;