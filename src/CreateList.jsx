import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase.js";

function CreateList({ user, onClose, onRefreshLists }) {
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [itemPhotoUrl, setItemPhotoUrl] = useState("");
  const [itemComments, setItemComments] = useState("");
  const [listName, setListName] = useState("");
  const [items, setItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValues, setEditValues] = useState({
    name: "",
    quantity: "",
    imgUrl: "",
    comments: "",
  });
  const [showSaveMode, setShowSaveMode] = useState(false);
  const [selectedStore, setSelectedStore] = useState("");
  const [errorModal, setErrorModal] = useState("");
  const [successModal, setSuccessModal] = useState("");
  const [listPrivacy, setListPrivacy] = useState("Private");

  function handleAddItemsToList() {
    if (itemName.trim() === "" || itemQty.trim() === "") {
      setErrorModal("Please fill in both name and quantity.");
      return;
    }
    if (Number(itemQty) <= 0) {
      setErrorModal("Quantity must be at least 1.");
      return;
    }
    setItems([
      ...items,
      {
        name: itemName,
        quantity: itemQty,
        imgUrl: itemPhotoUrl.trim() === "" ? "Not added" : itemPhotoUrl,
        comments: itemComments.trim() === "" ? "Not added" : itemComments,
        checked: false,
      },
    ]);
    setItemName("");
    setItemQty("");
    setItemPhotoUrl("");
    setItemComments("");
  }

  function handleDeleteLineItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleEditLineItem(index) {
    setEditValues({
      name: items[index].name,
      quantity: items[index].quantity,
      imgUrl: items[index].imgUrl,
      comments: items[index].comments,
    });
    setEditingIndex(index);
  }

  function handleCancelEdit() {
    setEditingIndex(null);
  }

  function handleSaveLineItem(index) {
    if (editValues.name.trim() === "" || editValues.quantity.trim() === "") {
      setErrorModal("Please fill in both name and quantity.");
      return;
    }
    if (Number(editValues.quantity) <= 0) {
      setErrorModal("Quantity must be at least 1.");
      return;
    }
    setItems(
      items.map((item, i) =>
        i === index ? { ...editValues, checked: item.checked } : item,
      ),
    );
    setEditingIndex(null);
  }

  async function handleSaveList() {
    if (listName.trim() === "" || selectedStore === "" || items.length === 0) {
      setErrorModal("Please add a name to your list and select a store.");
      return;
    }
    try {
      await addDoc(collection(db, "lists"), {
        ownerId: user.uid,
        ownerEmail: user.email,
        name: listName,
        store: selectedStore,
        items,
        createdAt: new Date(),
        privacy: listPrivacy,
      });
      setItems([]);
      setListName("");
      setSelectedStore("");
      setShowSaveMode(false);
      setSuccessModal("List saved!");
      setListPrivacy("Private");
      onRefreshLists(user.uid);
    } catch (error) {
      setErrorModal(error.message);
    }
  }

  return (
    <div className="create-list-section">
      <p className="section-subtitle">
        Start building your list below. Add items one at a time.
      </p>
      <form className="item-form">
        <input
          className="text-input"
          type="text"
          placeholder="Item*"
          maxLength={25}
          value={itemName}
          onChange={(e) => {
            setItemName(e.target.value);
            if (e.target.value.length >= 25) {
              setErrorModal("Maximum characters reached.");
            }
          }}
        />

        <input
          className="text-input"
          type="number"
          placeholder="Qty*"
          value={itemQty}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
            setItemQty(value);
            if (value.length >= 4) {
              setErrorModal("Maximum characters reached.");
            }
          }}
        />

        <input
          className="text-input"
          type="text"
          placeholder="Photo URL (optional)"
          maxLength={250}
          value={itemPhotoUrl}
          onChange={(e) => {
            setItemPhotoUrl(e.target.value);
            if (e.target.value.length >= 250) {
              setErrorModal("Maximum characters reached.");
            }
          }}
        />

        <input
          className="text-input"
          type="text"
          placeholder="Comments (optional)"
          maxLength={250}
          value={itemComments}
          onChange={(e) => {
            setItemComments(e.target.value);
            if (e.target.value.length >= 250) {
              setErrorModal("Maximum characters reached.");
            }
          }}
        />
      </form>
      <button
        className="btn-primary action-btn"
        onClick={handleAddItemsToList}
        disabled={items.length >= 25}
      >
        Add Item to list
      </button>

      {items.length === 0 && <p className="no-items">No items added yet.</p>}

      {items.length >= 25 && <p>Maximum of 25 items / list reached.</p>}

      {items.length > 0 && (
        <div className="items-list">
          {items.map((element, index) => (
            <div className="item-card" key={index}>
              {index === editingIndex ? (
                <div className="item-card-edit">
                  <input
                    className="text-input"
                    type="text"
                    autoFocus
                    maxLength={25}
                    placeholder="Item*"
                    value={editValues.name}
                    onChange={(e) => {
                      setEditValues({ ...editValues, name: e.target.value });
                      if (e.target.value.length >= 25) {
                        setErrorModal("Maximum characters reached.");
                      }
                    }}
                  />
                  <input
                    className="text-input"
                    type="number"
                    placeholder="Qty*"
                    value={editValues.quantity}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 4);
                      setEditValues({ ...editValues, quantity: value });
                      if (value.length >= 4) {
                        setErrorModal("Maximum characters reached.");
                      }
                    }}
                  />
                  <input
                    className="text-input"
                    type="text"
                    maxLength={250}
                    placeholder="Photo URL (optional)"
                    value={editValues.imgUrl}
                    onChange={(e) => {
                      setEditValues({
                        ...editValues,
                        imgUrl: e.target.value,
                      });
                      if (e.target.value.length >= 250) {
                        setErrorModal("Maximum characters reached.");
                      }
                    }}
                  />
                  <input
                    className="text-input"
                    type="text"
                    maxLength={250}
                    placeholder="Comments (optional)"
                    value={editValues.comments}
                    onChange={(e) => {
                      setEditValues({
                        ...editValues,
                        comments: e.target.value,
                      });
                      if (e.target.value.length >= 250) {
                        setErrorModal("Maximum characters reached.");
                      }
                    }}
                  />
                  <div className="item-card-edit-actions">
                    <button
                      className="btn-secondary"
                      onClick={handleCancelEdit}
                    >
                      ✕ Cancel
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => handleSaveLineItem(index)}
                    >
                      ✓ Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="item-card-main">
                    <span className="item-card-index">{index + 1}</span>
                    <span className="item-card-name">{element.name}</span>
                    <span className="item-card-qty">
                      Qty {element.quantity}
                    </span>
                    <span className="item-card-actions">
                      <button
                        className="icon-btn icon-btn-edit"
                        aria-label="Edit item"
                        onClick={() => handleEditLineItem(index)}
                      >
                        ✎
                      </button>
                      <button
                        className="icon-btn icon-btn-delete"
                        aria-label="Delete item"
                        onClick={() => handleDeleteLineItem(index)}
                      >
                        🗑
                      </button>
                    </span>
                  </div>
                  <p className="item-card-photo">
                    {element.imgUrl === "Not added" ? (
                      "Photo: Not added"
                    ) : (
                      <a
                        href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(element.imgUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Search photo: {element.imgUrl}
                      </a>
                    )}
                  </p>
                  <p className="item-card-comments">
                    Comment:{" "}
                    {element.comments === "Not added"
                      ? "Not added."
                      : element.comments}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        className="btn-secondary action-btn"
        onClick={() => setShowSaveMode(true)}
        disabled={items.length === 0}
      >
        Save current list
      </button>

      <button className="btn-secondary action-btn" onClick={onClose}>
        ← Back
      </button>

      {showSaveMode && (
        <div className="modal-overlay" onClick={() => setShowSaveMode(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="item-form">
              <input
                className="text-input"
                id="list"
                placeholder="Enter list name"
                maxLength={25}
                value={listName}
                onChange={(e) => setListName(e.target.value)}
              />

              <select
                className="text-input"
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
              >
                <option value="">Select a store</option>
                <option>Kaufland</option>
                <option>Metro</option>
                <option>Auchan</option>
                <option>Cora</option>
                <option>Profi</option>
                <option>Lidl</option>
                <option>Other</option>
              </select>

              <input
                className="text-input"
                type="date"
                disabled
                value={new Date().toISOString().split("T")[0]}
              />

              <div className="privacy-info">
                <select
                  className="text-input"
                  value={listPrivacy}
                  onChange={(e) => setListPrivacy(e.target.value)}
                >
                  <option>Private</option>
                  <option>Public</option>
                </select>
                <p>
                  <strong>Private</strong> — only you can see and edit this
                  list.
                </p>
                <p>
                  <strong>Public</strong> — all users from your group can see
                  and edit the list.
                </p>
              </div>

              <div className="item-card-edit-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowSaveMode(false)}
                >
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSaveList}>
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {successModal && (
        <div className="alert-overlay" onClick={() => setSuccessModal("")}>
          <div
            className="alert-box alert-success"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="alert-dismiss"
              onClick={() => setSuccessModal("")}
            >
              ✖
            </button>
            <p>{successModal}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateList;
