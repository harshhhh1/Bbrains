import csv from 'csv-parser';
import fs from 'fs';

/**
 * Process CSV file and return parsed data with validation
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Array>} - Array of parsed objects
 */
export const processCSVFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim().toLowerCase().replace(/^\uFEFF/, ''),
        mapValues: ({ value }) => value.trim()
      }))
      .on('data', (data) => {
        // Skip empty rows (where all values are empty strings)
        const hasData = Object.values(data).some(val => val !== undefined && val !== null && val.trim() !== '');
        if (hasData) {
          results.push(data);
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * Validate required fields in CSV data
 * @param {Array} data - Parsed CSV data
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Validation result with errors if any
 */
export const validateCSVData = (data, requiredFields) => {
  const errors = [];
  
  if (!Array.isArray(data) || data.length === 0) {
    errors.push({ row: 0, message: 'CSV file is empty or invalid' });
    return { isValid: false, errors };
  }
  
  // Check header
  const firstRow = data[0];
  const missingFields = requiredFields.filter(field => !(field in firstRow));
  if (missingFields.length > 0) {
    errors.push({ 
      row: 0, 
      message: `Missing required columns: ${missingFields.join(', ')}` 
    });
    return { isValid: false, errors };
  }
  
  // Validate each row
  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      const value = row[field];
      if (value === undefined || value === null || value.trim() === '') {
        errors.push({ 
          row: index + 1, // 1-based for user-friendly reporting
          field: field,
          message: `${field} is required` 
        });
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Sanitize string for username generation
 * @param {string} str - Input string
 * @returns {string} - Sanitized string
 */
export const sanitizeForUsername = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric
    .replace(/^[\d]+|[\d]+$/g, ''); // Remove leading/trailing numbers
};

/**
 * Generate username from firstname and birth year
 * @param {string} firstname - User's first name
 * @param {string} dob - Date of birth in YYYY-MM-DD format
 * @param {Array} existingUsernames - Array of existing usernames to avoid duplicates
 * @returns {string} - Generated username
 */
export const generateUsername = (firstname, dob, existingUsernames = []) => {
  const birthYear = dob ? dob.split('-')[0] : '0000';
  const sanitizedFirstName = sanitizeForUsername(firstname);
  let username = `${sanitizedFirstName}${birthYear}`;
  
  // Handle duplicates
  let counter = 1;
  const originalUsername = username;
  while (existingUsernames.includes(username)) {
    username = `${originalUsername}_${counter}`;
    counter++;
  }
  
  return username;
};

/**
 * Generate password from firstname and birth year
 * @param {string} firstname - User's first name
 * @param {string} dob - Date of birth in YYYY-MM-DD format
 * @returns {string} - Generated password
 */
export const generatePassword = (firstname, dob) => {
  const birthYear = dob ? dob.split('-')[0] : '0000';
  const sanitizedFirstName = sanitizeForUsername(firstname);
  return `${sanitizedFirstName}${birthYear}`;
};