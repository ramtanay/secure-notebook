// src/components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-gray-50 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Welcome to Secure Notepad</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Choose how you'd like to log in:
      </p>
      <div className="space-x-4 mb-6">
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Login with Username
        </button>
        <button
          onClick={() => navigate('/face-login')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
        >
          Login with Face
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">New user?</p>
      <button
        onClick={() => navigate('/face-register')}
        className="mt-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
      >
        Register Face
      </button>
    </div>
  );
}

export default Home;
