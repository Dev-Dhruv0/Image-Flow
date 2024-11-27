import React from "react";
import { useImages } from "../context/ImageContext";

const Gallery = () => {
  const { images } = useImages();

  console.log('Gallery Images: ', images);

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
    <div className="max-h-[60vh] overflow-y-auto scrollbar-hide w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <img 
              src={URL.createObjectURL(image.file)}
              alt={`Uploaded ${index + 1}`}
              className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white text-sm">
                  {image.file.name}
                </p>
                <p className="text-white/70 text-xs">
                {(image.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;     /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;             /* Chrome, Safari and Opera */
        }
      `}</style>
    </div>
  );
};

export default Gallery;