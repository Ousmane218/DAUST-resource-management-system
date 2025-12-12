import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAdminAndFetch();
    }, []);

    const checkAdminAndFetch = async () => {
        try {
            // 1. Check if user is actually an admin
            const { data: { user } } = await supabase.auth.getUser();
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile.role !== 'admin') {
                toast.error("Access Denied: You are not an Administrator.");
                navigate('/dashboard');
                return;
            }

            // 2. Fetch ALL pending bookings
            const { data, error } = await supabase
                .from('bookings')
                .select(`
          id,
          start_time,
          end_time,
          purpose,
          status,
          resources ( name ),
          profiles ( full_name, email )
        `)
                .eq('status', 'pending') // Only show pending ones
                .order('start_time', { ascending: true });

            if (error) throw error;
            setBookings(data);

        } catch (error) {
            console.error("Error:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDecision = async (bookingId, decision) => {
        // decision should be 'approved' or 'rejected'
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: decision })
                .eq('id', bookingId);

            if (error) throw error;

            // Remove the processed booking from the list
            setBookings(bookings.filter(b => b.id !== bookingId));
            toast.success(`Booking ${decision} successfully.`);

        } catch (error) {
            toast.error("Error updating booking: " + error.message);
        }
    };

    if (loading) return <div className="p-8">Checking permissions...</div>;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-red-800">Admin Dashboard</h1>
                <Link to="/admin/add-resource" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    + Add Resource
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold">Pending Approvals ({bookings.length})</h2>
                </div>

                {bookings.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No pending requests. Good job!</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{booking.profiles.full_name}</div>
                                        <div className="text-sm text-gray-500">{booking.profiles.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {booking.resources.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div>{new Date(booking.start_time).toLocaleDateString()}</div>
                                        <div>
                                            {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                            {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="italic text-gray-400 mt-1">"{booking.purpose}"</div>
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button
                                            onClick={() => handleDecision(booking.id, 'approved')}
                                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs font-bold"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleDecision(booking.id, 'rejected')}
                                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs font-bold"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
