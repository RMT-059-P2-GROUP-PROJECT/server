const { User } = require('../models');
const {comparePassword} = require('../helpers/bcrypt')
const { signToken } = require('../helpers/jwt');
const { OAuth2Client } = require('google-auth-library')

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

    static async googleLogin(req, res, next) {
        try {
            const {googleToken} = req.body

            const client = new OAuth2Client()
            const ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: process.env.GOOGLE_API_KEY
            })

            const payload = ticket.getPayload()
            const [user] = await User.findOrCreate({
                where: {
                    email: payload.email
                },
                defaults: {
                    username: payload.name,
                    email: payload.email,
                    password: Math.random().toString(36).slice(-8),
                }
            })
            const access_token = signToken({ id: user.id })
            res.status(200).json({ access_token })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = ControllUser;