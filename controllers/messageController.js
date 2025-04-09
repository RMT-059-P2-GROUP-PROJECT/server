const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Message, User, GroupUser } = require('../models');

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

            if (!message) {
                throw { name: 'BadRequest', message: 'Message is required' };
            }

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
                SenderId: req.user.id
            });

            // Populate the user data for the emitted message
            const messageWithUser = await Message.findByPk(messages.id, {
                include: [
                    {
                        model: User,
                        attributes: ['id', 'username']
                    }
                ]
            });

            const io = req.app.get('io');
            // Emit the new message to all clients in the group room
            io.to(`group_${id}`).emit('new_message', messageWithUser);

            res.status(201).json(messages);
        } catch (error) {
            next(error);
        }
    }

    static async summerizeAI(req, res, next) {
        try {
            const groupId = +req.params.groupId;

            const checkMember = await GroupUser.findOne({
                where: {
                    GroupId: groupId,
                    UserId: req.user.id
                }
            });
            if (!checkMember) {
                throw { name: 'Forbidden', message: 'You are not a member of this group' };
            }

            const messages = await Message.findAll({
                where: { GroupId: groupId },
                include: [
                    {
                        model: User,
                        attributes: ['username']
                    }
                ],
                order: [['createdAt', 'ASC']]
            });

            const chatContent = messages.map(msg => `${msg.User.username}: ${msg.message}`).join('\n');

            const prompt = `
            Berikut ini adalah percakapan chat antara beberapa orang. Tolong buatkan ringkasan obrolan ini dengan gaya santai tapi sedikit formal, seperti kalau orang mengambil kesimpulan dari percakapan atau perdebatan 2 orang atau lebih.
            Isi chat:
            ${chatContent}
            `;

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const result = await model.generateContent(prompt);
            const summary = result.response.text();

            res.json({ summary });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = messageController;