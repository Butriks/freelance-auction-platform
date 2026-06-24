import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createMessage, getContractMessages } from '../api/messageApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

function formatTime(value, fallback) {
  return value ? new Date(value).toLocaleString() : fallback;
}

function normalizeMessage(message, contractId) {
  return {
    ...message,
    contractId: message.contractId || Number(contractId),
  };
}

function ContractChat({ contractId }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { socket, status: socketStatus } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      setIsLoading(true);
      setError('');

      try {
        const { data } = await getContractMessages(contractId, {
          limit: 100,
          offset: 0,
        });

        if (isMounted) {
          setMessages((data.messages || []).map((message) => normalizeMessage(message, contractId)));
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || t('chat.unableToLoad'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [contractId, t]);

  useEffect(() => {
    if (!socket || !contractId) {
      return undefined;
    }

    const numericContractId = Number(contractId);

    socket.emit('join_contract_room', { contractId: numericContractId }, (response) => {
      if (response && !response.ok) {
        console.warn('Unable to join contract room:', response.message);
      }
    });

    const handleNewMessage = (message) => {
      const nextMessage = normalizeMessage(message, numericContractId);

      if (Number(nextMessage.contractId) !== numericContractId) {
        return;
      }

      setMessages((currentMessages) => {
        if (currentMessages.some((currentMessage) => currentMessage.id === nextMessage.id)) {
          return currentMessages;
        }

        return [...currentMessages, nextMessage].sort(
          (first, second) => new Date(first.createdAt) - new Date(second.createdAt),
        );
      });
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.emit('leave_contract_room', { contractId: numericContractId });
    };
  }, [contractId, socket]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedText = text.trim();
    if (!trimmedText) {
      setError(t('chat.validation'));
      return;
    }

    if (trimmedText.length > 5000) {
      setError(t('chat.validation'));
      return;
    }

    setIsSending(true);
    setError('');

    try {
      const { data } = await createMessage(contractId, { text: trimmedText });
      const nextMessage = normalizeMessage(data.message || data, contractId);

      setMessages((currentMessages) => (
        currentMessages.some((message) => message.id === nextMessage.id)
          ? currentMessages
          : [...currentMessages, nextMessage]
      ));
      setText('');
    } catch (requestError) {
      setError(requestError.message || t('chat.unableToSend'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="chat-card">
      <div className="chat-card__header">
        <div>
          <p className="page-section__eyebrow">{t('chat.title')}</p>
          <h2>{t('chat.message')}</h2>
        </div>
        <span className="socket-note socket-note--compact">{t('bids.realtime', { status: socketStatus })}</span>
      </div>

      {isLoading ? (
        <div className="state-card">
          <span className="loading-state__spinner" />
          <strong>{t('chat.loading')}</strong>
        </div>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      {!isLoading && messages.length === 0 ? (
        <div className="state-card">
          <strong>{t('chat.empty')}</strong>
          <p>{t('chat.emptyText')}</p>
        </div>
      ) : null}

      {!isLoading && messages.length > 0 ? (
        <div className="message-list">
          {messages.map((message) => {
            const isMine = Number(message.senderId) === Number(user?.id);

            return (
              <article key={message.id} className={`message-bubble${isMine ? ' message-bubble--mine' : ''}`}>
                <div className="message-bubble__meta">
                  <strong>{message.sender?.email || t('common.name')}</strong>
                  <span>{message.sender?.role || 'USER'}</span>
                </div>
                <p>{message.text}</p>
                <time>{formatTime(message.createdAt, t('bids.recently'))}</time>
              </article>
            );
          })}
        </div>
      ) : null}

      <form className="chat-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>{t('chat.message')}</span>
          <textarea
            rows="3"
            maxLength="5000"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t('chat.placeholder')}
            required
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={isSending}>
          {isSending ? t('chat.sending') : t('chat.send')}
        </button>
      </form>
    </section>
  );
}

export default ContractChat;
