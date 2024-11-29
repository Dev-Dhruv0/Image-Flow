import React, { useState } from 'react';
import PropTypes from 'prop-types';
import PreviewModal from './PreviewModal';

const ImagePreview = ({ image, onDelete }) => {
  const [showModal, setShowModal] = useState(false);

  if (!image) return null;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Date unavailable';
    }
  };

  return (
    <>
      <div className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 aspect-square">
        <div 
          className="absolute -top-2 -right-2 z-10 cursor-pointer bg-white hover:bg-gray-100 
                    shadow-md rounded-full p-1.5 opacity-0 group-hover:opacity-100 
                    transition-all duration-200 ease-in-out"
          onClick={() => onDelete(image)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </div>
        <img
          src={image.url}
          alt={`Uploaded by ${image.username || 'unknown'}`}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white text-sm">{image.name || 'Untitled'}</p>
            <p className="text-white/70 text-xs">
              Uploaded by: {image.username || 'unknown'}
            </p>
            <p className="text-white/70 text-xs">
              Size: {((image.size || 0) / 1024 / 1024).toFixed(2)} MB
            </p>
            <p className="text-white/70 text-xs">
              {image.uploadedAt ? formatDate(image.uploadedAt) : 'Date unavailable'}
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <PreviewModal
          image={image}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

ImagePreview.propTypes = {
  image: PropTypes.shape({
    url: PropTypes.string.isRequired,
    username: PropTypes.string,
    email: PropTypes.string,
    size: PropTypes.number.isRequired,
    uploadedAt: PropTypes.string,
    name: PropTypes.string
  }).isRequired,
  onDelete: PropTypes.func.isRequired
};

export default ImagePreview;