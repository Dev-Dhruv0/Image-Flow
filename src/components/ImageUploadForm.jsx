import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "../schemas/formSchema";
import { useImages } from "../context/ImageContext";
import PreviewModal from "./PreviewModal";
import { API_BASE_URL } from "../config";

const ImageUploadForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addImages } = useImages(); // Only get addImages from context
  const [localImages, setLocalImages] = useState([]); // New local state for form preview
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    console.log("Files selected: ", files);
    setError("");

    if (files.length + localImages.length > 5) {
      setError(
        `You can only upload up to 5 images. You already have ${localImages.length} images.`
      );
      e.target.value = "";
      return;
    }

    const invalidFiles = files.filter(
      (file) => !["image/jpeg", "image/jpg", "image/png"].includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setError("Only JPG, JPEG, and PNG files are allowed");
      e.target.value = "";
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);

    if (oversizedFiles.length > 0) {
      setError("Each file must be less than 5MB");
      e.target.value = "";
      return;
    }

    const imageFiles = files.map((file) => ({ file }));
    console.log("Adding Images: ", imageFiles);
    setLocalImages((prev) => [...prev, ...imageFiles]); // Update local state
    e.target.value = "";
  };

  const removeLocalImage = (index) => {
    setLocalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    try {
      if (localImages.length === 0) {
        setError("Please upload at least one image");
        return;
      }

      setIsSubmitting(true);
      setError(""); // Clear any previous errors

      // Upload each image one by one
      for (const img of localImages) {
        try {
          console.log('Uploading image:', img.file.name);
          
          // Create FormData for each image
          const formData = new FormData();
          formData.append("file", img.file);
          formData.append("username", data.username || '');
          formData.append("email", data.email || '');

          const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: "POST",
            body: formData,
          });

          const result = await response.json();
          // console.log('Upload response:', result);

          if (!response.ok) {
            throw new Error(`Upload failed: ${result.error}${result.details ? ': ' + result.details : ''}`);
          }

          if (!result.url || !result.size) {
            throw new Error('Invalid response from server');
          }

          console.log('Upload successful:', result);

          // Add the uploaded image to context with user data
          addImages([
            {
              url: result.url,
              size: result.size,
              uploadedAt: result.uploadedAt || new Date().toISOString(),
              name: img.file.name,
              username: data.username || null,
              email: data.email || null,
              id: result.id
            },
          ]);

          // Remove the successfully uploaded image from local state
          setLocalImages((prev) => prev.filter((localImg) => localImg.file !== img.file));
        } catch (error) {
          console.error(`Failed to upload ${img.file.name}:`, error);
          setError(`Failed to upload ${img.file.name}: ${error.message}`);
          // Don't break the loop, continue with next image
        }
      }

      if (localImages.length === 0) {
        // All uploads successful
        reset();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setError(`Upload failed: ${error.message}`);
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
              {...register("username")}
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
              {...register("email")}
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

          {/* Image Upload Input */}
          <div className="relative">
            <div className="relative group">
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/jpeg,image/jpg,image/png"
                multiple
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
                  <p className="text-xs text-purple-400 mt-1">
                    PNG, JPG, JPEG (max 5 files)
                  </p>
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

        {/* Preview Section */}
        {localImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {localImages.map((img, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-lg overflow-visible"
              >
                <img
                  src={URL.createObjectURL(img.file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div 
                  onClick={() => removeLocalImage(index)}
                  className="absolute -top-2 -right-2 z-10 cursor-pointer bg-white hover:bg-gray-100 
                            shadow-md rounded-full p-1.5 opacity-0 group-hover:opacity-100 
                            transition-all duration-200 ease-in-out"
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
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full px-4 py-3 rounded-xl text-white font-medium
                    ${
                      isSubmitting
                        ? "bg-purple-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700"
                    }
                    transition-colors duration-200`}
        >
          {isSubmitting ? "Uploading..." : "Upload Images"}
        </button>
      </form>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={localImages}
      />
    </div>
  );
};

export default ImageUploadForm;
