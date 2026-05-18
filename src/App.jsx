import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ManagerDashboard from "./components/ManagerDashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }
    async function fetchRole() {
      setRoleLoading(true);
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRole(snap.data().role || "employee");
        } else {
          // First login — create the user doc with default role
          await setDoc(ref, { email: user.email, uid: user.uid, role: "employee" });
          setRole("employee");
        }
      } finally {
        setRoleLoading(false);
      }
    }
    fetchRole();
  }, [user]);

  function handleSignOut() {
    setUser(null);
    setRole(null);
  }

  if (!user) return <Login onLogin={setUser} />;

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <p className="text-sm text-gray-400 font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (role === "manager") {
    return <ManagerDashboard user={user} onSignOut={handleSignOut} />;
  }

  return <Dashboard user={user} onSignOut={handleSignOut} />;
}
