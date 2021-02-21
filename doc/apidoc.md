# 亿点存钱API 文档

[TOC]

## Login Related: 登录相关

### signUp: 注册账号

**Method:** POST

**Path:** /api/signup

**Request**: 

```json
{
    "username": "" // 用户名
    "email": "" // 电子邮箱
    "password": "" // 密码
}
```

**Response**

```json
{
    "success": true // 如果成功则为true
    "data": {
    	"userId": 1, // 用户id,
    	"name": "" // 用户名
	}
}
```

### signIn: 登录账号

**Method:** POST

**Path:** /api/signin

**Request**: 

```json
{
    "identity": "", // 用户名或电子邮箱
    "password": "" // 密码
}
```

**Response**

```json
{
    "success": true, // 如果成功则为true
    "data": {
    	"userId": 1, // 用户id,
    	"name": "" // 用户名
	}
}
```

### signOut: 注销账号

**Method:** DELETE

**Path:** /api/signin

**Request**: 

(无请求)

**Response**

```json
{
    "success": true, // 如果成功则为true
    "data": {
    	"login": true // 如果先前登录了返回true 
	} 
}
```



## Superuser: 超级管理员

用户id为1的自动为超级管理员. 超级管理员不可更改.

### addAdmin: 增加管理员账户

**Method:** GET

**Path:** /api/super/:id

**Request**: 

- **id**: 需添加的管理员的账号

**Response**

```json
{
    "success": true //如果成功则为true
}
```



### deleteAdmin: 删除管理员账户

**Method:** DELETE

**Path:** /api/super/:id

**Request**: 

- **id**: 需删除的管理员的账号

**Response**

```json
{
    "success": true //如果成功则为true
}
```

