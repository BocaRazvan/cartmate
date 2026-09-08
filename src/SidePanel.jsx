import { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
  updatePassword,
  deleteUser,
} from "firebase/auth";
import { doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase.js";

const AVATAR_SEEDS = [
  "Buddy",
  "Milo",
  "Luna",
  "Bella",
  "Charlie",
  "Coco",
  "Max",
  "Daisy",
  "Rocky",
  "Zoe",
  "Leo",
  "Nala",
];

function buildAvatarUrl(seed) {
  return `https://api.dicebear.com/10.x/toon-head/svg?seed=${encodeURIComponent(seed)}`;
}

function SidePanel({
  open,
  onClose,
  user,
  myLists,
  myGroup,
  myProfile,
  onLogout,
  onRefreshProfile,
}) {
  const [activeModal, setActiveModal] = useState(null);
  const [errorModal, setErrorModal] = useState("");
  const [successModal, setSuccessModal] = useState("");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [currentPasswordForPassword, setCurrentPasswordForPassword] =
    useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [deletePassword, setDeletePassword] = useState("");

  function closeModal() {
    setActiveModal(null);
    setCurrentPasswordForEmail("");
    setNewEmail("");
    setCurrentPasswordForPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setDeletePassword("");
  }

  async function handleChangeEmail() {
    if (currentPasswordForEmail.trim() === "" || newEmail.trim() === "") {
      setErrorModal("Please fill in your password and the new email.");
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPasswordForEmail,
      );
      await reauthenticateWithCredential(user, credential);
      await verifyBeforeUpdateEmail(user, newEmail.trim());
      closeModal();
      setSuccessModal(
        `A verification link was sent to ${newEmail.trim()}. Your email changes once you confirm it there.`,
      );
    } catch (error) {
      setErrorModal(error.message);
    }
  }

  async function handleChangePassword() {
    if (
      currentPasswordForPassword.trim() === "" ||
      newPassword.trim() === "" ||
      confirmNewPassword.trim() === ""
    ) {
      setErrorModal("Please fill in all three password fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorModal("New passwords do not match.");
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPasswordForPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      closeModal();
      setSuccessModal("Your password has been changed.");
    } catch (error) {
      setErrorModal(error.message);
    }
  }

  async function handleDeleteAccount() {
    if (deletePassword.trim() === "") {
      setErrorModal("Enter your password to confirm.");
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        deletePassword,
      );
      await reauthenticateWithCredential(user, credential);
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      onLogout();
    } catch (error) {
      setErrorModal(error.message);
    }
  }

  async function handleSelectAvatar(seed) {
    await setDoc(
      doc(db, "users", user.uid),
      { avatarUrl: buildAvatarUrl(seed) },
      { merge: true },
    );
    await onRefreshProfile(user.uid);
    closeModal();
    setSuccessModal("Avatar updated!");
  }

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.origin);
    setSuccessModal("Link copied to clipboard!");
  }

  function handleToggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }

  const totalListsCreated = myLists.length;
  const totalItemsAdded = myLists.reduce(
    (sum, list) => sum + list.items.length,
    0,
  );
  const groupMemberCount = myGroup?.members?.length || 0;
  const loginTimestamps = myProfile?.loginTimestamps || [];
  const now = new Date();
  const totalLogins = loginTimestamps.length;
  const loginsThisYear = loginTimestamps.filter(
    (ts) => ts.toDate().getFullYear() === now.getFullYear(),
  ).length;
  const loginsThisMonth = loginTimestamps.filter((ts) => {
    const d = ts.toDate();
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  }).length;
  const accountCreated = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown";

  return (
    <>
      {open && (
        <div className="side-panel">
          <button className="dismiss-btn" onClick={onClose}>
            ✖
          </button>
          <p className="side-panel-title">CartMate v1.0</p>

          <div className="identity">
            <button
              className="avatar-btn"
              onClick={() => setActiveModal("avatar")}
            >
              {myProfile?.avatarUrl ? (
                <img className="avatar-img" src={myProfile.avatarUrl} alt="" />
              ) : (
                "👤"
              )}
            </button>
            <p className="identity-email">{user?.email}</p>
          </div>

          <div className="actions">
            <button
              className="side-menu-btn"
              onClick={() => setActiveModal("email")}
            >
              Change email
            </button>
            <button
              className="side-menu-btn"
              onClick={() => setActiveModal("password")}
            >
              Change password
            </button>
            <button
              className="side-menu-btn side-menu-btn-danger"
              onClick={() => setActiveModal("delete")}
            >
              Delete Account
            </button>
          </div>

          <div className="app-stuff">
            <button
              className="side-menu-btn"
              onClick={() => setActiveModal("stats")}
            >
              User stats
            </button>
            <button className="side-menu-btn" onClick={handleShare}>
              Share
            </button>
            <button
              className="side-menu-btn"
              onClick={() => setActiveModal("contact")}
            >
              Contact and feedback
            </button>
          </div>

          <div className="utility">
            <button className="side-menu-btn" onClick={handleToggleDarkMode}>
              {darkMode ? "Switch to light mode" : "Switch to dark mode"}
            </button>
            <button className="side-menu-btn" onClick={() => onLogout()}>
              Sign out
            </button>
          </div>
        </div>
      )}

      {activeModal === "email" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="dismiss-btn" onClick={closeModal}>
              ✖
            </button>
            <div className="item-form">
              <p className="section-subtitle">
                Enter your current password and the new email address.
              </p>
              <input
                className="text-input"
                type="password"
                placeholder="Current password"
                value={currentPasswordForEmail}
                onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
              />
              <input
                className="text-input"
                type="email"
                placeholder="New email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <button className="btn-primary" onClick={handleChangeEmail}>
                Change email
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "password" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="dismiss-btn" onClick={closeModal}>
              ✖
            </button>
            <div className="item-form">
              <p className="section-subtitle">
                Enter your current password and a new one.
              </p>
              <input
                className="text-input"
                type="password"
                placeholder="Current password"
                value={currentPasswordForPassword}
                onChange={(e) => setCurrentPasswordForPassword(e.target.value)}
              />
              <input
                className="text-input"
                type="password"
                placeholder="New password"
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                className="text-input"
                type="password"
                placeholder="Confirm new password"
                minLength={6}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
              <button className="btn-primary" onClick={handleChangePassword}>
                Change password
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "delete" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="dismiss-btn" onClick={closeModal}>
              ✖
            </button>
            <div className="item-form">
              <p className="section-subtitle">
                Deleting your account cannot be undone. Enter your password to
                confirm.
              </p>
              <input
                className="text-input"
                type="password"
                placeholder="Password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
              <div className="item-card-edit-actions">
                <button className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn-danger" onClick={handleDeleteAccount}>
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === "stats" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content list-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="dismiss-btn" onClick={closeModal}>
              ✖
            </button>
            <h2 className="list-modal-title">Your stats</h2>

            <div className="stats-row">
              <span className="stats-label">Account created</span>
              <span className="stats-value">{accountCreated}</span>
            </div>
            <div className="stats-row">
              <span className="stats-label">Logins this month</span>
              <span className="stats-value">{loginsThisMonth}</span>
            </div>
            <div className="stats-row">
              <span className="stats-label">Logins this year</span>
              <span className="stats-value">{loginsThisYear}</span>
            </div>
            <div className="stats-row">
              <span className="stats-label">Total logins</span>
              <span className="stats-value">{totalLogins}</span>
            </div>
            <div className="stats-row">
              <span className="stats-label">Lists created</span>
              <span className="stats-value">{totalListsCreated}</span>
            </div>
            <div className="stats-row">
              <span className="stats-label">Total items added</span>
              <span className="stats-value">{totalItemsAdded}</span>
            </div>
            <div className="stats-row">
              <span className="stats-label">Group members</span>
              <span className="stats-value">{groupMemberCount}</span>
            </div>
          </div>
        </div>
      )}

      {activeModal === "avatar" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content list-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="dismiss-btn" onClick={closeModal}>
              ✖
            </button>
            <h2 className="list-modal-title">Choose your avatar</h2>
            <div className="avatar-grid">
              {AVATAR_SEEDS.map((seed) => (
                <button
                  key={seed}
                  className="avatar-option"
                  onClick={() => handleSelectAvatar(seed)}
                >
                  <img src={buildAvatarUrl(seed)} alt={seed} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeModal === "contact" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="dismiss-btn" onClick={closeModal}>
              ✖
            </button>
            <p className="section-subtitle">
              Contact and feedback is under construction. Please use the message
              board for now.
            </p>
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
    </>
  );
}

export default SidePanel;
