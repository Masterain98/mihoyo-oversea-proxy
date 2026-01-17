<div align="center">
  <img src="store/logo.png" alt="米哈游海外加速" width="128">
  <h1>米哈游海外加速</h1>
  <p><strong>让海外访问米游社更快一点</strong></p>

  [![Chrome Web Store](https://img.shields.io/badge/Chrome-扩展商店-4285F4?logo=googlechrome&logoColor=white)](https://chrome.google.com/webstore)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

---

## 为什么需要这个？

米哈游的网页服务（如米游社）的静态资源托管在国内服务器，缺少全球 CDN 支持。对于海外用户来说，这意味着：

- 图片加载缓慢或失败
- 页面样式显示异常
- 活动页面迟迟打不开

**米哈游海外加速** 通过将静态资源请求重定向到你自己部署的反向代理节点，让访问体验恢复正常。

---

## 功能特性

| 功能 | 说明 |
|------|------|
| **一键加速** | 自动重定向静态资源到加速节点 |
| **自定义域名** | 支持配置自己的反代服务器 |
| **独立开关** | 分别控制用户图片和活动资源 |
| **自建指南** | 内置 Nginx 配置，一键复制部署 |

---

## 安装

### Chrome 扩展商店（推荐）

前往 [Chrome 扩展商店]() 安装。

### 手动安装

1. 下载本项目，解压到任意目录
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启右上角「**开发者模式**」
4. 点击「**加载已解压的扩展程序**」
5. 选择 `extension` 目录

---

## 使用方法

1. 点击浏览器工具栏中的扩展图标
2. 输入你的反代域名（或使用默认域名）
3. 点击「保存设置」
4. 刷新米游社页面即可生效

---

## 自建反代节点

想要部署自己的加速节点？点击扩展中的「**自建反代节点**」，即可获取完整的 Nginx 配置文件。

本代码库也提供了两个现成的配置文件：
- `upload-bbs-nginx.conf` - 用户上传图片加速
- `act-mihoyo-nginx.conf` - 活动页面静态资源加速

---

## 许可证

[MIT License](LICENSE)
