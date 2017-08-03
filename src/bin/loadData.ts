require('app-module-path').addPath(__dirname + '/../');
import {Logger} from 'core/log';
import {Db} from 'core/db';
import {BackendConfig} from 'core/config';
import * as configjs from 'config';
import * as errorHandler from 'utils/errorHandling';
import {Api} from 'api/api';
import {inversifyContainer} from 'core/inversify';
import * as minimist from 'minimist';
import * as fixtures from 'pow-mongoose-fixtures';

// setup unhandled error handling
process.on('unhandledRejection', handleRejections.bind(this));
process.on('uncaughtException', handleRejections.bind(this));

// inject runtime configs (from config/{env}.json) to Config class
if (!configjs.has('api')) process.exit(0);
let conf = {};
conf = Object.assign({}, configjs.get('api'));
let backendConfig = inversifyContainer.get<BackendConfig>(BackendConfig);
backendConfig.setConfig(conf);

let log = inversifyContainer.get<Logger>(Logger);

(async () => {

    let argv = minimist(process.argv.slice(2));
    if (argv['file']) {
        // load fixtures into db (only in dev mode)
        console.log('Loading data into DB');

        let db = inversifyContainer.get<Db>(Db);
        await db.setupDb();

        let fixtureFiles = __dirname + '/../../../' + argv['file'];

        fixtures.load(fixtureFiles, db.mongooseConnection, (err) => {
            if (err) throw new Error(err);

            log.info('Data loaded correctly');

            process.exit();
        });

    }
    else {
        console.log('Please specify a file with --file argument');
    }
})();

function handleRejections(err) {
    errorHandler.handleRejections(err, log);
}