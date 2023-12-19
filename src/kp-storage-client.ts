import { Upload } from './lib/storage';
import {
    KryptapayStorageClientOptions,
    FileUploadParameters,
} from './lib/types';
import * as FileSystem from 'expo-file-system';

export default class KryptaPayStorageClient {
    protected url: string;
    protected headers: Record<string, string>;
    protected uploadFile: Upload;

    constructor(options: KryptapayStorageClientOptions) {
        this.url = options.url;
        this.headers = options.headers;
        this.uploadFile = options.upload;
    }

    /**
     * Upload a file
     * @param options - Options for uploading the file.
     */
    async upload(data: FileUploadParameters) {
        try {
            const { path, fileUri, options } = data;
            options.uploadType = FileSystem.FileSystemUploadType.MULTIPART;
            const url = `${this.url}/${path}`;
            const response = await this.uploadFile(url, fileUri, options);
            const { body } = response;
            try {
                return { data: JSON.parse(body), error: null };
            } catch (error) {
                return { data: null, error: body };
            }
        } catch (error) {
            return { data: null, error };
        }
    }
}
