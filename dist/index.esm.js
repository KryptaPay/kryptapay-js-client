import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const version = '0.1.0';

// constants.ts
const DEFAULT_HEADERS = { 'X-Client-Info': `kryptapay-js/${version}` };
const STORAGE_KEY = 'kryptapay.auth.token';

function stripTrailingSlash(url) {
    return url.replace(/\/$/, '');
}
function applySettingDefaults(options, defaults) {
    const { auth: authOptions, global: globalOptions } = options;
    const { auth: DEFAULT_AUTH_OPTIONS, global: DEFAULT_GLOBAL_OPTIONS } = defaults;
    return {
        auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS), authOptions),
        global: Object.assign(Object.assign({}, DEFAULT_GLOBAL_OPTIONS), globalOptions),
    };
}
const looksLikeAxiosResponse = (maybeResponse) => {
    return (typeof maybeResponse === 'object' &&
        maybeResponse !== null &&
        'status' in maybeResponse &&
        'data' in maybeResponse &&
        'headers' in maybeResponse);
};
const setItemAsync = (key, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield SecureStore.setItemAsync(key, JSON.stringify(data));
});
const getItemAsync = (key) => __awaiter(void 0, void 0, void 0, function* () {
    const value = yield SecureStore.getItemAsync(key);
    if (!value) {
        return null;
    }
    try {
        return JSON.parse(value);
    }
    catch (_a) {
        return value;
    }
});
const removeItemAsync = (key) => __awaiter(void 0, void 0, void 0, function* () {
    yield SecureStore.deleteItemAsync(key);
});

class AuthError extends Error {
    constructor(message, status) {
        super(message);
        this.__isAuthError = true;
        this.name = 'AuthError';
        this.status = status;
    }
}
function isAuthError(error) {
    return typeof error === 'object' && error !== null && '__isAuthError' in error;
}
class AuthApiError extends AuthError {
    constructor(message, status) {
        super(message, status);
        this.name = 'AuthApiError';
        this.status = status;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
        };
    }
}
function isAuthApiError(error) {
    return isAuthError(error) && error.name === 'AuthApiError';
}
class AuthUnknownError extends AuthError {
    constructor(message, originalError) {
        super(message);
        this.name = 'AuthUnknownError';
        this.originalError = originalError;
    }
}
class CustomAuthError extends AuthError {
    constructor(message, name, status) {
        super(message);
        this.name = name;
        this.status = status;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
        };
    }
}
class AuthInvalidTokenResponseError extends CustomAuthError {
    constructor() {
        super('Auth session or user missing', 'AuthInvalidTokenResponseError', 500);
    }
}
class AuthInvalidCredentialsError extends CustomAuthError {
    constructor(message) {
        super(message, 'AuthInvalidCredentialsError', 400);
    }
}
class AuthRetryableFetchError extends CustomAuthError {
    constructor(message, status) {
        super(message, 'AuthRetryableFetchError', status);
    }
}

const resolveFetch = (customFetch) => {
    let _fetch;
    if (customFetch) {
        _fetch = customFetch;
    }
    else {
        _fetch = axios;
    }
    return (...args) => _fetch(...args);
};
const fetchWithAuth = (getAccessToken, customFetch) => {
    const fetcher = resolveFetch(customFetch);
    return (input) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const accessToken = (_a = (yield getAccessToken())) !== null && _a !== void 0 ? _a : null;
        input.headers.Authorization = `Bearer ${accessToken}`;
        return fetcher(input);
    });
};
const _getErrorMessage = (err) => {
    var _a;
    return (((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.error_description) ||
        (err === null || err === void 0 ? void 0 : err.data) ||
        (err === null || err === void 0 ? void 0 : err.msg) ||
        (err === null || err === void 0 ? void 0 : err.message) ||
        (err === null || err === void 0 ? void 0 : err.error_description) ||
        (err === null || err === void 0 ? void 0 : err.error) ||
        require('flatted').stringify(err));
};
const handleError = (error, reject) => __awaiter(void 0, void 0, void 0, function* () {
    const NETWORK_ERROR_CODES = [502, 503, 504];
    if (Object.hasOwn(error, 'response')) {
        const response = error.response;
        if (!looksLikeAxiosResponse(response)) {
            reject(new AuthRetryableFetchError(_getErrorMessage(response), response.status));
        }
        else if (NETWORK_ERROR_CODES.includes(response.status)) {
            reject(new AuthRetryableFetchError(_getErrorMessage(response), response.status));
        }
        else {
            reject(new AuthApiError(_getErrorMessage(response), response.status || 500));
        }
    }
    else {
        reject(new AuthUnknownError(_getErrorMessage(error), error));
    }
});
function _request(fetcher, method, url, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const headers = Object.assign({}, options === null || options === void 0 ? void 0 : options.headers);
        if (options === null || options === void 0 ? void 0 : options.jwt) {
            headers['Authorization'] = `Bearer ${options.jwt}`;
        }
        const data = yield _handleRequest(fetcher, method, url, { headers, noResolveJson: options === null || options === void 0 ? void 0 : options.noResolveJson }, options === null || options === void 0 ? void 0 : options.body);
        return { data: Object.assign({}, data), error: null };
    });
}
function _handleRequest(fetcher, method, url, options, body) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fetcher(Object.assign({ url,
                method, headers: options === null || options === void 0 ? void 0 : options.headers }, body))
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                handleError(error, reject);
            });
        });
    });
}

