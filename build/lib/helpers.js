var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as SecureStore from 'expo-secure-store';
export function stripTrailingSlash(url) {
    return url.replace(/\/$/, '');
}
export function applySettingDefaults(options, defaults) {
    const { auth: authOptions, global: globalOptions } = options;
    const { auth: DEFAULT_AUTH_OPTIONS, global: DEFAULT_GLOBAL_OPTIONS } = defaults;
    return {
        auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS), authOptions),
        global: Object.assign(Object.assign({}, DEFAULT_GLOBAL_OPTIONS), globalOptions),
    };
}
export const looksLikeAxiosResponse = (maybeResponse) => {
    return (typeof maybeResponse === 'object' &&
        maybeResponse !== null &&
        'status' in maybeResponse &&
        'data' in maybeResponse &&
        'headers' in maybeResponse);
};
export const setItemAsync = (key, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield SecureStore.setItemAsync(key, JSON.stringify(data));
});
export const getItemAsync = (key) => __awaiter(void 0, void 0, void 0, function* () {
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
export const removeItemAsync = (key) => __awaiter(void 0, void 0, void 0, function* () {
    yield SecureStore.deleteItemAsync(key);
});
