import { TokenLevel } from '../models/token.model';
import { BackendConfig } from '../core/config';
import {UserInstance} from 'models/user.model';
import {Db} from 'core/db';
import * as utilsCrypt from 'utils/crypt';
import {TokenInstance} from 'models/token.model';
import * as Bluebird from 'bluebird';
import {injectable} from 'inversify';

@injectable()
export class AuthService {
    constructor(
        private _db: Db,
        private _config: BackendConfig
    ) {}

    /**
     * Build a user activation link to be sent by mail
     *
     * @param {UserInstance} user
     * @returns {Promise<string>}
     *
     * @memberOf AuthService
     */
    async buildActivationLink(user: UserInstance): Promise<string> {
        const activationToken = await this.createToken(user, this._config.token.activationExpire, TokenLevel.activation);

        return `${this._config.email.activationUrl}/${activationToken.value}`;
    }

    /**
     * Build a reset password link to be sent by mail
     *
     * @param {UserInstance} user
     * @returns {Promise<string>}
     *
     * @memberOf AuthService
     */
    async buildResetPasswordLink(user: UserInstance): Promise<string> {
        const activationToken = await this.createToken(user, this._config.token.resetPasswordExpire, TokenLevel.resetPassword);

        return `${this._config.email.resetPasswordUrl}/${activationToken.value}`;
    }

    /**
     * Generate token and associate user to it
     *
     * @private
     * @param {UserInstance} user
     * @returns
     *
     * @memberOf PassportConfig
     */
    async createToken(user: UserInstance, expire: number, level: number): Promise<TokenInstance> {

        let expireAt = new Date();
        expireAt.setTime(expireAt.getTime() + expire * 1000);

        let token = new this._db.models.Token({
           user:  user._id,
           value:  utilsCrypt.uid(16),
           expireAt:  expireAt,
           level:  level
        });

        return await token.save();

    }

}



