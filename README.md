# 个人网站 - Personal Website

这是一个简洁、现代化的个人网站，集成了个人简介、学术主页、博客分享等功能。

## ✨ 特性

- 📱 **响应式设计**：完美适配桌面、平板和手机
- 🎨 **蓝色主题**：简洁优雅的蓝色主色调
- 🔄 **组件化设计**：导航栏和页脚统一管理，易于维护
- 📝 **Markdown支持**：博客文章使用Markdown格式，自动转换为HTML
- 🚀 **GitHub Pages就绪**：可直接部署到GitHub Pages
- ⚡ **流畅动画**：丰富的页面动画和交互效果

## 📁 项目结构

```
test/
├── index.html              # 主页（个人简介）
├── interests.html          # 兴趣爱好页面
├── research.html           # 科研经历页面
├── blog.html              # 博客列表页面
├── blog-detail.html       # 博客详情页面
├── awards.html            # 荣誉奖项页面
│
├── components/            # 可复用组件
│   ├── navbar.html       # 导航栏组件
│   └── footer.html       # 页脚组件
│
├── css/
│   └── style.css         # 统一的样式文件
│
├── js/
│   ├── components.js     # 组件加载器
│   └── main.js          # 主要功能（导航、Markdown解析等）
│
├── blog/                 # Markdown博客文章
│   ├── welcome.md
│   ├── python-tutorial.md
│   ├── deep-learning-intro.md
│   ├── study-methods.md
│   └── life-reflection.md
│
└── data/
    └── blogs.json        # 博客配置文件
```

## 🚀 快速开始

### 本地预览

1. **克隆或下载项目**

2. **使用本地服务器运行**

   由于浏览器的同源策略，需要使用本地服务器来运行：

   **方式一：使用Python（推荐）**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **方式二：使用Node.js**
   ```bash
   # 安装http-server
   npm install -g http-server
   
   # 运行服务器
   http-server -p 8000
   ```

   **方式三：使用VS Code**
   - 安装 "Live Server" 扩展
   - 右键点击 index.html，选择 "Open with Live Server"

3. **在浏览器中访问**
   ```
   http://localhost:8000
   ```

## 🎨 自定义网站

### 1. 修改个人信息

#### 主页信息（index.html）
找到以下部分并修改为你的信息：
```html
<h1 class="hero-title">你好，我是 [你的名字]</h1>
<p class="hero-subtitle">学生 | 研究者 | 开发者</p>
```

#### 头像图片
替换主页中的头像链接：
```html
<img src="你的头像图片路径" alt="个人头像" class="avatar-img">
```

#### 社交链接（components/footer.html）
修改页脚中的社交媒体链接：
```html
<a href="你的GitHub链接" class="social-link">GitHub</a>
<a href="mailto:你的邮箱" class="social-link">Email</a>
```

### 2. 添加新页面

如果你想添加新页面（比如"项目展示"）：

1. **创建HTML文件**（如 `projects.html`）
   ```html
   <!DOCTYPE html>
   <html lang="zh-CN">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
       <title>项目展示 - 个人主页</title>
       <link rel="stylesheet" href="css/style.css">
   </head>
   <body>
       <!-- 导航栏占位符 -->
       <div id="navbar-placeholder"></div>
       
       <!-- 你的页面内容 -->
       <main class="main-content">
           <div class="container">
               <!-- 内容 -->
           </div>
       </main>
       
       <!-- 页脚占位符 -->
       <div id="footer-placeholder"></div>
       
       <script src="js/components.js"></script>
       <script src="js/main.js"></script>
   </body>
   </html>
   ```

2. **在导航栏中添加链接**（`components/navbar.html`）
   ```html
   <li class="nav-item"><a href="projects.html" class="nav-link">项目展示</a></li>
   ```

### 3. 添加博客文章

#### 步骤一：创建Markdown文件
在 `blog/` 目录下创建新的 `.md` 文件，例如 `my-new-blog.md`：

