const multer = require('multer')

const errorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.error(err.stack)
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: 'Tipe file tidak sesuai' });
        } else if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File melebihi maksimal' });
        }
        return res.status(400).json({ error: err.message });
    }
    console.error(err.stack)
    res.status(500).json({ message: 'Something went wrong' })
}

module.exports = errorHandler