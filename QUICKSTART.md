# 快速开始指南

## 第一步：本地预览

使用Python快速启动本地服务器：

```bash
cd test
python -m http.server 8000
```

然后在浏览器访问：`http://localhost:8000`

## 第二步：个性化定制

### 1. 修改个人信息
- 打开 `index.html`，搜索 `[你的名字]`，替换为你的真实信息
- 替换头像图片链接

### 2. 更新社交链接
- 编辑 `components/footer.html`
- 修改GitHub、Email等链接

### 3. 添加博客文章
- 在 `blog/` 目录创建 `.md` 文件
- 在 `data/blogs.json` 添加文章信息

## 第三步：添加新页面

如果想添加新页面：

1. 复制任意现有HTML文件作为模板
2. 修改内容
3. 在 `components/navbar.html` 添加导航链接

## 部署到GitHub

```bash
# 在test目录下
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/你的用户名.github.io.git
git push -u origin main
```

## 常用修改位置

| 想要修改 | 文件位置 |
|---------|---------|
| 导航栏 | `components/navbar.html` |
| 页脚 | `components/footer.html` |
| 主色调 | `css/style.css` 中的 `:root` 部分 |
| 博客配置 | `data/blogs.json` |

## 注意事项

⚠️ **必须使用本地服务器运行**，不能直接双击HTML文件打开！

这是因为浏览器的安全策略会阻止加载本地组件文件。

---

详细说明请查看 `README.md`
