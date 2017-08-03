// configuration for dependency injection with inversify.js

import {MailService} from 'services/mail.service';
import {UserController} from 'api/endpoints/user/user.controller';
import {Policy} from 'core/policies';
import {UserRoute} from 'api/endpoints/user/user.route';
import {ResponseService} from 'core/response';
import {RouterFactory} from 'api/route';
import {AuthService} from 'services/auth.service';
import {PassportConfig} from 'core/passport';
import {TokenFactory} from 'models/token.model';
import {UserFactory} from 'models/user.model';
import {Db} from 'core/db';
import {Logger} from 'core/log';
import {BackendConfig} from 'core/config';
import {Api} from 'api/api';
import {Container} from 'inversify';
import 'reflect-metadata';

export let inversifyContainer = new Container();

inversifyContainer.bind<Api>(Api).toSelf();
inversifyContainer.bind<BackendConfig>(BackendConfig).toSelf().inSingletonScope();
inversifyContainer.bind<Logger>(Logger).toSelf().inSingletonScope();
inversifyContainer.bind<Db>(Db).toSelf().inSingletonScope();
inversifyContainer.bind<UserFactory>(UserFactory).toSelf();
inversifyContainer.bind<TokenFactory>(TokenFactory).toSelf();
inversifyContainer.bind<PassportConfig>(PassportConfig).toSelf();
inversifyContainer.bind<AuthService>(AuthService).toSelf();
inversifyContainer.bind<RouterFactory>(RouterFactory).toSelf();
inversifyContainer.bind<ResponseService>(ResponseService).toSelf();
inversifyContainer.bind<UserRoute>(UserRoute).toSelf();
inversifyContainer.bind<Policy>(Policy).toSelf();
inversifyContainer.bind<UserController>(UserController).toSelf();
inversifyContainer.bind<MailService>(MailService).toSelf();