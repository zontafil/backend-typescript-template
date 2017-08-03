import {Logger} from 'core/log';
import {BackendConfig} from 'core/config';
import {ApiError} from 'core/errorCodes';
import * as winston from 'winston';
import {injectable} from 'inversify';

export interface ErrorResponseBody {
    message: string;
    stack?: any;
    code?: number;
}

/**
 * Response server useful for changing responses presentation logic
 *
 * @export
 * @class Response
 */
@injectable()
export class ResponseService {
    constructor(
        private _logger: Logger,
        private _config: BackendConfig,
    ) {}
    /**
     * Express error middleware
     *
     * @param {any} err
     * @param {any} req
     * @param {any} res
     * @param {any} next
     *
     * @memberOf Response
     */
    errorMiddleware(err, req, res, next) {
        let status: number = 500;
        let responseBody: ErrorResponseBody;

        if (err instanceof ApiError) {
            responseBody = {
                message: err.errorCodeObject.message,
                code: err.errorCodeObject.code,
                stack: err.stack
            };
            status = err.errorCodeObject.status;
        }
        else if (err instanceof Error) {
            responseBody = {
                message: err.message,
                stack: err.stack
            };
        }
        else {
            responseBody = {
                message: err
            };
        }


        if (status === 400) this.badRequest(responseBody, req, res, next);
        else if (status === 401) this.unauthorized(responseBody, req, res, next);
        else if (status === 403) this.forbidden(responseBody, req, res, next);
        else if (status === 404) this.notFound(responseBody, req, res, next);
        else this.serverError(responseBody, req, res, next);
    }

    // handler for 500 responses
    serverError(err: ErrorResponseBody, req, res, next) {
        if (!this._config.debug.sendErrorsToClient) {
            res.status(500).send();
        }
        else {
            res.status(500).send({
                message: err.message,
                code: err.code,
                stack: (this._config.debug.sendStackToClient) ? err.stack : undefined
            });
        }
        this._logger.error(err);
        process.exit(1);
    }

    // handler for 400 responses
    badRequest(err, req, res, next) {
        res.status(400).send({
            message: err.message,
            code: err.code,
            stack: (this._config.debug.sendStackToClient) ? err.stack : undefined
        });
    }
    // handler for 403 responses
    forbidden(err, req, res, next) {
        return res.status(403).send([{
            message: err.message,
            code: err.code,
            stack: (this._config.debug.sendStackToClient) ? err.stack : undefined
        }]);
    }

    // handler for 401 responses
    unauthorized(err, req, res, next) {
        res.status(401).send({
            message: err.message,
            code: err.code,
            stack: (this._config.debug.sendStackToClient) ? err.stack : undefined
        });
    }

    // handler generic error responses
    notFound(err, req, res, next) {
        res.status(404).send();
    }
}

