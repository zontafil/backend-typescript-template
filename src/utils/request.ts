import * as _ from 'lodash';

export function parseValues(req): any {
    let ret = _.merge(req.body, req.query);
    ret.where = (typeof ret.where === 'string') ? JSON.parse(ret.where) : ret.where;
    ret.include = (typeof ret.include === 'string') ? JSON.parse(ret.include) : ret.include;
    delete ret.access_token;
    return ret;
}
