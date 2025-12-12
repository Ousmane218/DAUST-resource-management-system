import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">DAUST RMS</h1>
            <p className="text-lg mb-8">Resource Management System</p>
            <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
                Login to Reserve
            </Link>
        </div>
    );
};
export default Home;
