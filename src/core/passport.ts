import {TokenLevel} from 'models/token.model';
import {UserInstance} from 'models/user.model';
import {AuthService} from 'services/auth.service';
import {ErrorCode, ApiError} from 'core/errorCodes';
import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import * as bcrypt from 'bcrypt';
import { Db } from 'core/db';
import { BackendConfig } from 'core/config';
import { injectable } from 'inversify';


@injectable()
export class PassportConfig {
    constructor(
        private _config: BackendConfig,
        private _db: Db,
        private _authService: AuthService) {}

    initStrategies() {

        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser((id, done) => {
            this._db.models.User.findOne({
                where: {
                    id: id
                }
            })
                .then((user) => { return done(null, user); })
                .catch((err) => { return done(err, null); });
        });

        // USER/MAIL & PASS LOGIN STRATEGY
        passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        }, async (email, password, done) => {
            if ((!email) || (!password)) return done(null, false);

            try {
                let user = await this._db.models.User.findOne({
                    email: email
                });

                if (!user) throw new ApiError(ErrorCode.user_not_found);
                else if (!bcrypt.compareSync(password, user.password)) throw new ApiError(ErrorCode.user_invalid_password);
                else if (!user.activated) throw new ApiError(ErrorCode.user_not_activated);

                // login succesful. generate token
                let expire = this._config.token.expire;
                let token = await this._authService.createToken(user, expire, 0);

                user.token = token.value;
                return done(null, user);

            }
            catch (err) {
                done(null, false, err);
            }
        }
        ));

        // BEARER TOKEN AUTHENTICATE
        passport.use(new BearerStrategy(
            async (accessToken, done) => {

                let token = await this._db.models.Token.findOne({
                    value: accessToken,
                    expireAt: { $gt: new Date() },
                    level: TokenLevel.authenticate
                })
                .populate('user');

                if (!token) return done(null, false);
                else if (!token.user) return done(null, false);

                let user = <UserInstance>token.user;
                user.token = token.value;
                done(null, user);
                return 0;
            }
        ));
        passport.use('bearer-reset-password', new BearerStrategy(
            async (accessToken, done) => {
                let token = await this._db.models.Token.findOne({
                    value: accessToken,
                    expireAt: { $gt: new Date() },
                    level: TokenLevel.resetPassword
                })
                .populate('user');

                if (!token) return done(null, false);
                else if (!token.user) return done(null, false);

                let user = <UserInstance>token.user;
                user.token = token.value;
                done(null, user);
                return 0;
            }
        ));
        passport.use('bearer-user-activation', new BearerStrategy(
            async (accessToken, done) => {
                let token = await this._db.models.Token.findOne({
                    value: accessToken,
                    expireAt: { $gt: new Date() },
                    level: TokenLevel.activation
                })
                .populate('user');

                if (!token) return done(null, false);
                else if (!token.user) return done(null, false);

                let user = <UserInstance>token.user;
                user.token = token.value;

                // this token can be used once. delete it from the db
                await this._db.models.Token.remove({
                    _id: token.id
                });

                done(null, user);
                return 0;
            }
        ));
    }

}
