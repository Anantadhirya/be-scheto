const multer = require("multer");
const MulterError = require("multer").MulterError;
const path = require('path');



const fileFilter = (req, file, cb) => {
    // Allowed MIME types
    const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];
    // Allowed file extensions
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    // Get file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Check for valid MIME type and file extension
    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
        cb(null, true); // File is accepted
    } else {
        cb(new MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname), false); // Invalid file type or extension
    }
};

const uploadFileToBuffer = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 2,
        files: 1,
    },
    fileFilter,
});

module.exports = {
    uploadFileToBuffer
}