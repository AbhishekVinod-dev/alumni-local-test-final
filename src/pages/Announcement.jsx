// src/pages/Announcements.jsx
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Announcements() {
  const { user, role, loading } = useAuth();
  const [messages, setMessages] = useState([]);

  // Admin form state
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [posting, setPosting] = useState(false);

  // Fetch announcements
  const fetchMessages = async () => {
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Post announcement (admin only)
  const handlePost = async (e) => {
    e.preventDefault();
    if (!subject || !body) return;

    setPosting(true);
    try {
      await addDoc(collection(db, "notifications"), {
        subject,
        body,
        targetRole,
        createdAt: serverTimestamp(),
      });
      // Reset form
      setSubject("");
      setBody("");
      setTargetRole("all");
      fetchMessages(); // Refresh list
    } catch (err) {
      console.error("Error posting announcement:", err);
    }
    setPosting(false);
  };

  if (loading)
    return <p className="text-center mt-10">Loading...</p>;

  if (!user)
    return (
      <p className="text-center mt-10 text-gray-400">
        Login to view announcements.
      </p>
    );

  return (
    <section className="grid gap-6">
      <h2 className="text-2xl font-bold">Announcements</h2>

      {/* Admin Post Form */}
      {role === "admin" && (
        <form
          onSubmit={handlePost}
          className="grid gap-2 p-4 border rounded bg-gray-50"
        >
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <textarea
            placeholder="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All</option>
            <option value="admin">Admin</option>
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
          </select>
          <button
            type="submit"
            disabled={posting}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {posting ? "Posting..." : "Post Announcement"}
          </button>
        </form>
      )}

      {messages.length === 0 && (
        <p className="text-gray-400">No announcements yet.</p>
      )}

      {/* Announcement List */}
      <div className="grid gap-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className="card p-4 border rounded bg-white shadow-sm"
          >
            <h3 className="font-bold">{m.subject}</h3>
            <p>{m.body}</p>
            <p className="text-xs text-gray-400">
              Target Role: {m.targetRole} •{" "}
              {m.createdAt?.toDate
                ? m.createdAt.toDate().toLocaleString()
                : "Loading..."}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
