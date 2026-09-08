import { useState } from "react";
import CreateList from "./CreateList";
import logo from "./assets/logo.jpg";
import ViewLists from "./View";
import ManageGroups from "./ManageGroups";
import MessageBoard from "./MessageBoard";
import SidePanel from "./SidePanel";

function Home({
  user,
  onLogout,
  myLists,
  onRefreshLists,
  myGroup,
  onRefreshGroup,
  sharedLists,
  onRefreshSharedLists,
  messages,
  onRefreshMessages,
  myProfile,
  onRefreshProfile,
}) {
  const [view, setView] = useState(null);
  const [openSide, setOpenSide] = useState(false);

  function handleOpenSide() {
    setOpenSide((prev) => !prev);
  }

  async function handleOpenView() {
    await onRefreshLists(user.uid);
    await onRefreshSharedLists(user.uid);
    setView("view");
  }

  async function handleOpenManage() {
    await onRefreshGroup(user.uid);
    setView("manage");
  }

  async function handleOpenMessage() {
    await onRefreshMessages();
    setView("message");
  }

  return (
    <div className="home-page">
      <div className="top-menu">
        <div className="top-menu-inner">
          <img className="logo-img" src={logo} alt="" />
          <span className="top-menu-brand">CartMate</span>
          <p className="hamburger-menu" onClick={handleOpenSide}>
            ☰
          </p>
        </div>
      </div>

      <SidePanel
        open={openSide}
        onClose={handleOpenSide}
        user={user}
        myLists={myLists}
        myGroup={myGroup}
        myProfile={myProfile}
        onLogout={onLogout}
        onRefreshProfile={onRefreshProfile}
      />
      <div className="main-content">
        {view === null && (
          <div className="home-buttons">
            <button
              onClick={() => setView("create")}
              className="btn-primary action-btn"
            >
              Create a new list
            </button>
            <button onClick={handleOpenView} className="btn-primary action-btn">
              View lists
            </button>
          </div>
        )}

        {view === "create" && (
          <CreateList
            user={user}
            onClose={() => setView(null)}
            onRefreshLists={onRefreshLists}
          />
        )}

        {view === "view" && (
          <ViewLists
            setter={setView}
            myLists={myLists}
            onRefreshLists={onRefreshLists}
            sharedLists={sharedLists}
            onRefreshSharedLists={onRefreshSharedLists}
            user={user}
          />
        )}

        {view === "manage" && (
          <ManageGroups
            setter={setView}
            user={user}
            myGroup={myGroup}
            onRefreshGroup={onRefreshGroup}
          />
        )}

        {view === "message" && (
          <MessageBoard
            setter={setView}
            user={user}
            messages={messages}
            onRefreshMessages={onRefreshMessages}
          />
        )}
      </div>

      {view === null && (
        <div className="minor-content">
          <button
            onClick={handleOpenManage}
            className="btn-secondary minor-btn"
          >
            Manage group
          </button>
          <button
            onClick={handleOpenMessage}
            className="btn-secondary minor-btn"
          >
            Message board
          </button>
        </div>
      )}

      <footer className="app-footer">
        <p className="footer-brand">CartMate</p>
        <p className="footer-tagline">The mate that never forgets the milk.</p>
      </footer>
    </div>
  );
}

export default Home;
