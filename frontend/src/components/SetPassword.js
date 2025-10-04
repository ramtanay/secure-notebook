// src/components/SetPassword.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function SetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newPassword || !confirm) {
      return setError('Please fill in both fields');
    }

    if (newPassword !== confirm) {
      return setError('Passwords do not match');
    }

    try {
      const token = localStorage.getItem('token'); // ✅ only user token
      if (!token) {
        setError('Unauthorized. Please login again.');
        return navigate('/login');
      }

      const res = await axios.post(
        'http://localhost:5000/set-password',
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || 'Password updated!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <motion.div
      className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <form
        onSubmit={handleSetPassword}
        className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Set New Password</h2>

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Update Password
        </button>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        {message && <p className="text-green-600 text-sm mt-3">{message}</p>}
      </form>
    </motion.div>
  );
}

export default SetPassword;
