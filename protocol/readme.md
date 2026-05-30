### 客户端与服务端通信架构概览

Methods.ts -> Request/Response Method (ID 映射)

Package.ts -> 数据包体的封装

LingCatProto -> 二进制数据结构, 请求体定义, 基础数据类定义

#### 设计思路

服务端生成长期密钥并将公钥通过安全途径传递给客户端验证并保存
```js
crypto.generateKeyPairSync('ed25519')
```

客户端生成临时的密钥对: 客户临时 公,私
储存在内存中仅本次会话使用
```js
crypto.generateKeyPairSync('x25519')
```

客户端连接服务端, 发送初次握手消息, 传递客户端临时公钥, 服务端针对此客户端生成自己的临时密钥对: 服务临时 公,私
```js
// HandShake_Request
keyObject.export({ type: 'spki', format: 'pem' })
crypto.createPublicKey({ key: rawPubC, type: 'spki', format: 'pem' })
```

服务端用自己的 服务临时私钥 和 客户临时公钥 计算共享秘密, 然后依次派生出会话使用的对称加密密钥: 客户端→服务端加密, 服务端→客户端加密
随后丢弃共享秘密不管
```js
crypto.diffieHellman({ privateKey, publicKey })
crypto.hkdfSync('sha256', ikm, salt, info, 32)
```

服务端在客户端握手请求后先用私钥对响应内容签名, 再响应, 传递服务端临时公钥, 客户端用预置的服务端长期公钥进行验证
```js
crypto.sign(null, data, privateKey)
// HandShake_Response
crypto.verify(null, data, publicKey, signature)
```

客户端和服务端一样生成共享秘密 (客户临时私钥 和 服务临时公钥, 和服务端对调过来), 一样派生, 一样丢弃共享秘密

通信加密
```js
crypto.createCipheriv('aes-256-gcm', key, iv)
crypto.createDecipheriv('aes-256-gcm', key, iv)
```
