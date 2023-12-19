// helpers.ts
import { KryptapayClientOptions } from './types';
import * as SecureStore from 'expo-secure-store';

export function stripTrailingSlash(url: string): string {
    return url.replace(/\/$/, '');
}

export function applySettingDefaults(
    options: KryptapayClientOptions,
    defaults: KryptapayClientOptions
): KryptapayClientOptions {
    const { auth: authOptions, global: globalOptions } = options;
    const { auth: DEFAULT_AUTH_OPTIONS, global: DEFAULT_GLOBAL_OPTIONS } =
        defaults;

    return {
        auth: {
            ...DEFAULT_AUTH_OPTIONS,
            ...authOptions,
        },
        global: {
            ...DEFAULT_GLOBAL_OPTIONS,
            ...globalOptions,
        },
    };
}

export const looksLikeAxiosResponse = (
    maybeResponse: unknown
): maybeResponse is Response => {
    return (
        typeof maybeResponse === 'object' &&
        maybeResponse !== null &&
        'status' in maybeResponse &&
        'data' in maybeResponse &&
        'headers' in maybeResponse
    );
};

export const setItemAsync = async (key: string, data: any): Promise<void> => {
    await SecureStore.setItemAsync(key, JSON.stringify(data));
};

export const getItemAsync = async (key: string): Promise<unknown> => {
    const value = await SecureStore.getItemAsync(key);

    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

export const removeItemAsync = async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key);
};
