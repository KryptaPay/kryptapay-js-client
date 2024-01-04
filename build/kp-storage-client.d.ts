import { Upload } from './lib/storage';
import { KryptapayStorageClientOptions, FileUploadParameters } from './lib/types';
export default class KryptaPayStorageClient {
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
