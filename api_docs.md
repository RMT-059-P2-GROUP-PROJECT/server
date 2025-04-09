## Endpoints

List of available endpoints:

- `POST /register`


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


## 2. POST /groups

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