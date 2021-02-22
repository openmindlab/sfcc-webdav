const Ocapi = require('./dist/ocapi');
const DW = require('./dist/dw');
const config = DW.getDwJson();
const client = new Ocapi(config);
