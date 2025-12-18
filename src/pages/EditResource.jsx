import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditResource = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    
    const [formData, setFormData] = useState({
        name: '',
        type: 'room',
        capacity: 0,
        description: '',
        image_url: ''
    });

    
    useEffect(() => {
        const fetchResource = async () => {
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                toast.error("Error loading resource");
                navigate('/dashboard');
            } else {
                setFormData(data);
                setLoading(false);
            }
        };
        fetchResource();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('resources')
                .update({
                    name: formData.name,
                    type: formData.type,
                    capacity: formData.capacity,
                    description: formData.description,
                    image_url: formData.image_url
                })
                .eq('id', id);

            if (error) throw error;

            toast.success("Resource updated successfully!");
            navigate('/dashboard');

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-xl mx-auto p-4 md:p-8 bg-white shadow-lg rounded-lg mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Resource</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full border p-2 rounded mt-1">
                            <option value="room">Room</option>
                            <option value="lab">Lab</option>
                            <option value="equipment">Equipment</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Capacity</label>
                        <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded mt-1"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input name="image_url" value={formData.image_url} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                </div>
                <button className="w-full bg-blue-900 text-white py-2 rounded font-bold hover:bg-blue-800">
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default EditResource;
