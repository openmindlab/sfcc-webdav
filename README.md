# sfcc-webdav

>  Salesforce Commerce Cloud simple webdav API

<div>
	<br>
	<a href="https://openmindonline.it" target="_blank"><img width="200" src="openmind.svg" alt="openmind"></a>
	<br>
	<br>
</div>

## Features

* API for upload and delete files via webdav, useful for real-time upload of changes file during development
* Authentication via OCAPI client, uses dw.json for configuration

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
const sfccwebdav = require('sfcc-webdav');

sfccwebdav.fileUpload('/path/to/local/file', '/cartridges/mycodeversion/app_storefront/cartridge/static/filetoupload');

sfccwebdav.fileDelete('/path/to/local/file', '/cartridges/mycodeversion/app_storefront/cartridge/static/filetodelete');
```


## License

Copyright (c) openmind

Released under the MIT license.