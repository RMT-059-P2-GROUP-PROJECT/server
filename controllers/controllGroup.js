const crypto = require('crypto');
const { Group, GroupUser } = require('../models');

class ControllGroup {
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
        } catch(err) {
            next(err)
        }
    }
}

module.exports = ControllGroup;