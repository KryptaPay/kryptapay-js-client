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
import { AuthError, AuthInvalidCredentialsError, AuthInvalidTokenResponseError, AuthUnknownError, isAuthApiError, isAuthError, } from './lib/errors';
import { _request } from './lib/fetch';
import { getItemAsync, removeItemAsync, setItemAsync } from './lib/helpers';
import axios from 'axios';
const DEFAULT_OPTIONS = {
    storageKey: STORAGE_KEY,
    persistSession: true,
    headers: DEFAULT_HEADERS,
};
export default class KryptaPayAuthClient {
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
                    error: new AuthUnknownError('Unexpected error during initialization', error),
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
                if ('phone' in credentials && 'email' in credentials) {
                    const { phone, password, email, userName, country, refererUuid, pushToken, } = credentials;
                    res = yield _request(this.fetch, 'POST', `${this.url}/signup`, {
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
                            },
                        },
                    });
                }
                else {
                    throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a password');
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
                if ('email' in credentials) {
                    const { email, password } = credentials;
                    res = yield _request(this.fetch, 'POST', `${this.url}/token`, {
                        headers: this.headers,
                        body: {
                            data: {
                                username: email,
                                password,
                                grant_type: 'password',
                                scope: 'user',
                            },
                        },
                    });
                }
                else if ('phone' in credentials) {
                    const { phone, password } = credentials;
                    res = yield _request(this.fetch, 'POST', `${this.url}/token`, {
                        headers: this.headers,
                        body: {
                            data: {
                                username: phone,
                                password,
                                grant_type: 'password',
                                scope: 'user',
                            },
                        },
                    });
                }
                else {
                    throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a password');
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
                if ('ROTP' in credentials) {
                    const { userId, ROTP, TOTP, options } = credentials;
                    const res = yield _request(this.fetch, 'POST', `${this.url}/otp`, {
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
                throw new AuthInvalidCredentialsError('You must provide an ROTP.');
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
                if ('userId' in credentials) {
                    const { userId, options } = credentials;
                    const res = yield _request(this.fetch, 'POST', `${this.url}/signout`, {
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
                            error: new AuthError('Response data is missing'),
                        };
                    }
                    return { data, error };
                }
                else {
                    throw new AuthInvalidCredentialsError('You must provide an userId.');
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
                if ('email' in credentials) {
                    const { email, type } = credentials;
                    const { error } = yield _request(this.fetch, 'POST', endpoint, {
                        headers: this.headers,
                        body: {
                            email,
                            type,
                        },
                    });
                    return { data: { user: null, session: null }, error };
                }
                else if ('phone' in credentials) {
                    const { phone, type } = credentials;
                    const { error } = yield _request(this.fetch, 'POST', endpoint, {
                        headers: this.headers,
                        body: {
                            phone,
                            type,
                        },
                    });
                    return { data: { user: null, session: null }, error };
                }
                throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a type');
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
                const res = yield _request(this.fetch, 'POST', `${this.url}/code`, {
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
                const res = yield _request(this.fetch, 'POST', `${this.url}/recover`, {
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
        const isValidSession = typeof maybeSession === 'object' &&
            maybeSession !== null &&
            'accessToken' in maybeSession &&
            'user' in maybeSession;
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
