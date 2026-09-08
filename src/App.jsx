import { useState } from "react";
import Login from "./Login.jsx";
import Home from "./Home.jsx";
import { signOut } from "firebase/auth";
import { auth } from "./firebase.js";
import "./App.css";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase.js";

function App() {
  const [user, setUser] = useState(null);
  const [myLists, setMyLists] = useState([]);
  const [myGroup, setMyGroup] = useState({ members: [], memberUids: [] });
  const [sharedLists, setSharedLists] = useState([]);
  const [messages, setMessages] = useState([]);
  const [myProfile, setMyProfile] = useState({ loginTimestamps: [] });

  async function handleLogOut() {
    try {
      await signOut(auth);
      setUser(null);
    } catch {
      // Sign-out failing client-side is rare and not actionable here.
    }
  }

  async function fetchMyLists(uid) {
    const q = query(collection(db, "lists"), where("ownerId", "==", uid));
    const snapshot = await getDocs(q);
    const fetchedLists = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    fetchedLists.sort(
      (a, b) => b.createdAt.toDate() - a.createdAt.toDate(),
    );
    setMyLists(fetchedLists);
  }

  async function fetchMyGroup(uid) {
    const groupSnap = await getDoc(doc(db, "groups", uid));
    if (!groupSnap.exists()) {
      setMyGroup({ members: [], memberUids: [] });
      return;
    }
    const groupData = groupSnap.data();
    const membersWithAvatars = await Promise.all(
      groupData.members.map(async (member) => {
        const memberProfileSnap = await getDoc(doc(db, "users", member.uid));
        return {
          ...member,
          avatarUrl: memberProfileSnap.exists()
            ? memberProfileSnap.data().avatarUrl
            : null,
        };
      }),
    );
    setMyGroup({ id: groupSnap.id, ...groupData, members: membersWithAvatars });
  }

  async function fetchSharedLists(uid) {
    const groupsQuery = query(
      collection(db, "groups"),
      where("memberUids", "array-contains", uid),
    );
    const groupsSnapshot = await getDocs(groupsQuery);
    const ownerIds = groupsSnapshot.docs.map((groupDoc) => groupDoc.id);

    if (ownerIds.length === 0) {
      setSharedLists([]);
      return;
    }

    const listsQuery = query(
      collection(db, "lists"),
      where("ownerId", "in", ownerIds),
      where("privacy", "==", "Public"),
    );
    const listsSnapshot = await getDocs(listsQuery);
    const fetchedLists = listsSnapshot.docs.map((listDoc) => ({
      id: listDoc.id,
      ...listDoc.data(),
    }));
    fetchedLists.sort(
      (a, b) => b.createdAt.toDate() - a.createdAt.toDate(),
    );
    setSharedLists(fetchedLists);
  }

  async function fetchMessages() {
    const snapshot = await getDocs(collection(db, "messages"));
    const fetchedMessages = snapshot.docs.map((messageDoc) => ({
      id: messageDoc.id,
      ...messageDoc.data(),
    }));

    const uniqueAuthorUids = [
      ...new Set(fetchedMessages.map((message) => message.authorUid)),
    ];
    const avatarEntries = await Promise.all(
      uniqueAuthorUids.map(async (uid) => {
        const profileSnap = await getDoc(doc(db, "users", uid));
        return [
          uid,
          profileSnap.exists() ? profileSnap.data().avatarUrl : null,
        ];
      }),
    );
    const avatarByUid = Object.fromEntries(avatarEntries);

    const messagesWithAvatars = fetchedMessages.map((message) => ({
      ...message,
      avatarUrl: avatarByUid[message.authorUid] || null,
    }));
    messagesWithAvatars.sort(
      (a, b) => b.createdAt.toDate() - a.createdAt.toDate(),
    );
    setMessages(messagesWithAvatars);
  }

  async function fetchMyProfile(uid) {
    const profileSnap = await getDoc(doc(db, "users", uid));
    setMyProfile({ id: profileSnap.id, ...profileSnap.data() });
  }

  async function handleLoginSuccess(loggedInUser) {
    setUser(loggedInUser);
    const profileRef = doc(db, "users", loggedInUser.uid);
    await setDoc(
      profileRef,
      {
        email: loggedInUser.email,
        loginTimestamps: arrayUnion(new Date()),
      },
      { merge: true },
    );
    await fetchMyProfile(loggedInUser.uid);
    await fetchMyLists(loggedInUser.uid);
    await fetchMyGroup(loggedInUser.uid);
    await fetchSharedLists(loggedInUser.uid);
    await fetchMessages();
  }

  return (
    <div className="app">
      {user ? null : <Login onLogin={handleLoginSuccess} />}

      {user ? (
        <Home
          user={user}
          onLogout={handleLogOut}
          myLists={myLists}
          onRefreshLists={fetchMyLists}
          myGroup={myGroup}
          onRefreshGroup={fetchMyGroup}
          sharedLists={sharedLists}
          onRefreshSharedLists={fetchSharedLists}
          messages={messages}
          onRefreshMessages={fetchMessages}
          myProfile={myProfile}
          onRefreshProfile={fetchMyProfile}
        />
      ) : null}
    </div>
  );
}

export default App;
