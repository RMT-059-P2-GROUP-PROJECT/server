const request = require("supertest")
const { test, expect, beforeAll, afterAll, describe } = require("@jest/globals")
const { app, closeServer } = require("../app")
const { User, Group, GroupUser, Message } = require('../models')
const { signToken } = require("../helpers/jwt")
const { hashPassword } = require("../helpers/bcrypt")

let accessToken
let groupId
let inviteCode

beforeAll(async () => {
    console.log("beforeAll")

    const hashedPassword = hashPassword("testpassword123")

    await User.bulkCreate([
        {
            "username": "testuser1",
            "email": "testuser1@example.com",
            "password": hashedPassword,
        },
        {
            "username": "testuser2",
            "email": "testuser2@example.com",
            "password": hashedPassword,
        },
        {
            "username": "testuser3",
            "email": "testuser3@example.com",
            "password": hashedPassword,
        },
    ])

    const user = await User.create({
        "username": "mainuser",
        "email": "mainuser@example.com",
        "password": hashedPassword,
    })

    accessToken = signToken({ id: user.id })

    const group = await Group.create({
        name: "Test Group",
        inviteCode: "testcode123",
        createdBy: user.id
    })

    groupId = group.id
    inviteCode = group.inviteCode

    await GroupUser.create({
        UserId: user.id,
        GroupId: group.id,
        role: "admin"
    })

    await Message.create({
        message: "Hello everyone!",
        GroupId: group.id,
        SenderId: user.id
    })
})

afterAll(async () => {
    console.log("afterAll")
    await Message.destroy({
        truncate: true,
        cascade: true,
        restartIdentity: true
    })
    await GroupUser.destroy({
        truncate: true,
        cascade: true,
        restartIdentity: true
    })
    await Group.destroy({
        truncate: true,
        cascade: true,
        restartIdentity: true
    })
    await User.destroy({
        truncate: true,
        cascade: true,
        restartIdentity: true
    })

    await require('../models').sequelize.close();
    
    closeServer();
})

describe("USER AUTHENTICATION", () => {
    describe("POST /register", () => {
        test("berhasil mendaftarkan user baru", async () => {
            const newUser = {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "newuser123"
            }

            const response = await request(app)
                .post("/register")
                .send(newUser)

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty("message", "User registered successfully")
        })

        test("gagal mendaftarkan user dengan email yang sudah terdaftar", async () => {
            const existingUser = {
                "username": "duplicate",
                "email": "mainuser@example.com",
                "password": "duplicate123"
            }

            const response = await request(app)
                .post("/register")
                .send(existingUser)

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty("message", expect.any(String))
        })
    })

    describe("POST /login", () => {
        test("berhasil login dan mengirimkan access_token", async () => {
            const loginData = {
                "email": "mainuser@example.com",
                "password": "testpassword123"
            }

            const response = await request(app)
                .post("/login")
                .send(loginData)

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty("access_token", expect.any(String))
            expect(response.body).toHaveProperty("id", expect.any(Number))
        })

        test("Email tidak diisi", async () => {
            const loginData = {
                "email": "",
                "password": "testpassword123"
            }

            const response = await request(app)
                .post("/login")
                .send(loginData)

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty("message", "Email is required")
        })

        test("Password tidak diisi", async () => {
            const loginData = {
                "email": "mainuser@example.com",
                "password": ""
            }

            const response = await request(app)
                .post("/login")
                .send(loginData)

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty("message", "Password is required")
        })

        test("Email tidak terdaftar", async () => {
            const loginData = {
                "email": "nonexistent@example.com",
                "password": "testpassword123"
            }

            const response = await request(app)
                .post("/login")
                .send(loginData)

            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty("message", "Invalid email or password")
        })

        test("Password diberikan salah/tidak match", async () => {
            const loginData = {
                "email": "mainuser@example.com",
                "password": "wrongpassword"
            }

            const response = await request(app)
                .post("/login")
                .send(loginData)

            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty("message", "Invalid email or password")
        })
    })

    describe("POST /google-login", () => {
        test("gagal login dengan google tanpa token", async () => {
            const response = await request(app)
                .post("/google-login")
                .send({})

            expect(response.status).toBe(500)
        })
    })
})

