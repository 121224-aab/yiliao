# 智慧医疗助手 · 静态官网

**从零上线到自定义域名的完整操作，见：[部署步骤.md](./部署步骤.md)。**

## 通过域名配置官网（推荐）

**所有与域名相关的对外信息，只改一个文件即可：**

1. 编辑项目根目录的 **`domain.config.json`**：
   - **`siteOrigin`**：完整站点根地址，**不要**末尾斜杠，例如 `https://miraculoushandai.top`（与托管商是否强制 HTTPS 保持一致）。
   - **`host`**：纯域名，用于页内展示、联系邮箱域名、以及 **GitHub Pages 的 `CNAME`**。
   - **`contactLocalPart`**：联系邮箱前缀，默认可为 `contact`，最终邮箱为 `前缀@host`。
   - **`contactEmail`**（可选）：若与 `前缀@host` 不同，可在此写完整邮箱。

2. 在项目根目录执行同步（需已安装 [Node.js](https://nodejs.org/)）：

   ```bash
   cd "/Users/lixichen/Desktop/医疗"
   npm run domain
   ```

   或直接：`node scripts/apply-domain.mjs`

3. 脚本会自动更新：
   - 各页 **`<link rel="canonical">`** 与 **`favicon.svg`** 引用
   - **`sitemap.xml`**、**`robots.txt`**、**`404.html`**（含 `noindex`，避免收录错误页）
   - **`contact.html`** 中的官网链接、`mailto:`、展示用邮箱
   - 根目录 **`CNAME`**（供 [GitHub Pages 自定义域名](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site) 使用）

修改 DNS 后，在托管后台把 **`host`** 指到对应服务即可；**不要再手改**各 HTML 里的 canonical，以免与配置不一致。

**默认已按「绑定域名 + HTTPS」就绪**：`domain.config.json` 中 `siteOrigin` 为 `https://…`。若托管阶段暂时只有 HTTP，请改为 `http://你的域名` 后再执行一次 `npm run domain`。

---

## 绑定域名后「开箱可用」自检

| 项 | 说明 |
|----|------|
| 根目录部署 | `index.html`、`assets/`、`favicon.svg`、`404.html`、`robots.txt`、`sitemap.xml` 均在站点根路径可访问 |
| HTTPS | 在托管台开启证书；`siteOrigin` 与线上协议一致（推荐全程 `https://`） |
| 构建/发布前 | 执行 `npm run domain` 并提交变更，避免 canonical / 站点地图与真实域名不一致 |
| 邮箱 | 在邮局为 `contact@你的域名`（或你在配置里写的地址）创建邮箱，联系表单 `mailto:` 才能送达 |
| GitHub Pages | 保留仓库根目录 **`CNAME`** 与 **`.nojekyll`**（避免 Jekyll 忽略部分文件） |
| Netlify | **`_headers`** 会随站点部署；自定义域名在后台 **Domain** 中绑定并启用 HTTPS |
| Vercel | 可使用根目录 **`vercel.json`** 中的基础安全头 |

---

纯 HTML / CSS / JS，无业务后端。站点为**静态公开资源**：不应对整站启用登录墙、HTTP Basic 认证或 IP 白名单。

## 域名与托管

1. 在域名注册商处将 **`host`（见 `domain.config.json`）** 的 **A / AAAA / CNAME** 指向托管商文档要求的主机。
2. 将本仓库**根目录**作为站点根目录部署。
3. 托管商签发 **HTTPS** 后，确认 `siteOrigin` 为 **`https://你的域名`**，并再执行一次 `npm run domain`（若曾用 http）。

## 本地预览

```bash
cd "/Users/lixichen/Desktop/医疗"
python3 -m http.server 8080
```

浏览器访问 `http://127.0.0.1:8080/`。公网访问以绑定域名后的 HTTP(S) 为准。

## 公网托管参考

| 方式 | 说明 |
|------|------|
| [GitHub Pages](https://pages.github.com/) | 推送本文件夹，Settings → Pages 指定根目录；仓库根目录保留 `CNAME`。 |
| [Cloudflare Pages](https://pages.cloudflare.com/) | 绑定 Git 或上传目录，在控制台绑定自定义域名。 |
| [Netlify](https://www.netlify.com/) | 可使用根目录 `netlify.toml`；构建命令会执行 `npm run domain`（需 Node 环境）。 |

## 安全说明

- **勿**在公开网页中写入 AI 接口密钥。首页 `DEEPSEEK_KEY` 应留空或由后端代理注入。

## 文件结构

- `domain.config.json` — **官网域名唯一配置源**（含 `siteName` 等）
- `domain.config.schema.json` — JSON Schema（可选）
- `scripts/apply-domain.mjs` — 域名同步脚本
- `favicon.svg` — 站点图标（各页由脚本挂上 `<link rel="icon">`）
- `index.html` — 首页
- `product.html`、`app.html`、`about.html`、`contact.html` — 子页面
- `404.html` — 由脚本生成，GitHub Pages / Netlify / Cloudflare 等会用作「找不到页面」
- `assets/site.css`、`assets/site.js` — 全站样式与导航脚本
- `robots.txt`、`sitemap.xml`、`CNAME` — 由脚本生成/覆盖
- `.nojekyll` — GitHub Pages 使用，关闭 Jekyll 处理
- `_headers` — Netlify 全站基础安全头
- `vercel.json` — Vercel 部署时的基础安全头
- `netlify.toml` — Netlify 发布目录与构建命令（`npm run domain`）
