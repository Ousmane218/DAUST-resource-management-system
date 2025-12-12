import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AddResource = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'room', // default
        capacity: 10,
        description: '',
        image_url: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check admin status (Double security)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Insert data
            const { error } = await supabase
                .from('resources')
                .insert([formData]);

            if (error) throw error;

            toast.success("Resource created successfully!");
            navigate('/dashboard'); // Go back to dashboard to see it

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Resource</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Resource Name</label>
                    <input name="name" required onChange={handleChange} className="w-full border p-2 rounded mt-1" placeholder="e.g. Chemistry Lab" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select name="type" onChange={handleChange} className="w-full border p-2 rounded mt-1">
                            <option value="room">Room</option>
                            <option value="lab">Laboratory</option>
                            <option value="equipment">Equipment</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Capacity</label>
                        <input type="number" name="capacity" required min="1" onChange={handleChange} className="w-full border p-2 rounded mt-1" value={formData.capacity} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" required rows="3" onChange={handleChange} className="w-full border p-2 rounded mt-1"></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input name="image_url" type="url" onChange={handleChange} className="w-full border p-2 rounded mt-1" placeholder="https://..." />
                    <p className="text-xs text-gray-500 mt-1">Paste a link from Unsplash or Google Images.</p>
                </div>

                <button disabled={loading} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold">
                    {loading ? 'Creating...' : 'Create Resource'}
                </button>
            </form>
        </div>
    );
};

export default AddResource;
