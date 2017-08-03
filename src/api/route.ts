import {UserRoute} from 'api/endpoints/user/user.route';
import {injectable} from 'inversify';
import {Logger} from 'core/log';
import {BackendConfig} from 'core/config';
import * as express from 'express';
import * as winston from 'winston';
import {Db} from 'core/db';

/**
 * Routing configuration
 *
 * @export
 * @class Router
 */
@injectable()
export class RouterFactory {
    /**
     * express middleware
     *
     * @type {express.Router}
     * @memberOf Router
     */
    public expressRouter: express.Router;
    constructor(private _userRoute: UserRoute) {

        let router = express.Router(); // create a new Router

        // setup the routes
        this._userRoute.setupRoutes(router);

        this.expressRouter = router;
    }
}