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


function App() {
  const [session, setSession] = useState(null);

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
          <nav className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-md">
            <div className="font-bold text-xl tracking-wide">DAUST RMS</div>
            <div className="space-x-4">
              <Link to="/" className="hover:text-blue-200 transition">Home</Link>

              {session && (
                <>
                  <Link to="/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
                  <Link to="/my-bookings" className="hover:text-blue-200 transition">My Bookings</Link>
                  <Link to="/admin" className="text-red-300 hover:text-white font-semibold transition">Admin Panel</Link>
                </>
              )}

              {!session ? (
                <Link to="/login" className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-600 transition">
                  Login
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-500 transition"
                >
                  Logout
                </button>
              )}
            </div>
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
