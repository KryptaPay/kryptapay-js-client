import { KryptapayClientOptions } from './types';
export declare function stripTrailingSlash(url: string): string;
export declare function applySettingDefaults(options: KryptapayClientOptions, defaults: KryptapayClientOptions): KryptapayClientOptions;
export declare const looksLikeAxiosResponse: (maybeResponse: unknown) => maybeResponse is Response;
export declare const setItemAsync: (key: string, data: any) => Promise<void>;
export declare const getItemAsync: (key: string) => Promise<unknown>;
export declare const removeItemAsync: (key: string) => Promise<void>;
