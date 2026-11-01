export async function verifyPayment(input) {
    if (process.env.PAYMENT_MODE === 'manual')
        return { verified: false, reason: 'MANUAL_REVIEW_REQUIRED' };
    return { verified: false, reason: 'PROVIDER_NOT_CONFIGURED' };
}
