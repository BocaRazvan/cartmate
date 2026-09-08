import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase.js";

function ViewLists({
  setter,
  myLists,
  onRefreshLists,
  sharedLists,
  onRefreshSharedLists,
  user,
}) {
  const [section, setSection] = useState("mine");
  const [selectedList, setSelectedList] = useState(null);
  const [listToDelete, setListToDelete] = useState(null);
  const [privacyFilter, setPrivacyFilter] = useState("All");

  async function handleToggleChecked(index) {
    const updatedItems = selectedList.items.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item,
    );
    setSelectedList({ ...selectedList, items: updatedItems });
    await updateDoc(doc(db, "lists", selectedList.id), {
      items: updatedItems,
    });
    onRefreshLists(user.uid);
    onRefreshSharedLists(user.uid);
  }

  async function handleDeleteList() {
    await deleteDoc(doc(db, "lists", listToDelete.id));
    setListToDelete(null);
    onRefreshLists(user.uid);
    onRefreshSharedLists(user.uid);
  }

  const visibleLists = myLists.filter(
    (list) => privacyFilter === "All" || list.privacy === privacyFilter,
  );

  return (
    <div className="view-lists-section">
      <div className="view-lists-tabs">
        <button
          className={section === "mine" ? "tab-btn active" : "tab-btn"}
          onClick={() => setSection("mine")}
        >
          My lists
        </button>
        <button
          className={section === "shared" ? "tab-btn active" : "tab-btn"}
          onClick={() => setSection("shared")}
        >
          Shared with me
        </button>
      </div>

      {section === "mine" && (
        <>
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
              onClick={() => onRefreshLists(user.uid)}
            >
              ⟳
            </button>
          </div>{" "}
          <div className="view-lists-tabs">
            <button
              className={privacyFilter === "All" ? "tab-btn active" : "tab-btn"}
              onClick={() => setPrivacyFilter("All")}
            >
              All
            </button>
            <button
              className={
                privacyFilter === "Public" ? "tab-btn active" : "tab-btn"
              }
              onClick={() => setPrivacyFilter("Public")}
            >
              Public
            </button>
            <button
              className={
                privacyFilter === "Private" ? "tab-btn active" : "tab-btn"
              }
              onClick={() => setPrivacyFilter("Private")}
            >
              Private
            </button>
          </div>
          {visibleLists.length === 0 && <p>No lists yet.</p>}
          <div className="items-list">
            {visibleLists.map((list) => (
              <div
                className="list-card"
                key={list.id}
                onClick={() => setSelectedList(list)}
              >
                <div className="list-card-top">
                  <span className="list-card-name">{list.name}</span>
                  <span className="list-card-top-right">
                    <span
                      className={
                        list.privacy === "Private"
                          ? "privacy-badge privacy-private"
                          : "privacy-badge privacy-public"
                      }
                    >
                      {list.privacy}
                    </span>
                    <button
                      className="icon-btn icon-btn-delete"
                      aria-label="Delete list"
                      onClick={(e) => {
                        e.stopPropagation();
                        setListToDelete(list);
                      }}
                    >
                      🗑
                    </button>
                  </span>
                </div>
                <p className="list-card-date">
                  {list.createdAt.toDate().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                </p>

                <p className="list-card-info">
                  {list.store} · {list.items.length} items
                </p>
                <p className="list-card-owner">Owner: {list.ownerEmail}</p>
                <span className="list-card-chevron">
                  <span className="chevron-part">›</span>
                  <span className="chevron-part">›</span>
                  <span className="chevron-part">›</span>{" "}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {section === "shared" && (
        <>
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
              onClick={() => onRefreshSharedLists(user.uid)}
            >
              ⟳
            </button>
          </div>
          {sharedLists.length === 0 && <p>No shared lists yet.</p>}
          <div className="items-list">
            {sharedLists.map((list) => (
              <div
                className="list-card"
                key={list.id}
                onClick={() => setSelectedList(list)}
              >
                <div className="list-card-top">
                  <span className="list-card-name">{list.name}</span>
                  <span className="list-card-top-right">
                    <span className="privacy-badge privacy-public">
                      Public
                    </span>
                    <button
                      className="icon-btn icon-btn-delete"
                      aria-label="Delete list"
                      onClick={(e) => {
                        e.stopPropagation();
                        setListToDelete(list);
                      }}
                    >
                      🗑
                    </button>
                  </span>
                </div>
                <p className="list-card-date">
                  {list.createdAt.toDate().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                <p className="list-card-info">
                  {list.store} · {list.items.length} items
                </p>
                <p className="list-card-owner">Owner: {list.ownerEmail}</p>
                <span className="list-card-chevron">
                  <span className="chevron-part">›</span>
                  <span className="chevron-part">›</span>
                  <span className="chevron-part">›</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedList && (
        <div className="modal-overlay" onClick={() => setSelectedList(null)}>
          <div
            className="modal-content list-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="dismiss-btn"
              onClick={() => setSelectedList(null)}
            >
              ✖
            </button>
            <h2 className="list-modal-title">{selectedList.name}</h2>
            <p className="section-subtitle">{selectedList.store}</p>

            <div className="items-list">
              {selectedList.items.map((item, index) => (
                <div className="item-card" key={index}>
                  <div className="item-card-main">
                    <span className="item-card-index">{index + 1}</span>
                    <span
                      className={
                        item.checked
                          ? "item-card-name checked"
                          : "item-card-name"
                      }
                    >
                      {item.name}
                    </span>
                    <span className="item-card-qty">Qty {item.quantity}</span>
                    <span className="item-card-actions">
                      <button
                        className="icon-btn"
                        aria-label={
                          item.checked
                            ? "Mark item as not done"
                            : "Mark item as done"
                        }
                        onClick={() => handleToggleChecked(index)}
                      >
                        {item.checked ? "☑" : "☐"}
                      </button>
                    </span>
                  </div>
                  <p className="item-card-photo">
                    {item.imgUrl === "Not added" ? (
                      "Photo: Not added"
                    ) : (
                      <a
                        href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(item.imgUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Search photo: {item.imgUrl}
                      </a>
                    )}
                  </p>
                  <p className="item-card-comments">
                    Comment:{" "}
                    {item.comments === "Not added"
                      ? "Not added."
                      : item.comments}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {listToDelete && (
        <div className="modal-overlay" onClick={() => setListToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <p className="section-subtitle">
              Delete "{listToDelete.name}"? This action cannot be undone.
            </p>
            <div className="item-card-edit-actions">
              <button
                className="btn-secondary"
                onClick={() => setListToDelete(null)}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteList}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewLists;
