# sfcc-webdav

>  Salesforce Commerce Cloud simple webdav API

## Features

* Authentication using API client, no Business Manager username/password required
* Interactive prompt for logs selection
* Support configuration of multiple instances or standard dw.json config file
* Multiple log tailing, with merging/reordering of log entries
* Color output based on log levels
* Converts log timestamp to local timezone

## Installation

```bash
$ npm i sfcc-webdav
```

## Requirements
* Node >= 10

## Configuration

Requires a dw.json with client_id/secret

```json
{
  "hostname": "dev01-mysandbox.demandware.net",
  "client_id": "a12464ae-b484-4b90-4dfe-17e20844e9f0",
  "client_secret": "mysupersecretpassword"
}
```

### API client configuration

The API client must be created from the account.demandware.com consoleand must be granted the required permissions for accessing the `cartridges` folder through webdav.

For doing so access Business Manager and add the following in Administration -> Organization -> WebDAV Client Permissions. Replace client id with your client id, you may need to merge these settings with existing ones.

```json
{
  "clients": [
    {
      "client_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "permissions": [
        {
          "path": "/cartridges",
          "operations": [
            "read_write"
          ]
        }
      ]
    }
  ]
}
```

## Usage

```javascript

```


## License

Copyright (c) 2019 openmind

Released under the MIT license.