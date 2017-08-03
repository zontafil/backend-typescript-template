import * as _ from 'lodash';
import {injectable} from 'inversify';
import 'reflect-metadata';


let defaultConf = {
    projectInfo: {
        projectCompanyName: null,
        projectCompanyNameLong: null
    },
    processSuffix: null,
    port: 27001,
    log: {
        http: true,
        error: true,
        level: 'info',
        timestamp: true
    },
    mongoDB: {
        host: null,
        port: null,
        user: null,
        password: null,
        dbname: null
    },
    mongoDBtest: {
        host: null,
        port: null,
        user: null,
        password: null,
        dbname: null
    },
    token: {
        expire: 2000000,
        resetPasswordExpire: 3600,
        activationExpire: 3000000
    },
    email: {
        host: null,
        port: null,
        secure: null,
        auth: {
            user: null,
            pass: null
        },
        replyTo: null,
        activationUrl: null,
        resetPasswordUrl: null,
        sendAuthMails: false,
        frontendBaseUrl: null,
        crashNotifyEnabled: false,
        crashNotifyRecipients: []
    },
    debug: {
        sendErrorsToClient: false,
        sendStackToClient: false
    }
};

/**
 * Configuration service
 *
 * @export
 * @class ApiConfig
 */
@injectable()
export class BackendConfig {
    projectInfo: {
        projectCompanyName: string;
        projectCompanyNameLong: string;
    };
    /**
     * Process suffix to be used for catching processes crashes  for notification
     *
     * @type {string}
     * @memberOf BackendConfig
     */
    processSuffix: string;
    /**
     * Port which the server will listen to
     *
     * @type {number}
     * @memberOf ApiConfig
     */
    port: number;
    /**
     * turn on/off http and error loggin and set logging level
     *
     * @type {{
     *         http?: boolean;
     *         error?: boolean;
     *         level?: string;
     *     }}
     * @memberOf ApiConfig
     */
    log: {
        http: boolean;
        error: boolean;
        level: string;
        timestamp: boolean;
    };
    mongoDB: {
        user: string;
        password: string;
        host: string;
        port: number;
        dbname: string;
    };
    mongoDBtest: {
        user: string;
        password: string;
        host: string;
        port: number;
        dbname: string;
    };
    token: {
        /**
         * token expiration in seconds
         *
         * @type {number}
         */
        expire: number;
        /**
         * token expiration in seconds for reset password tokens
         *
         * @type {number}
         */
        resetPasswordExpire: number;
        /**
         * token expiration in seconds for activation link
         *
         * @type {number}
         */
        activationExpire: number;
    };
    email: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
        replyTo: string;
        activationUrl: string;
        resetPasswordUrl: string;
        frontendBaseUrl: string;
        crashNotifyEnabled: boolean; // send an email when a service crashes
        crashNotifyRecipients: string[];
        sendAuthMails: boolean;
    };
    debug: {
        sendErrorsToClient: boolean;
        sendStackToClient: boolean;
    };
    constructor() {
        // inject default config
        this.setConfig({});
    }

    /**
     * set configuration data with fallback to default config
     *
     * @param {Object} conf
     *
     * @memberOf ApiConfig
     */
    setConfig(conf: Object) {
        let c = _.merge(defaultConf, conf);
        this.port = c.port;
        this.projectInfo = c.projectInfo;
        this.processSuffix = c.processSuffix;
        this.log = c.log;
        this.mongoDB = c.mongoDB;
        this.mongoDBtest = c.mongoDBtest;
        this.token = c.token;
        this.email = c.email;
        this.debug = c.debug;
    }
}