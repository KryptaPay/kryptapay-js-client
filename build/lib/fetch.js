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
import axios from 'axios';
import { looksLikeAxiosResponse } from './helpers';
import { AuthApiError, AuthRetryableFetchError, AuthUnknownError, } from './errors';
export const resolveFetch = (customFetch) => {
    let _fetch;
    if (customFetch) {
        _fetch = customFetch;
    }
    else {
        _fetch = axios;
    }
    return (...args) => _fetch(...args);
};
export const fetchWithAuth = (getAccessToken, customFetch) => {
    const fetcher = resolveFetch(customFetch);
    return (input) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const accessToken = (_a = (yield getAccessToken())) !== null && _a !== void 0 ? _a : null;
        input.headers.Authorization = `Bearer ${accessToken}`;
        return fetcher(input);
    });
};
const _getErrorMessage = (err) => {
    var _a;
    return (((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.error_description) ||
        (err === null || err === void 0 ? void 0 : err.data) ||
        (err === null || err === void 0 ? void 0 : err.msg) ||
        (err === null || err === void 0 ? void 0 : err.message) ||
        (err === null || err === void 0 ? void 0 : err.error_description) ||
        (err === null || err === void 0 ? void 0 : err.error) ||
        require('flatted').stringify(err));
};
const handleError = (error, reject) => __awaiter(void 0, void 0, void 0, function* () {
    const NETWORK_ERROR_CODES = [502, 503, 504];
    if (Object.hasOwn(error, 'response')) {
        const response = error.response;
        if (!looksLikeAxiosResponse(response)) {
            reject(new AuthRetryableFetchError(_getErrorMessage(response), response.status));
        }
        else if (NETWORK_ERROR_CODES.includes(response.status)) {
            reject(new AuthRetryableFetchError(_getErrorMessage(response), response.status));
        }
        else {
            reject(new AuthApiError(_getErrorMessage(response), response.status || 500));
        }
    }
    else {
        reject(new AuthUnknownError(_getErrorMessage(error), error));
    }
});
export function _request(fetcher, method, url, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const headers = Object.assign({}, options === null || options === void 0 ? void 0 : options.headers);
        if (options === null || options === void 0 ? void 0 : options.jwt) {
            headers['Authorization'] = `Bearer ${options.jwt}`;
        }
        const data = yield _handleRequest(fetcher, method, url, { headers, noResolveJson: options === null || options === void 0 ? void 0 : options.noResolveJson }, options === null || options === void 0 ? void 0 : options.body);
        return { data: Object.assign({}, data), error: null };
    });
}
function _handleRequest(fetcher, method, url, options, body) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fetcher(Object.assign({ url,
                method, headers: options === null || options === void 0 ? void 0 : options.headers }, body))
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) {
                handleError(error, reject);
            });
        });
    });
}
