import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickActionsGrid = ({ actions }) => {
  const navigate = useNavigate();

  const handleActionClick = (action) => {
    switch(action.label) {
      case 'Préparation des commandes clients':
      case 'Sales order pick':
        navigate('/sales-order');
        break;
      case 'Goods receipt':
        navigate('/goods-receipt');
        break;
      case 'Déménagement':
      case 'Relocation':
        navigate('/relocation');
        break;
      case 'Stock taking':
        navigate('/stock-taking');
        break;
      case 'Relocalisation par lots':
      case 'Batch relocation':
        navigate('/batch-relocation');
        break;
      case 'Stock correction':
        navigate('/stock-correction');
        break;
      case 'Batch storage':
        navigate('/batch-storage');
        break;
      case 'Prod. Put':
        navigate('/prod-put');
        break;
      default:
        console.log('Action non implémentée:', action.label);
    }
  };

  return (
    <div className="actions-grid">
      {actions.map((action) => (
        <div 
          key={action.id} 
          className="action-card"
          onClick={() => handleActionClick(action)}
          style={{ 
            background: `linear-gradient(135deg, ${action.bgColor} 0%, white 100%)`,
            borderLeft: `4px solid ${action.color}`
          }}
        >
          <div className="action-icon" style={{ color: action.color }}>
            {action.icon}
          </div>
          <div className="action-label">
            {action.label}
          </div>
          <div className="action-hover">
            <span>Cliquez pour accéder</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickActionsGrid;