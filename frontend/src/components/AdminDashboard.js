// src/components/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUserNotes, setSelectedUserNotes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await axios.get('http://localhost:5000/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      localStorage.removeItem('admin_token'); // clear invalid token
      navigate('/admin/login');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    const token = localStorage.getItem('admin_token');
    if (!window.confirm('Are you sure you want to delete this user and all their notes?')) return;
    try {
      await axios.delete(`http://localhost:5000/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(); // refresh user list
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewNotes = async (id) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await axios.get(`http://localhost:5000/admin/users/${id}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedUserNotes(res.data);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Admin Panel
      </h2>

      {users.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No users found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">Username</th>
              <th className="border p-2 text-left">Created At</th>
              <th className="border p-2 text-left">Face Image</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <td className="border p-2">{user.id}</td>
                <td className="border p-2">{user.username}</td>
                <td className="border p-2">{new Date(user.created_at).toLocaleString()}</td>
                <td className="border p-2">
                  {user.face_image ? (
                    <img
                      src={`data:image/jpeg;base64,${user.face_image}`}
                      alt="Face"
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  ) : (
                    <span className="text-gray-500">No image</span>
                  )}
                </td>
                <td className="border p-2 flex gap-2">
                  <button
                    onClick={() => handleViewNotes(user.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    View Notes
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for viewing user notes */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-3/4 max-w-3xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">User Notes</h3>
            {selectedUserNotes.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">No notes found for this user.</p>
            ) : (
              <ul className="space-y-2 max-h-96 overflow-y-auto">
                {selectedUserNotes.map((note) => (
                  <li key={note.id} className="p-3 rounded border border-gray-300 dark:border-gray-600">
                    <strong>{note.title || 'Untitled'}</strong>
                    <p className="text-gray-700 dark:text-gray-200">{note.body || '-'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pinned: {note.pinned ? 'Yes' : 'No'}, Color: {note.color}, Trashed: {note.trashed ? 'Yes' : 'No'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => setModalOpen(false)}
              className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default AdminDashboard;
