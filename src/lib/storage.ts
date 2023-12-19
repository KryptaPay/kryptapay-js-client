'use strict';
// @ts-check
import * as FileSystem from 'expo-file-system';

export type FileSystemType = typeof FileSystem;
export type UploadResult = FileSystem.FileSystemUploadResult;
export type UploadOptions = FileSystem.FileSystemUploadOptions;
export type Upload = (
    url: string,
    fileUri: string,
    options?: UploadOptions
) => Promise<UploadResult>;

export const resolveStorage = (
    customStorage?: FileSystemType
): FileSystemType => {
    let _storage: FileSystemType;
    if (customStorage) {
        _storage = customStorage;
    } else {
        _storage = FileSystem;
    }
    return _storage;
};

export const uploadWithAuth = (
    getAccessToken: () => Promise<string | null>,
    customStorage?: FileSystemType
): Upload => {
    const storage = resolveStorage(customStorage);

    return async (url, fileUri, options) => {
        const accessToken = (await getAccessToken()) ?? null;
        options.headers.Authorization = `Bearer ${accessToken}`;

        return await storage.uploadAsync(url, fileUri, options);
    };
};
