import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema } from '../schemas/formSchema';
import { useImages } from '../context/ImageContext';
import PreviewModal from './PreviewModal';

const ImageUploadForm = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addImages } = useImages(); // Only get addImages from context
    const [localImages, setLocalImages] = useState([]); // New local state for form preview
    const [error, setError] = useState('');
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        resolver: zodResolver(formSchema)
    });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        console.log('Files selected: ', files);
        setError('');

        if (files.length + localImages.length > 5) {
            setError(`You can only upload up to 5 images. You already have ${localImages.length} images.`);
            e.target.value = '';
            return;
        }

        const invalidFiles = files.filter(
            file => !['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
        );

        if (invalidFiles.length > 0) {
            setError('Only JPG, JPEG, and PNG files are allowed');
            e.target.value = '';
            return;
        }

        const oversizedFiles = files.filter(
            file => file.size > 5 * 1024 * 1024
        );

        if (oversizedFiles.length > 0) {
            setError('Each file must be less than 5MB');
            e.target.value = '';
            return;
        }

        const imageFiles = files.map(file => ({ file }));
        console.log('Adding Images: ', imageFiles);
        setLocalImages(prev => [...prev, ...imageFiles]); // Update local state
        e.target.value = '';
    };

    const removeLocalImage = (index) => {
        setLocalImages(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data) => {
        try {
            if (localImages.length === 0) {
                setError('Please upload at least one image');
                return;
            }
            
            setIsSubmitting(true);
            
            // Create a FormData object to handle file uploads
            const formData = new FormData();
            formData.append('username', data.username);
            formData.append('email', data.email);
            
            // Add to context for gallery before appending to formData
            addImages(localImages);
            
            // Append each image file
            localImages.forEach((img, index) => {
                formData.append(`image${index}`, img.file);
            });
            
            // Log the form data
            console.log('Form data:', {
                username: data.username,
                email: data.email,
                imageCount: localImages.length
            });
            
            // Simulate successful submission
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Clear form and local images
            setLocalImages([]); // Clear local images
            reset();
            setError('');
            
            alert('Form submitted successfully!');
            
        } catch (error) {
            console.error('Error submitting form:', error);
            setError('Failed to submit form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {/* Username Input */}
                    <div className="relative">
                        <input
                            type="text"
                            {...register('username')}
                            placeholder="Username"
                            className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-purple-100 
                                rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent
                                placeholder-purple-300 text-purple-900"
                        />
                        {errors.username && (
                            <p className="absolute -bottom-5 left-0 text-xs text-red-500">
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                        <input
                            type="email"
                            {...register('email')}
                            placeholder="Email"
                            className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-purple-100 
                                rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent
                                placeholder-purple-300 text-purple-900"
                        />
                        {errors.email && (
                            <p className="absolute -bottom-5 left-0 text-xs text-red-500">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Image Upload Section */}
                    <div className="relative">
                        <div className="relative group">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="imageInput"
                            />
                            <label
                                htmlFor="imageInput"
                                className="flex flex-col items-center justify-center w-full h-32 
                                    bg-white/50 backdrop-blur-sm border-2 border-dashed border-purple-200 
                                    rounded-xl cursor-pointer transition-all duration-300
                                    group-hover:border-purple-400 group-hover:bg-white/60"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg
                                        className="w-8 h-8 mb-3 text-purple-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        ></path>
                                    </svg>
                                    <p className="text-sm text-purple-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-purple-400 mt-1">PNG, JPG, JPEG (max 5 files)</p>
                                </div>
                            </label>
                        </div>
                        {error && (
                            <p className="absolute -bottom-5 left-0 text-xs text-red-500">
                                {error}
                            </p>
                        )}
                    </div>
                </div>

                {/* Image Preview Section */}
                {localImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                        {localImages.map((img, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={URL.createObjectURL(img.file)}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border border-purple-100"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeLocalImage(index)}
                                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md 
                                        opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                    <svg
                                        className="w-4 h-4 text-red-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <rect
                                            x="5"
                                            y="9"
                                            width="10"
                                            height="2"
                                            transform="rotate(45 10 10)"
                                        />
                                        <rect
                                            x="5"
                                            y="9"
                                            width="10"
                                            height="2"
                                            transform="rotate(-45 10 10)"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white 
                        py-3 px-6 rounded-xl font-medium shadow-lg
                        hover:from-purple-600 hover:to-violet-600 
                        focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-300"
                >
                    {isSubmitting ? 'Uploading...' : 'Upload Images'}
                </button>
            </form>

            {isModalOpen && (
                <PreviewModal
                    images={localImages}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ImageUploadForm;