import mongoose from 'mongoose';
const bucketName = 'paymentProofs';
function getBucket() {
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error('MongoDB connection is not ready.');
    }
    return new mongoose.mongo.GridFSBucket(db, {
        bucketName
    });
}
export async function savePaymentProof(buffer, userId, contentType) {
    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(`payment-proof-${Date.now()}`, {
        contentType,
        metadata: {
            userId,
            kind: 'payment-proof'
        }
    });
    return await new Promise((resolve, reject) => {
        uploadStream.on('error', reject);
        uploadStream.on('finish', () => {
            resolve(String(uploadStream.id));
        });
        uploadStream.end(buffer);
    });
}
export async function paymentProofFile(proofId) {
    if (!mongoose.Types.ObjectId.isValid(proofId)) {
        return null;
    }
    const bucket = getBucket();
    const files = await bucket
        .find({
        _id: new mongoose.Types.ObjectId(proofId)
    })
        .toArray();
    return files[0] || null;
}
export function paymentProofStream(proofId) {
    if (!mongoose.Types.ObjectId.isValid(proofId)) {
        throw new Error('Invalid payment proof id.');
    }
    const bucket = getBucket();
    return bucket.openDownloadStream(new mongoose.Types.ObjectId(proofId));
}
export async function paymentProofExists(proofId, userId) {
    const file = await paymentProofFile(proofId);
    if (!file) {
        return false;
    }
    return (String(file.metadata?.userId || '') ===
        String(userId));
}
