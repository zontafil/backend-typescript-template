import {injectable} from 'inversify';
import {BackendConfig} from 'core/config';
import * as express from 'express';
import * as winston from 'winston';
import * as winstonCommon from 'winston/lib/winston/common';
let expressWinston = require('express-winston');
import * as dateformat from 'dateformat';
import 'reflect-metadata';

interface LoggerConfig {
    http: boolean;
    error: boolean;
    level: string;
    timestamp: boolean;
}

/**
 * Logging class utilities
 *
 * @export
 * @class Logger
 */
@injectable()
export class Logger {
    /**
     * Winston logging instance for programmatic use (log.info('');)
     *
     * @type {winston.LoggerInstance}
     * @memberOf Logger
     */
    log: winston.LoggerInstance;

    /**
     * Redirect to winstonLog.error
     *
     * @param {any} err
     *
     * @memberOf Logger
     */
    error(err) {
        return this.log.error(err);
    }

    /**
     * Redirect to winstonLog.debug
     *
     * @param {any} err
     *
     * @memberOf Logger
     */
    debug(message) {
        return this.log.debug(message);
    }

    /**
     * Redirect to winstonLog.info
     *
     * @param {any} message
     *
     * @memberOf Logger
     */
    info(message) {
        return this.log.log('info', message);
    }

    /**
     * Redirect to winstonLog.silly
     *
     * @param {any} message
     *
     * @memberOf Logger
     */
    silly(message) {
        return this.log.log('silly', message);
    }

    /**
     * add winston logger to express application, i.e. request logging, error logging
     *
     * @static
     * @param {express.Application} app
     *
     * @memberOf Log
     */
    constructor(private _config: BackendConfig) {

        // Override to use real console.log etc for VSCode debugger
        // see https://github.com/winstonjs/winston/issues/981
        // and https://github.com/Microsoft/vscode/issues/19750
        winston.transports.Console.prototype.log = function (level, message, meta, callback) {
          const output = winstonCommon.log(Object.assign({}, this, {
            level,
            message,
            meta,
          }));

          console[level in console ? level : 'log'](output);

          setImmediate(callback, null, true);
        };

        console.log('Logger: log level ' + this._config.log.level);

        this.log = new winston.Logger({
            level: this._config.log.level,
            transports: [
                new (winston.transports.Console)({
                    json: false,
                    colorize: true,
                    useTimestamp: this._config.log.level,
                    stderrLevels: ['error'],
                    timestamp: (this._config.log.timestamp) ? function() {
                        return (<any>winston).config.colorize('data', dateformat(new Date(), 'isoDateTime'));
                    } : false
                })
            ]
        });
    }
    setupApp(app: express.Application) {

        // log http requests
        if (this._config.log.http) app.use(expressWinston.logger({
            transports: [
                new winston.transports.Console({
                    json: false,
                    colorize: true,
                    timestamp: (this._config.log.timestamp) ? function() {
                        return (<any>winston).config.colorize('data', dateformat(new Date(), 'isoDateTime'));
                    } : false
                })
            ],
            meta: false, // optional: control whether you want to log the meta data about the request (default to true)
            msg: 'HTTP {{req.method}} {{req.url}} {{res.responseTime}}ms {{res.statusCode}}',
            colorize: true
        }));

    }

}