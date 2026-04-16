# ZBlog IP 部署说明

第一版按轻量服务器部署设计：一个 Next.js 服务加一个 Nginx 反向代理，数据目录通过 Docker volume 挂载到宿主机，重启和重新发布不会丢失博客、论文偏好和组会草稿。

## 服务器端口

安全组只需要开放：

- `22`：SSH
- `80`：HTTP，当前 IP 访问使用

绑定域名并申请 HTTPS 后再开放/使用 `443`。

## 环境变量

服务器项目目录下创建 `.env.production`：

```bash
cp deploy/env.production.example .env.production
```

必须填写：

- `API_KEY`：通义千问 API Key
- `ADMIN_PASSWORD`：管理端登录密码
- `AUTH_SECRET`：随机长字符串，用于签名登录 Cookie

## 启动

```bash
docker compose up -d --build
```

访问：

- 展示端：`http://服务器IP/`
- 管理端：`http://服务器IP/login`

## 备份

手动备份：

```bash
sh deploy/backup-data.sh
```

定时备份示例：

```bash
0 3 * * * cd /opt/zblog && sh deploy/backup-data.sh >> /var/log/zblog-backup.log 2>&1
```