describe("GROUP MANAGEMENT", () => {
    describe("GET /groups", () => {
        test("berhasil mendapatkan daftar grup untuk user yang login", async () => {
            const response = await request(app)
                .get("/groups")
                .set("Authorization", `Bearer ${accessToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Array)
            expect(response.body.length).toBeGreaterThan(0)
            expect(response.body[0]).toHaveProperty("Group")
            expect(response.body[0].Group).toHaveProperty("name")
        })

        test("gagal mendapatkan daftar grup tanpa authentication", async () => {
            const response = await request(app)
                .get("/groups")

            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty("message", "Invalid token")
        })
    })

    describe("POST /groups", () => {
        test("berhasil membuat grup baru", async () => {
            const newGroup = {
                "name": "New Test Group"
            }

            const response = await request(app)
                .post("/groups")
                .send(newGroup)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty("message", "Group created")
            expect(response.body).toHaveProperty("group")
            expect(response.body.group).toHaveProperty("name", newGroup.name)
            expect(response.body.group).toHaveProperty("inviteCode", expect.any(String))
        })

        test("gagal membuat grup tanpa nama", async () => {
            const invalidGroup = {
                "name": ""
            }

            const response = await request(app)
                .post("/groups")
                .send(invalidGroup)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty("message", "Group name is required")
        })

        test("gagal membuat grup tanpa authentication", async () => {
            const newGroup = {
                "name": "Another Test Group"
            }

            const response = await request(app)
                .post("/groups")
                .send(newGroup)

            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty("message", "Invalid token")
        })
    })

    describe("GET /groups/join/:inviteCode", () => {
        test("berhasil bergabung dengan grup menggunakan kode undangan", async () => {
            const secondUser = await User.findOne({
                where: { email: "testuser1@example.com" }
            })

            const secondUserToken = signToken({ id: secondUser.id })

            const response = await request(app)
                .get(`/groups/join/${inviteCode}`)
                .set("Authorization", `Bearer ${secondUserToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty("message", "Successfully joined the group.")
            expect(response.body).toHaveProperty("group")
            expect(response.body.group).toHaveProperty("name")
        })

        test("gagal bergabung dengan grup menggunakan kode undangan yang tidak valid", async () => {
            const response = await request(app)
                .get("/groups/join/invalidcode")
                .set("Authorization", `Bearer ${accessToken}`)

            expect(response.status).toBe(404)
            expect(response.body).toHaveProperty("message", "Group not found")
        })

        test("gagal bergabung dengan grup yang sudah diikuti", async () => {
            const response = await request(app)
                .get(`/groups/join/${inviteCode}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty("message", "You are already a member of this group.")
        })

        test("gagal bergabung dengan grup tanpa authentication", async () => {
            const response = await request(app)
                .get(`/groups/join/${inviteCode}`)

            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty("message", "Invalid token")
        })
    })

    describe("POST /groups/link-generate/:groupId", () => {
        test("berhasil generate link invite untuk grup", async () => {
            const response = await request(app)
                .post(`/groups/link-generate/${groupId}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty("message", `/groups/join/${inviteCode}`)
        })

        test("gagal generate link untuk grup yang tidak ada", async () => {
            const response = await request(app)
                .post("/groups/link-generate/9999")
                .set("Authorization", `Bearer ${accessToken}`)

            expect(response.status).toBe(404)
            expect(response.body).toHaveProperty("message", "Group not found")
        })

        test("gagal generate link tanpa authentication", async () => {
            const response = await request(app)
                .post(`/groups/link-generate/${groupId}`)

            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty("message", "Invalid token")
        })
    })
})

describe("MESSAGING", () => {
    describe("GET /groups/:groupId", () => {
        test("berhasil mendapatkan pesan dalam grup", async () => {
            const response = await request(app)
                .get(`/groups/${groupId}`)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Array)
            expect(response.body[0]).toHaveProperty("message")
            expect(response.body[0]).toHaveProperty("User")
        })

        test("gagal mendapatkan pesan dari grup yang bukan anggota", async () => {
            const thirdUser = await User.findOne({
                where: { email: "testuser3@example.com" }
            })

            const thirdUserToken = signToken({ id: thirdUser.id })

            const response = await request(app)
                .get(`/groups/${groupId}`)
                .set("Authorization", `Bearer ${thirdUserToken}`)

            expect(response.status).toBe(403)
            expect(response.body).toHaveProperty("message", "You are not a member of this group")
        })

        test("gagal mendapatkan pesan tanpa authentication", async () => {
            const response = await request(app)
                .get(`/groups/${groupId}`)

            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty("message", "Invalid token")
        })
    })

    describe("POST /groups/:groupId", () => {
        test("berhasil mengirim pesan ke grup", async () => {
            const newMessage = {
                "message": "Hello from the test suite!"
            }

            const response = await request(app)
                .post(`/groups/${groupId}`)
                .send(newMessage)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty("message", newMessage.message)
            expect(response.body).toHaveProperty("GroupId", groupId)
            expect(response.body).toHaveProperty("SenderId", expect.any(Number))
        })

        test("gagal mengirim pesan kosong", async () => {
            const emptyMessage = {
                "message": ""
            }

            const response = await request(app)
                .post(`/groups/${groupId}`)
                .send(emptyMessage)
                .set("Authorization", `Bearer ${accessToken}`)

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty("message", "Message is required")
        })

        test("gagal mengirim pesan ke grup yang bukan anggota", async () => {
            const thirdUser = await User.findOne({
                where: { email: "testuser3@example.com" }
            })

            const thirdUserToken = signToken({ id: thirdUser.id })

            const newMessage = {
                "message": "Can I join the conversation?"
            }

            const response = await request(app)
                .post(`/groups/${groupId}`)
                .send(newMessage)
                .set("Authorization", `Bearer ${thirdUserToken}`)

            expect(response.status).toBe(403)
            expect(response.body).toHaveProperty("message", "You are not a member of this group")
        })

        test("gagal mengirim pesan tanpa authentication", async () => {
            const newMessage = {
                "message": "Anonymous message"
            }

            const response = await request(app)
                .post(`/groups/${groupId}`)
                .send(newMessage)

            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty("message", "Invalid token")
        })
    })

    describe("GET /summerize-AI/:groupId", () => {
        test("gagal meringkas percakapan bagi user yang bukan anggota grup", async () => {
            const thirdUser = await User.findOne({
                where: { email: "testuser3@example.com" }
            })

            const thirdUserToken = signToken({ id: thirdUser.id })

            const response = await request(app)
                .get(`/summerize-AI/${groupId}`)
                .set("Authorization", `Bearer ${thirdUserToken}`)

            expect(response.status).toBe(403)
            expect(response.body).toHaveProperty("message", "You are not a member of this group")
        })

        test("gagal meringkas percakapan tanpa authentication", async () => {
            const response = await request(app)
                .get(`/summerize-AI/${groupId}`)

            expect(response.status).toBe(401)
            expect(response.body).toHaveProperty("message", "Invalid token")
        })
    })
})