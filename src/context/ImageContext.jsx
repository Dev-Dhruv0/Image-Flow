import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

// Define the context type
const ImageContext = createContext({
    images: [],
    addImages: () => {},
    removeImage: () => {},
    clearImages: () => {},
    deleteImage: () => {},
});

export const ImageProvider = ({ children }) => {
    
    const [images, setImages] = useState([]);

    // Add new Images
    const addImages = (newImages) => {
        const processedImages = newImages.map(img => ({
            ...img,
            size: typeof img.size === 'string' ? parseInt(img.size, 10) : img.size
        }));
        setImages(prev => [...prev, ...processedImages]);
    };

    // Remove image by index
    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // Clear all images
    const clearImages = () => {
        setImages([]);
    };

    useEffect(() => {
        const fetchImages = async () => {
            try {
                // console.log('Attempting to fetch images...');
                const response = await fetch(`${API_BASE_URL}/api/images`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                // Get response as text first to debug
                const text = await response.text();
                // console.log('Raw response:', text);
                
                // Only try to parse if we have content
                if (!text) {
                    console.log('Empty response received');
                    setImages([]);
                    return;
                }
                
                // Parse the JSON and ensure size is a number
                const data = JSON.parse(text);
                const processedData = data.map(img => ({
                    ...img,
                    size: typeof img.size === 'string' ? parseInt(img.size, 10) : img.size
                }));
                // console.log('Processed data:', processedData);
                setImages(processedData);
                
            } catch (error) {
                console.error('Error fetching images:', error);
                if (error.message.includes('Failed to fetch')) {
                    console.error('Server might be down or unreachable. Please check if the server is running on port 3000');
                } else if (error instanceof SyntaxError) {
                    console.error('Invalid JSON response from server');
                }
            }
        };

        fetchImages();
    }, []);

    // Delete image from server and state
    const deleteImage = async (image) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/images/${image.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || 'Failed to delete image');
            }

            // Remove from state only after successful deletion
            setImages(prev => prev.filter(img => img.id !== image.id));
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    };

    const value = {
        images,
        addImages,
        removeImage,
        clearImages,
        deleteImage
    };

    return (
        <ImageContext.Provider
            value={value}
        >
            {children}
        </ImageContext.Provider>
    );
};

export const useImages = () => {
    const context = useContext(ImageContext);
    if (!context) {
        throw new Error('useImages must be used within an ImageProvider');
    }
    return context;
};