// src/components/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useState } from "react";
import { FiMenu, FiX, FiSearch } from 'react-icons/fi';

export default function Header() {
  const { currentUser, userProfile, isAdmin } = useAuth(); // Changed from 'user' to match context
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-orange-400">MindStack</span>
          </Link>

          {/* Search bar - Hidden on mobile */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-8">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </form>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <>
                <Link
                  to="/ask"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm transition"
                >
                  Ask Question
                </Link>
                
                {/* Dropdown Menu */}
                <div className="relative group">
                  <button className="flex items-center gap-2 focus:outline-none">
                    <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                      {userProfile?.avatar ? (
                        <img src={userProfile.avatar} alt={userProfile.displayName} className="w-9 h-9 rounded-full" />
                      ) : (
                        getInitials(userProfile?.displayName || currentUser?.email || 'User')
                      )}
                    </div>
                  </button>
                  
                  {/* Dropdown content */}
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-2 text-sm font-semibold text-white">{userProfile?.displayName || currentUser?.email}</div>
                    <div className="px-4 py-1 text-xs text-gray-400">{currentUser?.email}</div>
                    <div className="border-t border-gray-700 my-1"></div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Profile</Link>
                    <Link to="/favorites" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Favorites</Link>
                    <Link to="/chat" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Messages</Link>
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-700 my-1"></div>
                        <Link to="/admin" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Admin Dashboard</Link>
                      </>
                    )}
                    <div className="border-t border-gray-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-gray-800 rounded-lg"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </form>

            {currentUser ? (
              <>
                <Link
                  to="/ask"
                  className="block w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Ask Question
                </Link>
                <Link
                  to="/profile"
                  className="block w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/favorites"
                  className="block w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Favorites
                </Link>
                <Link
                  to="/chat"
                  className="block w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="block w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}