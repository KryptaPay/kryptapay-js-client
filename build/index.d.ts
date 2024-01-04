import KryptapayClient from './kp-client';
import type { KryptapayClientOptions } from './lib/types';
/**
 * Creates a new Kryptapay Client.
 */
export declare const createClient: (kryptapayUrl: string, kryptapayKey: string, kryptapaySecret: string, options?: KryptapayClientOptions) => KryptapayClient;
