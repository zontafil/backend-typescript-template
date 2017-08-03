require('app-module-path').addPath(__dirname + '/../');
import {ErrorCode, ApiError} from 'core/errorCodes';
import {Logger} from 'core/log';
import {BackendConfig} from 'core/config';
import * as configjs from 'config';
import * as errorHandler from 'utils/errorHandling';
import {Api} from 'api/api';
import {inversifyContainer} from 'core/inversify';

// setup unhandled error handling
let log: Logger;
process.on('unhandledRejection', handleRejections.bind(this));
process.on('uncaughtException', handleRejections.bind(this));

// inject runtime configs (from config/{env}.json) to Config class
if (!configjs.has('api')) {
    throw new Error('Cannot find runtime configuration file. Check that config/default.json exists');
}
let conf = Object.assign({}, configjs.get('api'));
let backendConfig = inversifyContainer.get<BackendConfig>(BackendConfig);
backendConfig.setConfig(conf);
log = inversifyContainer.get<Logger>(Logger);

(async () => {
    // start the server
    let server = inversifyContainer.get<Api>(Api);
    await server.setup();
    server.listen();
})();


function handleRejections(err) {
    errorHandler.handleRejections(err, log);
}