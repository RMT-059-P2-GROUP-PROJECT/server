const {Message, User, GroupUser} = require('../models');

class messageController {
    static async getMessage(req, res, next) {
        try {
            const id = +req.params.groupId;
            const checkMember = await GroupUser.findOne({
                where: {
                    GroupId: id,
                    UserId: req.user.id
                }
            });
            if (!checkMember) {
                throw { name: 'Forbidden', message: 'You are not a member of this group' };
            }

            const messages = await Message.findAll({
                where: {
                    GroupId: id
                },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'username']
                    }
                ],
                order: [['createdAt', 'ASC']]
            });
            res.status(200).json(messages);
        } catch (error) {
            next(error);
        }
    }

    static async postMessage(req, res, next) {
        try {
            const id = +req.params.groupId;
            const { message } = req.body;
            const checkMember = await GroupUser.findOne({
                where: {
                    GroupId: id,
                    UserId: req.user.id
                }
            });
            if (!checkMember) {
                throw { name: 'Forbidden', message: 'You are not a member of this group' };
            }

            const messages = await Message.create({
                message: message,
                GroupId: id,
                UserId: req.user.id
            });
            res.status(201).json(messages);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = messageController;