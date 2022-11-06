import HttpStatus from 'http-status-codes';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models';
import logger from '../../common-modules/server/config/winston';

/**
 * Returns jwt token if valid email and password is provided
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export function login(req, res) {
    const { email, password } = req.body;
    User.query({
        where: { email: email },
    }).fetch({ require: false }).then(user => {
        if (user) {
            if (bcrypt.compareSync(password, user.get('password'))) {

                const token = jwt.sign({
                    id: user.get('id'),
                    email: user.get('email')
                }, process.env.TOKEN_SECRET_KEY);

                res.json({
                    success: true,
                    token,
                    email: user.get('email')
                });
            } else {
                logger.log('error', 'ההתחברות נכשלה. סיסמא לא תקינה.');

                res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'ההתחברות נכשלה. סיסמא לא תקינה.'
                });
            }
        } else {
            logger.log('error', 'ההתחברות נכשלה. שם משתמש או סיסמא לא תואמים.');

            res.status(HttpStatus.UNAUTHORIZED).json({
                success: false, message: 'ההתחברות נכשלה. שם משתמש או סיסמא לא תואמים.'
            });
        }
    });
}