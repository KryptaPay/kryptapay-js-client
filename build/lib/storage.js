'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// @ts-check
import * as FileSystem from 'expo-file-system';
export const resolveStorage = (customStorage) => {
    let _storage;
    if (customStorage) {
        _storage = customStorage;
    }
    else {
        _storage = FileSystem;
    }
    return _storage;
};
export const uploadWithAuth = (getAccessToken, customStorage) => {
    const storage = resolveStorage(customStorage);
    return (url, fileUri, options) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const accessToken = (_a = (yield getAccessToken())) !== null && _a !== void 0 ? _a : null;
        options.headers.Authorization = `Bearer ${accessToken}`;
        return yield storage.uploadAsync(url, fileUri, options);
    });
};
