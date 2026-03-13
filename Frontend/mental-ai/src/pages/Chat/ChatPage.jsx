import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CrisisBanner from '../../components/CrisisBanner/CrisisBanner';
import TypingIndicator from '../../components/TypingIndicator/TypingIndicator';
import { Button } from '../../components/ui/Button/Button';
import api from '../../api/axios';
import styles from './Chat.module.css';

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [crisisScore, setCrisisScore] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: 'Hi there. I am MindEase, your safe space to talk. How are you feeling right now?',
        timestamp: new Date().toISOString(),
      }
    ]);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Build minimal conversation history for the backend
      const conversationHistory = [...messages, userMessage].map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      const response = await api.post('/chat/message', {
        message: userMessage.text,
        conversationHistory,
        sessionId,
      });

      const payload = response.data?.data || {};
      const {
        message: aiText,
        crisisScore: apiCrisisScore,
        copingTip,
        sessionId: newSessionId,
      } = payload;

      const effectiveSessionId = newSessionId || sessionId;
      if (!sessionId && effectiveSessionId) {
        setSessionId(effectiveSessionId);
      }

      const aiResponse = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toISOString(),
        coping_tip: copingTip,
      };

      setMessages((prev) => [...prev, aiResponse]);
      if (typeof apiCrisisScore === 'number') {
        setCrisisScore(apiCrisisScore);
      }
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Crisis Banner - fixed at top if active */}
      <CrisisBanner score={crisisScore} />

      {/* Chat Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button onClick={() => navigate('/dashboard')} className={styles.backBtn} aria-label="Go back">
            <ArrowLeft size={24} />
          </button>
          <div className={styles.headerInfo}>
            <div className={styles.aiAvatar}>M</div>
            <div>
              <h2 className={styles.headerTitle}>MindEase AI</h2>
              <p className={styles.headerStatus}>Online</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className={styles.messagesArea}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`${styles.messageWrapper} ${isUser ? styles.userWrapper : styles.aiWrapper}`}>
              {!isUser && <div className={styles.messageAvatar}>M</div>}
              
              <div className={styles.messageContent}>
                <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.aiBubble}`}>
                  {msg.text}
                </div>
                
                {/* Coping Tip Badge underneath AI message */}
                {msg.coping_tip && (
                  <div className={styles.copingTip}>
                    <span className={styles.copingTipLabel}>Tip</span>
                    {msg.coping_tip}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className={`${styles.messageWrapper} ${styles.aiWrapper}`}>
            <div className={styles.messageAvatar}>M</div>
            <TypingIndicator />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputContainer}>
        <form onSubmit={handleSend} className={styles.inputForm}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className={styles.inputField}
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isTyping}
            className={styles.sendBtn}
            aria-label="Send message"
          >
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}
