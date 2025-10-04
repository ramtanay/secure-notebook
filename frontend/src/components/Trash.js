// src/components/Trash.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

function Trash() {
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    axios
      .get('http://localhost:5000/trash', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setNotes(res.data))
      .catch(() => navigate('/dashboard'));
  }, [navigate]);

  const handleRestore = async (noteId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:5000/restore/${noteId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (err) {
      console.error('Restore failed:', err);
    }
  };

  const handleDelete = async (noteId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/trash/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">🗑️ Trashed Notes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400">Trash is empty.</p>
        )}
        {notes.map((note) => (
          <div key={note.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
              {note.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
              {note.body}
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleRestore(note.id)}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Restore
              </button>
              <button
                onClick={() => handleDelete(note.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default Trash;
