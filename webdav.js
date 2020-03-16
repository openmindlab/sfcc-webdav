#!/usr/bin/env node


const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
// https://github.com/request/request/issues/3142
// const request = require('request-promise-native');
const { request } = require('axios');

const cwd = process.cwd();

const { log, error } = console;

let token;


function getDwJson() {
  let dwjsonpath = path.join(cwd, 'dw.json');
  if (!fs.existsSync(dwjsonpath)) {
    error(chalk.red(`Missing file ${dwjsonpath}\n`));
    throw new Error(`Missing file ${dwjsonpath}`);
  }

  const dwjson = JSON.parse(fs.readFileSync(path.join(cwd, 'dw.json'), 'UTF-8'));
  if (!dwjson.client_id || !dwjson.client_secret) {
    error(chalk.red(`Missing client_id/client_secret in ${dwjsonpath}\n`));
    throw new Error(`Missing client_id/client_secret in ${dwjsonpath}`);
  }
  return dwjson;
}

async function authorize() {
  if (!token) {
    const dwjson = getDwJson();

    try {
      const { data } = await request(
        {
          url: 'https://account.demandware.com/dw/oauth2/access_token?grant_type=client_credentials',
          method: 'post',
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          }, 
          auth: {
            username: dwjson.client_id,
            password: dwjson.client_secret
          }
        }
      );
      const newtoken = data.access_token;
      // log(chalk.yellow(`Authenticated with client id ${dwjson.client_id}, got token ${newtoken}`));
      token = newtoken;
      return newtoken;
    } catch (err) {
      error(chalk.red('Authorization failed:', err));
      throw err;
    }
  }
  return token;
}

async function fileUpload(file, relativepath) {
  await authorize();
  const fileStream = fs.createReadStream(file);
  const options = {
    baseURL: `https://${getDwJson().hostname}`,
    url: `/on/demandware.servlet/webdav/Sites${relativepath}`,
    headers: {
      Authorization: `Bearer ${token}`
    },
    method: 'PUT',
    data: fileStream
  };

  try {
    await request(options);
  } catch (err) {
    token = null;
    await authorize();
    options.headers.Authorization = `Bearer ${token}`;
    await request(options);
  }

  log(chalk.cyan(`Uploaded ${relativepath}`));
}


async function fileDelete(file, relativepath) {
  await authorize();

  const options = {
    baseUrl: `https://${getDwJson().hostname}`,
    url: `/on/demandware.servlet/webdav/Sites${relativepath}`,
    auth: {
      bearer: token
    },
    method: 'DELETE'
  };

  try {
    await request(options);
  } catch (err) {
    token = null;
    await authorize();
    options.auth.bearer = token;
    await request(options);
  }

  log(chalk.cyan(`Deleted  ${relativepath}`));
}

module.exports = {
  fileUpload: fileUpload,
  fileDelete: fileDelete,
  authorize: authorize
};
