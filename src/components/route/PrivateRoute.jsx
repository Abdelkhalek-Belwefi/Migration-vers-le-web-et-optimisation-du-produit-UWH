import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRole = null }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const estActif = localStorage.getItem('estActif') === 'true';

    if (!token) {
        return <Navigate to="/login" />;
    }

    // Si le compte n'est pas actif, rediriger vers la page d'attente
    if (!estActif) {
        return <Navigate to="/en-attente" />;
    }

    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

export default PrivateRoute;