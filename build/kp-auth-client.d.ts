import { AuthError } from './lib/errors';
import { Axios } from './lib/fetch';
import type { AuthResponse, KryptapayAuthClientOptions, InitializeResult, Session, SignInWithPasswordCredentials, UserResponse, SignInWithOTPCredentials, SignUpCredentials, ResendParams, SignoutCredentials, ResetPasswordOptions, SecurityCodeRequestOptions } from './lib/types';
export default class KryptaPayAuthClient {
    /**
     * The storage key used to identify the values saved in localStorage
     */
    protected storageKey: string;
    /**
     * The session object for the currently logged in user. If null, it means there isn't a logged-in user.
     * Only used if persistSession is false.
     */
    protected inMemorySession: Session | null;
    protected persistSession: boolean;
    /**
     * Keeps track of the async client initialization.
     * When null or not yet resolved the auth state is `unknown`
     * Once resolved the the auth state is known and it's save to call any further client methods.
     * Keep extra care to never reject or throw uncaught errors
     */
    protected initializePromise: Promise<InitializeResult> | null;
    protected url: string;
    protected headers: {
        [key: string]: string;
    };
    protected fetch: Axios;
    /**
     * Create a new client for use in the app.
     */
    constructor(options: KryptapayAuthClientOptions);
    /**
     * Initializes the client session from storage.
     * This method is automatically called when instantiating the client
     */
    initialize(): Promise<InitializeResult>;
    /**
     * IMPORTANT:
     * 1. Never throw in this method, as it is called from the constructor
     * 2. Never return a session from this method as it would be cached over
     *    the whole lifetime of the client
     */
    private _initialize;
    /**
     * Creates a new user.
     *
     * Be aware that if a user account exists in the system you may get back an
     * error message that attempts to hide this information from the user.
     *
     * @returns A logged-in session and user
     */
    signUp(credentials: SignUpCredentials): Promise<AuthResponse>;
    /**
     * Log in an existing user with an email and password or phone and password.
     *
     * Be aware that you may get back an error message that will not distinguish
     * between the cases where the account does not exist or that the
     * email/phone and password combination is wrong
     */
    signInWithPassword(credentials: SignInWithPasswordCredentials): Promise<UserResponse>;
    /**
     * Log in a user using a one-time password (OTP).
     */
    signInWithOtp(credentials: SignInWithOTPCredentials): Promise<AuthResponse>;
    /**
     * Log out a user.
     */
    signOut(credentials: SignoutCredentials): Promise<{
        data: any;
        error: AuthError | null;
    }>;
    /**
     * Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.
     */
    resend(credentials: ResendParams): Promise<AuthResponse>;
    /**
     * Returns the session.
     * The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.
     */
    getSession(): Promise<{
        data: {
            session: Session;
        };
        error: null;
    } | {
        data: {
            session: null;
        };
        error: AuthError;
    } | {
        data: {
            session: null;
        };
        error: null;
    }>;
    /**
     * Sends a security code request to an email address.
     * @param email The email address of the user.
     * @param scope The code scope.
     */
    requestSecuritycode(options: SecurityCodeRequestOptions): Promise<{
        data: {};
        error: null;
    } | {
        data: null;
        error: AuthError;
    }>;
    /**
     * Sends a password reset request to an email address.
     * @param email The email address of the user.
     */
    resetPasswordForEmail(options: ResetPasswordOptions): Promise<{
        data: {};
        error: null;
    } | {
        data: null;
        error: AuthError;
    }>;
    private _isValidSession;
    /**
     * Recovers the session from storage and refreshes
     * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
     */
    private _recoverAndRefresh;
    /**
     * set currentSession and currentUser
     * process to _startAutoRefreshToken if possible
     */
    private _saveSession;
    private _persistSession;
    private _removeSession;
}
