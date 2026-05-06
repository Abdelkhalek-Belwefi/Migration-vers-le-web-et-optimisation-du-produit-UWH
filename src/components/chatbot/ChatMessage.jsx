import React from 'react';
import { FaRobot, FaUser } from 'react-icons/fa';
import ChatCard from './ChatCard';

const ChatMessage = ({ message }) => {
    const formatTime = (date) => {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const renderContent = () => {
        if (message.type === 'CARDS' && message.cards) {
            return (
                <div className="message-cards">
                    {message.cards.map((card, idx) => (
                        <ChatCard key={idx} card={card} />
                    ))}
                </div>
            );
        }
        
        // Formatage du texte (remplacement des \n par des <br>)
        const formattedText = message.text.split('\n').map((line, i) => (
            <React.Fragment key={i}>
                {line}
                {i < message.text.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
        
        return <div className="message-text">{formattedText}</div>;
    };

    return (
        <div className={`message ${message.sender}`}>
            <div className="message-avatar">
                {message.sender === 'bot' ? <FaRobot /> : <FaUser />}
            </div>
            <div className="message-content">
                {renderContent()}
                <div className="message-time">
                    {formatTime(message.timestamp)}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;