# 章村四艺 · 一物一故事

面向公众的章村四艺故事网站，包含主页、畲织、竹编、笋壳画和畲香四个独立故事页，适配手机与电脑。访客可以阅读手艺故事、收藏到当前浏览器的故事册，并分享故事链接。

- 网站：[章村四艺](https://shuolarry.github.io/zhangcun-four-arts/)
- 仓库：[shuoLarry/zhangcun-four-arts](https://github.com/shuoLarry/zhangcun-four-arts)
- 团队：北京航空航天大学章村四艺团队

网站采用 HTML、CSS、JavaScript，无数据库或运行时构建依赖。

## 本地预览

在本目录运行 `python -m http.server 8080`，浏览器打开 `http://localhost:8080/`。

## 修改内容

- `content.json`：四艺故事、制作步骤和来源资料。
- `scripts/build_pages.py`：公共页面模板、主页文案和图片说明。
- `styles.css`：响应式布局和视觉样式。
- `app.js`：导航、故事收藏、分享功能。
- `assets/`：IP 形象、图片及本地二维码库。

修改内容或模板后，运行 `python scripts/build_pages.py` 生成页面，再运行 `python scripts/check_site.py` 检查链接。

生成结果为 `index.html` 和 `stories/` 下的四个 HTML 页面。直接修改生成页面，会在下次构建时被模板覆盖。

## GitHub Pages 发布

仓库通过 `.github/workflows/pages.yml` 自动部署。向 `main` 分支提交后，工作流依次生成页面、检查链接、打包并发布。仓库 **Settings → Pages → Source** 应设为 **GitHub Actions**。

## 文创故事固定入口

| 四艺 | IP | 故事路径 |
| --- | --- | --- |
| 畲织 | 阿畲 | `stories/shezhi.html` |
| 竹编 | 竹仔 | `stories/zhubian.html` |
| 笋壳画 | 笋壳妹 | `stories/sunkehua.html` |
| 畲香 | 香香 | `stories/shexiang.html` |

产品二维码直接指向以上故事页。保留网站域名、仓库名称和故事路径，更新故事内容时就无需重新印码。四艺故事页的分享窗口可展示对应故事二维码。

## 素材

IP 与图片来自团队提供的 1029 版项目 PPT。图片来源见 `assets/SOURCES.md`，故事资料见各页资料说明。发布范围仅为本网站目录。
