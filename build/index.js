import KryptapayClient from './kp-client';
/**
 * Creates a new Kryptapay Client.
 */
export const createClient = (kryptapayUrl, kryptapayKey, kryptapaySecret, options) => {
    return new KryptapayClient(kryptapayUrl, kryptapayKey, kryptapaySecret, options);
};
