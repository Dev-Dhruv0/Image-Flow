import React from 'react';
import PropTypes from 'prop-types';

const PreviewModal = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-lg p-4 max-w-[90vw] max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <img
          src={image.url}
          alt={`Uploaded by ${image.username || 'unknown'}`}
          className="max-w-full max-h-[70vh] object-contain mx-auto"
        />
        <div className="mt-4">
          <h3 className="font-semibold">{image.name || 'Untitled'}</h3>
          <p className="text-gray-600 text-sm">Uploaded by: {image.username || 'unknown'}</p>
          <p className="text-gray-600 text-sm">
            Size: {((image.size || 0) / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
    </div>
  );
};

PreviewModal.propTypes = {
  image: PropTypes.shape({
    url: PropTypes.string.isRequired,
    username: PropTypes.string,
    name: PropTypes.string,
    size: PropTypes.number
  }),
  onClose: PropTypes.func.isRequired
};

export default PreviewModal;
