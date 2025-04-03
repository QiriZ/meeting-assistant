# 会议转写小助手

一个基于 DeepSeek-R1 API 的智能会议记录处理工具，可以将基于飞书妙计、讯飞听见等音频转文字工具生成的口语化的会议记录转换为可直接使用的结构化会议记录。

## 功能特点

- 支持多种文本格式（Markdown、Word、TXT）
- 三种模式转换：
  - **采访稿模式**：优化问答格式，保留回答原文
  - **演讲提纲模式**：构建金字塔结构，提取核心观点
  - **演讲稿模式**：按主题分段，保留原文语气和专业性
- 智能文本处理：
  - 术语标准化
  - 情感保留
  - 智能分段
- 支持本地导出和云端保存
- 美观的现代化界面

## 快速开始

1. 克隆项目：
```bash
git clone https://github.com/你的用户名/meeting-transcription-assistant.git
cd meeting-transcription-assistant
```

2. 设置环境变量：
```bash
# 创建.env文件
echo "API_KEY=你的DeepSeek_API密钥" > .env
```

3. 安装依赖：
```bash
pip install -r requirements.txt
```

4. 启动应用：
```bash
python app.py
```

5. 打开浏览器，访问：http://localhost:5001

## 部署到 Cloudflare

本项目适合使用 Cloudflare Pages + Workers 的方式部署，这种方式在中国大陆访问速度快、稳定，并且免费额度充足：

### 1. 准备工作

- 注册 [Cloudflare](https://dash.cloudflare.com) 账号（免费）
- 将项目代码推送到 GitHub 仓库（已完成）

### 2. 部署 Cloudflare Worker （后端服务）

1. 登录 Cloudflare Dashboard
2. 选择 "Workers & Pages" 点击 "Create Worker"
3. 复制粘贴项目中的 `worker.js` 文件内容
4. 设置 Worker 名称，如 `meeting-assistant-worker`
5. 点击 "Save and Deploy"

### 3. 设置环境变量

1. 在创建好的 Worker 页面中，选择 "Settings" 标签
2. 点击 "Variables"
3. 添加环境变量 `API_KEY`，值为你的 DeepSeek API 密钥
4. 点击 "Save and Deploy"

### 4. 部署 Cloudflare Pages（前端页面）

1. 在 Cloudflare Dashboard 选择 "Workers & Pages"
2. 点击 "Create Application" 然后选择 "Pages"
3. 连接你的 GitHub 仓库（首次使用需要授权）
4. 选择你的项目仓库 `meeting-assistant`
5. 配置项目：
   - **构建设置**：
     - 构建命令留空
     - 输出目录：`static`
   - 点击 "Save and Deploy"

### 5. 更新前端调用地址

部署完成后，需要在前端文件 `index.html` 中更新 Worker 的地址：

```javascript
// 将这行代码
 const response = await fetch('https://meeting-assistant-worker.你的用户名.workers.dev/process', {

// 更新为你实际的 Worker 地址，例如：
const response = await fetch('https://meeting-assistant-worker.qiriz.workers.dev/process', {
```

然后重新部署前端页面。

### 6. 访问你的应用

Cloudflare Pages 会自动为你生成一个域名，格式为 `项目名.pages.dev`。你可以通过这个域名访问你的应用。

2. 启动服务器：
```bash
python app.py
```

3. 访问网页：
打开浏览器访问 http://localhost:5000

## 使用方法

1. 选择转换模式（采访稿/演讲稿）
2. 上传文本文件或直接粘贴文本内容
3. 选择处理选项（术语标准化、情感保留、智能分段）
4. 点击"开始处理"按钮
5. 查看处理结果，可以选择本地导出或云端保存

## 技术栈

- 后端：Python + Flask
- 前端：HTML + CSS + JavaScript
- API：DeepSeek-V3
- 文本处理：marked.js

## 注意事项

- API Key 请妥善保管，不要泄露
- 文本长度建议不要超过 2000 tokens
- 目前云端保存功能尚未实现
