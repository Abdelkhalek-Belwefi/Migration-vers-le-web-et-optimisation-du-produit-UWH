import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingUserId, setEditingUserId] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        role: 'OPERATEUR_ENTREPOT'
    });

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setUsers(data);
            setError('');
        } catch (err) {
            setError('Erreur lors du chargement des utilisateurs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const data = await adminService.getAllRoles();
            setRoles(data);
        } catch (err) {
            console.error('Erreur lors du chargement des rôles:', err);
        }
    };

    const handleActiverCompte = async (userId) => {
        try {
            await adminService.activerCompte(userId);
            setUsers(users.map(user =>
                user.id === userId ? { ...user, estActif: true } : user
            ));
            setSuccess('Compte activé avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError("Erreur lors de l'activation");
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleDesactiverCompte = async (userId) => {
        try {
            await adminService.desactiverCompte(userId);
            setUsers(users.map(user =>
                user.id === userId ? { ...user, estActif: false } : user
            ));
            setSuccess('Compte désactivé avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Erreur lors de la désactivation');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminService.updateUserRole(userId, newRole);
            setUsers(users.map(user =>
                user.id === userId ? { ...user, role: newRole } : user
            ));
            setEditingUserId(null);
            setSelectedRole('');
            setSuccess('Rôle mis à jour avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Erreur lors de la mise à jour du rôle');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            return;
        }
        try {
            await adminService.deleteUser(userId);
            setUsers(users.filter(user => user.id !== userId));
            setSuccess('Utilisateur supprimé avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Erreur lors de la suppression');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const newUserData = await adminService.createUser(newUser);
            setUsers([...users, newUserData]);
            setShowAddModal(false);
            setNewUser({
                nom: '',
                prenom: '',
                email: '',
                password: '',
                role: 'OPERATEUR_ENTREPOT'
            });
            setSuccess('Utilisateur ajouté avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || "Erreur lors de l'ajout");
            setTimeout(() => setError(''), 3000);
        }
    };

    const getRoleBadgeClass = (role) => {
        const roleClasses = {
            'ADMINISTRATEUR': 'role-badge admin',
            'RESPONSABLE_ENTREPOT': 'role-badge manager',
            'OPERATEUR_ENTREPOT': 'role-badge operator',
            'OPERATOR': 'role-badge pending'
        };
        return roleClasses[role] || 'role-badge';
    };

    const getRoleLabel = (role) => {
        const labels = {
            'ADMINISTRATEUR': 'Administrateur',
            'RESPONSABLE_ENTREPOT': 'Responsable Entrepôt',
            'OPERATEUR_ENTREPOT': 'Opérateur Entrepôt',
            'OPERATOR': 'En attente'
        };
        return labels[role] || role;
    };

    if (loading) return <div className="loading">Chargement...</div>;

    return (
        <div className="user-management">
            <div className="header">
                <h2>Gestion des Utilisateurs</h2>
                <button className="btn-add" onClick={() => setShowAddModal(true)}>
                    + Ajouter un utilisateur
                </button>
            </div>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            <div className="table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.nom}</td>
                                <td>{user.prenom}</td>
                                <td>{user.email}</td>
                                <td>
                                    {editingUserId === user.id ? (
                                        <select
                                            value={selectedRole || user.role}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="role-select"
                                        >
                                            {roles.map(role => (
                                                <option key={role} value={role}>
                                                    {getRoleLabel(role)}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className={getRoleBadgeClass(user.role)}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <span className={`status-badge ${user.estActif ? 'active' : 'inactive'}`}>
                                        {user.estActif ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td className="actions">
                                    {editingUserId === user.id ? (
                                        <>
                                            <button
                                                className="btn-save"
                                                onClick={() => handleRoleChange(user.id, selectedRole)}
                                            >
                                                ✓
                                            </button>
                                            <button
                                                className="btn-cancel"
                                                onClick={() => {
                                                    setEditingUserId(null);
                                                    setSelectedRole('');
                                                }}
                                            >
                                                ✗
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {!user.estActif ? (
                                                <button
                                                    className="btn-activate"
                                                    onClick={() => handleActiverCompte(user.id)}
                                                >
                                                    ✅
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn-deactivate"
                                                    onClick={() => handleDesactiverCompte(user.id)}
                                                >
                                                    ⏸️
                                                </button>
                                            )}
                                            <button
                                                className="btn-edit"
                                                onClick={() => {
                                                    setEditingUserId(user.id);
                                                    setSelectedRole(user.role);
                                                }}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                🗑️
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal d'ajout */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Ajouter un utilisateur</h3>
                        <form onSubmit={handleAddUser}>
                            <div className="form-group">
                                <label>Nom</label>
                                <input
                                    type="text"
                                    value={newUser.nom}
                                    onChange={(e) => setNewUser({...newUser, nom: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Prénom</label>
                                <input
                                    type="text"
                                    value={newUser.prenom}
                                    onChange={(e) => setNewUser({...newUser, prenom: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Mot de passe</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Rôle</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>
                                            {getRoleLabel(role)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-submit">Ajouter</button>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;