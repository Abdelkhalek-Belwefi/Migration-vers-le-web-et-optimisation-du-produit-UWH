import React from 'react';
import { useNavigate } from 'react-router-dom';
// Import des icônes depuis react-icons/fa
import { FaUsers, FaKey, FaLock, FaFileAlt, FaChartBar, FaCheckCircle, FaPaperPlane, FaPrint, FaCog, FaDownload, FaBox, FaClipboardList, FaCheck, FaSyncAlt, FaHourglassHalf } from 'react-icons/fa';
import '../../styles/task-table.css';

const TaskTable = ({ role }) => {
  const navigate = useNavigate();

  const tasksByRole = {
    ADMINISTRATEUR: [
      { id: 1, name: 'Gérer les utilisateurs', icon: <FaUsers />, path: '/admin/users' },
      { id: 2, name: 'Gérer les rôles', icon: <FaKey />, path: '/admin/roles' },
      { id: 3, name: 'Gérer les permissions', icon: <FaLock />, path: '/admin/permissions' },
      { id: 4, name: 'Consulter les journaux', icon: <FaFileAlt />, path: '/admin/logs' },
    ],
    RESPONSABLE_ENTREPOT: [
      { id: 1, name: 'Consulter le stock', icon: <FaChartBar />, path: '/stock' },
      { id: 2, name: 'Valider une réception', icon: <FaCheckCircle />, path: '/reception/valider' },
      { id: 3, name: 'Valider une expédition', icon: <FaPaperPlane />, path: '/expedition/valider' },
      { id: 4, name: 'Imprimer des documents', icon: <FaPrint />, path: '/documents' },
      { id: 5, name: 'Générer une tâche de rangement', icon: <FaCog />, path: '/rangement/generer' },
    ],
    OPERATEUR_ENTREPOT: [
      { id: 1, name: 'Réceptionner une marchandise', icon: <FaDownload />, path: '/reception' },
      { id: 2, name: 'Exécuter un rangement', icon: <FaBox />, path: '/rangement' },
      { id: 3, name: 'Créer un picking', icon: <FaClipboardList />, path: '/picking/creer' },
      { id: 4, name: 'Valider un picking', icon: <FaCheck />, path: '/picking/valider' },
      { id: 5, name: 'Effectuer un transfert', icon: <FaSyncAlt />, path: '/transfert' },
    ],
    OPERATOR: [
      { id: 1, name: 'Compte en attente de validation', icon: <FaHourglassHalf />, path: '#' },
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