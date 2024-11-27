import { createContext, useContext, useState } from "react";

// Define the context type
const ImageContext = createContext({
    images: [],
    addImages: () => {},
    removeImage: () => {},
    clearImages: () => {},
});

export const ImageProvider = ({ children }) => {
    
    const [images, setImages] = useState([]);

    // Add new Images
    const addImages = (newImages) => {
        setImages(prev => [...prev, ...newImages]);
    };

    // Remove image by index
    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // Clear all images
    const clearImages = () => {
        setImages([]);
    };

    return (
        <ImageContext.Provider
            value={{
                images,
                addImages,
                removeImage,
                clearImages,
            }}
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