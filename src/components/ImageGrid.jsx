import React from 'react';
import ImagePreview from './ImagePreview';
import { useImages } from '../context/ImageContext';

const ImageGrid = () => {
  const { images, deleteImage } = useImages();

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-purple-900/60">
          No images uploaded yet. Head to the Upload page to add
        </p>
      </div>
    );
  }

  const handleDelete = async (image) => {
    try {
      await deleteImage(image);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <ImagePreview 
          key={image.url || index}
          image={image}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default ImageGrid;