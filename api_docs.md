## Endpoints

List of available endpoints:

- `POST /register`
- `POST /login`
- `POST /google-login`
- `GET /groups`
- `POST /groups`
- `GET /groups/join/:inviteCode`
- `GET /groups/:groupId`
- `POST /groups/:groupId`
- `GET /summerize-AI/:groupId`
- `POST /groups/link-generate/:groupId`


## 1. POST /register

Request:

- body:

```json
{
  "username" : "string",  
  "email": "string",
  "password": "string"
}
```

Response (201 - Created)

```json
{
  "message": "User registered successfully"
}
```

Response (400 - Bad Request)

```json
{
  "message": "Email is required"
}
OR
{
  "message": "Invalid email format"
}
OR
{
  "message": "Username is required"
}
OR
{
  "message": "Email must be unique"
}
OR
{
  "message": "Password is required"
}
```

## 2. POST /login

Request:

- body:

```json
{
  "email":"string",
  "password":"string
}
```

Response (200 - OK)

```json
{
    "access_token": "string"
}
```

Response (400 - Bad Request)

```json
{
    "message": "Email is required"
}
OR
{
    "message": "Password is required"
}
```

Response (401 - Unauthorized)

```json
{
    "message": "Invalid email or password"
}
```

## 3. POST /groups

Request:

- body:

```json
{
  "username" : "name"
}
```

Response (201 - Created)

```json
{
    "message": "string",
    "group": {
        "id": "integer",
        "name": "string",
        "inviteCode": "string",
        "createdBy": "integer",
        "updatedAt": "2025-04-09T00:28:09.508Z",
        "createdAt": "2025-04-09T00:28:09.508Z"
    }
}
```

Response (400 - Bad Request)

```json
{
    "message": "Group name is required"
}
```

## 4. GET /groups/:groupId

Response (200 - OK)

```json
{
    "message": "string",
    "createdAt": "date",
    "updatedAt": "date",
    "User": {
        "id": "integer",
        "username": "string"
    }
}
```

Response (403 - Forbidden)

```json
{
    "message": "You are not a member of this group"
}
```

## 5. POST /groups/:groupId

Request:

- body:

```json
{
  "message" : "string"
}
```

Response (201 - Created)

```json
{
    "message" : "string",
    "GroupId" : "integer",
    "SenderId" : "integer"
}
```

Response (400 - Bad Request)

```json
{
    "message": "Message is required"
}
```

Response (403 - Forbidden)

```json
{
    "message": "You are not a member of this group"
}
```