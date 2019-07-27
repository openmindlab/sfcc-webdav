#!/usr/bin/env node


const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const request = require('request-promise-native');

const cwd = process.cwd();

const { log } = console;

let token;


function getDwJson() {
  let dwjsonpath = path.join(cwd, 'dw.json');
  if (!fs.existsSync(dwjsonpath)) {
    log(chalk.red(`Missing file ${dwjsonpath}\n`));
    throw new Error(`Missing file ${dwjsonpath}`);
  }

  const dwjson = JSON.parse(fs.readFileSync(path.join(cwd, 'dw.json'), 'UTF-8'));
  if (!dwjson.client_id || !dwjson.client_secret) {
    log(chalk.red(`Missing client_id/client_secret in ${dwjsonpath}\n`));
    throw new Error(`Missing client_id/client_secret in ${dwjsonpath}`);
  }
  return dwjson;
}

async function authorize() {
  if (!token) {
    const dwjson = getDwJson();

    try {
      const response = await request.post({
        url: 'https://account.demandware.com/dw/oauth2/access_token?grant_type=client_credentials',
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        auth: {
          user: dwjson.client_id,
          pass: dwjson.client_secret
        }
      });

      const newtoken = JSON.parse(response).access_token;
      // log(chalk.yellow(`Authenticated with client id ${dwjson.client_id}, got token ${newtoken}`));
      token = newtoken;
      return newtoken;
    } catch (err) {
      log(chalk.red('Authorization failed:', err));
      throw err;
    }
  }
  return token;
}

async function fileUpload(file, relativepath) {
  await authorize();

  const options = {
    baseUrl: `https://${getDwJson().hostname}`,
    uri: `/on/demandware.servlet/webdav/Sites/${relativepath}`,
    auth: {
      bearer: token
    },
    method: 'PUT',
    body: fs.createReadStream(file)
  };

  try {
    await request(options);
  } catch (err) {
    token = null;
    await authorize();
    options.auth.bearer = token;
    await request(options);
  }

  log(chalk.cyan(`Uploaded ${relativepath}`));
}


async function fileDelete(file, relativepath) {
  await authorize();

  const options = {
    baseUrl: `https://${getDwJson().hostname}`,
    uri: `/on/demandware.servlet/webdav/Sites/${relativepath}`,
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
  fileDelete: fileDelete
};
