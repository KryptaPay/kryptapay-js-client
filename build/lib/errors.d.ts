export declare class AuthError extends Error {
    status: number | undefined;
    protected __isAuthError: boolean;
    constructor(message: string, status?: number);
}
export declare function isAuthError(error: unknown): error is AuthError;
export declare class AuthApiError extends AuthError {
    status: number;
    constructor(message: string, status: number);
    toJSON(): {
        name: string;
        message: string;
        status: number;
    };
}
export declare function isAuthApiError(error: unknown): error is AuthApiError;
export declare class AuthUnknownError extends AuthError {
    originalError: unknown;
    constructor(message: string, originalError: unknown);
}
export declare class CustomAuthError extends AuthError {
    name: string;
    status: number;
    constructor(message: string, name: string, status: number);
    toJSON(): {
        name: string;
        message: string;
        status: number;
    };
}
export declare class AuthSessionMissingError extends CustomAuthError {
    constructor();
}
export declare class AuthInvalidTokenResponseError extends CustomAuthError {
    constructor();
}
export declare class AuthInvalidCredentialsError extends CustomAuthError {
    constructor(message: string);
}
export declare class AuthRetryableFetchError extends CustomAuthError {
    constructor(message: string, status: number);
}
