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