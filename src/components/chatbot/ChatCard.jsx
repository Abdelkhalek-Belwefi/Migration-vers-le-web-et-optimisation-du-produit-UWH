import React from 'react';

const ChatCard = ({ card }) => {
    const handleButtonClick = () => {
        if (card.buttonAction) {
            window.location.href = card.buttonAction;
        }
    };

    return (
        <div className="message-card">
            <div className="message-card-header">
                <h4>{card.title}</h4>
                {card.subtitle && <p>{card.subtitle}</p>}
            </div>
            {card.fields && (
                <div className="message-card-body">
                    {Object.entries(card.fields).map(([key, value], idx) => (
                        <div key={idx} className="message-card-field">
                            <span className="label">{key}:</span>
                            <span className="value">{value}</span>
                        </div>
                    ))}
                </div>
            )}
            {card.buttonLabel && (
                <button className="message-card-button" onClick={handleButtonClick}>
                    {card.buttonLabel}
                </button>
            )}
        </div>
    );
};

export default ChatCard;