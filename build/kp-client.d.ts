import KryptaPayAuthClient from './kp-auth-client';
import { Axios, KryptapayClientOptions } from './lib/types';
import KryptaPayRpcClient from './kp-rpc-client';
import { Upload } from './lib/storage';
import KryptaPayStorageClient from './kp-storage-client';
/**
 * Kryptapay Client.
 *
 * An isomorphic Javascript client for interacting with a web server.
 */
export default class KryptaPayClient {
    protected kryptapayUrl: string;
    protected kryptapayKey: string;
    protected kryptapaySecret: string;
    /**
     * Kryptapay Auth allows to create and manage user sessions for access to data that is secured by access policies.
     */
    auth: KryptaPayAuthClient;
    /**
     * Kryptapay Rpc allows to call remote functions from url.
     */
    rpc: KryptaPayRpcClient;
    /**
     * Kryptapay storage allows CRUD operations on file.
     */
    storage: KryptaPayStorageClient;
    protected authUrl: string;
    protected rpcUrl: string;
    protected storageUrl: string;
    protected storageKey: string;
    protected fetch?: Axios;
    protected upload?: Upload;
    protected headers: {
        [key: string]: string;
    };
    /**
     * Create a new client for use in the app.
     * @param kryptapayUrl The unique Kryptapay URL which is supplied when you create a new project in your project dashboard.
     * @param kryptapayKey The unique Kryptapay Key which is supplied when you create a new project in your project dashboard.
     * @param kryptapaySecret The unique Kryptapay secret which is supplied when you create a new project in your project dashboard.
     * @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
     * @param options.global.fetch A custom fetch implementation.
     * @param options.global.headers Any additional headers to send with each network request.
     */
    constructor(kryptapayUrl: string, kryptapayKey: string, kryptapaySecret: string, options?: KryptapayClientOptions);
    private _getAccessToken;
    private _initKryptapayAuthClient;
    private _initKryptapayRpcClient;
    private _initKryptapayStorageClient;
}
