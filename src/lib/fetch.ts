'use strict';
// @ts-check
import axios from 'axios';
import { looksLikeAxiosResponse } from './helpers';
import {
    AuthApiError,
    AuthRetryableFetchError,
    AuthUnknownError,
} from './errors';

export type Axios = typeof axios;

export const resolveFetch = (customFetch?: Axios): Axios => {
    let _fetch: Axios;
    if (customFetch) {
        _fetch = customFetch;
    } else {
        _fetch = axios as Axios;
    }
    return (...args) => _fetch(...args);
};

export const fetchWithAuth = (
    getAccessToken: () => Promise<string | null>,
    customFetch: Axios
): Axios => {
    const fetcher = resolveFetch(customFetch);

    return async (input) => {
        const accessToken = (await getAccessToken()) ?? null;
        input.headers.Authorization = `Bearer ${accessToken}`;
        return fetcher(input);
    };
};

export interface AxiosOptions {
    headers?: {
        [key: string]: string;
    };
    noResolveJson?: boolean;
}

export type RequestMethodType = 'GET' | 'POST';

const _getErrorMessage = (err: any): string => {
    return (
        err?.data?.error_description ||
        err?.data ||
        err?.msg ||
        err?.message ||
        err?.error_description ||
        err?.error ||
        require('flatted').stringify(err)
    );
};
const handleError = async (error: any, reject: (reason?: any) => void) => {
    const NETWORK_ERROR_CODES = [502, 503, 504];

    if (Object.hasOwn(error, 'response')) {
        const response: any = error.response;
        if (!looksLikeAxiosResponse(response)) {
            reject(
                new AuthRetryableFetchError(
                    _getErrorMessage(response),
                    response.status
                )
            );
        } else if (NETWORK_ERROR_CODES.includes(response.status)) {
            reject(
                new AuthRetryableFetchError(
                    _getErrorMessage(response),
                    response.status
                )
            );
        } else {
            reject(
                new AuthApiError(
                    _getErrorMessage(response),
                    response.status || 500
                )
            );
        }
    } else {
        reject(new AuthUnknownError(_getErrorMessage(error), error));
    }
};

interface KryptaPayRequestOptions extends AxiosOptions {
    jwt?: string;
    redirectTo?: string;
    body?: object;
    query?: { [key: string]: string };
}

export async function _request(
    fetcher: Axios,
    method: RequestMethodType,
    url: string,
    options?: KryptaPayRequestOptions
) {
    const headers = { ...options?.headers };
    if (options?.jwt) {
        headers['Authorization'] = `Bearer ${options.jwt}`;
    }

    const data = await _handleRequest(
        fetcher,
        method,
        url,
        { headers, noResolveJson: options?.noResolveJson },
        options?.body
    );
    return { data: { ...data }, error: null };
}

async function _handleRequest(
    fetcher: Axios,
    method: RequestMethodType,
    url: string,
    options?: AxiosOptions,
    body?: object
): Promise<any> {
    return new Promise((resolve, reject) => {
        fetcher({
            url,
            method,
            headers: options?.headers,
            ...body,
        })
            .then(function (response) {
                resolve(response.data);
            })
            .catch(function (error) {
                handleError(error, reject);
            });
    });
}
