var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { DEFAULT_HEADERS, STORAGE_KEY } from './lib/constants';
import { stripTrailingSlash, applySettingDefaults } from './lib/helpers';
import KryptaPayAuthClient from './kp-auth-client';
import KryptaPayRpcClient from './kp-rpc-client';
import { Buffer } from 'buffer';
import { fetchWithAuth } from './lib/fetch';
import { uploadWithAuth } from './lib/storage';
import KryptaPayStorageClient from './kp-storage-client';
const DEFAULT_GLOBAL_OPTIONS = {
    headers: DEFAULT_HEADERS,
};
const DEFAULT_AUTH_OPTIONS = {
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
     * Create a new client for use in the app.
     * @param kryptapayUrl The unique Kryptapay URL which is supplied when you create a new project in your project dashboard.
     * @param kryptapayKey The unique Kryptapay Key which is supplied when you create a new project in your project dashboard.
     * @param kryptapaySecret The unique Kryptapay secret which is supplied when you create a new project in your project dashboard.
     * @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
     * @param options.global.fetch A custom fetch implementation.
     * @param options.global.headers Any additional headers to send with each network request.
     */
    constructor(kryptapayUrl, kryptapayKey, kryptapaySecret, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        this.kryptapayUrl = kryptapayUrl;
        this.kryptapayKey = kryptapayKey;
        this.kryptapaySecret = kryptapaySecret;
        if (!kryptapayUrl)
            throw new Error('kryptapayUrl is required.');
        if (!kryptapayKey)
            throw new Error('kryptapayKey is required.');
        if (!kryptapaySecret)
            throw new Error('kryptapaySecret is required.');
        const _kryptapayUrl = stripTrailingSlash(kryptapayUrl);
        this.authUrl = `${_kryptapayUrl}/auth`;
        this.rpcUrl = `${_kryptapayUrl}`;
        this.storageUrl = `${_kryptapayUrl}/storage`;
        const DEFAULTS = {
            auth: Object.assign({}, DEFAULT_AUTH_OPTIONS),
            global: DEFAULT_GLOBAL_OPTIONS,
        };
        const settings = applySettingDefaults(options !== null && options !== void 0 ? options : {}, DEFAULTS);
        this.storageKey = (_b = (_a = settings.auth) === null || _a === void 0 ? void 0 : _a.storageKey) !== null && _b !== void 0 ? _b : '';
        this.headers = (_d = (_c = settings.global) === null || _c === void 0 ? void 0 : _c.headers) !== null && _d !== void 0 ? _d : {};
        this.auth = this._initKryptapayAuthClient((_e = settings.auth) !== null && _e !== void 0 ? _e : {}, this.headers, (_f = settings.global) === null || _f === void 0 ? void 0 : _f.fetch);
        this.fetch = fetchWithAuth(this._getAccessToken.bind(this), (_g = settings.global) === null || _g === void 0 ? void 0 : _g.fetch);
        this.rpc = this._initKryptapayRpcClient(this.headers, this.fetch);
        this.upload = uploadWithAuth(this._getAccessToken.bind(this), (_h = settings.global) === null || _h === void 0 ? void 0 : _h.store);
        this.storage = this._initKryptapayStorageClient(this.headers, this.upload);
    }
    _getAccessToken() {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.auth.getSession();
            return (_d = (_c = (_b = (_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.session) === null || _b === void 0 ? void 0 : _b.accessToken) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : null;
        });
    }
    _initKryptapayAuthClient({ persistSession, storageKey }, headers, fetch) {
        const buffer = Buffer.from(this.kryptapayKey + ':' + this.kryptapaySecret).toString('base64');
        const authHeaders = {
            Authorization: `Basic ${buffer}`,
        };
        return new KryptaPayAuthClient({
            url: this.authUrl,
            headers: Object.assign(Object.assign({}, authHeaders), headers),
            storageKey: storageKey,
            persistSession,
            fetch,
        });
    }
    _initKryptapayRpcClient(headers, fetch) {
        return new KryptaPayRpcClient({
            url: this.rpcUrl,
            headers: Object.assign({}, headers),
            customFetch: fetch,
        });
    }
    _initKryptapayStorageClient(headers, upload) {
        return new KryptaPayStorageClient({
            url: this.storageUrl,
            headers: Object.assign({}, headers),
            upload,
        });
    }
}
