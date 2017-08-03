import {ResponseService} from 'core/response';
import { PassportConfig } from 'core/passport';
import { BackendConfig } from 'core/config';
import { Logger } from 'core/log';
import { RouterFactory } from 'api/route';
import { Db } from 'core/db';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as winston from 'winston';
import * as passport from 'passport';
import * as http from 'http';
import {injectable} from 'inversify';


/**
 * The Api server.
 *
 * @class Api
 */
@injectable()
export class Api {

    private _app: express.Application;
    private _server: http.Server;

    /**
     * Constructor.
     *
     * @class Server
     * @constructor
     */
    constructor(
        private _config: BackendConfig,
        private _logger: Logger,
        private _db: Db,
        private _passportConfig: PassportConfig,
        private _route: RouterFactory,
        private _responseService: ResponseService) {}

    /**
     * Setup app (db and routing)
     *
     * @returns {Promise<any>}
     *
     * @memberOf Api
     */
    async setup(): Promise<any> {
        // create new express app
        this._app = express();

        // configure CORS
        this._app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
            next();
        });

        // configure middlewares
        this._app.use(bodyParser.json()); // mount json form parser
        this._app.use(bodyParser.urlencoded({ extended: true })); // mount query string parser

        // configure db
        await this._db.setupDb();

        // configure passport
        this._app.use(passport.initialize());
        this._passportConfig.initStrategies();

        // setup logging middlewares
        this._logger.setupApp(this._app);

        // configure routes
        this._app.use(this._route.expressRouter);

        // configure error handling
        this._app.use(this._responseService.errorMiddleware.bind(this._responseService));
    }

    /**
     * Start the server
     *
     *
     * @memberOf Api
     */
    async listen(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._server = this._app.listen(this._config.port, (server) => {
                this._logger.log.info('Server listening on port ' + this._config.port);
                resolve();
            });
        });
    }
    /**
     * Close the server
     *
     *
     * @memberOf Api
     */
    async close(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._server.close(() => {
                this._logger.log.debug('Server connection closed');
                resolve();
            });
        });
    }
}