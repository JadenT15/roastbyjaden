# 賢仔烧腊商家后台

这是独立给 Vercel 部署的商家后台目录，不包含买家网页。

上线前需要把 `index.html` 里的：

```html
window.ROAST_API_BASE_URL = "https://YOUR-BACKEND-API.example.com";
```

换成已经上线的 Go API 地址。

本地预览：

```bash
python3 -m http.server 4175 --bind 127.0.0.1
```

打开：

```text
http://127.0.0.1:4175/
```
