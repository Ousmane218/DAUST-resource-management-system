import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast'; // Import Toast for notifications

const Dashboard = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [isAdmin, setIsAdmin] = useState(false); // New State for Admin check

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            console.log("Fetching dashboard resources..."); // DEBUG

            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile && profile.role === 'admin') {
                    console.log("User is Admin"); // DEBUG: Verify role
                    setIsAdmin(true);
                }
            }

            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Supabase Error:", error); // DEBUG: Catch API errors
                throw error;
            }

            console.log("Resources loaded:", data); // DEBUG: Check data structure
            setResources(data);

        } catch (error) {
            toast.error('Error loading system: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- SOFT DELETE FUNCTION ---
    const handleDelete = async (resourceId, resourceName) => {
        // 1. Confirm with the user
        if (!window.confirm(`Are you sure you want to delete "${resourceName}"?`)) {
            return;
        }

        try {
            // 2. perform "Soft Delete" (Mark as inactive)
            // We do NOT use .delete(). We use .update()
            const { error } = await supabase
                .from('resources')
                .update({ is_active: false }) // <--- The Magic Change
                .eq('id', resourceId);

            if (error) throw error;

            // 3. Update UI (Remove the item without reloading)
            setResources(resources.filter(r => r.id !== resourceId));
            toast.success(`"${resourceName}" deleted successfully.`);

        } catch (error) {
            toast.error("Failed to delete: " + error.message);
        }
    };

    // Filter logic
    const filteredResources = filter === 'all'
        ? resources
        : resources.filter(r => r.type === filter);

    return (
        <div className="container mx-auto p-6 min-h-screen">

            {/* Responsive Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Available Resources</h2>

                <div className="flex flex-wrap justify-center gap-2">
                    {['all', 'room', 'lab', 'equipment'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-3 py-1 md:px-4 md:py-2 text-sm md:text-base rounded capitalize transition ${filter === type ? 'bg-blue-900 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredResources.map((resource) => (
                        <div key={resource.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col relative">

                            { }
                            {isAdmin && (
                                <div className="absolute top-2 right-2 z-10 flex gap-2">
                                    { }
                                    <Link
                                        to={`/admin/edit-resource/${resource.id}`}
                                        className="bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700 transition"
                                        title="Edit"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                        </svg>
                                    </Link>

                                    { }
                                    <button
                                        onClick={() => handleDelete(resource.id, resource.name)}
                                        className="bg-red-600 text-white p-2 rounded-full shadow hover:bg-red-700 transition"
                                        title="Delete Resource"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            { }
                            <div className="h-48 overflow-hidden bg-gray-100 group">
                                {resource.image_url ? (
                                    <img
                                        src={resource.image_url}
                                        alt={resource.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                                        No Image
                                    </div>
                                )}
                            </div>

                            { }
                            <div className="p-5 flex-grow flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{resource.name}</h3>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium uppercase tracking-wide ${resource.type === 'room' ? 'bg-green-100 text-green-800' :
                                        resource.type === 'equipment' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'
                                        }`}>
                                        {resource.type}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                                    {resource.description}
                                </p>

                                <div className="mt-auto flex justify-between items-center border-t border-gray-100 pt-4">
                                    <span className="text-sm text-gray-500 font-medium flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                        {resource.capacity} People
                                    </span>
                                    <Link
                                        to={`/book/${resource.id}`}
                                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold transition-colors shadow-sm"
                                    >
                                        Book Now
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
