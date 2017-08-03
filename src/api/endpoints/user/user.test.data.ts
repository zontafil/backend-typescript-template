import { TokenLevel } from 'models/token.model';
import { hashPassword } from 'utils/crypt';
import { UserRole } from 'models/user.model';
import * as mongodb from 'mongodb';
let ObjectID = mongodb.ObjectID;

let expireDate = new Date();
expireDate.setTime(expireDate.getTime() + 1000000000);

let testData: any = {};

testData.User = {
    u1: {
        _id: new ObjectID(),
        activated: false,
        email: '1@crispybacontest.it',
        password: hashPassword('1'),
        role: UserRole.installer
    },
    u2: {
        _id: new ObjectID(),
        activated: true,
        email: '2@crispybacontest.it',
        password: hashPassword('2'),
        role: UserRole.installer
    }
};

testData.Token = {
    t1n: {
        _id: new ObjectID(),
        value: '1n',
        expireAt: expireDate,
        level: TokenLevel.authenticate,
        user: testData.User.u1._id
    },
    t1a: {
        _id: new ObjectID(),
        value: '1a',
        expireAt: expireDate,
        level: TokenLevel.activation,
        user: testData.User.u1._id
    },
    t2n: {
        _id: new ObjectID(),
        value: '2n',
        expireAt: expireDate,
        level: TokenLevel.authenticate,
        user: testData.User.u2._id
    },
    t2r: {
        _id: new ObjectID(),
        value: '2r',
        expireAt: expireDate,
        level: TokenLevel.resetPassword,
        user: testData.User.u2._id
    }
};

export = testData;