```markdown
# 我的新博客标题

这是博客内容...

## 小标题

更多内容...
```

#### 步骤二：更新博客配置
在 `data/blogs.json` 中添加博客信息：

```json
{
  "id": "my-new-blog",
  "title": "我的新博客标题",
  "date": "2026-02-05",
  "category": "tech",
  "tags": ["标签1", "标签2"],
  "readTime": "5分钟阅读",
  "excerpt": "这是博客摘要...",
  "file": "blog/my-new-blog.md"
}
```

### 4. 修改主题颜色

在 `css/style.css` 文件顶部的 `:root` 部分修改颜色变量：

```css
:root {
    --primary-color: #2563eb;      /* 主色调 */
    --primary-dark: #1e40af;       /* 深色 */
    --primary-light: #3b82f6;      /* 浅色 */
    --secondary-color: #60a5fa;    /* 辅助色 */
    /* 修改这些值来改变网站配色 */
}
```

## 🌐 部署到GitHub Pages

### 方法一：通过GitHub网页操作

1. **创建GitHub仓库**
   - 登录GitHub
   - 创建新仓库，命名为 `your-username.github.io`（替换为你的用户名）

2. **上传文件**
   - 将test文件夹中的所有文件上传到仓库根目录
   - 确保 `index.html` 在根目录

3. **启用GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 `main` 分支
   - 点击 Save

4. **访问网站**
   - 几分钟后，访问 `https://your-username.github.io`

### 方法二：使用Git命令行

```bash
# 初始化Git仓库
cd test
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/your-username/your-username.github.io.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

### 自定义域名（可选）

1. 在仓库根目录添加 `CNAME` 文件
2. 文件内容为你的域名，如：`www.yourdomain.com`
3. 在域名提供商处设置DNS记录指向GitHub Pages

## 📝 维护建议

### 定期更新博客
- 在 `blog/` 目录添加新的 `.md` 文件
- 更新 `data/blogs.json` 配置

### 备份内容
- 定期提交代码到GitHub
- 保留重要图片和文件的备份

### 性能优化
- 压缩图片（推荐工具：TinyPNG）
- 使用CDN加速静态资源
- 定期检查并更新代码

## 🔧 常见问题

### Q1: 组件没有加载，页面没有导航栏？
**A:** 确保使用本地服务器运行，不能直接双击HTML文件打开。浏览器的同源策略会阻止加载本地文件。

### Q2: 博客列表显示"正在加载"但没有内容？
**A:** 检查：
- 是否使用本地服务器运行
- `data/blogs.json` 文件是否存在且格式正确
- 浏览器控制台是否有错误信息

### Q3: 移动端显示不正常？
**A:** 确保每个HTML文件的 `<head>` 中都有正确的viewport设置：
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
```

### Q4: 如何修改网站标题和Logo？
**A:** 在 `components/navbar.html` 中修改：
```html
<a href="index.html" class="nav-logo">你的标题</a>
```

### Q5: GitHub Pages部署后404错误？
**A:** 确保：
- 文件都在仓库根目录
- 文件名大小写正确
- 等待几分钟让GitHub Pages生效

## 🎯 技术栈

- **前端**: HTML5, CSS3, JavaScript (Vanilla)
- **样式**: 自定义CSS，响应式设计
- **部署**: GitHub Pages
- **特性**: 
  - Flexbox & Grid布局
  - CSS动画和过渡
  - Fetch API
  - 自定义Markdown解析器

## 📄 许可证

本项目采用 MIT 许可证，你可以自由使用和修改。

## 💡 建议和反馈

如果你有任何建议或发现了问题，欢迎：
- 提交Issue
- 发送邮件
- 提交Pull Request

## 🙏 致谢

感谢使用这个模板！希望它能帮助你快速搭建个人网站。

---

**祝你使用愉快！✨**

如果觉得有帮助，请给个Star⭐
