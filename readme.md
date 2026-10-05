<div align="center">
  <h1>灵猫</h1>
</div>
<br>

一个普通的即时通讯项目——简单, 轻量, 纯粹, 时而天真

## 简介

本项目是由 **月有阴晴圆缺 (白日梦 / 满月叶)** 使用 Node.js + React 编写的轻量级自部署即时通讯应用. 

- **前端**: MDUI v2（Material Design 3 风格 UI 库, 已根据自己的需求魔改）
- **后端**: Express + WebSocket + Knex (SQLite)
- **加密**: X25519 密钥交换 + XChaCha20-Poly1305 会话加密

Android 客户端仍在开发中, 敬请期待. 

> 在本项目之前, 本人也有多次即时通讯类应用程序的开发尝试, 但多以失败告终. 
>
> 本项目在多处 vibe 以快速开发功能, 但也不乏自己的审查和测试, 以及个人风格的修改. 
>
> 如果发现任何 Bug, 欢迎各位提交修复 ^_^

## 基础功能部署

```bash
git clone https://codeberg.org/CrescentLeaf/LingCat
cd LingCat

# 安装依赖
npm install -d

# 首次启动服务端, 生成密钥
npm run server
# 生成密钥后按 Ctrl+C 关闭

# 构建前端
npm run build-client

# 再次启动服务端
npm run server
```

启动后访问 `http://localhost:3601` 即可看到页面. 

> 所有数据（数据库、密钥、上传文件）存放在 `./lingcat_data/`

## LiveKit 功能部署

会议 / 语音 / 屏幕共享 / 摄像头功能依赖 **LiveKit**. 

### 1. 下载并启动 LiveKit Server

去 [LiveKit Releases](https://github.com/livekit/livekit/releases/) 下载对应平台的服务端, 解压后:

```bash
cd /path/to/livekit-server

# 生成 API Key 和 Secret
./livekit-server generate-keys
# 输出示例:
# API Key:    APIxxxxxxxxxxxx
# API Secret: secretxxxxxxxxxxxxxxxxxxxxxxxx

# 启动服务端 (注意冒号两侧不要有空格)
./livekit-server --keys "APIxxxxxxxxxxxx:secretxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 2. 配置

编辑 `lingcat_data/config.json`, 添加以下字段:

```json
{
    "livekit_enabled": true,
    "livekit_url": "same-origin",
    "livekit_api_key": "APIxxxxxxxxxxxx",
    "livekit_api_secret": "secretxxxxxxxxxxxxxxxxxxxxxxxx",
    "livekit_http_url": "http://localhost:7880",
    "max_meeting_participants": 6,
    "meeting_token_ttl_seconds": 7200
}
```

| 字段 | 说明 |
|------|------|
| `livekit_enabled` | `false` 时所有会议接口返回 403, 前端自动隐藏会议按钮 |
| `livekit_url` | `"same-origin"`（走 Nginx 反代）或 `"wss://livekit.example.com"`（直连） |
| `livekit_api_key` / `livekit_api_secret` | 与 LiveKit Server 的 `--keys` 保持一致 |
| `livekit_http_url` | 服务端调用 LiveKit HTTP API 的地址（默认 `http://localhost:7880`） |
| `max_meeting_participants` | 单个会议房间的人数上限 |
| `meeting_token_ttl_seconds` | 会议 Token 的有效期（秒） |

### 3. 网络要求

LiveKit 需要以下端口对客户端可达:

| 端口 | 协议 | 用途 |
|------|------|------|
| 7880 | TCP | 信令 WebSocket / HTTP API |
| 7881 | TCP | WebRTC over TCP（UDP 不通时兜底） |
| 7882 | UDP | WebRTC 媒体流（主要通道, **必须开放**） |

> **只开放 TCP 端口会导致 WebRTC 走 TCP 兜底**, 能连接但延迟高、丢包重传严重. 生产环境务必开放 **UDP 7882**. 
>
> 如果服务器有公网 IP, 启动 LiveKit 时加 `--node-ip <公网IP>`, 或配置文件里设置 `rtc.use_external_ip: true`. 

### 4. 反向代理（仅 `same-origin` 模式）

如果 `livekit_url` 设为 `"same-origin"`, 客户端会连接到 `wss://<当前页面域名>/rtc`, 需要 Nginx 转发:

```nginx
location /rtc {
    proxy_pass http://127.0.0.1:7880;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

> `$connection_upgrade` 变量需要在 `http {}` 块中定义. Nginx 官方默认配置已包含, 如果自建配置缺失, 可添加:
>
> ```nginx
> map $http_upgrade $connection_upgrade {
>     default upgrade;
>     ''      close;
> }
> ```

`/rtc` 反代只解决信令, **媒体流仍然直连 LiveKit 的 UDP 7882 端口**, 这部分无法通过 Nginx 代理, 必须在防火墙放行. 

---

## Nginx 反代

```nginx
# /etc/nginx/http.d/lingcat.conf

server {
    listen 443 ssl;
    server_name lingcat.example.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 应用主入口
    location / {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Range $http_range;
        proxy_set_header If-Range $http_if_range;
        proxy_redirect off;
        proxy_buffering off;

        proxy_pass http://127.0.0.1:3601;
    }

    # LiveKit 信令 (仅 same-origin 模式需要)
    location /rtc {
        proxy_pass http://127.0.0.1:7880;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 目录结构

```
LingCat/
├── android_client/    Android 客户端 (开发中)
├── client/            Web 前端 (React + Vite)
├── client_protocol/   客户端协议实现
├── protocol/          协议定义 (Protobuf + TypeScript)
├── server/            服务端 (Express + WS)
├── shared/            共享工具
└── lingcat_data/      运行时数据 (数据库 / 密钥 / 上传文件)
```


## [License](./license)
