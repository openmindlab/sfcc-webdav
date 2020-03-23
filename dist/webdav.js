#!/usr/bin/env node
"use strict";
/* eslint-disable camelcase */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
// https://github.com/request/request/issues/3142
// const request = require('request-promise-native');
const axios_1 = require("axios");
const cwd = process.cwd();
const { log, error } = console;
function getDwJson() {
    let dwjsonpath = path.join(cwd, 'dw.json');
    if (!fs.existsSync(dwjsonpath)) {
        error(chalk.red(`Missing file ${dwjsonpath}\n`));
        throw new Error(`Missing file ${dwjsonpath}`);
    }
    const dwjson = JSON.parse(fs.readFileSync(path.join(cwd, 'dw.json'), 'UTF-8'));
    return dwjson;
}
class Webdav {
    constructor(dwJson) {
        this.useDwJson(dwJson);
        this.token = undefined;
        this.trace = false;
        this.axios = axios_1.default.create();
        this.axios.interceptors.request.use(request => {
            if (this.trace) {
                log(chalk.cyan('Sending Request:'));
                log(chalk.cyan('baseUrl: '), request.baseURL);
                log(chalk.cyan('url: '), request.url);
                log(chalk.cyan('method: '), request.method);
                log(chalk.cyan('headers: '), JSON.stringify(request.headers));
                log(chalk.cyan('data: '), JSON.stringify(request.data));
            }
            return request;
        });
        this.axios.interceptors.response.use(response => {
            if (this.trace) {
                log(chalk.cyan('Sending Response:'));
                log(chalk.cyan('Status: '), response.status);
                log(chalk.cyan('Status Msg: '), response.statusText);
                log(chalk.cyan('Response Data: '), JSON.stringify(response.data));
            }
            return response;
        });
    }
    useDwJson(dwJson) {
        this.clientId = (dwJson === null || dwJson === void 0 ? void 0 : dwJson.client_id) || (dwJson === null || dwJson === void 0 ? void 0 : dwJson['client-id']);
        this.clientSecret = (dwJson === null || dwJson === void 0 ? void 0 : dwJson.client_secret) || (dwJson === null || dwJson === void 0 ? void 0 : dwJson['client-secret']);
        this.hostname = dwJson === null || dwJson === void 0 ? void 0 : dwJson.hostname;
        this.codeVersion = dwJson === null || dwJson === void 0 ? void 0 : dwJson['code-version'];
    }
    toServerPath(file) {
        let basepath = `/cartridges/${this.codeVersion}/`;
        let cartridgepath = path.basename(file.substr(0, file.indexOf('/cartridge/'))) + file.substr(file.indexOf('/cartridge/'));
        return `${basepath}${cartridgepath}`;
    }
    async authorize() {
        if (!this.clientId) {
            error(chalk.red("Missing Client-id! Cannot make authorize request without it."));
            throw "Missing Client-id";
        }
        if (!this.clientSecret) {
            error(chalk.red("Missing Client-secret! Cannot make authorize request without it."));
            throw "Missing Client-secret";
        }
        const { data } = await this.axios.request({
            url: 'https://account.demandware.com/dw/oauth2/access_token?grant_type=client_credentials',
            method: 'post',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            auth: {
                username: this.clientId,
                password: this.clientSecret
            }
        });
        this.token = data.access_token;
    }
    async sendRequest(options, callback) {
        var _a;
        try {
            let { data } = await this.axios.request(options);
            callback(data);
        }
        catch (err) {
            error(chalk.red('Error processing request:', err));
            if ((_a = options === null || options === void 0 ? void 0 : options.headers) === null || _a === void 0 ? void 0 : _a.Authorization) {
                if (this.trace)
                    console.debug(`Expiring Token! ${this.token}`);
                await this.authorize();
                if (this.trace)
                    console.debug(`New Token! ${this.token}`);
                options.headers.Authorization = `Bearer ${this.token}`;
            }
            try {
                let { data } = await axios_1.default.request(options);
                callback(data);
            }
            catch (innerErr) {
                error(chalk.red('Error processing retry:', err));
                throw err;
            }
        }
    }
    async fileUpload(file, relativepath) {
        if (!this.hostname) {
            error(chalk.red("Missing hostname! Cannot make create a request without it."));
            throw "Missing hostname";
        }
        if (!this.token)
            await this.authorize();
        const fileStream = fs.createReadStream(file);
        fileStream.on('error', (err) => error(`On Upload request of file ${file}, ReadStream Error: ${err}`));
        await fileStream.on('ready', async () => {
            const options = {
                baseURL: `https://${this.hostname}`,
                url: `/on/demandware.servlet/webdav/Sites${relativepath}`,
                headers: {
                    Authorization: `Bearer ${this.token}`
                },
                method: 'PUT',
                data: fileStream
            };
            await this.sendRequest(options, () => log(chalk.cyan(`Uploaded ${relativepath}`)));
        });
    }
    async fileDelete(file, relativepath) {
        if (!this.hostname) {
            error(chalk.red("Missing hostname! Cannot make create a request without it."));
            throw "Missing hostname";
        }
        if (!this.token)
            await this.authorize();
        const options = {
            baseURL: `https://${this.hostname}`,
            url: `/on/demandware.servlet/webdav/Sites${relativepath}`,
            headers: {
                Authorization: `Bearer ${this.token}`
            },
            method: 'DELETE'
        };
        await this.sendRequest(options, () => log(chalk.cyan(`Deleted ${relativepath}`)));
    }
}
exports.Webdav = Webdav;
const webdav = new Webdav(getDwJson());
webdav.Webdav = Webdav;
exports.default = webdav;
/**
 * Upload a file via webdav
 * @param {string} file Local file path
 * @param {string} remote path, starting with '/cartridges'
 */
async function fileUpload(file, relativepath) {
    await webdav.fileUpload(file, relativepath);
}
exports.fileUpload = fileUpload;
/**
 * Deletes a file via webdav
 * @param {string} file Local file path
 * @param {string} remote path, starting with '/cartridges'
 */
async function fileDelete(file, relativepath) {
    await webdav.fileDelete(file, relativepath);
}
exports.fileDelete = fileDelete;
