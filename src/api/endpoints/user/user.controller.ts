import { hashPassword } from 'utils/crypt';
import { UserInstance } from 'models/user.model';
import {UserRole} from 'models/user.model';
import { MailService } from 'services/mail.service';
import { Logger } from 'core/log';
import { AuthService } from 'services/auth.service';
import { ApiError, ErrorCode } from 'core/errorCodes';
import { TokenLevel } from 'models/token.model';
import { Db } from 'core/db';
import { BackendConfig } from 'core/config';
import * as utilsReq from 'utils/request';
import { RequestSessionHandler } from 'api/requestSessionHandler';
import * as winston from 'winston';
import * as passport from 'passport';
import {injectable} from 'inversify';



@injectable()
export class UserController {
    constructor(
        private _config: BackendConfig,
        private _logger: Logger,
        private _db: Db,
        private _mail: MailService,
        private _authService: AuthService) {
            this.logoutAction = this.logoutAction.bind(this);
            this.registerAction = this.registerAction.bind(this);
            this.activateAction = this.activateAction.bind(this);
            this.sendResetLinkAction = this.sendResetLinkAction.bind(this);
            this.changePasswordAction = this.changePasswordAction.bind(this);
    }

    /**
     *
     *
     * @param {any} req
     * @param {any} res
     * @param {any} next
     * @returns
     *
     * @memberOf UserController
     */
    async changePasswordAction(req: RequestSessionHandler, res, next) {
        try {
            let data = utilsReq.parseValues(req);
            if (!data.password) {
                throw new ApiError(ErrorCode.missing_password);
            }

            req.user.activated = true;
            req.user.password = hashPassword(data.password);

            await req.user.save();

            res.send();

        } catch (err) {
            next(err);
        }

    }

    /**
     * Send a reset password link to the user's mail
     *
     * @param {RequestSessionHandler} req
     * @param {any} res
     * @param {any} next
     * @returns
     *
     * @memberOf UserController
     */
    async sendResetLinkAction(req: RequestSessionHandler, res, next) {
        const data = utilsReq.parseValues(req);
        let user: UserInstance;

        try {
            if (!data.email) {
                throw new ApiError(ErrorCode.missing_email);
            }

            user = await this._db.models.User.findOne({
                email: data.email
            });

            if (!user) {
                throw new ApiError(ErrorCode.unauthorized);
            }

            res.send();
        } catch (err) {
            next(err);
            return;
        }

        if (this._config.email.sendAuthMails) {
            const link = await this._authService.buildResetPasswordLink(user);

            this._mail.send({
                from: this._config.projectInfo.projectCompanyName + ' <' + this._config.email.auth.user + '>',
                to: data.email,
                replyTo: this._config.email.replyTo,
                subject: `Reimpostazione password ${this._config.projectInfo.projectCompanyNameLong}`,
                html: `
                    <p>Seguire il link sottostante per procedere alla reimpostazione della password della dasboard di ${this._config.projectInfo.projectCompanyNameLong}</p>
                    <p><a href="${link}">${link}</a></p>
                    <p></p>
                `
            });
        }

    }

    /**
     * Activate a user given an activation token sent by mail
     *
     * @param {RequestSessionHandler} req
     * @param {any} res
     * @param {any} next
     *
     * @memberOf UserController
     */
    async activateAction(req: RequestSessionHandler, res, next) {

        // at this point, the authentication is already made by passport using an activation bearer token.
        try {
            // activate the user
            req.user.activated = true;
            await req.user.save();

            res.send();
        } catch (err) {
            next(err);
        }
    }

    /**
     * Register a new user
     *
     * @param {RequestSessionHandler} req
     * @param {any} res
     * @param {any} next
     *
     * @memberOf UserController
     */
    async registerAction(req: RequestSessionHandler, res, next) {
        let data = utilsReq.parseValues(req);
        let user: UserInstance;

        try {
            if (!data.password || !data.email) {
                throw new ApiError(ErrorCode.missing_email_or_password);
            }

            const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            if (!EMAIL_REGEX.test(data.email)) {
                throw new ApiError(ErrorCode.invalid_email);
            }

            // check if a user with the given email is already present in the db
            let oldUser = await this._db.models.User.findOne({
                email: data.email
            });

            if (oldUser) {
                throw new ApiError(ErrorCode.user_already_present);
            }

            user = new this._db.models.User({
                serial: data.serial,
                email: data.email,
                role: UserRole.installer,
                password: hashPassword(data.password),
                activated: false
            });

            await user.save();

            res.send(user);

        }
        catch (err) {
            next(err);
            return;
        }

        if (this._config.email.sendAuthMails) {
            this._logger.debug(`Sending registration mail to ${data.email}`);
            const link = await this._authService.buildActivationLink(user);

            this._mail.send({
                from: this._config.projectInfo.projectCompanyName + ' <' + this._config.email.auth.user + '>',
                to: data.email,
                replyTo: this._config.email.replyTo,
                subject: ` Registrazione a ${this._config.projectInfo.projectCompanyNameLong}`,
                html: `
                    <p>Grazie per esserti registrato a ${this._config.projectInfo.projectCompanyNameLong}.</p>
                    <p>Seguire il link sottostante per procedere all'attivazione dell'account</p>
                    <p><a href="${link}">${link}</a></p>
                    <p></p>
                `
            });
        }
    }

    /**
     * Logout
     *
     * @param {RequestSessionHandler} req
     * @param {any} res
     * @param {any} next
     *
     * @memberOf UserController
     */
    async logoutAction(req: RequestSessionHandler, res, next) {
        try {
            await this._db.models.Token.remove({
                value: req.user.token
            });
            res.send();
        }
        catch (err) {
            next(err);
        }
    }

    /**
     * Login with passport local strategy
     *
     * @param {RequestSessionHandler} req
     * @param {any} res
     * @param {any} next
     *
     * @memberOf UserController
     */
    loginAction(req: RequestSessionHandler, res, next) {
        passport.authenticate('local', (err, user, info) => {
            if (err) next(err);
            else if (info) {
                if (info.message === 'Missing credentials') next({ status: 401 });
                else next(info);
            }
            else if (!user) next({ status: 401 });
            else res.send(user);
        })(req, res, next);
    }

}