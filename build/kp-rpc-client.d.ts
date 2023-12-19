import { Axios, RpcResponse, RpcInvokeOptions, KryptapayRpcClientOptions } from './lib/types';
export default class KryptaPayRpcClient {
    protected url: string;
    protected headers: Record<string, string>;
    protected fetch: Axios;
    constructor(options: KryptapayRpcClientOptions);
    /**
     * Invokes a function
     * @param functionName - The name of the Function to invoke.
     * @param options - Options for invoking the Function.
     */
    invoke<T = any>(functionName: string, options?: RpcInvokeOptions): Promise<RpcResponse<T>>;
}
