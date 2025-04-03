# 会议转写小助手

一个基于 DeepSeek API 的智能会议记录处理工具，可以将基于飞书妙计、讯飞听见等音频转文字工具生成的口语化的会议记录转换为可直接使用的结构化会议记录。

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

## 部署到云服务

### 方案一：使用Replit部署（推荐，无需信用卡）

Replit提供现代化的Python环境，可以非常简单地部署这个应用：

1. **注册Replit账号**
   - 访问[Replit官网](https://replit.com/)
   - 点击“Sign Up”并完成注册（可使用GitHub账号直接登录）

2. **创建Python项目**
   - 登录后，点击右上角的“+”按钮
   - 选择“Python”模板
   - 给项目起名（如“meeting-transcription-assistant”）
   - 点击“Create Repl”

3. **上传代码文件**
   - 点击左侧文件面板顶部的“Upload file”按钮
   - 选择并上传所有项目文件（app.py、templates和static文件夹等）
   - 或者点击“+”按钮创建文件，并复制粘贴内容

4. **设置环境变量**
   - 点击左侧的“Secrets”选项（锁形图标）
   - 添加API密钥：KEY=`API_KEY`，VALUE=您的DeepSeek API密钥

5. **创建.replit文件**
   - 创建一个名为`.replit`的文件
   - 添加内容：`run = "python app.py"`

6. **安装依赖并启动应用**
   - 在Shell中运行：`pip install flask requests python-dotenv gunicorn`
   - 点击顶部的“Run”按钮
   - 应用会自动启动，并获得一个公共URL

7. **查看并分享您的应用**
   - URL格式为：`https://meeting-transcription-assistant.您的用户名.repl.co`
   - 这个URL可以分享给任何人访问

### 方案二：使用Render.com部署（需要信用卡验证）

本项目也可以部署到Render.com：

1. 创建GitHub仓库并推送项目代码
2. 在Render.com创建新的Web Service
3. 连接GitHub仓库
4. 设置环境变量：`API_KEY`
5. 设置构建命令：`pip install -r requirements.txt`
6. 设置启动命令：`gunicorn wsgi:app`
7. 点击部署

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
