import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const ChatInput = ({ onSendMessage, disabled }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() && !disabled) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <form className="chatbot-input" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Écrivez votre message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={disabled}
            />
            <button type="submit" disabled={disabled || !inputValue.trim()}>
                <FaPaperPlane />
            </button>
        </form>
    );
};

export default ChatInput;