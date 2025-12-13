import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'room', 'equipment', 'lab'

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .eq('is_active', true); // Only show active resources

            if (error) throw error;
            setResources(data);
        } catch (error) {
            alert('Error fetching resources: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredResources = filter === 'all'
        ? resources
        : resources.filter(r => r.type === filter);

    return (
        <div className="container mx-auto p-6">
            {/* NEW: Responsive Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Available Resources</h2>

                {/* Simple Filter */}
                <div className="flex flex-wrap justify-center gap-2">
                    {['all', 'room', 'lab', 'equipment'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-3 py-1 md:px-4 md:py-2 text-sm md:text-base rounded capitalize ${filter === type ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading resources...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource) => (
                        <div key={resource.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                            {/* Image Section */}
                            <div className="h-48 overflow-hidden bg-gray-200">
                                {resource.image_url ? (
                                    <img
                                        src={resource.image_url}
                                        alt={resource.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-blue-900 mb-2">{resource.name}</h3>
                                    <span className={`text-xs px-2 py-1 rounded capitalize ${resource.type === 'room' ? 'bg-green-100 text-green-800' :
                                        resource.type === 'equipment' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'
                                        }`}>
                                        {resource.type}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden">
                                    {resource.description}
                                </p>

                                <div className="flex justify-between items-center mt-4 border-t pt-4">
                                    <span className="text-sm text-gray-500">Capacity: {resource.capacity}</span>
                                    <Link
                                        to={`/book/${resource.id}`}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
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
