import * as express from 'express';
let passport = require('passport');
import {UserRole} from 'models/user.model';
import {injectable} from 'inversify';


export enum Roles {
    authenticated,
    admin,
    create_user,
    reset_password,
    activate_user
}

/**
 * Authorization policy service
 *
 * @export
 * @class Policy
 */
@injectable()
export class Policy {
    constructor() {}
    /**
     * check if the request is authorized for one of the given roles
     *
     * @param {Roles[]} roles
     * @returns {express.RequestHandler}
     *
     * @memberOf Policy
     */
    isOneOf(roles: Roles[]): express.Handler {
        return (req, res, next) => {
            Promise.all(roles.map(role => this.isRoleValid(req, res, role)))
            .then(next)
            .catch(next);
        };
    }
    /**
     * check if the request is authorized for the given role
     *
     * @param {Roles} role
     * @returns {express.RequestHandler}
     *
     * @memberOf Policy
     */
    is(role: Roles): express.Handler {
        return (req, res, next) => {
            this.isRoleValid(req, res, role)
            .then(next)
            .catch(next);
        };
    }

    isRoleValid(req, res, role: Roles ): Promise<boolean> {
        switch (role) {
            case Roles.authenticated: return this.authenticated(req, res);
            case Roles.reset_password: return this.authenticatedResetPassword(req, res);
            case Roles.activate_user: return this.authenticatedActivateUser(req, res);
            case Roles.admin: return this.admin(req, res);
            case Roles.create_user: return this.create_user(req, res);
            default: throw new Error('Invalid Role ' + role);
        }
    }
    authenticatedResetPassword(req, res): Promise<any> {
        return new Promise((resolve, reject) => {
            passport.authenticate('bearer-reset-password')(req, res, () => {
                resolve();
            });
        });
    }
    authenticatedActivateUser(req, res): Promise<any> {
        return new Promise((resolve, reject) => {
            passport.authenticate('bearer-user-activation')(req, res, () => {
                resolve();
            });
        });
    }
    authenticated(req, res): Promise<any> {
        return new Promise((resolve, reject) => {
            passport.authenticate('bearer')(req, res, () => {
                resolve();
            });
        });
    }
    admin(req, res): Promise<any> {
        return new Promise((resolve, reject) => {
            passport.authenticate('bearer')(req, res, () => {
                if (req.user.role !== UserRole.admin) reject({ status: 403 });
                else resolve();
            });
        });
    }
    create_user(req, res): Promise<any> {
        return new Promise((resolve, reject) => {
            passport.authenticate('bearer')(req, res, () => {
                if (req.user.role === UserRole.admin) resolve();
                else reject({ status: 403 });
            });
        });
    }
}