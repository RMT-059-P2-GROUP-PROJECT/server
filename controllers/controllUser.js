const { User } = require('../models');

class ControllUser {
    static async register(req, res, next) {
        try {
            await User.create(req.body);

            res.status(201).json({ message: 'User registered successfully' });
        } catch (err) {
            next(err)
        }
    }
}

module.exports = ControllUser;