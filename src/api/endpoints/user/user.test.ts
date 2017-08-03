require('app-module-path').addPath(__dirname + '/../../../');
import { UserRole } from '../../../models/user.model';
import 'mocha';
import * as Request from 'supertest';
import * as testUtils from 'utils/test.utils';
import expect = require('expect.js');
let mongoFixtures = require('pow-mongoose-fixtures');

let testGlobals: testUtils.TestGlobals;

describe('User', () => {
    before(async () => {
        // init server, db
        let t = await testUtils.init_e2e();
        testGlobals = t;
    });
    after(async () => {
        await testGlobals.api.close();
    });
    beforeEach(async () => {
        await testGlobals.db.clearDb();
        await testGlobals.db.loadMongoDataFromFile(require('./user.test.data.js'));
    });
    describe('login', () => {
        it('should not login as a not activated user', async () => {
            await Request(testGlobals.url)
                .post('login')
                .send({
                    email: '1@crispybacontest.it',
                    password: '1'
                })
                .expect(401);
        });
        it('should not login with a wrong email', async () => {
            await Request(testGlobals.url)
                .post('login')
                .send({
                    email: '222@crispybacontest.it',
                    password: '1'
                })
                .expect(401);
        });
        it('should not login with a wrong password', async () => {
            await Request(testGlobals.url)
                .post('login')
                .send({
                    email: '1@crispybacontest.it',
                    password: '2'
                })
                .expect(401);
        });
        it('should login as an activated user', async () => {
            let res = await Request(testGlobals.url)
                .post('login')
                .send({
                    email: '2@crispybacontest.it',
                    password: '2'
                })
                .expect(200);
            expect(res.body.email).to.be('2@crispybacontest.it');
        });
    });
    describe('logout', () => {
        it('should not logout with a wrong token', async () => {
            await Request(testGlobals.url)
                .post('logout')
                .set('Authorization', 'bearer 10')
                .expect(401);
        });
        it('should logout with a valid token', async () => {
            await Request(testGlobals.url)
                .post('logout')
                .set('Authorization', 'bearer 1n')
                .expect(200);

            let token = await testGlobals.db.models.Token.findOne({
                value: '1n'
            });
            expect(token).to.not.be.ok();
        });
    });
    describe('activate', () => {
        it('should not activate a user with a normal level token', async () => {
            await Request(testGlobals.url)
                .post('activate')
                .set('Authorization', 'bearer 1n')
                .expect(401);
        });
        it('should activate a user with a valid token', async () => {
            await Request(testGlobals.url)
                .post('activate')
                .set('Authorization', 'bearer 1a')
                .expect(200);

            let user = await testGlobals.db.models.User.findOne({
                email: '1@crispybacontest.it'
            });

            expect(user).to.be.ok();
            expect(user.activated).to.be(true);
        });
    });
    describe('change password', () => {
        it('should not change password with a normal level token', async () => {
            await Request(testGlobals.url)
                .post('changePassword')
                .set('Authorization', 'bearer 2n')
                .send({
                    password: 'new'
                })
                .expect(401);
        });
        it('should change password with a valid token', async () => {
            await Request(testGlobals.url)
                .post('changePassword')
                .set('Authorization', 'bearer 2r')
                .send({
                    password: 'new'
                })
                .expect(200);

            await Request(testGlobals.url)
            .post('login')
            .send({
                email: '2@crispybacontest.it',
                password: 'new'
            })
            .expect(200);
        });
        it('should not change password when a password is not provided', async () => {
            let res = await Request(testGlobals.url)
                .post('changePassword')
                .set('Authorization', 'bearer 2r')
                .send({})
                .expect(400);

            expect(res.body.code).to.be(1104);
        });
    });
    describe('register', () => {
        it('should not register a user without an email', async () => {
            let res = await Request(testGlobals.url)
                .post('register')
                .send({
                    password: 'pass'
                })
                .expect(400);

            expect(res.body.code).to.be(1101);
        });
        it('should not register a user without a password', async () => {
            let res = await Request(testGlobals.url)
                .post('register')
                .send({
                    email: '10@crispybacontest.it'
                })
                .expect(400);

            expect(res.body.code).to.be(1101);
        });
        it('should not register a user with an invalid email', async () => {
            let res = await Request(testGlobals.url)
                .post('register')
                .send({
                    email: '10crispybacontest.it',
                    password: 'pass'
                })
                .expect(400);

            expect(res.body.code).to.be(1105);
        });
        it('should not register a user with an already registered email', async () => {
            let res = await Request(testGlobals.url)
                .post('register')
                .send({
                    email: '1@crispybacontest.it',
                    password: 'pass'
                })
                .expect(400);

            expect(res.body.code).to.be(1102);
        });
        it('should register a user with a valid email and password, the user should not be activated', async () => {
            let res = await Request(testGlobals.url)
                .post('register')
                .send({
                    email: '10@crispybacontest.it',
                    password: 'pass'
                })
                .expect(200);

            expect(res.body.activated).to.be(false);
        });
        it('should register with installer role', async () => {
            let res = await Request(testGlobals.url)
                .post('register')
                .send({
                    email: '10@crispybacontest.it',
                    password: 'pass'
                })
                .expect(200);

            expect(res.body.role).to.be(UserRole.installer);
        });
    });
    describe('reset link', () => {
        it('should not send a reset link for a not existant mail', async () => {
            let res = await Request(testGlobals.url)
                .post('resetlink')
                .send({
                    email: '100@crispybacontest.it'
                })
                .expect(401);
        });
        it('should send a reset link for a valid email', async () => {
            let res = await Request(testGlobals.url)
                .post('resetlink')
                .send({
                    email: '1@crispybacontest.it'
                })
                .expect(200);
        });
    });
});
