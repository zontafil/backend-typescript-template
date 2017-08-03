require('app-module-path').addPath(__dirname + '/../');
import {MailService} from '../services/mail.service';
require('app-module-path').addPath(__dirname + '/../');
import {ErrorCode, ApiError} from 'core/errorCodes';
import {Logger} from 'core/log';
import {BackendConfig} from 'core/config';
import * as configjs from 'config';
import * as errorHandler from 'utils/errorHandling';
import {Api} from 'api/api';
import {inversifyContainer} from 'core/inversify';
import * as pm2 from 'pm2';
let readLastLines = require('read-last-lines');
let AU = require('ansi_up');


// setup unhandled error handling
let log = inversifyContainer.get<Logger>(Logger);
process.on('unhandledRejection', handleRejections.bind(this));
process.on('uncaughtException', handleRejections.bind(this));

// inject runtime configs (from config/{env}.json) to Config class
if (!configjs.has('api')) {
    throw new Error('Cannot find runtime configuration file. Check that config/default.json exists');
}
let conf = Object.assign({}, configjs.get('api'));
let backendConfig = inversifyContainer.get<BackendConfig>(BackendConfig);
backendConfig.setConfig(conf);
let mailService = inversifyContainer.get<MailService>(MailService);


if (!backendConfig.email.crashNotifyEnabled) {
    log.info('Crash mail notifications disabled. Exiting');
}
else {

    pm2.connect(function () {
        pm2.launchBus(function (err, bus) {
            bus.on('process:event', function (data) {

                let processSuffix = backendConfig.processSuffix;

                if ((data.event === 'exit') && (data.process.name.substring(0, processSuffix.length) === processSuffix)) {

                    // read log files
                    Promise.all([
                        readLastLines.read(data.process.pm_err_log_path, 100),
                        readLastLines.read(data.process.pm_out_log_path, 100)
                    ])
                    .then(([errLogs, outLogs]) => {
                        const ansiup = new AU.default;
                        errLogs = ansiup.ansi_to_html(errLogs);
                        errLogs = errLogs.replace(/(?:\r\n|\r|\n)/g, '<br />');
                        outLogs = ansiup.ansi_to_html(outLogs);
                        outLogs = outLogs.replace(/(?:\r\n|\r|\n)/g, '<br />');
                        let text = '<div> STDERR: ' + errLogs + '<br/><br/>STDOUT: ' + outLogs + '</div>';

                        // send mail
                        log.info('Sending crash notification for service: ' + data.process.name);
                        return Promise.all(backendConfig.email.crashNotifyRecipients.map(recipient => {
                            return mailService.send({
                                from: backendConfig.projectInfo.projectCompanyName + ' <' + backendConfig.email.auth.user + '>',
                                to: recipient,
                                subject: 'Crash report for service ' + data.process.name,
                                html: text
                            });
                        }));
                    });
                }
            });
        });
    });
}

function handleRejections(err) {
    errorHandler.handleRejections(err, log);
}