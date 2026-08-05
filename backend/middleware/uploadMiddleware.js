const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const safeField = file.fieldname.replace(/[^a-zA-Z0-9_-]/g, '_');
        cb(null, `${safeField}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`);
    }
});

const allowedVideoTypes = new Set([
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime'
]);

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || allowedVideoTypes.has(file.mimetype)) {
        return cb(null, true);
    }
    cb(new Error('Only image files and MP4, WebM, OGG or MOV videos are allowed.'), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 120 * 1024 * 1024 }
});

module.exports = upload;
