import React, { useState, useEffect } from 'react';
import { 
    FaSave, 
    FaTimes, 
    FaCheck, 
    FaPause,
    FaEdit, 
    FaTrash,
    FaUserCheck,
    FaCrown,
    FaWarehouse,
    FaSearch,
    FaEye,
    FaEnvelope,
    FaPhone,
    FaCalendarAlt,
    FaBuilding,
    FaUserTag
} from 'react-icons/fa';
import { adminService } from '../../services/adminService';
import { getAllEntrepots } from '../../services/entrepotService ';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [entrepots, setEntrepots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingUserId, setEditingUserId] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedRoleEntrepotId, setSelectedRoleEntrepotId] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchEmail, setSearchEmail] = useState('');
    const [newUser, setNewUser] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        role: 'OPERATEUR_ENTREPOT',
        entrepotId: '',
        numTelephone: ''
    });

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchEntrepots();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setUsers(data);
            setFilteredUsers(data);
            setError('');
        } catch (err) {
            setError('Erreur lors du chargement des utilisateurs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchByEmail = async () => {
        if (!searchEmail.trim()) {
            setFilteredUsers(users);
            return;
        }
        
        try {
            setLoading(true);
            const data = await adminService.searchUsersByEmail(searchEmail.trim());
            setFilteredUsers(data);
            setError('');
        } catch (err) {
            setError('Erreur lors de la recherche');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResetSearch = () => {
        setSearchEmail('');
        setFilteredUsers(users);
    };

    // ========== OUVRE LE MODAL DE DÉTAILS (uniquement par le bouton) ==========
    const handleShowDetails = (user) => {
        setSelectedUser(user);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedUser(null);
    };

    const fetchRoles = async () => {
        try {
            const data = await adminService.getAllRoles();
            let rolesList = data.filter(role => role !== 'ADMINISTRATEUR');
            if (!rolesList.includes('SERVICE_COMMERCIAL')) {
                rolesList.push('SERVICE_COMMERCIAL');
            }
            setRoles(rolesList);
        } catch (err) {
            console.error('Erreur lors du chargement des rôles:', err);
            setRoles(['RESPONSABLE_ENTREPOT', 'OPERATEUR_ENTREPOT', 'OPERATOR', 'SERVICE_COMMERCIAL']);
        }
    };

    const fetchEntrepots = async () => {
        try {
            const data = await getAllEntrepots();
            setEntrepots(data);
        } catch (err) {
            console.error('Erreur chargement entrepôts:', err);
            setEntrepots([]);
        }
    };

    const handleActiverCompte = async (userId) => {
        try {
            await adminService.activerCompte(userId);
            const updatedUsers = users.map(user =>
                user.id === userId ? { ...user, estActif: true } : user
            );
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers);
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
            const updatedUsers = users.map(user =>
                user.id === userId ? { ...user, estActif: false } : user
            );
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers);
            setSuccess('Compte désactivé avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Erreur lors de la désactivation');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleRoleChange = async (userId, newRole, entrepotId) => {
        try {
            await adminService.updateUserRole(userId, newRole, entrepotId);
            const updatedUsers = users.map(user =>
                user.id === userId ? { ...user, role: newRole, entrepotId: entrepotId } : user
            );
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers);
            setEditingUserId(null);
            setSelectedRole('');
            setSelectedRoleEntrepotId('');
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
            const updatedUsers = users.filter(user => user.id !== userId);
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers);
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
            const userToCreate = {
                ...newUser,
                entrepotId: newUser.entrepotId || null
            };
            const newUserData = await adminService.createUser(userToCreate);
            const updatedUsers = [...users, newUserData];
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers);
            setShowAddModal(false);
            setNewUser({
                nom: '',
                prenom: '',
                email: '',
                password: '',
                role: 'OPERATEUR_ENTREPOT',
                entrepotId: '',
                numTelephone: ''
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
            'OPERATOR': 'role-badge pending',
            'SERVICE_COMMERCIAL': 'role-badge commercial',
            'TRANSPORTEUR': 'role-badge transporter'
        };
        return roleClasses[role] || 'role-badge';
    };

    const getRoleLabel = (role) => {
        const labels = {
            'ADMINISTRATEUR': 'Administrateur',
            'RESPONSABLE_ENTREPOT': 'Responsable Entrepôt',
            'OPERATEUR_ENTREPOT': 'Opérateur Entrepôt',
            'OPERATOR': 'En attente',
            'SERVICE_COMMERCIAL': 'Service Commercial',
            'TRANSPORTEUR': 'Transporteur'
        };
        return labels[role] || role;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="loading">Chargement...</div>;

    return (
        <div className="user-management">
            <div className="header">
                <h2>Gestion des Utilisateurs</h2>
                <button className="btn-add" onClick={() => setShowAddModal(true)}>
                    <FaUserCheck /> Ajouter un utilisateur
                </button>
            </div>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            {/* SECTION DE RECHERCHE PAR EMAIL */}
            <div className="search-section">
                <div className="search-form">
                    <input
                        type="text"
                        placeholder="Rechercher par email..."
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchByEmail()}
                    />
                    <button className="btn-search" onClick={handleSearchByEmail}>
                        <FaSearch /> Rechercher
                    </button>
                    <button className="btn-reset" onClick={handleResetSearch}>
                        <FaTimes /> Réinitialiser
                    </button>
                </div>
            </div>

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
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.nom}</td>
                                <td>{user.prenom}</td>
                                <td>{user.email}</td>
                                <td>
                                    {editingUserId === user.id ? (
                                        <>
                                            <select
                                                value={selectedRole || user.role}
                                                onChange={(e) => setSelectedRole(e.target.value)}
                                                className="role-select"
                                                style={{ marginBottom: '8px', width: '100%' }}
                                            >
                                                {roles.map(role => (
                                                    <option key={role} value={role}>
                                                        {getRoleLabel(role)}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                value={selectedRoleEntrepotId || (user.entrepotId || '')}
                                                onChange={(e) => setSelectedRoleEntrepotId(e.target.value)}
                                                className="role-select"
                                                style={{ width: '100%' }}
                                            >
                                                <option value="">-- Aucun (global) --</option>
                                                {entrepots.map(ent => (
                                                    <option key={ent.id} value={ent.id}>{ent.nom}</option>
                                                ))}
                                            </select>
                                        </>
                                    ) : (
                                        <>
                                            <span className={getRoleBadgeClass(user.role)}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                            {user.entrepotNom && (
                                                <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                                                    <FaWarehouse size={10} /> {user.entrepotNom}
                                                </div>
                                            )}
                                        </>
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
                                                onClick={() => handleRoleChange(user.id, selectedRole, selectedRoleEntrepotId || null)}
                                                title="Sauvegarder"
                                            >
                                                <FaSave />
                                            </button>
                                            <button
                                                className="btn-cancel"
                                                onClick={() => {
                                                    setEditingUserId(null);
                                                    setSelectedRole('');
                                                    setSelectedRoleEntrepotId('');
                                                }}
                                                title="Annuler"
                                            >
                                                <FaTimes />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {user.email === 'admin@gmail.com' ? (
                                                <span className="admin-badge" title="Compte système protégé">
                                                    <FaCrown /> Admin système
                                                </span>
                                            ) : (
                                                <>
                                                    {/* Bouton Voir Détails - SEUL moyen d'ouvrir le modal */}
                                                    <button
                                                        className="btn-view"
                                                        onClick={() => handleShowDetails(user)}
                                                        title="Voir détails"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    {!user.estActif ? (
                                                        <button
                                                            className="btn-activate"
                                                            onClick={() => handleActiverCompte(user.id)}
                                                            title="Activer le compte"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn-deactivate"
                                                            onClick={() => handleDesactiverCompte(user.id)}
                                                            title="Désactiver le compte"
                                                        >
                                                            <FaPause />
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => {
                                                            setEditingUserId(user.id);
                                                            setSelectedRole(user.role);
                                                            setSelectedRoleEntrepotId(user.entrepotId || '');
                                                        }}
                                                        title="Modifier le rôle"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        title="Supprimer"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                 </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="no-data">Aucun utilisateur trouvé</div>
                )}
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
                                <label><FaPhone /> Téléphone</label>
                                <input
                                    type="tel"
                                    value={newUser.numTelephone}
                                    onChange={(e) => setNewUser({...newUser, numTelephone: e.target.value})}
                                    placeholder="Numéro de téléphone"
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
                            <div className="form-group">
                                <label>Entrepôt (optionnel)</label>
                                <select
                                    value={newUser.entrepotId}
                                    onChange={(e) => setNewUser({...newUser, entrepotId: e.target.value})}
                                >
                                    <option value="">-- Aucun (rôle global) --</option>
                                    {entrepots.map(ent => (
                                        <option key={ent.id} value={ent.id}>{ent.nom}</option>
                                    ))}
                                </select>
                                <small>Laissez vide pour un rôle valable sur tous les entrepôts</small>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-submit">
                                    <FaUserCheck /> Ajouter
                                </button>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    <FaTimes /> Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE DÉTAILS */}
            {showDetailModal && selectedUser && (
                <div className="modal-overlay" onClick={handleCloseDetailModal}>
                    <div className="modal-content user-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><FaUserTag /> Détails de l'utilisateur</h3>
                            <button className="modal-close" onClick={handleCloseDetailModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <h4>📋 Informations personnelles</h4>
                                
                                <div className="detail-row">
                                    <span className="detail-label">ID :</span>
                                    <span className="detail-value">{selectedUser.id}</span>
                                </div>
                                
                                <div className="detail-row">
                                    <span className="detail-label">Nom :</span>
                                    <span className="detail-value">{selectedUser.nom}</span>
                                </div>
                                
                                <div className="detail-row">
                                    <span className="detail-label">Prénom :</span>
                                    <span className="detail-value">{selectedUser.prenom}</span>
                                </div>
                                
                                <div className="detail-row">
                                    <span className="detail-label">Nom complet :</span>
                                    <span className="detail-value">{selectedUser.prenom} {selectedUser.nom}</span>
                                </div>
                                
                                <div className="detail-row">
                                    <span className="detail-label"><FaPhone /> Téléphone :</span>
                                    <span className="detail-value">{selectedUser.numTelephone || 'Non renseigné'}</span>
                                </div>
                                
                                <div className="detail-row">
                                    <span className="detail-label"><FaEnvelope /> Email :</span>
                                    <span className="detail-value">{selectedUser.email}</span>
                                </div>
                                
                                <div className="detail-row">
                                    <span className="detail-label"><FaUserTag /> Rôle :</span>
                                    <span className={`role-badge ${getRoleBadgeClass(selectedUser.role)}`}>
                                        {getRoleLabel(selectedUser.role)}
                                    </span>
                                </div>
                                
                                <div className="detail-row">
                                    <span className="detail-label"><FaBuilding /> Entrepôt :</span>
                                    <span className="detail-value">{selectedUser.entrepotNom || 'Aucun (global)'}</span>
                                </div>
                                
                                <div className="detail-row">
                                    <span className="detail-label">Statut :</span>
                                    <span className={`status-badge ${selectedUser.estActif ? 'active' : 'inactive'}`}>
                                        {selectedUser.estActif ? '✅ Actif' : '❌ Inactif'}
                                    </span>
                                </div>
                                
                                <div className="detail-row">
                                    <span className="detail-label"><FaCalendarAlt /> Date de création :</span>
                                    <span className="detail-value">{formatDate(selectedUser.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-close" onClick={handleCloseDetailModal}>
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;