const axios = require('axios').default;
export class RpcError extends Error {
    constructor(message = 'Failed to send a Rpc', name = 'RpcError', context) {
        super(message);
        this.__isRpcError = true;
        this.name = name;
        this.context = context;
    }
}
export function isRpcError(error) {
    return (typeof error === 'object' && error !== null && '__isRpcError' in error);
}
export class StorageError extends Error {
    constructor(message = 'Failed to send a storage request', name = 'storageError', context) {
        super(message);
        this.__isStorageError = true;
        this.name = name;
        this.context = context;
    }
}
export function isSorageError(error) {
    return (typeof error === 'object' &&
        error !== null &&
        '__isStorageError' in error);
}
