import * as dateformat from 'dateformat';
import {Logger} from 'core/log';

export function handleRejections(err, log: Logger) {
    let errors = [err];
    if (err.stack) errors.push(err.stack);
    printErrors(errors, log);
    process.exit(1);
}

export function printErrors(errors: any[], log: Logger) {
    errors.forEach(err => {
        log.error(err);
    });
}