#!/usr/bin/env node
/**
 * 读取 domain.config.json，同步写入：
 * - 各页 <link rel="canonical">、全站 favicon
 * - sitemap.xml、robots.txt、404.html
 * - contact.html 官网链接、mailto、展示用邮箱
 * - CNAME（GitHub Pages 自定义域名）
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const cfgPath = path.join(root, "domain.config.json");

const FAVICON =
    '<link rel="icon" href="favicon.svg" type="image/svg+xml" sizes="any">';

function ensureFavicon(html) {
    if (html.includes("favicon.svg")) return html;
    return html.replace(/<\/title>/i, `</title>\n    ${FAVICON}`);
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/"/g, "&quot;");
}

function render404(siteName, origin) {
    const safe = escapeHtml(siteName);
    return `<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex">
    <title>页面未找到 - ${safe}</title>
    ${FAVICON}
    <link rel="stylesheet" href="assets/site.css">
</head>

<body>
    <a class="skip-link" href="#main">跳到主要内容</a>
    <header class="site-header">
        <div class="nav-container">
            <a class="logo" href="index.html">🏥 ${safe}</a>
        </div>
    </header>
    <main id="main" class="page-wrap" style="text-align:center;padding-top:64px;padding-bottom:80px;">
        <p class="page-eyebrow">404</p>
        <h1 class="page-title">找不到该页面</h1>
        <p class="page-lead" style="max-width:420px;margin-left:auto;margin-right:auto;">链接可能已失效，或地址输入有误。请从首页重新浏览。</p>
        <p style="margin-top:28px;">
            <a class="btn btn-primary" href="index.html">返回首页</a>
            <a class="btn btn-ghost" href="contact.html">联系我们</a>
        </p>
        <p class="form-hint" style="margin-top:40px;max-width:none;"><a class="text-link" href="${origin}/">${origin.replace(/^https?:\/\//, "")}</a></p>
    </main>
    <footer class="site-footer">
        <p class="footer-bottom">Copyright © ${new Date().getFullYear()} ${safe}</p>
    </footer>
</body>

</html>
`;
}

function main() {
    if (!fs.existsSync(cfgPath)) {
        console.error("缺少 domain.config.json");
        process.exit(1);
    }
    const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
    const origin = String(cfg.siteOrigin || "").replace(/\/+$/, "");
    const host = String(cfg.host || "").replace(/^\/+|\/+$/g, "");
    const siteName = String(cfg.siteName || "智慧医疗助手");
    if (!origin || !host) {
        console.error("domain.config.json 需包含 siteOrigin 与 host");
        process.exit(1);
    }
    let contactEmail = cfg.contactEmail;
    if (!contactEmail) {
        const local = String(cfg.contactLocalPart || "contact").replace(/@.*/, "");
        contactEmail = `${local}@${host}`;
    }

    const pages = [
        ["index.html", `${origin}/`],
        ["product.html", `${origin}/product.html`],
        ["app.html", `${origin}/app.html`],
        ["about.html", `${origin}/about.html`],
        ["contact.html", `${origin}/contact.html`],
    ];

    for (const [file, href] of pages) {
        const fp = path.join(root, file);
        if (!fs.existsSync(fp)) continue;
        let html = fs.readFileSync(fp, "utf8");
        if (!/<link rel="canonical" href="[^"]*"/.test(html)) {
            console.warn("跳过 canonical（未找到标签）:", file);
        } else {
            html = html.replace(
                /<link rel="canonical" href="[^"]*"/,
                `<link rel="canonical" href="${href}"`
            );
        }
        html = ensureFavicon(html);
        fs.writeFileSync(fp, html);
        console.log("更新:", file);
    }

    const contactPath = path.join(root, "contact.html");
    if (fs.existsSync(contactPath)) {
        let c = fs.readFileSync(contactPath, "utf8");
        c = c.replace(
            /(<a[^>]*id="site-official-link"[^>]*href=")[^"]+(")/i,
            `$1${origin}/$2`
        );
        c = c.replace(
            /(<a[^>]*id="site-official-link"[^>]*>)[^<]*(<\/a>)/i,
            `$1${host}$2`
        );
        c = c.replace(/action="mailto:[^"]+"/, `action="mailto:${contactEmail}"`);
        c = c.replace(
            /(<code[^>]*id="site-contact-email"[^>]*>)[^<]*(<\/code>)/i,
            `$1${contactEmail}$2`
        );
        c = ensureFavicon(c);
        fs.writeFileSync(contactPath, c);
        console.log("contact.html: 外链 / mailto / favicon");
    }

    const sm = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${origin}/product.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${origin}/app.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${origin}/about.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${origin}/contact.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
`;
    fs.writeFileSync(path.join(root, "sitemap.xml"), sm);
    console.log("sitemap.xml");

    const robots = `# 官网：${origin} — 全站对任意访客与搜索引擎开放（无登录墙）
User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
    fs.writeFileSync(path.join(root, "robots.txt"), robots);
    console.log("robots.txt");

    fs.writeFileSync(path.join(root, "CNAME"), `${host}\n`);
    console.log("CNAME →", host);

    const notFound = render404(siteName, origin);
    fs.writeFileSync(path.join(root, "404.html"), notFound);
    console.log("404.html");

    console.log("\n完成。siteOrigin =", origin, "| host =", host, "| 联系邮箱 =", contactEmail);
}

main();
