import { DEFAULT_HEADERS, STORAGE_KEY } from './lib/constants';
import { stripTrailingSlash, applySettingDefaults } from './lib/helpers';
import KryptaPayAuthClient from './kp-auth-client';
import {
    Axios,
    KryptapayClientOptions,
    KryptapayAuthClientOptions,
} from './lib/types';
import KryptaPayRpcClient from './kp-rpc-client';
import { Buffer } from 'buffer';
import { fetchWithAuth } from './lib/fetch';
import { Upload, uploadWithAuth } from './lib/storage';
import KryptaPayStorageClient from './kp-storage-client';

const DEFAULT_GLOBAL_OPTIONS = {
    headers: DEFAULT_HEADERS,
};

const DEFAULT_AUTH_OPTIONS: KryptapayAuthClientOptions = {
    persistSession: true,
    storageKey: STORAGE_KEY,
};

/**
 * Kryptapay Client.
 *
 * An isomorphic Javascript client for interacting with a web server.
 */
export default class KryptaPayClient {
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
    constructor(
        protected kryptapayUrl: string,
        protected kryptapayKey: string,
        protected kryptapaySecret: string,
        options?: KryptapayClientOptions
    ) {
        if (!kryptapayUrl) throw new Error('kryptapayUrl is required.');
        if (!kryptapayKey) throw new Error('kryptapayKey is required.');
        if (!kryptapaySecret) throw new Error('kryptapaySecret is required.');

        const _kryptapayUrl = stripTrailingSlash(kryptapayUrl);

        this.authUrl = `${_kryptapayUrl}/auth`;
        this.rpcUrl = `${_kryptapayUrl}`;
        this.storageUrl = `${_kryptapayUrl}/storage`;

        const DEFAULTS = {
            auth: { ...DEFAULT_AUTH_OPTIONS },
            global: DEFAULT_GLOBAL_OPTIONS,
        };

        const settings = applySettingDefaults(options ?? {}, DEFAULTS);

        this.storageKey = settings.auth?.storageKey ?? '';
        this.headers = settings.global?.headers ?? {};

        this.auth = this._initKryptapayAuthClient(
            settings.auth ?? {},
            this.headers,
            settings.global?.fetch
        );
        this.fetch = fetchWithAuth(
            this._getAccessToken.bind(this),
            settings.global?.fetch
        );
        this.rpc = this._initKryptapayRpcClient(this.headers, this.fetch);
        this.upload = uploadWithAuth(
            this._getAccessToken.bind(this),
            settings.global?.store
        );
        this.storage = this._initKryptapayStorageClient(
            this.headers,
            this.upload
        );
    }

    private async _getAccessToken() {
        const result = await this.auth.getSession();
        return result?.data?.session?.accessToken?.value ?? null;
    }

    private _initKryptapayAuthClient(
        { persistSession, storageKey }: KryptapayAuthClientOptions,
        headers?: Record<string, string>,
        fetch?: Axios
    ) {
        const buffer = Buffer.from(
            this.kryptapayKey + ':' + this.kryptapaySecret
        ).toString('base64');
        const authHeaders = {
            Authorization: `Basic ${buffer}`,
        };
        return new KryptaPayAuthClient({
            url: this.authUrl,
            headers: { ...authHeaders, ...headers },
            storageKey: storageKey,
            persistSession,
            fetch,
        });
    }

    private _initKryptapayRpcClient(
        headers?: Record<string, string>,
        fetch?: Axios
    ) {
        return new KryptaPayRpcClient({
            url: this.rpcUrl,
            headers: { ...headers },
            customFetch: fetch,
        });
    }

    private _initKryptapayStorageClient(
        headers?: Record<string, string>,
        upload?: Upload
    ) {
        return new KryptaPayStorageClient({
            url: this.storageUrl,
            headers: { ...headers },
            upload,
        });
    }
}
