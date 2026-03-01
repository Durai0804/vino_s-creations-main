const supabase = require('../config/supabase');
const { db } = require('../config/firebase');
const crypto = require('crypto');
const path = require('path');

const STORAGE_BUCKET = 'product-images';
const COLLECTION = 'testimonials';

/**
 * Upload an image to Supabase Storage and return the public URL.
 */
async function uploadImage(file) {
    const ext = path.extname(file.originalname);
    const filename = `testimonials/${crypto.randomUUID()}${ext}`;

    const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filename);

    return publicUrl;
}

/**
 * Delete an image from Supabase Storage by URL.
 */
async function deleteImage(imageUrl) {
    try {
        const parts = imageUrl.split(`${STORAGE_BUCKET}/`);
        const filename = parts[parts.length - 1];

        if (filename) {
            const { error } = await supabase
                .storage
                .from(STORAGE_BUCKET)
                .remove([filename]);

            if (error) throw error;
        }
    } catch (error) {
        console.error('Failed to delete testimonial image from Supabase:', error.message);
    }
}

// GET all testimonials
exports.getAllTestimonials = async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database not initialized.' });
        }
        const snapshot = await db.collection(COLLECTION).orderBy('created_at', 'desc').get();
        const testimonials = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json({ testimonials });
    } catch (error) {
        console.error('Get all testimonials error:', error.message);
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
};

// POST create testimonial
exports.createTestimonial = async (req, res) => {
    try {
        const { name, role, content, rating } = req.body;

        if (!name || !content || rating === undefined) {
            return res.status(400).json({ error: 'Name, content, and rating are required' });
        }

        const ratingNum = Number(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        let image_url = null;
        if (req.file) {
            console.log('Uploading testimonial image to Supabase...');
            image_url = await uploadImage(req.file);
            console.log('Testimonial image uploaded:', image_url);
        }

        const testimonialData = {
            name,
            role: role || null,
            content,
            rating: ratingNum,
            image_url,
            created_at: new Date().toISOString(),
        };

        const docRef = await db.collection(COLLECTION).add(testimonialData);
        res.status(201).json({
            testimonial: { id: docRef.id, ...testimonialData }
        });
    } catch (error) {
        console.error('Create testimonial error:', error.message);
        res.status(500).json({ error: 'Failed to create testimonial' });
    }
};

// DELETE testimonial
exports.deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;

        const doc = await db.collection(COLLECTION).doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }

        // Clean up image from Supabase if exists
        const data = doc.data();
        if (data.image_url) {
            await deleteImage(data.image_url);
        }

        await db.collection(COLLECTION).doc(id).delete();
        res.json({ message: 'Testimonial deleted successfully' });
    } catch (error) {
        console.error('Delete testimonial error:', error.message);
        res.status(500).json({ error: 'Failed to delete testimonial' });
    }
};
