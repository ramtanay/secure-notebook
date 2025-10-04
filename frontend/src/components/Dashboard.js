import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();

  const getValidToken = () => {
    return localStorage.getItem('token'); // ✅ removed admin_token
  };

  const handleTrash = async (noteId) => {
    const token = getValidToken();
    try {
      await axios.put(`http://localhost:5000/trash/${noteId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter(n => n.id !== noteId)); // ✅ changed _id → id
    } catch (err) {
      console.error("Error moving note to trash:", err);
    }
  };

  useEffect(() => {
    const token = getValidToken();
    if (!token) return navigate('/login');

    axios.get('http://localhost:5000/notes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setNotes(res.data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  const pinnedNotes = notes.filter(n => n.pinned);
  const username = localStorage.getItem('username') || "User";

  return (
    <motion.div
      className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
    >
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Welcome, {username} 👋
      </h2>

      <button
        onClick={() => navigate('/note/new')}
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        + Create Note
      </button>

      {pinnedNotes.length > 0 && (
        <>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">📌 Pinned</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {pinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} navigate={navigate} handleTrash={handleTrash} />
            ))}
          </div>
        </>
      )}

      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Notes</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.filter(n => !n.pinned).length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No notes yet. Create your first note!</p>
        ) : (
          notes.filter(n => !n.pinned).map((note) => (
            <NoteCard key={note.id} note={note} navigate={navigate} handleTrash={handleTrash} />
          ))
        )}
      </div>
    </motion.div>
  );
}

function NoteCard({ note, navigate, handleTrash }) {
  const colorMap = {
    darkSlate: 'bg-gray-800',
    gray700: 'bg-gray-700',
    gray600: 'bg-gray-600',
    slate700: 'bg-slate-700',
    blue800: 'bg-blue-800',
    purple900: 'bg-purple-900',
  };
  const bgColor = colorMap[note.color] || 'bg-gray-800';

  return (
    <div className={`${bgColor} text-white p-4 rounded shadow`}>
      <h4 className="text-lg font-semibold mb-1">{note.title}</h4> {/* ✅ title now shows */}
      <p className="text-sm text-gray-200 line-clamp-3">{note.body}</p>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => navigate(`/note/${note.id}`)} // ✅ changed _id → id
          className="text-sm text-blue-300 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={() => handleTrash(note.id)} // ✅ changed _id → id
          className="text-sm text-yellow-300 hover:underline"
        >
          🗑️ Trash
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
