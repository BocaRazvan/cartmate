import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase.js";

function MessageBoard({ setter, user, messages, onRefreshMessages }) {
  const [nickname, setNickname] = useState("");
  const [messageText, setMessageText] = useState("");
  const [errorModal, setErrorModal] = useState("");

  async function handleSubmitMessage() {
    if (nickname.trim() === "" || messageText.trim() === "") {
      setErrorModal("Please fill in both a nickname and a message.");
      return;
    }
    await addDoc(collection(db, "messages"), {
      nickname: nickname.trim(),
      text: messageText.trim(),
      authorUid: user.uid,
      createdAt: new Date(),
    });
    setNickname("");
    setMessageText("");
    onRefreshMessages();
  }

  return (
    <div className="manage-group-section">
      <div className="view-lists-header">
        <button
          className="btn-secondary action-btn"
          onClick={() => setter(null)}
        >
          ← Back
        </button>
        <button
          className="icon-btn"
          aria-label="Refresh"
          onClick={onRefreshMessages}
        >
          ⟳
        </button>
      </div>

      <p className="section-subtitle">
        Leave a message for everyone on CartMate to see.
      </p>

      <div className="item-form">
        <input
          className="text-input"
          type="text"
          placeholder="Nickname*"
          maxLength={20}
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            if (e.target.value.length >= 20) {
              setErrorModal("Maximum characters reached.");
            }
          }}
        />
        <textarea
          className="textarea-input"
          placeholder="Message*"
          maxLength={250}
          rows={4}
          value={messageText}
          onChange={(e) => {
            setMessageText(e.target.value);
            if (e.target.value.length >= 250) {
              setErrorModal("Maximum characters reached.");
            }
          }}
        />
        <button className="btn-primary" onClick={handleSubmitMessage}>
          Submit
        </button>
      </div>

      {messages.length === 0 && <p className="no-items">No messages yet.</p>}

      <div className="items-list">
        {messages.map((message) => (
          <div className="message-card" key={message.id}>
            <div className="message-card-top">
              <div className="message-author">
                {message.avatarUrl ? (
                  <img
                    className="avatar-img-small"
                    src={message.avatarUrl}
                    alt=""
                  />
                ) : (
                  <span className="avatar-img-small avatar-placeholder">
                    👤
                  </span>
                )}
                <span className="message-card-nickname">
                  {message.nickname}
                </span>
              </div>
              <span className="message-card-date">
                {message.createdAt.toDate().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className="message-card-text">{message.text}</p>
          </div>
        ))}
      </div>

      {errorModal && (
        <div className="alert-overlay" onClick={() => setErrorModal("")}>
          <div
            className="alert-box alert-error"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="alert-dismiss" onClick={() => setErrorModal("")}>
              ✖
            </button>
            <p>{errorModal}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageBoard;