const DEFAULT_OPTIONS = {
    storageKey: STORAGE_KEY,
    persistSession: true,
    headers: DEFAULT_HEADERS,
};
class KryptaPayAuthClient {
    /**
     * Create a new client for use in the app.
     */
    constructor(options) {
        // protected storage: SupportedStorage
        /**
         * Keeps track of the async client initialization.
         * When null or not yet resolved the auth state is `unknown`
         * Once resolved the the auth state is known and it's save to call any further client methods.
         * Keep extra care to never reject or throw uncaught errors
         */
        this.initializePromise = null;
        const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
        this.inMemorySession = null;
        this.storageKey = settings.storageKey;
        this.persistSession = settings.persistSession;
        this.url = settings.url;
        this.headers = settings.headers;
        this.fetch = axios;
        this.initialize();
    }
    /**
     * Initializes the client session from storage.
     * This method is automatically called when instantiating the client
     */
    initialize() {
        if (!this.initializePromise) {
            this.initializePromise = this._initialize();
        }
        return this.initializePromise;
    }
    /**
     * IMPORTANT:
     * 1. Never throw in this method, as it is called from the constructor
     * 2. Never return a session from this method as it would be cached over
     *    the whole lifetime of the client
     */
    _initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initializePromise) {
                return this.initializePromise;
            }
            try {
                yield this._recoverAndRefresh();
                return { error: null };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { error };
                }
                return {
                    error: new AuthUnknownError("Unexpected error during initialization", error),
                };
            }
        });
    }
    /**
     * Creates a new user.
     *
     * Be aware that if a user account exists in the system you may get back an
     * error message that attempts to hide this information from the user.
     *
     * @returns A logged-in session and user
     */
    signUp(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._removeSession();
                let res;
                if ("phone" in credentials && "email" in credentials) {
                    const { phone, password, email, userName, country, refererUuid, pushToken, preferredLanguage, } = credentials;
                    res = yield _request(this.fetch, "POST", `${this.url}/signup`, {
                        headers: this.headers,
                        body: {
                            data: {
                                phone,
                                password,
                                email,
                                userName,
                                country,
                                refererUuid,
                                pushToken,
                                preferredLanguage,
                            },
                        },
                    });
                }
                else {
                    throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a password");
                }
                const { data, error } = res;
                if (error || !data) {
                    return { data: { user: null, session: null }, error: error };
                }
                const session = data.session;
                const user = data.user;
                return { data: { user, session }, error: null };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null, session: null }, error };
                }
                throw error;
            }
        });
    }
    /**
     * Log in an existing user with an email and password or phone and password.
     *
     * Be aware that you may get back an error message that will not distinguish
     * between the cases where the account does not exist or that the
     * email/phone and password combination is wrong
     */
    signInWithPassword(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._removeSession();
                let res;
                if ("email" in credentials) {
                    const { email, password } = credentials;
                    res = yield _request(this.fetch, "POST", `${this.url}/token`, {
                        headers: this.headers,
                        body: {
                            data: {
                                username: email,
                                password,
                                grant_type: "password",
                                scope: "user",
                            },
                        },
                    });
                }
                else if ("phone" in credentials) {
                    const { phone, password } = credentials;
                    res = yield _request(this.fetch, "POST", `${this.url}/token`, {
                        headers: this.headers,
                        body: {
                            data: {
                                username: phone,
                                password,
                                grant_type: "password",
                                scope: "user",
                            },
                        },
                    });
                }
                else {
                    throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a password");
                }
                const { data, error } = res;
                if (!data || !data.user) {
                    return {
                        data: { user: null },
                        error: new AuthInvalidTokenResponseError(),
                    };
                }
                return { data: { user: data.user }, error };
            }
            catch (error) {
                if (isAuthApiError(error)) {
                    return { data: { user: null }, error };
                }
                throw error;
            }
        });
    }
    /**
     * Log in a user using a one-time password (OTP).
     */
    signInWithOtp(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._removeSession();
                if ("ROTP" in credentials) {
                    const { userId, ROTP, TOTP, options } = credentials;
                    const res = yield _request(this.fetch, "POST", `${this.url}/otp`, {
                        headers: this.headers,
                        body: {
                            data: {
                                userId,
                                ROTP,
                                TOTP,
                            },
                        },
                    });
                    const { data, error } = res;
                    if (!data || !data.session || !data.user) {
                        return {
                            data: { user: null, session: null },
                            error: new AuthInvalidTokenResponseError(),
                        };
                    }
                    if (data.session) {
                        yield this._saveSession(data.session);
                    }
                    return {
                        data: { user: data.user, session: data.session },
                        error,
                    };
                }
                throw new AuthInvalidCredentialsError("You must provide an ROTP.");
            }
            catch (error) {
                if (isAuthApiError(error)) {
                    return { data: { user: null, session: null }, error };
                }
                throw error;
            }
        });
    }
    /**
     * Log out a user.
     */
    signOut(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._removeSession();
                if ("userId" in credentials) {
                    const { userId, options } = credentials;
                    const res = yield _request(this.fetch, "POST", `${this.url}/signout`, {
                        headers: this.headers,
                        body: {
                            data: {
                                userId,
                            },
                        },
                    });
                    const { data, error } = res;
                    if (!data) {
                        return {
                            data: null,
                            error: new AuthError("Response data is missing"),
                        };
                    }
                    return { data, error };
                }
                else {
                    throw new AuthInvalidCredentialsError("You must provide an userId.");
                }
            }
            catch (error) {
                if (isAuthApiError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.
     */
    resend(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._removeSession();
                const endpoint = `${this.url}/resend`;
                if ("email" in credentials) {
                    const { email, type } = credentials;
                    const { error } = yield _request(this.fetch, "POST", endpoint, {
                        headers: this.headers,
                        body: {
                            email,
                            type,
                        },
                    });
                    return { data: { user: null, session: null }, error };
                }
                else if ("phone" in credentials) {
                    const { phone, type } = credentials;
                    const { error } = yield _request(this.fetch, "POST", endpoint, {
                        headers: this.headers,
                        body: {
                            phone,
                            type,
                        },
                    });
                    return { data: { user: null, session: null }, error };
                }
                throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a type");
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: { user: null, session: null }, error };
                }
                throw error;
            }
        });
    }
    /**
     * Returns the session.
     * The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.
     */
    getSession() {
        return __awaiter(this, void 0, void 0, function* () {
            // save to just await, as long we make sure _initialize() never throws
            // await this.initializePromise
            let currentSession = null;
            if (this.persistSession) {
                const maybeSession = yield getItemAsync(this.storageKey);
                if (maybeSession !== null) {
                    if (this._isValidSession(maybeSession)) {
                        currentSession = maybeSession;
                    }
                    else {
                        yield this._removeSession();
                    }
                }
            }
            else {
                currentSession = this.inMemorySession;
            }
            if (!currentSession) {
                return { data: { session: null }, error: null };
            }
            return { data: { session: currentSession }, error: null };
        });
    }
    /**
     * Sends a security code request to an email address.
     * @param email The email address of the user.
     * @param scope The code scope.
     */
    requestSecuritycode(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { to, scope } = options;
                const res = yield _request(this.fetch, "POST", `${this.url}/code`, {
                    body: {
                        data: {
                            to,
                            scope,
                        },
                        headers: this.headers,
                    },
                });
                const { data, error } = res;
                if (!data) {
                    return {
                        data: null,
                        error: new AuthInvalidTokenResponseError(),
                    };
                }
                return { data, error };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    /**
     * Sends a password reset request to an email address.
     * @param email The email address of the user.
     */
    resetPasswordForEmail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, newPassword, oldPassword, securityCode, scope } = options;
                const res = yield _request(this.fetch, "POST", `${this.url}/recover`, {
                    body: {
                        data: {
                            email,
                            newPassword,
                            oldPassword,
                            securityCode,
                            scope,
                        },
                        headers: this.headers,
                    },
                });
                const { data, error } = res;
                if (!data) {
                    return {
                        data: null,
                        error: new AuthInvalidTokenResponseError(),
                    };
                }
                return { data, error };
            }
            catch (error) {
                if (isAuthError(error)) {
                    return { data: null, error };
                }
                throw error;
            }
        });
    }
    _isValidSession(maybeSession) {
        const isValidSession = typeof maybeSession === "object" &&
            maybeSession !== null &&
            "accessToken" in maybeSession &&
            "user" in maybeSession;
        return isValidSession;
    }
    /**
     * Recovers the session from storage and refreshes
     * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
     */
    _recoverAndRefresh() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentSession = yield getItemAsync(this.storageKey);
                if (!this._isValidSession(currentSession)) {
                    if (currentSession !== null) {
                        yield this._removeSession();
                    }
                    return;
                }
                if (this.persistSession) {
                    yield this._saveSession(currentSession);
                }
            }
            catch (err) {
                console.error(err);
                return;
            }
        });
    }
    /**
     * set currentSession and currentUser
     * process to _startAutoRefreshToken if possible
     */
    _saveSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.persistSession) {
                this.inMemorySession = session;
            }
            if (this.persistSession) {
                yield this._persistSession(session);
            }
        });
    }
    _persistSession(currentSession) {
        return setItemAsync(this.storageKey, currentSession);
    }
    _removeSession() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.persistSession) {
                yield removeItemAsync(this.storageKey);
            }
            else {
                this.inMemorySession = null;
            }
        });
    }
}

