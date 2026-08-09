<div align="center">
  <h1>灵猫</h1>
</div>
<br>

一个普通的即时通讯项目——简单, 轻量, 纯粹, 时而天真

### 简介

本项目是由 月有阴晴圆缺 (白日梦 / 满月叶) 使用 Node.js + React 编写的轻量级自部署即时通讯应用, 前端使用 MDUI v2 (Material Design 3 风格 UI 库, 已根据自己的需求魔改), 后端使用 Express + WebSocket + Knex (SQLite) 驱动

Android 客户端仍在开发中, 敬请期待

在本项目之前, 本人也有多次即时通讯类应用程序的开发尝试, 但多以失败告终

本项目在多处 vibe 以快速开发功能, 但也不乏自己的审查和测试, 以及个人风格的修改

如果发现任何 Bug, 欢迎各位提交修复 ^_^

### 部署

```bash
git clone https://codeberg.org/CrescentLeaf/LingCat
cd LingChair
# 安装必要的依赖
npm install -d
# 先启动服务端生成密钥
npm run server
# 生成密钥后 Ctrl+C 关闭服务端
# 再去构建前端
npm run build-client
# 之后再次启动服务端
npm run server
```

### Nginx 代理

```conf
# /etc/nginx/http.d/xxx.conf
# 这是一个示范
server {
    location /lingcat/ {
        proxy_http_version 1.1;
        # Nginx 默认的 nginx.conf 中, http 块内有 $http_upgrade $connection_upgrade 变量的定义
        # 或者可以网络检索相关内容
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header X-Forwarded-For $remote_addr:$remote_port;
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Range $http_range;
        proxy_set_header If-Range $http_if_range;
        proxy_redirect off;
        proxy_buffering off;
        
        # 根据实际情况修改这行地址
        proxy_pass http://域名:端口/;
    }
}
```
