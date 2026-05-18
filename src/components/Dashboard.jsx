import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase.js";

const CATEGORIES = ["Performance", "Learning", "Leadership", "Collaboration", "Innovation", "Other"];
const EMPTY_FORM = { title: "", description: "", category: "Performance", weightage: "", dueDate: "" };

function GoalModal({ goal, goals, onSave, onClose, saving }) {
  const [form, setForm] = useState(goal || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const otherTotal = goals
    .filter((g) => g.id !== goal?.id)
    .reduce((sum, g) => sum + Number(g.weightage), 0);

  const remaining = 100 - otherTotal;

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Goal title is required.";
    if (!form.weightage || isNaN(form.weightage)) e.weightage = "Enter a valid number.";
    else if (Number(form.weightage) <= 0) e.weightage = "Weightage must be greater than 0.";
    else if (Number(form.weightage) > remaining) e.weightage = `Max allowed is ${remaining}% (total must not exceed 100%).`;
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSave({ ...form, weightage: Number(form.weightage) });
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{goal ? "Edit Goal" : "Add New Goal"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition rounded-lg p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Remaining budget pill */}
        <div className="px-6 pt-4">
          <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${
            remaining <= 0 ? "bg-red-50 text-red-600" : remaining < 20 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${remaining <= 0 ? "bg-red-500" : remaining < 20 ? "bg-amber-500" : "bg-emerald-500"}`}/>
            {remaining <= 0 ? "No weightage remaining" : `${remaining}% available to allocate`}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title <span className="text-red-400">*</span></label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Improve customer satisfaction score"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${errors.title ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"}`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Briefly describe what success looks like…"
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Category + Weightage row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weightage (%) <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={remaining}
                  value={form.weightage}
                  onChange={(e) => set("weightage", e.target.value)}
                  placeholder="e.g. 25"
                  className={`w-full pl-3.5 pr-8 py-2.5 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${errors.weightage ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">%</span>
              </div>
              {errors.weightage && <p className="text-xs text-red-500 mt-1">{errors.weightage}</p>}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 pb-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold text-white transition shadow-md shadow-indigo-100">
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Saving…
                </>
              ) : goal ? "Save Changes" : "Add Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const CATEGORY_COLORS = {
  Performance: "bg-indigo-50 text-indigo-700",
  Learning: "bg-blue-50 text-blue-700",
  Leadership: "bg-purple-50 text-purple-700",
  Collaboration: "bg-teal-50 text-teal-700",
  Innovation: "bg-pink-50 text-pink-700",
  Other: "bg-gray-100 text-gray-600",
};

export default function Dashboard({ user, onSignOut }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);
  const [docSubmitted, setDocSubmitted] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [managerComment, setManagerComment] = useState("");

  const userDocRef = doc(db, "user_goals", user.uid);

  // Load this user's goals in real-time on login
  useEffect(() => {
    const unsub = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setGoals(data.goals || []);
        setDocSubmitted(data.submitted || false);
        setApprovalStatus(data.approvalStatus || null);
        setManagerComment(data.managerComment || "");
      } else {
        setGoals([]);
        setDocSubmitted(false);
        setApprovalStatus(null);
        setManagerComment("");
      }
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  // Write the full goals array to user_goals/{uid} with the user's email
  async function syncGoals(updatedGoals, extra = {}) {
    await setDoc(
      userDocRef,
      { email: user.email, uid: user.uid, goals: updatedGoals, updatedAt: serverTimestamp(), ...extra },
      { merge: true }
    );
  }

  const totalWeight = goals.reduce((s, g) => s + Number(g.weightage), 0);
  const remaining = 100 - totalWeight;
  const isComplete = totalWeight === 100;

  async function handleSave(form) {
    setSaving(true);
    try {
      let updatedGoals;
      if (editGoal) {
        updatedGoals = goals.map((g) => g.id === editGoal.id ? { ...g, ...form } : g);
      } else {
        const newGoal = { ...form, id: `goal_${Date.now()}`, status: "In Progress", createdAt: new Date().toISOString() };
        updatedGoals = [...goals, newGoal];
      }
      // Clear submitted flag if editing after submission
      await syncGoals(updatedGoals, docSubmitted ? { submitted: false } : {});
      setModalOpen(false);
      setEditGoal(null);
      showToast(editGoal ? "Goal updated and saved to Firebase!" : "Goal added and saved to Firebase!");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(goal) {
    setEditGoal(goal);
    setModalOpen(true);
  }

  async function handleDelete(id) {
    const updatedGoals = goals.filter((g) => g.id !== id);
    await syncGoals(updatedGoals);
    setDeleteId(null);
  }

  async function handleToggleStatus(id) {
    const updatedGoals = goals.map((g) =>
      g.id === id ? { ...g, status: g.status === "Completed" ? "In Progress" : "Completed" } : g
    );
    await syncGoals(updatedGoals);
  }

  async function handleSubmitGoals() {
    setSaving(true);
    try {
      await syncGoals(goals, { submitted: true, submittedAt: serverTimestamp() });
      showToast("Goals submitted and saved to Firebase!");
    } finally {
      setSaving(false);
    }
  }

  const completedCount = goals.filter((g) => g.status === "Completed").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-base">GoalTracker</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-sm text-gray-600 max-w-[180px] truncate">{user?.email}</span>
            </div>
            <button onClick={onSignOut}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-1.5 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Approval status banner */}
      {approvalStatus && (
        <div className={`border-b ${
          approvalStatus === "Approved"
            ? "bg-emerald-50 border-emerald-200"
            : "bg-red-50 border-red-200"
        }`}>
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-start gap-3">
            <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
              approvalStatus === "Approved" ? "bg-emerald-500" : "bg-red-500"
            }`}>
              {approvalStatus === "Approved" ? (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
              ) : (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${approvalStatus === "Approved" ? "text-emerald-800" : "text-red-700"}`}>
                Your goals have been <strong>{approvalStatus}</strong> by your manager.
              </p>
              {managerComment && (
                <p className={`text-xs mt-0.5 ${approvalStatus === "Approved" ? "text-emerald-700" : "text-red-600"}`}>
                  Manager comment: "{managerComment}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Page title + Add button */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Goals</h1>
            <p className="text-sm text-gray-500 mt-0.5">Define and track your goals. Total weightage must equal 100%.</p>
          </div>
          <button
            onClick={() => { setEditGoal(null); setModalOpen(true); }}
            disabled={remaining === 0}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-md shadow-indigo-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            Add Goal
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Goals", value: goals.length, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "text-indigo-600 bg-indigo-50" },
            { label: "Completed", value: completedCount, icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-emerald-600 bg-emerald-50" },
            { label: "Weightage Used", value: `${totalWeight}%`, icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z", color: "text-blue-600 bg-blue-50" },
            { label: "Remaining", value: `${remaining}%`, icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", color: remaining === 0 ? "text-emerald-600 bg-emerald-50" : remaining < 0 ? "text-red-600 bg-red-50" : "text-amber-600 bg-amber-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon}/>
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Weightage progress bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Weightage Allocation</span>
              {isComplete && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>
                  Complete
                </span>
              )}
            </div>
            <span className={`text-sm font-bold tabular-nums ${isComplete ? "text-emerald-600" : totalWeight > 100 ? "text-red-600" : "text-gray-900"}`}>
              {totalWeight} / 100%
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalWeight > 100 ? "bg-red-500" : isComplete ? "bg-emerald-500" : "bg-indigo-500"
              }`}
              style={{ width: `${Math.min(totalWeight, 100)}%` }}
            />
          </div>
          {!isComplete && goals.length > 0 && (
            <p className={`text-xs mt-2 ${remaining < 0 ? "text-red-500 font-semibold" : "text-gray-400"}`}>
              {remaining > 0 ? `Allocate ${remaining}% more to reach 100%` : `Over-allocated by ${Math.abs(remaining)}% — adjust your goals`}
            </p>
          )}
          {!isComplete && goals.length === 0 && (
            <p className="text-xs mt-2 text-gray-400">Add goals below to start allocating weightage.</p>
          )}
        </div>

        {/* Goals list */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex flex-col items-center text-center">
            <svg className="w-8 h-8 text-indigo-400 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            <p className="text-sm text-gray-400">Loading your goals…</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-700 mb-1">No goals yet</p>
            <p className="text-sm text-gray-400 mb-5">Click "Add Goal" to define your first goal and assign weightage.</p>
            <button
              onClick={() => { setEditGoal(null); setModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-100"
            >
              Add your first goal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal, idx) => (
              <div key={goal.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 items-start group hover:border-indigo-100 hover:shadow-md transition-all">
                {/* Index circle */}
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className={`font-semibold text-gray-900 text-base leading-snug ${goal.status === "Completed" ? "line-through text-gray-400" : ""}`}>
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{goal.description}</p>
                      )}
                    </div>
                    {/* Weightage badge */}
                    <span className="shrink-0 text-lg font-black text-indigo-600 tabular-nums">{goal.weightage}%</span>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.Other}`}>
                      {goal.category}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${goal.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {goal.status}
                    </span>
                    {docSubmitted && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                        </svg>
                        Submitted
                      </span>
                    )}
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

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleToggleStatus(goal.id)} title={goal.status === "Completed" ? "Mark in progress" : "Mark complete"}
                    className={`p-2 rounded-lg transition ${goal.status === "Completed" ? "text-emerald-500 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-50 hover:text-emerald-500"}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                    </svg>
                  </button>
                  <button onClick={() => handleEdit(goal)} className="p-2 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
                    </svg>
                  </button>
                  <button onClick={() => setDeleteId(goal.id)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Re-submit nudge — shown after editing a previously submitted set */}
        {docSubmitted === false && goals.length > 0 && isComplete && (
          <div className="mt-4 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
            </svg>
            <p className="text-xs font-medium text-orange-700">
              You've edited goals since your last submission — hit <strong>Submit Goals</strong> again to save the latest version.
            </p>
          </div>
        )}

        {/* Submit / Save CTA */}
        {goals.length > 0 && (
          <div className={`mt-4 rounded-2xl border p-5 flex items-center justify-between gap-4 flex-wrap transition-all ${
            isComplete ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isComplete ? "bg-emerald-100" : "bg-amber-100"}`}>
                {isComplete ? (
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z"/>
                  </svg>
                )}
              </div>
              <div>
                <p className={`text-sm font-semibold ${isComplete ? "text-emerald-800" : "text-amber-800"}`}>
                  {isComplete ? "All weightage allocated — ready to submit!" : `${remaining}% still unallocated`}
                </p>
                <p className={`text-xs mt-0.5 ${isComplete ? "text-emerald-600" : "text-amber-600"}`}>
                  {isComplete ? "Your goals add up to exactly 100%." : "Goals must total exactly 100% before submitting."}
                </p>
              </div>
            </div>
            <button
              disabled={!isComplete || saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-md shadow-emerald-100"
              onClick={handleSubmitGoals}
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Saving…
                </>
              ) : "Submit Goals"}
            </button>
          </div>
        )}
      </main>

      {/* Generic success toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl transition-all ${
          toast.type === "success" ? "bg-gray-900" : "bg-red-600"
        }`}>
          {toast.type === "success" ? (
            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
            </svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Goal Modal */}
      {modalOpen && (
        <GoalModal
          goal={editGoal}
          goals={goals}
          onSave={handleSave}
          saving={saving}
          onClose={() => { setModalOpen(false); setEditGoal(null); }}
        />
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete this goal?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-semibold text-white transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
