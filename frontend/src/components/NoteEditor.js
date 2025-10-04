// src/components/NoteEditor.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState({
    title: '',
    body: '',
    color: 'gray700',
    pinned: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    if (id !== 'new') {
      axios
        .get(`http://localhost:5000/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const data = res.data;
          setNote({
            title: data.title || '',
            body: data.body || '',
            color: data.color || 'gray700',
            pinned: data.pinned || false,
            id: data.id,
          });
        })
        .catch(() => navigate('/dashboard'));
    }
  }, [id, navigate]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const url = id === 'new' ? 'http://localhost:5000/notes' : `http://localhost:5000/notes/${id}`;
    const method = id === 'new' ? 'post' : 'put';

    try {
      await axios[method](url, {
        title: note.title,
        body: note.body,
        color: note.color,
        pinned: note.pinned,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/dashboard');
    } catch (err) {
      alert('Error saving note');
    }
  };

  const handleMoveToTrash = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:5000/trash/${note.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/dashboard');
    } catch (err) {
      console.error('Move to trash failed', err);
    }
  };

  const getColorHex = (name) => {
    const map = {
      gray700: '#374151',
      gray600: '#4b5563',
      darkSlate: '#1f2937',
      slate700: '#334155',
      blue800: '#1e40af',
      purple900: '#4c1d95',
    };
    return map[name] || '#374151';
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-start pt-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          {id === 'new' ? 'Create Note' : 'Edit Note'}
        </h2>

        <input
          value={note.title}
          onChange={(e) => setNote({ ...note, title: e.target.value })}
          placeholder="Note Title"
          className="w-full h-12 mb-4 p-3 text-base font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 bg-white dark:bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <textarea
          rows={10}
          value={note.body}
          onChange={(e) => setNote({ ...note, body: e.target.value })}
          placeholder="Note Body"
          className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
        />

        <div className="mb-4">
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
            Note Color:
          </label>
          <div className="flex gap-2">
            {['darkSlate', 'gray700', 'gray600', 'slate700', 'blue800', 'purple900'].map((clr) => (
              <div
                key={clr}
                className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                  note.color === clr ? 'border-black dark:border-white' : 'border-gray-300'
                }`}
                style={{ backgroundColor: getColorHex(clr) }}
                onClick={() => setNote({ ...note, color: clr })}
              />
            ))}
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={note.pinned}
            onChange={() => setNote({ ...note, pinned: !note.pinned })}
            className="w-4 h-4"
          />
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Pin this note
          </label>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Save Note
          </button>

          {id !== 'new' && (
            <button
              onClick={handleMoveToTrash}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              Move to Trash
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default NoteEditor;
