import React from "react";
import { useImages } from "../context/ImageContext";
import ImageGrid from "./ImageGrid";

const Gallery = () => {
  const { images } = useImages();

  console.log("Gallery Images: ", images);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date unavailable';
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-purple-900/60">
          No images uploaded yet. Head to the Upload page to add
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto hide-scrollbar w-full">
      <ImageGrid images={images} formatDate={formatDate} />
      <style>
        {`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default Gallery;
