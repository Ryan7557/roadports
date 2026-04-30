const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Strip trailing slash and /rest/v1 path to get the project base URL
const rawUrl = process.env.SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

// Use service_role key for backend — bypasses RLS for server-side uploads
// Never expose this key in the frontend!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase env vars not set. Image uploads will fail.');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const BUCKET = 'pothole-images';

/**
 * Upload a local file to Supabase Storage.
 * Returns the public URL of the uploaded image.
 * @param {string} filePath - Absolute path to the temp file on disk
 * @param {string} fileName - Desired file name in the bucket
 * @param {string} mimeType - MIME type, e.g. 'image/jpeg'
 * @returns {Promise<string>} Public URL
 */
async function uploadImage(filePath, fileName, mimeType) {
    const fileBuffer = fs.readFileSync(filePath);

    const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, fileBuffer, {
            contentType: mimeType || 'image/jpeg',
            upsert: true
        });

    if (error) {
        console.error('❌ Supabase upload error:', error.message);
        throw new Error(`Supabase upload failed: ${error.message}`);
    }

    // Get the public URL
    const { data: publicData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(data.path);

    console.log('✅ Supabase upload success:', publicData.publicUrl);
    return publicData.publicUrl;
}

/**
 * Delete a file from Supabase Storage by its path inside the bucket.
 * @param {string} filePath - Path within the bucket, e.g. 'pothole-123.jpg'
 */
async function deleteImage(filePath) {
    const { error } = await supabase.storage
        .from(BUCKET)
        .remove([filePath]);

    if (error) {
        console.error('⚠️  Supabase delete error:', error.message);
    }
}

/**
 * Verifies the Supabase connection by listing buckets.
 * Call this on server startup for a health check log.
 */
async function verifyConnection() {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error('❌ Supabase connection failed:', error.message);
    } else {
        const bucketNames = data.map(b => b.name).join(', ') || 'none';
        console.log(`✅ Supabase connected | Buckets: [${bucketNames}]`);
    }
}

module.exports = { supabase, uploadImage, deleteImage, verifyConnection, BUCKET };
