import { Upload, UploadOptions } from "./storage";
const axios = require("axios").default;
import * as FileSystem from "expo-file-system";

export type Axios = typeof axios;
export type FileSystemType = typeof FileSystem;

export type KryptapayClientOptions = {
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

import { AuthError } from "./errors";

/** One of the providers supported by KryptqPay. */
export type Provider = "apple" | "google";

export type KryptapayAuthClientOptions = {
  /* The URL of the GoTrue server. */
  url?: string;
  /* Any additional headers to send to the GoTrue server. */
  headers?: { [key: string]: string };
  /* Optional key name used for storing tokens in local storage. */
  storageKey?: string;
  /* Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user. */
  // detectSessionInUrl?: boolean
  /* Set to "true" if you want to automatically refresh the token before expiring. */
  // autoRefreshToken?: boolean
  /* Set to "true" if you want to automatically save the user session into local storage. If set to false, session will just be saved in memory. */
  persistSession?: boolean;
  /* Provide your own local storage implementation to use instead of the browser's local storage. */
  // storage?: SupportedStorage;
  /* A custom fetch implementation. */
  fetch?: Axios;
  /* If set to 'pkce' PKCE flow. Defaults to the 'implicit' flow otherwise */
  // flowType?: AuthFlowType
};

export type KryptapayRpcClientOptions = {
  /* The URL of the GoTrue server. */
  url: string;
  headers: Record<string, string>;
  /* A custom fetch implementation. */
  customFetch?: Axios;
};

export type KryptapayStorageClientOptions = {
  /* The URL of the GoTrue server. */
  url: string;
  headers: Record<string, string>;
  /* A upload function. */
  upload?: Upload;
};

export type AuthResponse =
  | {
      data: {
        user: User | null;
        session: Session | null;
      };
      error: null;
    }
  | {
      data: {
        user: null;
        session: null;
      };
      error: AuthError;
    };

export type AuthTokenResponse =
  | {
      data: {
        user: User;
        session: Session;
      };
      error: null;
    }
  | {
      data: {
        user: null;
        session: null;
      };
      error: AuthError;
    };

export type UserResponse =
  | {
      data: {
        user: User;
      };
      error: null;
    }
  | {
      data: {
        user: null;
      };
      error: AuthError;
    };

export interface Session {
  /**
   * A access token that can expires.
   */
  accessToken: string;
  /**
   * The user.
   */
  user: User;
}

export interface UserIdentity {
  id: string;
  user_id: string;
  identity_data?: {
    [key: string]: any;
  };
  provider: string;
  created_at?: string;
  last_sign_in_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export interface UserAttributes {
  /**
   * The user's email.
   */
  email: string;

  /**
   * The user's phone.
   */
  phone: string;

  /**
   * The user's password.
   */
  password: string;

  /**
   * The user's country.
   */
  country: string;

  /**
   * The user's userName.
   */
  userName: string;
}

export type SignUpCredentials = {
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
  /** The user's preferred language. */
  preferredLanguage: "fr_FR" | "en_EN";
};

export type SignInWithPasswordCredentials =
  | {
      /** The user's email address. */
      email?: string;
      /** The user's password. */
      password: string;
    }
  | {
      /** The user's phone number. */
      phone: string;
      /** The user's password. */
      password: string;
    };

export type SignInWithOTPCredentials = {
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

export type SignoutCredentials = {
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

export type ResetPasswordOptions = {
  /** The user's email address. */
  email: string;
  /** The user's old password */
  oldPassword?: string;
  /** The user's new password */
  newPassword: string;
  /** The security code. */
  securityCode: string;
  /** The security code scope. */
  scope?: "passwordReset";
};

export type SecurityCodeRequestOptions = {
  /** The user's email address or phone number. */
  to: string;
  /** The security code scope. */
  scope: string;
};

export type AuthFlowType = "client_credentials" | "password";

export type SignInWithIdTokenCredentials = {
  /**
   * Only Apple and Google ID tokens are supported for use from within iOS or Android applications.
   */
  provider: "google" | "apple";
  /** ID token issued by Apple or Google. */
  token: string;
  /** If the ID token contains a `nonce`, then the hash of this value is compared to the value in the ID token. */
  nonce?: string;
  options?: {
    /** Verification token received when the user completes the captcha on the site. */
    captchaToken?: string;
  };
};

export type MobileOtpType = "sms" | "phone_change";
export type EmailOtpType = "signup" | "recovery" | "email_change" | "email";

export type ResendParams =
  | {
      type: Extract<EmailOtpType, "signup" | "email_change">;
      email: string;
    }
  | {
      type: Extract<MobileOtpType, "sms" | "phone_change">;
      phone: string;
    };

type AnyFunction = (...args: any[]) => any;
type MaybePromisify<T> = T | Promise<T>;

type PromisifyMethods<T> = {
  [K in keyof T]: T[K] extends AnyFunction
    ? (...args: Parameters<T[K]>) => MaybePromisify<ReturnType<T[K]>>
    : T[K];
};

export type InitializeResult = { error: AuthError | null };

/**
 * Response format
 *
 */
export interface RpcResponseSuccess<T> {
  data: T;
  error: null;
}
export interface RpcResponseFailure {
  data: null;
  error: any;
}
export type RpcResponse<T> = RpcResponseSuccess<T> | RpcResponseFailure;

export class RpcError extends Error {
  context: any;
  protected __isRpcError = true;

  constructor(
    message: string = "Failed to send a Rpc",
    name = "RpcError",
    context?: any
  ) {
    super(message);
    this.name = name;
    this.context = context;
  }
}

export function isRpcError(error: unknown): error is RpcError {
  return typeof error === "object" && error !== null && "__isRpcError" in error;
}

export class StorageError extends Error {
  context: any;
  protected __isStorageError = true;

  constructor(
    message: string = "Failed to send a storage request",
    name = "storageError",
    context?: any
  ) {
    super(message);
    this.name = name;
    this.context = context;
  }
}

export function isSorageError(error: unknown): error is StorageError {
  return (
    typeof error === "object" && error !== null && "__isStorageError" in error
  );
}

export type RpcInvokeOptions = {
  /**
   * Object representing the headers to send with the request.
   * */
  headers?: { [key: string]: string };
  /**
   * The HTTP verb of the request
   */
  method?: "POST" | "GET";
  /**
   * The body of the request.
   */
  body?:
    | File
    | Blob
    | ArrayBuffer
    | FormData
    | ReadableStream<Uint8Array>
    | Record<string, any>
    | string;
};

export type FileUploadParameters = {
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
