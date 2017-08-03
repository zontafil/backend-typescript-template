export enum ErrorCode {
    unauthorized,
    user_not_activated,
    user_not_found,
    user_invalid_password,
    user_already_present,
    invalid_input_parameters,
    missing_email_or_password,
    invalid_email,
    missing_email,
    missing_password
}
export class ApiError extends Error {
    errorCodeObject: ErrorCodeObject;
    constructor(code: ErrorCode) {
        if (!errorsMap.has(code)) {
            super('Invalid error code thrown');
        }
        else {
            let errorCodeObject = errorsMap.get(code);
            super(errorCodeObject.message);
            this.errorCodeObject = errorCodeObject;
        }

        // restore prototype chain
        // see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export interface ErrorCodeObject {
    code?: number;
    label: ErrorCode;
    message?: string;
    status: 400 | 401 | 403;
}

let errorsMap: Map<ErrorCode, ErrorCodeObject> = new Map<ErrorCode, ErrorCodeObject>();

let errors: ErrorCodeObject[] = [
    {
        code: 1002,
        label: ErrorCode.user_not_activated,
        message: 'User not activated',
        status: 401
    },
    {
        code: 1003,
        label: ErrorCode.user_not_found,
        message: 'User not found',
        status: 401
    },
    {
        code: 1004,
        label: ErrorCode.user_invalid_password,
        message: 'Invalid password',
        status: 401
    },
    {
        code: 1101,
        label: ErrorCode.missing_email_or_password,
        message: 'Missing email or password',
        status: 400
    },
    {
        code: 1102,
        label: ErrorCode.user_already_present,
        message: 'An user with the given email is already present',
        status: 400
    },
    {
        code: 1103,
        label: ErrorCode.missing_email,
        message: 'Missing email',
        status: 400
    },
    {
        code: 1104,
        label: ErrorCode.missing_password,
        message: 'Missing password',
        status: 400
    },
    {
        code: 1105,
        label: ErrorCode.invalid_email,
        message: 'Invalid Email',
        status: 400
    },
    {
        code: 10001,
        label: ErrorCode.invalid_input_parameters,
        message: 'Invalid input parameters',
        status: 400
    },
    {
        label: ErrorCode.unauthorized,
        status: 401
    }
];

for (let error of errors) {
    errorsMap.set(error.label, error);
}