import bcrypt from 'bcrypt';
import HttpStatus from 'http-status-codes';
import { User } from '../models';

/**
 * Find all the users
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export function findAll(req, res) {
    User.forge()
        .fetchAll()
        .then(user => res.json({
            error: null,
            data: user.toJSON()
        }))
        .catch(err => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: err.message
        }));
}

/**
 *  Find user by id
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export function findById(req, res) {
    User.forge({ id: req.params.id })
        .fetch({ require: false })
        .then(user => {
            if (!user) {
                res.status(HttpStatus.NOT_FOUND).json({
                    error: 'לא נמצא'
                });
            }
            else {
                res.json({
                    error: null,
                    data: user.toJSON()
                });
            }
        })
        .catch(err => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: err.message
        }));
}

/**
 * Store new user
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export function store(req, res) {
    const { name, email } = req.body;
    const password = bcrypt.hashSync(req.body.password, 10);

    User.forge({
        name, email, password
    }).save()
        .then(user => res.json({
            error: null,
            data: user.toJSON()
        }))
        .catch(err => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: err.message
        }));
}

/**
 * Update user by id
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export function update(req, res) {
    User.forge({ id: req.params.id })
        .fetch({ require: true })
        .then(user => user.save({
            name: req.body.name || user.get('name'),
            email: req.body.email || user.get('email')
        }))
        .then(user => res.json({
            error: null,
            data: user.toJSON()
        }))
        .catch(err => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: err.message
        }));
}

/**
 * Destroy user by id
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export function destroy(req, res) {
    User.forge({ id: req.params.id })
        .fetch({ require: true })
        .then(user => user.destroy())
        .then(() => res.json({
            error: null,
            data: { message: 'משתמש נמחק בהצלחה.' }
        }))
        .catch(err => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: err.message
        }));
}