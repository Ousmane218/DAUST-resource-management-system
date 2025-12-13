import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AddResource = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // State for the form data
    const [name, setName] = useState('');
    const [type, setType] = useState('room');
    const [capacity, setCapacity] = useState(10);
    const [description, setDescription] = useState('');

    // State specifically for the file
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Create a fake local URL just to show a preview
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
                // Create a unique file name (e.g., 123456789-my-image.jpg)
                const fileName = `${Date.now()}-${imageFile.name}`;

                const { error: uploadError } = await supabase.storage
                    .from('resource-images') // The bucket name we created
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                // Get the Public URL
                const { data: urlData } = supabase.storage
                    .from('resource-images')
                    .getPublicUrl(fileName);

                finalImageUrl = urlData.publicUrl;
            }

            // 3. Insert Data into Database
            const { error: dbError } = await supabase
                .from('resources')
                .insert([{
                    name,
                    type,
                    capacity,
                    description,
                    image_url: finalImageUrl, // We save the Supabase URL here
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

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Resource Name</label>
                    <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border p-2 rounded mt-1"
                        placeholder="e.g. Chemistry Lab"
                    />
                </div>

                {/* Type & Capacity */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
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
                            required
                            min="1"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            className="w-full border p-2 rounded mt-1"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        required
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border p-2 rounded mt-1"
                    ></textarea>
                </div>

                {/* IMAGE UPLOAD SECTION */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Resource Photo</label>

                    <div className="mt-1 flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                </svg>
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                                <p className="text-xs text-gray-500">JPG, PNG (MAX. 2MB)</p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    {/* Preview Area */}
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
