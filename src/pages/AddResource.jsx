import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AddResource = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Refactor: Using a single object for state is cleaner than 5 different variables
    const [formData, setFormData] = useState({
        name: '',
        type: 'room',
        capacity: 10,
        description: '',
    });

    // State specifically for the file (kept separate because it's a binary object)
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    // Generic handler for all text inputs
    const handleChange = (e) => {
        setFormData({
            ...formData, // Keep the other fields as they are
            [e.target.name]: e.target.value // Update only the field that changed
        });
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Check Auth
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            let finalImageUrl = '';

            // 2. Upload Image (If one was selected)
            if (imageFile) {
                const fileName = `${Date.now()}-${imageFile.name}`;

                const { error: uploadError } = await supabase.storage
                    .from('resource-images')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('resource-images')
                    .getPublicUrl(fileName);

                finalImageUrl = urlData.publicUrl;
            }

            // 3. Insert Data
            const { error: dbError } = await supabase
                .from('resources')
                .insert([{
                    name: formData.name,
                    type: formData.type,
                    capacity: formData.capacity,
                    description: formData.description,
                    image_url: finalImageUrl,
                }]);

            if (dbError) throw dbError;

            toast.success("Resource created successfully!");
            navigate('/dashboard');

        } catch (error) {
            toast.error("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4 md:p-8 bg-white shadow-lg rounded-lg mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Resource</h2>

            <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                    <label className="block text-sm font-medium text-gray-700">Resource Name</label>
                    <input
                        name="name" // Matches the state key
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border p-2 rounded mt-1"
                        placeholder="e.g. Chemistry Lab"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full border p-2 rounded mt-1"
                        >
                            <option value="room">Room</option>
                            <option value="lab">Laboratory</option>
                            <option value="equipment">Equipment</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Capacity</label>
                        <input
                            type="number"
                            name="capacity"
                            required
                            min="1"
                            value={formData.capacity}
                            onChange={handleChange}
                            className="w-full border p-2 rounded mt-1"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        required
                        rows="3"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full border p-2 rounded mt-1"
                    ></textarea>
                </div>

                {/* Image Upload Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Resource Photo</label>
                    <div className="mt-1 flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                                <p className="text-xs text-gray-500">JPG, PNG (MAX. 2MB)</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>
                    {preview && (
                        <div className="mt-4">
                            <p className="text-xs text-gray-500 mb-2">Preview:</p>
                            <img src={preview} alt="Selected" className="h-32 w-full object-cover rounded-md" />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-900 text-white py-3 rounded hover:bg-blue-800 font-bold transition"
                >
                    {loading ? 'Uploading & Creating...' : 'Create Resource'}
                </button>
            </form>
        </div>
    );
};

export default AddResource;
