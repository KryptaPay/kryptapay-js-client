import {
    Axios,
    RpcResponse,
    RpcInvokeOptions,
    KryptapayRpcClientOptions,
    RpcError,
} from './lib/types';

export default class KryptaPayRpcClient {
    protected url: string;
    protected headers: Record<string, string>;
    protected fetch: Axios;

    constructor(options: KryptapayRpcClientOptions) {
        this.url = options.url;
        this.headers = options.headers;
        this.fetch = options.customFetch;
    }

    /**
     * Invokes a function
     * @param functionName - The name of the Function to invoke.
     * @param options - Options for invoking the Function.
     */
    async invoke<T = any>(
        functionName: string,
        options: RpcInvokeOptions = {}
    ): Promise<RpcResponse<T>> {
        try {
            const { headers, method, body: functionArgs } = options;

            let _headers: Record<string, string> = {};
            let body: any;
            if (
                functionArgs &&
                ((headers &&
                    !Object.prototype.hasOwnProperty.call(
                        headers,
                        'Content-Type'
                    )) ||
                    !headers)
            ) {
                if (
                    (typeof Blob !== 'undefined' &&
                        functionArgs instanceof Blob) ||
                    functionArgs instanceof ArrayBuffer
                ) {
                    // will work for File as File inherits Blob
                    // also works for ArrayBuffer as it is the same underlying structure as a Blob
                    _headers['Content-Type'] = 'application/octet-stream';
                    body = functionArgs;
                } else if (typeof functionArgs === 'string') {
                    // plain string
                    _headers['Content-Type'] = 'text/plain';
                    body = functionArgs;
                } else if (
                    typeof FormData !== 'undefined' &&
                    functionArgs instanceof FormData
                ) {
                    // don't set content-type headers
                    // Request will automatically add the right boundary value
                    body = functionArgs;
                } else {
                    // default, assume this is JSON
                    _headers['Content-Type'] = 'application/json';
                    body = functionArgs;
                }
            }

            const response = await this.fetch({
                url: `${this.url}/${functionName}`,
                method,
                // headers priority is (high to low):
                // 1. invoke-level headers
                // 2. client-level headers
                // 3. default Content-Type header
                headers: { ..._headers, ...this.headers, ...headers },
                ...body,
            });

            const { data } = response;
            return { data, error: null };
        } catch (error) {
            throw new RpcError(error.response.data);
        }
    }
}
