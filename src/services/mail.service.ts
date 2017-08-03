import { BackendConfig } from 'core/config';
import { injectable } from 'inversify';
import * as nodemailer from 'nodemailer';

export interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    activationUrl: string;
}
/**
 * Mail sending service
 *
 * @export
 * @class Mail
 */
@injectable()
export class MailService {
    constructor(private _config: BackendConfig) { }
    /**
     * send email
     *
     * @param {nodemailer.SendMailOptions} options
     * @returns {bluebird<any>}
     *
     * @memberOf Mail
     */
    send(options: nodemailer.SendMailOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let transporter = nodemailer.createTransport(this._config.email);

            transporter.sendMail(options, (err, info) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}