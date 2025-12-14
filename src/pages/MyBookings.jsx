import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyBookings();
    }, []);

    const fetchMyBookings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('bookings')
                .select(`
          *,
          resources ( name, type )
        `)
                .eq('user_id', user.id)
                .order('start_time', { ascending: false });

            if (error) throw error;
            setBookings(data);
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">My Reservations</h2>

            {loading ? <p>Loading...</p> : (
                <>
                    {/* DESKTOP VIEW: Table (Hidden on small screens) */}
                    <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            {/* ... Keep your existing Table Header and Body code here ... */}
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td className="px-6 py-4 font-medium text-gray-900">{booking.resources.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(booking.start_time).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                            {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE VIEW: Cards (Visible only on small screens) */}
                    <div className="md:hidden space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-white p-4 rounded-lg shadow border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-blue-900">{booking.resources.name}</h3>
                                    <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${getStatusColor(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="text-gray-600 text-sm space-y-1">
                                    <p>📅 {new Date(booking.start_time).toLocaleDateString()}</p>
                                    <p>⏰ {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                        {bookings.length === 0 && <p className="text-gray-500 text-center">No bookings found.</p>}
                    </div>
                </>
            )}
        </div>
    );
};

export default MyBookings;
