// src/pages/Events.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Events() {
  const { role, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, selectedType, events]);

  async function fetchEvents() {
    setLoading(true);
    try {
      const q = query(collection(db, "events"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Sort by date ascending
      list.sort((a, b) => new Date(a.date) - new Date(b.date));

      setEvents(list);
      setFiltered(list);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let data = [...events];

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (e) =>
          (e.title || "").toLowerCase().includes(s) ||
          (e.organizer || "").toLowerCase().includes(s) ||
          (e.type || "").toLowerCase().includes(s)
      );
    }

    if (selectedType) {
      data = data.filter((e) => e.type === selectedType);
    }

    setFiltered(data);
  }

  function handleFormChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSaveEvent(e) {
    e.preventDefault();
    setError("");

    if (!user || role !== "admin") {
      setError("Only admins can manage events.");
      return;
    }

    if (!form.title || !form.date) {
      setError("Title and Date are required.");
      return;
    }

    try {
      if (editingId) {
        // update
        await updateDoc(doc(db, "events", editingId), form);
      } else {
        // create
        const id = Date.now().toString();
        const docData = {
          title: form.title,
          description: form.description || "",
          date: form.date,
          type: form.type || "General",
          organizer: form.organizer || "",
          createdAt: new Date().toISOString(),
          createdBy: user.uid,
        };
        await setDoc(doc(db, "events", id), docData);
      }

      await fetchEvents();
      setShowModal(false);
      setForm({});
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save event.");
    }
  }

  async function handleDeleteEvent(id) {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteDoc(doc(db, "events", id));
      await fetchEvents();
    } catch (err) {
      console.error(err);
      alert("Failed to delete event.");
    }
  }

  function openEdit(event) {
    setForm(event);
    setEditingId(event.id);
    setShowModal(true);
  }

  const eventTypes = [...new Set(events.map((e) => e.type).filter(Boolean))];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Events</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-64 text-black"
        />

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border p-2 rounded text-black"
        >
          <option value="">All Types</option>
          {eventTypes.map((t, i) => (
            <option key={i} value={t}>
              {t}
            </option>
          ))}
        </select>

        {role === "admin" && (
          <button
            className="ml-auto bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => {
              setForm({});
              setEditingId(null);
              setShowModal(true);
            }}
          >
            + Add Event
          </button>
        )}
      </div>

      {/* Events List */}
      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <div key={e.id} className="border rounded p-4 bg-white shadow">
              <h2 className="text-lg font-bold">{e.title}</h2>
              <p className="text-sm text-gray-500">
                {new Date(e.date).toLocaleDateString()} • {e.type}
              </p>
              {e.organizer && (
                <p className="text-sm text-gray-600 mt-1">
                  Organizer: {e.organizer}
                </p>
              )}
              {e.description && (
                <p className="text-gray-700 mt-2 line-clamp-3">
                  {e.description}
                </p>
              )}

              {role === "admin" && (
                <div className="mt-3 flex gap-2">
                  <button
                    className="bg-yellow-600 text-white px-3 py-1 rounded"
                    onClick={() => openEdit(e)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleDeleteEvent(e.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal (Add/Edit) */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded w-96 text-black">
            <h2 className="text-lg font-bold mb-3">
              {editingId ? "Edit Event" : "Add Event"}
            </h2>

            <input
              name="title"
              placeholder="Title"
              value={form.title || ""}
              onChange={handleFormChange}
              className="w-full mb-2 p-2 border"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description || ""}
              onChange={handleFormChange}
              className="w-full mb-2 p-2 border"
            />
            <input
              name="date"
              type="date"
              value={form.date || ""}
              onChange={handleFormChange}
              className="w-full mb-2 p-2 border"
            />
            <input
              name="type"
              placeholder="Type (Workshop, Reunion...)"
              value={form.type || ""}
              onChange={handleFormChange}
              className="w-full mb-2 p-2 border"
            />
            <input
              name="organizer"
              placeholder="Organizer"
              value={form.organizer || ""}
              onChange={handleFormChange}
              className="w-full mb-2 p-2 border"
            />

            {error && <p className="text-red-500 mb-2">{error}</p>}

            <div className="flex gap-2">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={handleSaveEvent}
              >
                {editingId ? "Update" : "Create"}
              </button>
              <button
                className="bg-gray-300 px-3 py-1 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