require("axios").default;
class RpcError extends Error {
    constructor(message = "Failed to send a Rpc", name = "RpcError", context) {
        super(message);
        this.__isRpcError = true;
        this.name = name;
        this.context = context;
    }
}

class KryptaPayRpcClient {
    constructor(options) {
        this.url = options.url;
        this.headers = options.headers;
        this.fetch = options.customFetch;
    }
    /**
     * Invokes a function
     * @param functionName - The name of the Function to invoke.
     * @param options - Options for invoking the Function.
     */
    invoke(functionName, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { headers, method, body: functionArgs } = options;
                let _headers = {};
                let body;
                if (functionArgs &&
                    ((headers &&
                        !Object.prototype.hasOwnProperty.call(headers, 'Content-Type')) ||
                        !headers)) {
                    if ((typeof Blob !== 'undefined' &&
                        functionArgs instanceof Blob) ||
                        functionArgs instanceof ArrayBuffer) {
                        // will work for File as File inherits Blob
                        // also works for ArrayBuffer as it is the same underlying structure as a Blob
                        _headers['Content-Type'] = 'application/octet-stream';
                        body = functionArgs;
                    }
                    else if (typeof functionArgs === 'string') {
                        // plain string
                        _headers['Content-Type'] = 'text/plain';
                        body = functionArgs;
                    }
                    else if (typeof FormData !== 'undefined' &&
                        functionArgs instanceof FormData) {
                        // don't set content-type headers
                        // Request will automatically add the right boundary value
                        body = functionArgs;
                    }
                    else {
                        // default, assume this is JSON
                        _headers['Content-Type'] = 'application/json';
                        body = functionArgs;
                    }
                }
                const response = yield this.fetch(Object.assign({ url: `${this.url}/${functionName}`, method, 
                    // headers priority is (high to low):
                    // 1. invoke-level headers
                    // 2. client-level headers
                    // 3. default Content-Type header
                    headers: Object.assign(Object.assign(Object.assign({}, _headers), this.headers), headers) }, body));
                const { data } = response;
                return { data, error: null };
            }
            catch (error) {
                throw new RpcError(error.response.data);
            }
        });
    }
}

