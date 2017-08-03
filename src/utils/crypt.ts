import * as bcrypt from 'bcrypt';

export function uid(len: number): string {
    let buf = []
        , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        , charlen = chars.length;

      for (let i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
      }

      return buf.join('');
}

/**
 * Hash the given password
 *
 * @param {string} password
 * @returns {string}
 *
 */
export function hashPassword(password: string): string {
    let salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

