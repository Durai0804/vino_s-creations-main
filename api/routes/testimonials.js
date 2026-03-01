const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const testimonialController = require('../controllers/testimonialController');

// Multer configuration for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
        }
    },
});

// Public routes
router.get('/', testimonialController.getAllTestimonials);

// Protected routes (admin only)
router.post('/', authMiddleware, upload.single('image'), testimonialController.createTestimonial);
router.put('/:id', authMiddleware, upload.single('image'), testimonialController.updateTestimonial);
router.delete('/:id', authMiddleware, testimonialController.deleteTestimonial);

module.exports = router;
