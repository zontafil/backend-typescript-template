import {UserInstance} from 'models/user.model';
import {Request} from 'express';

export interface RequestSessionHandler extends Request {
    user?: UserInstance;
}