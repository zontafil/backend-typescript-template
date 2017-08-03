import {TokenFactory, TokenModel} from 'models/token.model';
import {injectable} from 'inversify';
import {UserModel, UserFactory} from 'models/user.model';
import {Logger} from 'core/log';
import {BackendConfig} from 'core/config';
import * as mongoose from 'mongoose';
import * as winston from 'winston';
import * as mongoFixtures from 'pow-mongoose-fixtures';

export interface Models {
    User: UserModel;
    Token: TokenModel;
}

@injectable()
export class Db {
    models: Models;
    mongooseConnection: mongoose.Connection;
    constructor(
        private _config: BackendConfig,
        private _log: Logger,
        private _userFactory: UserFactory,
        private _tokenFactory: TokenFactory) {}

    /**
     * Setup the databases and models
     *
     * @returns {Promise<void>}
     *
     * @memberOf Db
     */
    public setupDb(): Promise<any> {
        // connect to mongoDB
        let password = (this._config.mongoDB.password) ? `:${this._config.mongoDB.password}` : '';
        let authString = (this._config.mongoDB.user || password) ? this._config.mongoDB.user + password + '@' : '';
        let mongoUri = 'mongodb://' + authString + this._config.mongoDB.host + '/' + this._config.mongoDB.dbname;

        // use es6 Promise instead of mongoose's default promise library
        // solve deprecation warning. See http://mongoosejs.com/docs/promises.html
        (<any>mongoose).Promise = global.Promise;

        return new Promise((resolve, reject) => {
            if (mongoose.connection.readyState) {
                this._setupModels();
                resolve();
            }
            else {
                mongoose.connect(mongoUri, {useMongoClient: true}, err => {
                    if (err) return reject(err);

                    this._setupModels();
                    resolve();
                });
            }
        });

    }

    /**
     * Load data into mongoDB, using mongoose-fixtures format
     *
     * @param {string} data
     * @returns {Promise<void>}
     *
     * @memberOf Db
     */
    loadMongoDataFromFile(data): Promise<void> {
        return new Promise((resolve, reject) => {
            mongoFixtures.load(data, this.mongooseConnection, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    private _setupModels(): void {

        this._log.debug('Connected to mongoDB database ' + this._config.mongoDB.dbname);

        this.mongooseConnection = mongoose.connection;

        // configure models
        this.models = {
            User: this._userFactory.model,
            Token: this._tokenFactory.model
        };
    }

    /**
     * Truncate all collections/tables in the DB
     *
     * @returns {Promise<void>}
     *
     * @memberOf Db
     */
    async clearDb(): Promise<void> {
        await Promise.all([
            this.models.Token.remove({}),
            this.models.User.remove({})
        ]);
    }
}