const resolveStorage = (customStorage) => {
    let _storage;
    if (customStorage) {
        _storage = customStorage;
    }
    else {
        _storage = FileSystem;
    }
    return _storage;
};
const uploadWithAuth = (getAccessToken, customStorage) => {
    const storage = resolveStorage(customStorage);
    return (url, fileUri, options) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const accessToken = (_a = (yield getAccessToken())) !== null && _a !== void 0 ? _a : null;
        options.headers.Authorization = `Bearer ${accessToken}`;
        return yield storage.uploadAsync(url, fileUri, options);
    });
};

class KryptaPayStorageClient {
    constructor(options) {
        this.url = options.url;
        this.headers = options.headers;
        this.uploadFile = options.upload;
    }
    /**
     * Upload a file
     * @param options - Options for uploading the file.
     */
    upload(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { path, fileUri, options } = data;
                options.uploadType = FileSystem.FileSystemUploadType.MULTIPART;
                const url = `${this.url}/${path}`;
                const response = yield this.uploadFile(url, fileUri, options);
                const { body } = response;
                try {
                    return { data: JSON.parse(body), error: null };
                }
                catch (error) {
                    return { data: null, error: body };
                }
            }
            catch (error) {
                return { data: null, error };
            }
        });
    }
}

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
class KryptaPayClient {
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

/**
 * Creates a new Kryptapay Client.
 */
const createClient = (kryptapayUrl, kryptapayKey, kryptapaySecret, options) => {
    return new KryptaPayClient(kryptapayUrl, kryptapayKey, kryptapaySecret, options);
};

export { createClient };
