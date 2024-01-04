var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as FileSystem from 'expo-file-system';
export default class KryptaPayStorageClient {
    constructor(options) {
        this.url = options.url;
        this.headers = options.headers;
        this.uploadFile = options.upload;
    }
    /**
     * Upload a file
     * @param options - Options for uploading the file.
     */
    upload(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { path, fileUri, options } = data;
                options.uploadType = FileSystem.FileSystemUploadType.MULTIPART;
                const url = `${this.url}/${path}`;
                const response = yield this.uploadFile(url, fileUri, options);
                const { body } = response;
                try {
                    return { data: JSON.parse(body), error: null };
                }
                catch (error) {
                    return { data: null, error: body };
                }
            }
            catch (error) {
                return { data: null, error };
            }
        });
    }
}
