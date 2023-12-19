import { default as axios_2 } from 'axios';
import * as FileSystem_2 from 'expo-file-system';

declare class AuthError extends Error {
    status: number | undefined;
    protected __isAuthError: boolean;
    constructor(message: string, status?: number);
}

declare type AuthResponse = {
    data: {
        user: User | null;
        session: Session | null;
    };
    error: null;
} | {
    data: {
        user: null;
        session: null;
    };
    error: AuthError;
};

declare type Axios = typeof axios;

declare const axios: any;

declare type Axios_2 = typeof axios_2;

/**
 * Creates a new Kryptapay Client.
 */
export declare const createClient: (kryptapayUrl: string, kryptapayKey: string, kryptapaySecret: string, options?: KryptapayClientOptions) => KryptaPayClient;

declare type EmailOtpType = 'signup' | 'recovery' | 'email_change' | 'email';

declare type FileSystemType = typeof FileSystem_2;

declare type FileUploadParameters = {
    /**
     * The path for the remote URL, where the file will be sent.
     * */
    path: string;
    /**
     * The local URI of the file to send. The file must exist.
     */
    fileUri: string;
    /**
     * A map of upload options.
     */
    options: UploadOptions;
};

declare type InitializeResult = {
    error: AuthError | null;
};

declare class KryptaPayAuthClient {
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
    protected fetch: Axios_2;
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

declare type KryptapayAuthClientOptions = {
    url?: string;
    headers?: {
        [key: string]: string;
    };
    storageKey?: string;
    persistSession?: boolean;
    fetch?: Axios;
};

/**
 * Kryptapay Client.
 *
 * An isomorphic Javascript client for interacting with a web server.
 */
declare class KryptaPayClient {
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

declare type KryptapayClientOptions = {
    auth?: {
        /**
         * Automatically refreshes the token for logged-in users. Defaults to true.
         */
        autoRefreshToken?: boolean;
        /**
         * Optional key name used for storing tokens in local storage.
         */
        storageKey?: string;
        /**
         * Whether to persist a logged-in session to storage. Defaults to true.
         */
        persistSession?: boolean;
        /**
         * Detect a session from the URL. Used for OAuth login callbacks. Defaults to true.
         */
        detectSessionInUrl?: boolean;
    };
    global?: {
        fetch?: Axios;
        store?: FileSystemType;
        /**
         * Optional headers for initializing the client.
         */
        headers?: Record<string, string>;
    };
};

declare class KryptaPayRpcClient {
    protected url: string;
    protected headers: Record<string, string>;
    protected fetch: Axios;
    constructor(options: KryptapayRpcClientOptions);
    /**
     * Invokes a function
     * @param functionName - The name of the Function to invoke.
     * @param options - Options for invoking the Function.
     */
    invoke<T = any>(functionName: string, options?: RpcInvokeOptions): Promise<RpcResponse<T>>;
}

declare type KryptapayRpcClientOptions = {
    url: string;
    headers: Record<string, string>;
    customFetch?: Axios;
};

declare class KryptaPayStorageClient {
    protected url: string;
    protected headers: Record<string, string>;
    protected uploadFile: Upload;
    constructor(options: KryptapayStorageClientOptions);
    /**
     * Upload a file
     * @param options - Options for uploading the file.
     */
    upload(data: FileUploadParameters): Promise<{
        data: any;
        error: null;
    } | {
        data: null;
        error: unknown;
    }>;
}

declare type KryptapayStorageClientOptions = {
    url: string;
    headers: Record<string, string>;
    upload?: Upload;
};

declare type MobileOtpType = 'sms' | 'phone_change';

declare type ResendParams = {
    type: Extract<EmailOtpType, 'signup' | 'email_change'>;
    email: string;
} | {
    type: Extract<MobileOtpType, 'sms' | 'phone_change'>;
    phone: string;
};

declare type ResetPasswordOptions = {
    /** The user's email address. */
    email: string;
    /** The user's old password */
    oldPassword?: string;
    /** The user's new password */
    newPassword: string;
    /** The security code. */
    securityCode: string;
    /** The security code scope. */
    scope?: 'passwordReset';
};

declare type RpcInvokeOptions = {
    /**
     * Object representing the headers to send with the request.
     * */
    headers?: {
        [key: string]: string;
    };
    /**
     * The HTTP verb of the request
     */
    method?: 'POST' | 'GET';
    /**
     * The body of the request.
     */
    body?: File | Blob | ArrayBuffer | FormData | ReadableStream<Uint8Array> | Record<string, any> | string;
};

declare type RpcResponse<T> = RpcResponseSuccess<T> | RpcResponseFailure;

declare interface RpcResponseFailure {
    data: null;
    error: any;
}

/**
 * Response format
 *
 */
declare interface RpcResponseSuccess<T> {
    data: T;
    error: null;
}

declare type SecurityCodeRequestOptions = {
    /** The user's email address or phone number. */
    to: string;
    /** The security code scope. */
    scope: string;
};

declare interface Session {
    /**
     * A access token that can expires.
     */
    accessToken: string;
    /**
     * The user.
     */
    user: User;
}

declare type SignInWithOTPCredentials = {
    /** The user id. */
    userId: string;
    /** The email code. */
    ROTP: string;
    /** The totp. */
    TOTP?: string;
    options?: {
        /** The redirect url embedded in the email link */
        emailRedirectTo?: string;
        /** If set to false, this method will not create a new user. Defaults to true. */
        shouldCreateUser?: boolean;
        /**
         * A custom data object to store the user's metadata. This maps to the `auth.users.user_metadata` column.
         *
         * The `data` should be a JSON object that includes user-specific info, such as their first and last name.
         */
        data?: object;
        /** Verification token received when the user completes the captcha on the site. */
        captchaToken?: string;
    };
};

declare type SignInWithPasswordCredentials = {
    /** The user's email address. */
    email?: string;
    /** The user's password. */
    password: string;
} | {
    /** The user's phone number. */
    phone: string;
    /** The user's password. */
    password: string;
};

declare type SignoutCredentials = {
    /** The user's email address. */
    userId: string;
    options?: {
        /** The redirect url embedded in the email link */
        emailRedirectTo?: string;
        /** If set to false, this method will not create a new user. Defaults to true. */
        shouldCreateUser?: boolean;
        /**
         * A custom data object to store the user's metadata. This maps to the `auth.users.user_metadata` column.
         *
         * The `data` should be a JSON object that includes user-specific info, such as their first and last name.
         */
        data?: object;
        /** Verification token received when the user completes the captcha on the site. */
        captchaToken?: string;
    };
};

declare type SignUpCredentials = {
    /** The user's email address. */
    email: string;
    /** The user's password. */
    password: string;
    /** The user's email phone. */
    phone: string;
    /** The user's country. */
    country: string;
    /** The user's userName. */
    userName: string;
    /** The referer code. */
    refererUuid?: string;
    /** The push notification token. */
    pushToken: string;
};

declare type Upload = (url: string, fileUri: string, options?: UploadOptions) => Promise<UploadResult>;

declare type UploadOptions = FileSystem_2.FileSystemUploadOptions;

declare type UploadResult = FileSystem_2.FileSystemUploadResult;

declare interface User {
    id: string;
    email?: string;
    phone?: string;
    created_at: string;
}

declare type UserResponse = {
    data: {
        user: User;
    };
    error: null;
} | {
    data: {
        user: null;
    };
    error: AuthError;
};

export { }
