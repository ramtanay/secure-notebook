// src/components/FaceRegister.js
import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function FaceRegister() {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCapture = async () => {
    setError('');
    setSuccess('');

    if (!username.trim() || !password.trim()) {
      return setError('Username and password are required');
    }

    const imageSrc = webcamRef.current.getScreenshot();
    const byteString = atob(imageSrc.split(',')[1]);
    const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: mimeString });

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password); // ✅ Send password
    formData.append('face', blob, 'face.jpg');

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/register', formData);

      if (res.status === 200) {
        setSuccess(res.data.message || 'Registration successful!');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }

    setLoading(false);
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Register Face</h2>

      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-2 mb-4 w-full max-w-sm border rounded dark:bg-gray-800 dark:text-white"
      />

      <input
        type="password"
        placeholder="Set a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 mb-4 w-full max-w-sm border rounded dark:bg-gray-800 dark:text-white"
      />

      <Webcam
        audio={false}
        height={400}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={400}
        className="rounded-lg border shadow-sm"
      />

      <button
        onClick={handleCapture}
        disabled={loading}
        className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Registering...' : 'Capture & Register'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-600 mt-4">{success}</p>}

      <button onClick={() => navigate('/')} className="mt-4 text-blue-500 hover:underline">
        Back to Home
      </button>
    </motion.div>
  );
}

export default FaceRegister;
