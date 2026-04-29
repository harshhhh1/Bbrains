import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud00inary_api_url: process.env.CLOUDINARY_URL
});

/**
 * Extracts the public ID from a Cloudinary URL.
 * Example: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/image.png -> folder/image
 * @param {string} url - The Cloudinary URL
 * @returns {string|null} - The public ID or null if not found
 */
export const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  
  try {
    // Split by '/upload/' or '/fetch/' etc.
    const parts = url.split(/\/(?:upload|fetch|video|raw)\//);
    if (parts.length < 2) return null;
    
    // The second part starts with optional version (e.g., v12345678/) and then the public ID
    let publicIdWithExtension = parts[1].replace(/^v\d+\//, '');
    
    // Remove the extension
    const lastDotIndex = publicIdWithExtension.lastIndexOf('.');
    return lastDotIndex !== -1 ? publicIdWithExtension.substring(0, lastDotIndex) : publicIdWithExtension;
  } catch (error) {
    console.error('Error extracting public ID from Cloudinary URL:', error);
    return null;
  }
};

/**
 * Deletes an image from Cloudinary by its URL.
 * @param {string} url - The Cloudinary URL of the image to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export const deleteFromCloudinary = async (url) => {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return false;
  
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary deletion failed:', error);
    return false;
  }
};

export default cloudinary;
