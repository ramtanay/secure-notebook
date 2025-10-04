// src/components/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isTokenValid } from '../utils/auth';

function Navbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const isUser = isTokenValid();

  const handleLogout = () => {
    localStorage.removeItem('token'); // ✅ only user token
    navigate('/');
  };

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.theme = isDark ? 'dark' : 'light';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-white dark:bg-gray-800 shadow relative">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Notepad</h2>

      <div className="space-x-4 flex items-center">
        <button
          onClick={toggleDarkMode}
          className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
        >
          Change Theme
        </button>

        {isUser && (
          <>
            <Link to="/dashboard" className="text-gray-700 dark:text-gray-200 hover:underline">
              Dashboard
            </Link>

            {/* Dropdown menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="text-gray-700 dark:text-gray-200 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                ⚙️ Options
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded shadow z-10">
                  <Link
                    to="/trash"
                    className="block px-4 py-2 text-sm text-yellow-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    🗑️ Trash
                  </Link>
                  <Link
                    to="/set-password"
                    className="block px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    🔐 Set Password
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
