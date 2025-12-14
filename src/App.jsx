import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient'; // Import supabase
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookResource from './pages/BookResource';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import AddResource from './pages/AddResource';
import EditResource from './pages/EditResource';


function App() {
  const [session, setSession] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen for changes (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <Toaster position="top-center" />
      <Router>
        <div className="min-h-screen flex flex-col font-sans">
          {/* Navbar */}
          {/* Responsive Navbar */}
          <nav className="bg-blue-900 text-white shadow-md relative z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">

              {/* Logo */}
              <div className="font-bold text-xl tracking-wide">
                <Link to="/">DAUST RMS</Link>
              </div>

              {/* Desktop Menu (Hidden on mobile) */}
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="hover:text-blue-200 transition">Home</Link>
                {session && (
                  <>
                    <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
                    <Link to="/my-bookings" className="hover:text-blue-200">My Bookings</Link>
                    <Link to="/admin" className="text-red-300 hover:text-white">Admin Panel</Link>
                  </>
                )}
                {!session ? (
                  <Link to="/login" className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-600">Login</Link>
                ) : (
                  <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded hover:bg-red-500">Logout</button>
                )}
              </div>

              {/* Mobile Hamburger Button (Visible only on mobile) */}
              <button
                className="md:hidden text-white focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  // X Icon
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  // Hamburger Icon
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
              <div className="md:hidden bg-blue-800 px-4 pt-2 pb-4 space-y-2 absolute w-full shadow-xl">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:bg-blue-700 rounded">Home</Link>
                {session && (
                  <>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:bg-blue-700 rounded">Dashboard</Link>
                    <Link to="/my-bookings" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:bg-blue-700 rounded">My Bookings</Link>
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block py-2 text-red-300 hover:bg-blue-700 rounded">Admin Panel</Link>
                  </>
                )}
                {!session ? (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block py-2 bg-blue-700 text-center rounded">Login</Link>
                ) : (
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left py-2 text-red-300 hover:bg-blue-700 rounded">Logout</button>
                )}
              </div>
            )}
          </nav>

          {/* Main Content */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
              {/* Protect the dashboard route */}
              <Route
                path="/dashboard"
                element={session ? <Dashboard /> : <Navigate to="/login" />}
              />
              <Route
                path="/book/:id"
                element={session ? <BookResource /> : <Navigate to="/login" />}
              />
              <Route
                path="/my-bookings"
                element={session ? <MyBookings /> : <Navigate to="/login" />}
              />
              <Route
                path="/admin"
                element={session ? <AdminDashboard /> : <Navigate to="/login" />}
              />
              <Route
                path="/admin/add-resource"
                element={session ? <AddResource /> : <Navigate to="/login" />}
              />
              <Route
                path="/admin/edit-resource/:id"
                element={session ? <EditResource /> : <Navigate to="/login" />}
              />
            </Routes>
          </main>

          <footer className="bg-gray-800 text-white text-center p-4 text-sm">
            &copy; 2025 DAUST Resource Management System
          </footer>
        </div>
      </Router>
    </>
  );
}

export default App;
