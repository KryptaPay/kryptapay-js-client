import axios from 'axios';
export type Axios = typeof axios;
export declare const resolveFetch: (customFetch?: Axios) => Axios;
export declare const fetchWithAuth: (getAccessToken: () => Promise<string | null>, customFetch: Axios) => Axios;
export interface AxiosOptions {
    headers?: {
        [key: string]: string;
    };
    noResolveJson?: boolean;
}
export type RequestMethodType = 'GET' | 'POST';
interface KryptaPayRequestOptions extends AxiosOptions {
    jwt?: string;
    redirectTo?: string;
    body?: object;
    query?: {
        [key: string]: string;
    };
}
export declare function _request(fetcher: Axios, method: RequestMethodType, url: string, options?: KryptaPayRequestOptions): Promise<{
    data: any;
    error: null;
}>;
export {};
