import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: 'user',
};

function FaceLogin() {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const capture = async () => {
    setError('');
    setLoading(true);

    if (!webcamRef.current) {
      setError("Camera not available");
      setLoading(false);
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setError("Unable to capture image. Try again.");
      setLoading(false);
      return;
    }

    try {
      const byteString = atob(imageSrc.split(',')[1]);
      const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      const formData = new FormData();
      formData.append('face', blob, 'face.jpg');

      const res = await axios.post('http://localhost:5000/login', formData);
      const token = res.data.token;
      localStorage.setItem('token', token);

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Face not recognized');
    }

    setLoading(false);
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
    >
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Face Login</h2>
      <Webcam
        audio={false}
        height={400}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={400}
        videoConstraints={videoConstraints}
        className="rounded-lg shadow-md border"
      />
      <button
        onClick={capture}
        disabled={loading}
        className="mt-6 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Login with Face'}
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </motion.div>
  );
}

export default FaceLogin;
