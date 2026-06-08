# 賢仔烧腊商家后台

这是独立给 Vercel 部署的商家后台目录，不包含买家网页。

这个目录包含独立后台网页和 Vercel Go API Function。

Vercel 项目需要设置这些 Environment Variables：

```bash
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require
JWT_SECRET=change-this-to-a-long-random-secret
COOKIE_SECURE=true
```

`FRONTEND_ORIGIN` 可以不填，因为后台网页和 API 在同一个 Vercel 项目里。

本地预览：

```bash
python3 -m http.server 4175 --bind 127.0.0.1
```

打开：

```text
http://127.0.0.1:4175/
```
