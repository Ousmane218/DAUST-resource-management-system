import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Home = () => {
    const [featuredResources, setFeaturedResources] = useState([]);

    useEffect(() => {
        const fetchFeatured = async () => {
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(3);

            if (!error && data) {
                setFeaturedResources(data);
            }
        };
        fetchFeatured();
    }, []);

    return (
        <div className="min-h-screen bg-white">

            {/* 1. HERO SECTION - Asymmetric Split */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">

                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Reserve your space.</span>{' '}
                                    <span className="block text-blue-900 xl:inline">Build your future.</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    The official resource management platform for DAUST. Book engineering labs, lecture halls, and 3D printers instantly.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <Link
                                            to="/login"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-900 hover:bg-blue-800 md:py-4 md:text-lg transition"
                                        >
                                            Book a Resource
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link
                                            to="/dashboard"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg transition"
                                        >
                                            Browse Catalog
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>

                {/* Right Side Image */}
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                    <img
                        className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
                        src="/daust_campus.jpg"
                        alt="University Campus"
                    />
                    {/* Subtle overlay to blend image */}
                    <div className="absolute inset-0 bg-blue-900 opacity-10 lg:hidden"></div>
                </div>
            </div>

            {/* 2. VISUAL CATEGORIES - Dynamic from DB */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Recently Added Resources</h2>

                {featuredResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {featuredResources.map((resource) => (
                            <Link to={`/book/${resource.id}`} key={resource.id} className="group relative rounded-xl overflow-hidden h-64 shadow-lg cursor-pointer block">
                                {resource.image_url ? (
                                    <img
                                        src={resource.image_url}
                                        alt={resource.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-6">
                                    <h3 className="text-white text-xl font-bold">{resource.name}</h3>
                                    <p className="text-gray-300 text-sm line-clamp-1">{resource.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10">
                        <p>No resources found. <Link to="/dashboard" className="text-blue-600 hover:underline">Check the dashboard</Link>.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Home;
