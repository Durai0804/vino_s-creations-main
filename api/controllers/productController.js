const supabase = require('../config/supabase');
const { db } = require('../config/firebase');
const crypto = require('crypto');
const path = require('path');

const STORAGE_BUCKET = 'product-images';
const COLLECTION = 'products';

/**
 * Upload an image to Supabase Storage and return the public URL.
 */
async function uploadImage(file) {
    const ext = path.extname(file.originalname);
    const filename = `${crypto.randomUUID()}${ext}`;

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
        console.error('Failed to delete image from Supabase:', error.message);
    }
}

// GET all products
exports.getAllProducts = async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database not initialized. Please check FIREBASE_SERVICE_ACCOUNT in your Vercel settings.' });
        }
        const snapshot = await db.collection(COLLECTION).orderBy('created_at', 'desc').get();
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json({ products });
    } catch (error) {
        console.error('Get all products error:', error.message);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

// GET single product
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection(COLLECTION).doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ product: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error('Get product error:', error.message);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

// POST create product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, size, price, material, usage_suggestion } = req.body;
        console.log('--- Creating Product (Multi-Image) ---');
        console.log('Body:', req.body);
        console.log('Files:', req.files ? req.files.map(f => f.originalname) : 'No files');

        if (!name || !description || !size) {
            return res.status(400).json({ error: 'Name, description, and size are required' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'At least one product image is required' });
        }

        console.log(`Uploading ${req.files.length} images to Supabase...`);
        const image_urls = [];
        for (const file of req.files) {
            const url = await uploadImage(file);
            image_urls.push(url);
        }
        console.log('Images uploaded successfully:', image_urls);

        const productData = {
            name,
            description,
            size, // Now a user-given string
            price: price || null,
            material: material || null,
            usage_suggestion: usage_suggestion || null,
            image_urls,
            image_url: image_urls[0], // Main thumbnail (first image)
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const docRef = await db.collection(COLLECTION).add(productData);
        res.status(201).json({
            product: { id: docRef.id, ...productData }
        });
    } catch (error) {
        console.error('Create product error:', error.message);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

// PUT update product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, size, price, material, usage_suggestion, existing_image_urls } = req.body;

        if (!name || !description || !size) {
            return res.status(400).json({ error: 'Name, description, and size are required' });
        }

        const docRef = db.collection(COLLECTION).doc(id);
        const productSnap = await docRef.get();
        if (!productSnap.exists) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const oldProduct = productSnap.data();

        // Parse existing images if any (they come as strings from req.body)
        let kept_image_urls = [];
        if (existing_image_urls) {
            kept_image_urls = Array.isArray(existing_image_urls) ? existing_image_urls : [existing_image_urls];
        }

        // 1. Identify and delete removed images from Supabase
        const old_urls = oldProduct.image_urls || [oldProduct.image_url];
        const removed_urls = old_urls.filter(url => !kept_image_urls.includes(url));

        if (removed_urls.length > 0) {
            console.log(`Cleaning up ${removed_urls.length} orphaned images...`);
            for (const url of removed_urls) {
                try {
                    const filename = url.split('/').pop();
                    await supabase.storage
                        .from('vinos-creation-images')
                        .remove([filename]);
                } catch (delErr) {
                    console.error('Failed to cleanup image:', url, delErr.message);
                }
            }
        }

        const updates = {
            name,
            description,
            size,
            price: price || null,
            material: material || null,
            usage_suggestion: usage_suggestion || null,
            image_urls: kept_image_urls,
            updated_at: new Date().toISOString(),
        };

        // 2. If new images provided, upload them and add to list
        if (req.files && req.files.length > 0) {
            console.log(`Adding ${req.files.length} new images...`);
            for (const file of req.files) {
                const url = await uploadImage(file);
                updates.image_urls.push(url);
            }
        }

        // Set primary image_url to the first one in the final list
        updates.image_url = updates.image_urls[0] || '';

        await docRef.update(updates);
        const updatedDoc = await docRef.get();

        res.json({
            product: { id: updatedDoc.id, ...updatedDoc.data() }
        });
    } catch (error) {
        console.error('Update product error:', error.message);
        res.status(500).json({ error: 'Failed to update product' });
    }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const doc = await db.collection(COLLECTION).doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            const imagesToDelete = data.image_urls || [data.image_url];

            console.log(`Deleting ${imagesToDelete.length} images from Supabase...`);
            for (const url of imagesToDelete) {
                if (url) await deleteImage(url);
            }
        }

        await db.collection(COLLECTION).doc(id).delete();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error.message);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
