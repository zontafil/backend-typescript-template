import {UserInstance} from 'models/user.model';
import { BackendConfig } from 'core/config';
import * as mongoose from 'mongoose';
import { injectable } from 'inversify';

export enum TokenLevel {
    authenticate = 0,
    resetPassword = 1,
    activation = 2
}

export interface TokenInstance extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    value?: string;
    expireAt?: Date;
    level?: TokenLevel;
    user?: mongoose.Types.ObjectId | UserInstance;
    User?: UserInstance;
}

export type TokenModel = mongoose.Model<TokenInstance>;

let TokenSchema = {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    },
    value: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        required: true
    },
    level: {
        type: Number,
        required: true
    }
};

@injectable()
export class TokenFactory {
    attribute: TokenFactory;
    model: TokenModel;
    constructor(
        private _config: BackendConfig) {

        if (mongoose.modelNames().indexOf('Token') !== -1) {
            this.model = mongoose.model<TokenInstance>('Token');
        }
        else {
            let schema = new mongoose.Schema(TokenSchema);
            schema.set('autoIndex', false);
            this.model = mongoose.model<TokenInstance>('Token', schema);
        }
    }
}