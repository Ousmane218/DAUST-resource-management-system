import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const BookResource = () => {
    const { id } = useParams(); // Get resource ID from URL
    const navigate = useNavigate();

    // State for the resource details
    const [resource, setResource] = useState(null);

    // State for the form
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [purpose, setPurpose] = useState('');
    const [loading, setLoading] = useState(false);
    const [busySlots, setBusySlots] = useState([]); // Store taken times

    // 1. Fetch Resource Details on Load
    useEffect(() => {
        const fetchResource = async () => {
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .eq('id', id)
                .single();

            if (error) console.error(error);
            else setResource(data);
        };
        fetchResource();
    }, [id]);

    useEffect(() => {
        if (date && id) {
            fetchBusySlots();
        }
    }, [date, id]);

    const fetchBusySlots = async () => {
        // Get start and end of the selected day
        const dayStart = new Date(`${date}T00:00:00`).toISOString();
        const dayEnd = new Date(`${date}T23:59:59`).toISOString();

        const { data, error } = await supabase
            .from('bookings')
            .select('start_time, end_time')
            .eq('resource_id', id)
            .eq('status', 'approved') // Only count approved bookings
            .gte('start_time', dayStart)
            .lte('end_time', dayEnd);

        if (error) {
            console.error('Error fetching slots:', error);
        } else {
            setBusySlots(data);
        }
    };

    // 2. Handle Booking Submission
    const handleBooking = async (e) => {
        e.preventDefault();
        setLoading(true);
        // setError(''); // REMOVED as per previous toast integration

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in.");

            const startTimestamp = new Date(`${date}T${startTime}`).toISOString();
            const endTimestamp = new Date(`${date}T${endTime}`).toISOString();

            if (new Date(endTimestamp) <= new Date(startTimestamp)) {
                throw new Error("End time must be after start time.");
            }

            // --- NEW: CONFLICT CHECK START ---
            // We look for any booking for this resource that overlaps with our time
            // Logic: (ExistingStart < RequestedEnd) AND (ExistingEnd > RequestedStart)
            const { data: conflicts, error: conflictError } = await supabase
                .from('bookings')
                .select('id')
                .eq('resource_id', id)
                .eq('status', 'approved') // Only worry about approved bookings
                .lt('start_time', endTimestamp) // Existing start is BEFORE our end
                .gt('end_time', startTimestamp); // Existing end is AFTER our start

            if (conflictError) throw conflictError;

            if (conflicts && conflicts.length > 0) {
                throw new Error("Conflict! This time slot is already booked.");
            }
            // --- NEW: CONFLICT CHECK END ---

            // If no conflict, proceed to insert...
            const { error: bookingError } = await supabase
                .from('bookings')
                .insert([
                    {
                        user_id: user.id,
                        resource_id: id,
                        start_time: startTimestamp,
                        end_time: endTimestamp,
                        purpose: purpose,
                        status: 'pending'
                    }
                ]);

            if (bookingError) throw bookingError;

            toast.success("Booking Request Sent!"); // improved polish
            navigate('/dashboard');

        } catch (err) {
            toast.error(err.message); // improved polish
            // setError(err.message); // REMOVED
        } finally {
            setLoading(false);
        }
    };

    if (!resource) return <div className="p-10 text-center">Loading details...</div>;

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 bg-white shadow-lg rounded-lg mt-10">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Book: {resource.name}</h2>
            <p className="text-gray-600 mb-6">{resource.description}</p>



            <form onSubmit={handleBooking} className="space-y-4">

                {/* Date Selection */}
                <div>
                    <label className="block text-gray-700 font-medium">Date</label>
                    <input
                        type="date"
                        required
                        className="w-full border p-2 rounded"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]} // Disable past dates
                    />
                </div>

                {/* Visual Busy Indicator */}
                {date && (
                    <div className="mt-4 p-4 bg-gray-50 rounded border">
                        <h4 className="font-semibold text-gray-700 mb-2">Availability for {date}:</h4>
                        {busySlots.length === 0 ? (
                            <p className="text-green-600 text-sm">✓ All day available</p>
                        ) : (
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500 mb-1">The following times are <span className="text-red-600 font-bold">BUSY</span>:</p>
                                {busySlots.map((slot, index) => (
                                    <div key={index} className="flex items-center text-red-700 bg-red-50 p-2 rounded text-sm border border-red-100">
                                        <span className="font-mono font-bold mr-2">
                                            {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        to
                                        <span className="font-mono font-bold ml-2">
                                            {new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    {/* Start Time */}
                    <div>
                        <label className="block text-gray-700 font-medium">Start Time</label>
                        <input
                            type="time"
                            required
                            className="w-full border p-2 rounded"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    </div>

                    {/* End Time */}
                    <div>
                        <label className="block text-gray-700 font-medium">End Time</label>
                        <input
                            type="time"
                            required
                            className="w-full border p-2 rounded"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                    </div>
                </div>

                {/* Purpose */}
                <div>
                    <label className="block text-gray-700 font-medium">Purpose of Reservation</label>
                    <textarea
                        required
                        className="w-full border p-2 rounded"
                        rows="3"
                        placeholder="E.g., Robotics Club Meeting, Exam Review..."
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Processing..." : "Confirm Reservation"}
                </button>
            </form>
        </div>
    );
};

export default BookResource;
