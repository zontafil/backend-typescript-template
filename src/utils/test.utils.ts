import { BackendConfig } from '../core/config';
import { inversifyContainer } from '../core/inversify';
import { Db } from 'core/db';
import { Api } from 'api/api';
import * as configjs from 'config';
import * as _ from 'lodash';
import * as Bluebird from 'bluebird';

export interface TestGlobals {
    db: Db;
    url: string;
    api: Api;
}

export async function init_e2e(): Promise<TestGlobals> {

    // inject runtime configs (from config/{env}.json) to Config class
    if (!configjs.has('api')) {
        throw new Error('Cannot find runtime configuration file. Check that config/default.json exists');
    }

    // force the user to use conf.dbTest explicitly to avoid disasters
    let conf: any = Object.assign({}, configjs.get('api'));
    conf.db = conf.dbTest;
    conf.mongoDB = conf.mongoDBtest;

    let backendConfig = inversifyContainer.get<BackendConfig>(BackendConfig);
    backendConfig.setConfig(conf);

    // start the server
    let server = inversifyContainer.get<Api>(Api);
    await server.setup();
    await server.listen();

    return {
        db: inversifyContainer.get<Db>(Db),
        url: 'http://localhost:' + backendConfig.port + '/apiv1/',
        api: server
    };
}

