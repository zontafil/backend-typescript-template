import * as bcrypt from 'bcrypt';
import { BackendConfig } from 'core/config';
import * as mongoose from 'mongoose';
import { injectable } from 'inversify';


export enum UserRole {
    admin = 0,
    distributor = 1,
    subsidiary = 2,
    partner = 3,
    installer = 4
}

export interface UserInstance extends mongoose.Document {
    // _id: string;
    email?: string;
    password?: string;
    role?: UserRole;
    firstName?: string;
    lastName?: string;
    activated?: boolean;
    enabled?: boolean;
    token?: string;
}

export type UserModel = mongoose.Model<UserInstance>;

let UserSchema = {
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: false,
    },
    role: {
        type: Number,
        required: true,
    },
    firstName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: false,
    },
    activated: {
        type: Boolean,
        required: false,
    },
    token: {
        type: String,
        required: false,
    }
};

@injectable()
export class UserFactory {
    attribute: UserFactory;
    model: UserModel;
    constructor(
        private _config: BackendConfig) {

        if (mongoose.modelNames().indexOf('User') !== -1) {
            this.model = mongoose.model<UserInstance>('User');
        }
        else {
            let schema = new mongoose.Schema(UserSchema);
            schema.set('autoIndex', false);

            schema.methods.toJSON = function() {
                // hide password to clients
                let obj = this.toObject();
                delete obj.password;
                return obj;
            };

            this.model = mongoose.model<UserInstance>('User', schema);
        }
    }
}