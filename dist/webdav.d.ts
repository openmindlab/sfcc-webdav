#!/usr/bin/env node
import { AxiosRequestConfig, AxiosInstance } from 'axios';
export interface DwJson {
    client_id?: string;
    'client-id'?: string;
    client_secret?: string;
    'client-secret'?: string;
    hostname: string;
    'code-version': string;
}
export declare class Webdav {
    clientId: string;
    clientSecret: string;
    token: string;
    trace: boolean;
    hostname: string;
    codeVersion: string;
    axios: AxiosInstance;
    Webdav: typeof Webdav;
    constructor(dwJson: DwJson);
    useDwJson(dwJson: DwJson): void;
    toServerPath(file: string): string;
    authorize(): Promise<void>;
    sendRequest(options: AxiosRequestConfig, callback: Function): Promise<void>;
    fileUpload(file: string, relativepath: string): Promise<void>;
    fileDelete(file: string, relativepath: string): Promise<void>;
}
declare const webdav: Webdav;
export default webdav;
/**
 * Upload a file via webdav
 * @param {string} file Local file path
 * @param {string} remote path, starting with '/cartridges'
 */
export declare function fileUpload(file: string, relativepath: string): Promise<void>;
/**
 * Deletes a file via webdav
 * @param {string} file Local file path
 * @param {string} remote path, starting with '/cartridges'
 */
export declare function fileDelete(file: string, relativepath: string): Promise<void>;
