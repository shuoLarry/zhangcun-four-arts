# 章村四艺 · 一物一故事

适配手机与电脑的静态文化故事网站，包含主页、畲织、竹编、笋壳画、畲香四个独立故事入口，以及二维码制作页。HTML、CSS 和 JavaScript 可直接部署到 GitHub Pages，无需数据库、服务器或构建依赖。

## 本地查看

在本目录运行：

```bash
python -m http.server 8080
```

电脑浏览器打开 `http://localhost:8080/`。同一局域网的手机需要使用电脑的局域网 IP，例如 `http://192.168.1.20:8080/`，且电脑防火墙需允许访问；手机上的 `localhost` 指手机自身，不能访问电脑的网站。

正式产品二维码应使用部署后的 HTTPS 地址，本地预览地址不适合印刷。

## 发布到 GitHub Pages

1. 在你的 GitHub 账号下新建一个仓库，例如 `zhangcun-four-arts`。GitHub Free 账号可选择公开仓库。
2. 将**本目录内全部文件**上传到仓库的 `main` 分支，包含隐藏目录 `.github` 和文件 `.nojekyll`。不要将本目录再包进仓库的子目录。
3. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
4. 推送到 `main` 后，`Deploy Zhangcun Four Arts to GitHub Pages` 工作流会根据文案数据重新生成静态页面、校验链接，再发布网站。若首次上传早于 Pages 配置，可在 Actions 选择该工作流并点击 **Run workflow**。
5. 等待工作流成功，在 Settings → Pages 查看实际发布网址。普通项目网址形式为 `https://你的账号.github.io/仓库名/`；此处是地址格式示例，不是已发布的网址。

工作流依据 [GitHub Pages 官方自定义工作流说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) 配置。本目录准备完成不等于已在 GitHub 上发布，必须以仓库内成功的部署记录及实际页面为准。

## 四个固定故事入口

| 产品类别 | 相对于网站根目录的路径 |
| --- | --- |
| 畲织 | `stories/shezhi.html` |
| 竹编 | `stories/zhubian.html` |
| 笋壳画 | `stories/sunkehua.html` |
| 畲香 | `stories/shexiang.html` |

这些是独立 HTML 页面，扫码直接打开对应故事，无需先进入主页选择。所有资源使用相对地址，可以兼容 GitHub 的仓库子路径。

## 二维码制作与印刷

部署完成后访问 `qrcodes.html`。从正式网站打开时，以当前网站根地址生成四个故事链接；在本地制作时，可将根地址设为已验证的正式 HTTPS 地址。二维码在浏览器本地生成，不向第三方二维码服务发送链接。

- 导出后分别用手机扫描四个二维码，核对标题、图片和故事是否对应，并在未登录 GitHub 的设备上测试访问。
- 印刷保留完整白边和明显黑白对比，不拉伸、不裁剪、不覆盖定位方块。正式印量前先打样扫码。
- 二维码内记录的是固定网址。印刷后请保持域名、仓库名称、上述四个页面路径不变。日后更新页面内容不需要重新印码；更换网址则会影响已印刷二维码。
- 本站使用静态直链，不依赖付费二维码平台，也不包含扫码统计服务。

## 修改内容与检查

- `index.html`：主页。
- `stories/`：四艺故事页。
- `qrcodes.html`：二维码制作页。
- `content.json`：四艺故事文案、角色名、制作步骤和参考来源；修改故事内容请优先编辑此文件。
- `scripts/build_pages.py`：页面模板与静态页面生成器，仅需 Python 标准库；主页文案和公共页头、页脚也在这里。
- `styles.css`：公共样式与响应式布局。
- `app.js`：公共交互。
- `assets/`：从项目 PPT 整理的图片与本地资源。
- `assets/vendor/qrcode.js`：第三方二维码库，许可证与来源说明在同目录。
- `.github/workflows/pages.yml`：GitHub Pages 发布配置。

修改 `content.json` 或页面模板后，**需要先重新生成 HTML**，再检查：

```bash
python scripts/build_pages.py
python scripts/check_site.py
```

直接修改已生成的 `index.html`、`stories/*.html` 或 `qrcodes.html`，会在下次生成时被覆盖。样式和交互可直接编辑 `styles.css`、`app.js`；仅修改这两者时不需要重新生成 HTML。GitHub Actions 发布时会自动执行生成步骤，浏览器访问网站不需要 Python。

校验脚本检查所需页面、HTML 与 CSS 的本地文件引用、路径大小写和 GitHub 项目路径兼容性；不代替手机实机扫码与视觉检查。

“我的故事册”保存在当前浏览器的本地存储中，不需要账号，不会在不同手机、电脑或浏览器之间同步。清除浏览数据会清除收藏记录。

## 素材与内容

本项目以团队提供的 1029 版 PPT 及现有 IP 形象为主要设计素材。将其发布到公开仓库会公开这些网页素材，请仅上传本网站目录，避免上传原始 PPT、申报书及其他内部工作材料。四艺具体工艺介绍以页面列出的参考材料及项目表述为准，未经核实的历史年代、传承人、非遗等级和功效不作为事实陈述。
