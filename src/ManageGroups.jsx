import { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase.js";

function ManageGroups({ setter, user, myGroup, onRefreshGroup }) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");

  const members = myGroup?.members || [];

  async function handleSearch() {
    const trimmed = searchEmail.trim();
    setSearchResult(null);

    if (trimmed === "") {
      setSearchError("Enter an email address.");
      return;
    }
    if (trimmed === user.email) {
      setSearchError("You can't add yourself.");
      return;
    }
    if (members.some((member) => member.email === trimmed)) {
      setSearchError("This user is already in your group.");
      return;
    }

    const q = query(collection(db, "users"), where("email", "==", trimmed));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      setSearchError("No CartMate user found with that email.");
      return;
    }

    const foundDoc = snapshot.docs[0];
    setSearchError("");
    setSearchResult({
      uid: foundDoc.id,
      email: foundDoc.data().email,
      avatarUrl: foundDoc.data().avatarUrl || null,
    });
  }

  async function handleAddMember() {
    const updatedMembers = [...members, searchResult];
    await setDoc(doc(db, "groups", user.uid), {
      ownerId: user.uid,
      members: updatedMembers,
      memberUids: updatedMembers.map((member) => member.uid),
    });
    onRefreshGroup(user.uid);
    setShowAddMember(false);
    setSearchEmail("");
    setSearchResult(null);
    setSearchError("");
  }

  async function handleRemoveMember(uidToRemove) {
    const updatedMembers = members.filter(
      (member) => member.uid !== uidToRemove,
    );
    await setDoc(doc(db, "groups", user.uid), {
      ownerId: user.uid,
      members: updatedMembers,
      memberUids: updatedMembers.map((member) => member.uid),
    });
    onRefreshGroup(user.uid);
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
      </div>

      <p className="section-subtitle">
        Add members to your group so they can see and edit your{" "}
        <strong>public</strong> lists.
      </p>

      <button
        className="btn-primary action-btn"
        onClick={() => setShowAddMember(true)}
      >
        Add member
      </button>

      <p className="section-subtitle">Current members in your group:</p>

      {members.length === 0 && <p className="no-items">No members yet.</p>}

      <div className="items-list">
        {members.map((member) => (
          <div className="member-card" key={member.uid}>
            <div className="member-info">
              {member.avatarUrl ? (
                <img
                  className="avatar-img-small"
                  src={member.avatarUrl}
                  alt=""
                />
              ) : (
                <span className="avatar-img-small avatar-placeholder">
                  👤
                </span>
              )}
              <span className="list-card-name">{member.email}</span>
            </div>
            <button
              className="icon-btn icon-btn-delete"
              aria-label="Remove member"
              onClick={() => handleRemoveMember(member.uid)}
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="dismiss-btn"
              onClick={() => setShowAddMember(false)}
            >
              ✖
            </button>

            <div className="item-form">
              <input
                className="text-input"
                type="email"
                placeholder="Enter email address"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <button className="btn-secondary" onClick={handleSearch}>
                Search
              </button>

              {searchError && <p className="search-error">{searchError}</p>}

              {searchResult && (
                <div className="member-preview">
                  <div className="member-info">
                    {searchResult.avatarUrl ? (
                      <img
                        className="avatar-img-small"
                        src={searchResult.avatarUrl}
                        alt=""
                      />
                    ) : (
                      <span className="avatar-img-small avatar-placeholder">
                        👤
                      </span>
                    )}
                    <span>{searchResult.email}</span>
                  </div>
                  <button className="btn-primary" onClick={handleAddMember}>
                    Add to group
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageGroups;
