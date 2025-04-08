const { User } = require('../models');
const {comparePassword} = require('../helpers/bcrypt')
const { signToken } = require('../helpers/jwt');

class ControllUser {
    static async register(req, res, next) {
        try {
            await User.create(req.body);

            res.status(201).json({ message: 'User registered successfully' });
        } catch (err) {
            console.lo
            next(err)
        }
    }

    static async login(req,res,next){
        try {
            const { email, password } = req.body
            if (!email) {
                throw { name: 'Bad Request', message: 'Email is required' }
            }
            if (!password) {
                throw { name: 'Bad Request', message: 'Password is required' }
            }
            const user = await User.findOne({
                where: {
                    email
                }
            })
            if (!user) {
                throw { name: 'Unauthorized', message: 'Invalid email or password' }
            }
            const isValid = comparePassword(password, user.password)
            if (!isValid) {
                throw { name: 'Unauthorized', message: 'Invalid email or password' }
            }

            const access_token = signToken({ id: user.id})  
            res.status(200).json({ access_token })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = ControllUser;