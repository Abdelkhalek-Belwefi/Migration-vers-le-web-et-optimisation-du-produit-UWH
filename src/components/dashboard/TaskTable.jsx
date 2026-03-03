import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/task-table.css';

const TaskTable = ({ role }) => {
  const navigate = useNavigate();

  const tasksByRole = {
    ADMINISTRATEUR: [
      { id: 1, name: 'Gérer les utilisateurs', icon: '👥', path: '/admin/users' },
      { id: 2, name: 'Gérer les rôles', icon: '🔑', path: '/admin/roles' },
      { id: 3, name: 'Gérer les permissions', icon: '🔒', path: '/admin/permissions' },
      { id: 4, name: 'Consulter les journaux', icon: '📝', path: '/admin/logs' },
    ],
    RESPONSABLE_ENTREPOT: [
      { id: 1, name: 'Consulter le stock', icon: '📊', path: '/stock' },
      { id: 2, name: 'Valider une réception', icon: '✅', path: '/reception/valider' },
      { id: 3, name: 'Valider une expédition', icon: '📤', path: '/expedition/valider' },
      { id: 4, name: 'Imprimer des documents', icon: '🖨️', path: '/documents' },
      { id: 5, name: 'Générer une tâche de rangement', icon: '⚙️', path: '/rangement/generer' },
    ],
    OPERATEUR_ENTREPOT: [
      { id: 1, name: 'Réceptionner une marchandise', icon: '📥', path: '/reception' },
      { id: 2, name: 'Exécuter un rangement', icon: '📦', path: '/rangement' },
      { id: 3, name: 'Créer un picking', icon: '📋', path: '/picking/creer' },
      { id: 4, name: 'Valider un picking', icon: '✔️', path: '/picking/valider' },
      { id: 5, name: 'Effectuer un transfert', icon: '🔄', path: '/transfert' },
    ],
    OPERATOR: [
      { id: 1, name: 'Compte en attente de validation', icon: '⏳', path: '#' },
    ],
  };

  const tasks = tasksByRole[role] || tasksByRole.OPERATOR;

  const handleTaskClick = (path) => {
    if (path !== '#') {
      navigate(path);
    }
  };

  return (
    <div className="task-table-container">
      <h2>Mes tâches</h2>
      <div className="task-grid">
        {tasks.map(task => (
          <div
            key={task.id}
            className="task-card"
            onClick={() => handleTaskClick(task.path)}
            style={{ cursor: task.path !== '#' ? 'pointer' : 'default' }}
          >
            <div className="task-icon">{task.icon}</div>
            <div className="task-name">{task.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskTable;