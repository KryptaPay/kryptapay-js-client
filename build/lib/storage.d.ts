import * as FileSystem from 'expo-file-system';
export type FileSystemType = typeof FileSystem;
export type UploadResult = FileSystem.FileSystemUploadResult;
export type UploadOptions = FileSystem.FileSystemUploadOptions;
export type Upload = (url: string, fileUri: string, options?: UploadOptions) => Promise<UploadResult>;
export declare const resolveStorage: (customStorage?: FileSystemType) => FileSystemType;
export declare const uploadWithAuth: (getAccessToken: () => Promise<string | null>, customStorage?: FileSystemType) => Upload;
