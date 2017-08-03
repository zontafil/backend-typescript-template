import {UserController} from 'api/endpoints/user/user.controller';
import {Roles, Policy} from 'core/policies';
import {Db} from 'core/db';
import {BackendConfig} from 'core/config';
import {Router} from 'express';
import {LoggerInstance} from 'winston';
import {injectable} from 'inversify';



@injectable()
export class UserRoute {
    constructor(
        private _policy: Policy,
        private _userController: UserController) {}

    setupRoutes(router: Router) {

        /**
         *
         * @api {POST} /login Login
         * @apiName Login
         * @apiGroup User
         * @apiDescription Login with email password
         *
         * @apiParam email Email
         * @apiParam password Password
         *
         * @apiSuccess (200) {string} token Token for HTTP APIs authentication
         * @apiSuccess (200) {string} _id
         * @apiSuccess (200) {string} email
         * @apiSuccess (200) {string} serial
         * @apiSuccess (200) {number} admin = 0, distributor = 1, subsidiary = 2, partner = 3, installer = 4
         * @apiSuccess (200) {boolean} activated
         *
         * * @apiSuccessExample {json} Success-Response:
         *     HTTP/1.1 200 OK
         * {
         *     "token": "gPjyD1d9t2Nz1k6m",
         *     "_id": "5967957ae0f5625e292a9989",
         *     "email": "walter@zenga.it",
         *     "role": 0,
         *     "activated": true,
         *     "serial": "serialnumber2"
         * }
         */

        router.post('/apiv1/login', this._userController.loginAction);

        /**
         *
         * @api {POST} /logout Logout
         * @apiName Logout
         * @apiGroup User
         * @apiDescription Logout
         * @apiUse bearer_token
         *
         * * @apiSuccessExample {json} Success-Response:
         *     HTTP/1.1 200 OK
         *
         */
        router.post('/apiv1/logout', this._policy.is(Roles.authenticated), this._userController.logoutAction);

        /**
         *
         * @api {POST} /register Register User
         * @apiName Register User
         * @apiGroup User
         * @apiDescription Register User
         *
         * @apiParam email Email
         * @apiParam serial Serial
         *
         * @apiSuccess (200) {string} _id
         * @apiSuccess (200) {string} email
         * @apiSuccess (200) {string} serial
         * @apiSuccess (200) {number} admin = 0, distributor = 1, subsidiary = 2, partner = 3, installer = 4
         *
         * * @apiSuccessExample {json} Success-Response:
         *     HTTP/1.1 200 OK
         * {
         *     "serial": "serialnumber2",
         *     "email": "lol2@copter.it",
         *     "role": 0,
         *     "_id": "596cc3613f03db092aca8d98"
         * }
         *
         */
        router.post('/apiv1/register', this._userController.registerAction);

        /**
         *
         * @api {POST} /activate Activate user
         * @apiName Activate user
         * @apiGroup User
         * @apiDescription Activate a user
         * @apiUse bearer_token_activate
         *
         * * @apiSuccessExample {json} Success-Response:
         *     HTTP/1.1 200 OK
         */
        router.post('/apiv1/activate', this._policy.is(Roles.activate_user), this._userController.activateAction);

        /**
         *
         * @api {POST} /resetlink Reset password link
         * @apiName Reset password link
         * @apiGroup User
         * @apiDescription Send by mail a reset password link
         * @apiParam email Email
         *
         * * @apiSuccessExample {json} Success-Response:
         *     HTTP/1.1 200 OK
         */
        router.post('/apiv1/resetlink', this._userController.sendResetLinkAction);

        /**
         *
         * @api {POST} /changePassword Change password
         * @apiName Change password
         * @apiGroup User
         * @apiDescription Change password, given a reset password token
         * @apiUse bearer_token_resetpassword
         * @apiParam password New Password
         *
         * * @apiSuccessExample {json} Success-Response:
         *     HTTP/1.1 200 OK
         */
        router.post('/apiv1/changePassword', this._policy.is(Roles.reset_password), this._userController.changePasswordAction);
    }
}