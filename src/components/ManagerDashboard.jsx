import { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

const STATUS_STYLES = {
  Approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Rejected: "bg-red-50 text-red-600 ring-1 ring-red-200",
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
};

const CATEGORY_COLORS = {
  Performance: "bg-indigo-50 text-indigo-700",
  Learning: "bg-purple-50 text-purple-700",
  Leadership: "bg-blue-50 text-blue-700",
  Collaboration: "bg-teal-50 text-teal-700",
  Other: "bg-gray-100 text-gray-600",
};

export default function ManagerDashboard({ user, onSignOut }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Real-time listener on all user_goals docs
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "user_goals"), (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const submitted = all.filter((d) => d.submitted === true);
      setSubmissions(submitted);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Sync comment textarea when selected employee changes
  useEffect(() => {
    if (selected) {
      const fresh = submissions.find((s) => s.id === selected.id);
      if (fresh) {
        setSelected(fresh);
        setComment(fresh.managerComment || "");
      }
    }
  }, [submissions]);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleReview(status) {
    if (!selected) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "user_goals", selected.id), {
        approvalStatus: status,
        managerComment: comment.trim(),
        reviewedBy: user.email,
        reviewedAt: serverTimestamp(),
      });
      showToast(
        status === "Approved"
          ? "Goals approved and feedback saved!"
          : "Goals rejected and feedback saved!"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    onSignOut();
  }

  const approvedCount = submissions.filter((s) => s.approvalStatus === "Approved").length;
  const rejectedCount = submissions.filter((s) => s.approvalStatus === "Rejected").length;
  const pendingCount = submissions.filter(
    (s) => !s.approvalStatus || s.approvalStatus === "Pending"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6.75v6.75"/>
              </svg>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">Goal Tracking Portal</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">Manager View</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-red-500 font-medium transition flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span className="text-sm text-gray-600"><strong className="text-gray-900">{submissions.length}</strong> submitted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-sm text-gray-600"><strong className="text-gray-900">{pendingCount}</strong> pending review</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-sm text-gray-600"><strong className="text-gray-900">{approvedCount}</strong> approved</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span className="text-sm text-gray-600"><strong className="text-gray-900">{rejectedCount}</strong> rejected</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex gap-6">

        {/* Employee list sidebar */}
        <aside className="w-72 shrink-0 flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1 mb-1">
            Submitted Employees
          </h2>

          {loading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-gray-100" />
              ))}
            </div>
          )}

          {!loading && submissions.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
              <p className="text-sm text-gray-400">No submissions yet.</p>
              <p className="text-xs text-gray-400 mt-1">Employees appear here once they submit their goals.</p>
            </div>
          )}

          {!loading && submissions.map((sub) => {
            const status = sub.approvalStatus || "Pending";
            const isActive = selected?.id === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => { setSelected(sub); setComment(sub.managerComment || ""); }}
                className={`w-full text-left bg-white rounded-xl border px-4 py-3 transition hover:shadow-sm ${
                  isActive ? "border-indigo-300 shadow-sm ring-1 ring-indigo-200" : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 uppercase">
                      {(sub.email || "?")[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{sub.email}</p>
                      <p className="text-xs text-gray-400">{sub.goals?.length || 0} goals</p>
                    </div>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[status]}`}>
                    {status}
                  </span>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Right panel */}
        <main className="flex-1 min-w-0">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-24">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Select an employee</p>
              <p className="text-sm text-gray-400 mt-1">Click a name on the left to review their goals.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Employee header */}
              <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center uppercase">
                    {(selected.email || "?")[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selected.email}</p>
                    <p className="text-xs text-gray-400">
                      Submitted{" "}
                      {selected.submittedAt?.toDate
                        ? selected.submittedAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[selected.approvalStatus || "Pending"]}`}>
                  {selected.approvalStatus || "Pending"}
                </span>
              </div>

              {/* Goals list */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Goals</h3>
                {(selected.goals || []).map((goal) => (
                  <div key={goal.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{goal.title}</p>
                        {goal.description && (
                          <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.Other}`}>
                            {goal.category}
                          </span>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            goal.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {goal.status}
                          </span>
                          {goal.dueDate && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5"/>
                              </svg>
                              {new Date(goal.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-xl font-black text-indigo-600 tabular-nums">{goal.weightage}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Manager comment + actions */}
              <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-800">Manager Review</h3>

                {selected.reviewedBy && (
                  <p className="text-xs text-gray-400">
                    Last reviewed by <strong>{selected.reviewedBy}</strong>
                    {selected.reviewedAt?.toDate
                      ? ` on ${selected.reviewedAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                      : ""}
                  </p>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Comment <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Add feedback for the employee…"
                    className="w-full text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    disabled={saving}
                    onClick={() => handleReview("Approved")}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm shadow-emerald-100"
                  >
                    {saving ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                    )}
                    Approve
                  </button>

                  <button
                    disabled={saving}
                    onClick={() => handleReview("Rejected")}
                    className="flex items-center gap-2 bg-white hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed text-red-600 border border-red-200 text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl ${
          toast.type === "success" ? "bg-gray-900" : "bg-red-600"
        }`}>
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
          </svg>
          {toast.message}
        </div>
      )}
    </div>
  );
}
