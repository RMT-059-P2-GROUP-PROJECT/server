const crypto = require('crypto');
const { Group, GroupUser } = require('../models');
const { where } = require('sequelize');

class ControllGroup {
    static async getGroup(req,res,next){
        try {
            const group = await GroupUser.findAll({
                where: {
                    UserId : req.user.id
                },
                include: [{
                    model: Group
                }]
            })

            if(!group) {
                throw { name: 'NotFound', message: 'No Group found for this user' };
            }
            
            res.status(200).json(group)
        } catch (error) {
            next(error)
        }
    }
    static async createGroup(req, res, next) {
        try {
            const { name } = req.body;
            const userId = req.user.id;

            if (!name) {
                throw { name: "Bad Request", message: "Group name is required" };
            }

            const inviteCode = crypto.randomBytes(4).toString("hex");

            const group = await Group.create({
                name,
                inviteCode,
                createdBy: userId
            });

            await GroupUser.create({
                UserId: userId,
                GroupId: group.id,
                role: "admin"
            });

            res.status(201).json({ message: "Group created", group });
        } catch (err) {
            next(err)
        }
    }

    static async shareGroup(req, res, next) {
        try {
            const { inviteCode } = req.params;
            const userId = req.user.id;

            const group = await Group.findOne({ where: { inviteCode } });

            if (!group) {
                throw { name: "NotFound", message: "Group not found" };
            }

            const isMember = await GroupUser.findOne({
                where: { GroupId: group.id, UserId: userId }
            });

            if (isMember) {
                throw { name: "Bad Request", message: "You are already a member of this group." };
            }

            await GroupUser.create({
                GroupId: group.id,
                UserId: userId,
                role: "member"
            });

            return res.status(200).json({
                message: "Successfully joined the group.",
                group: {
                    id: group.id,
                    name: group.name
                }
            });
        } catch (err) {
            next(err)
        }
    }

    static async generateLink(req, res, next) {
        try {
            const { groupId } = req.params;

            const group = await Group.findByPk(groupId);

            if (!group) {
                throw { name: "NotFound", message: "Group not found" };
            }

            res.status(201).json({ message: `/groups/join/${group.inviteCode}`});
        } catch (err) {
            next(err)
        }
    }
}

module.exports = ControllGroup;