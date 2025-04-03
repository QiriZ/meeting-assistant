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

## 部署到Vercel免费平台

本项目可以轻松部署到Vercel，无需信用卡或支付即可获得免费项目托管：

1. 访问 [Vercel官网](https://vercel.com/) 并使用GitHub账号登录

2. 点击“+ New Project”并选择你的GitHub仓库

3. 配置项目：
   - 框架预设：选择 `Other`
   - 根目录：保持默认值 `.`
   - 点击“Environment Variables”并添加：
     - `API_KEY`：填入你的DeepSeek API密钥

4. 点击“Deploy”开始部署

5. 部署完成后，你将获得一个类似 `.vercel.app` 的公开网址

6. 可选操作：在Vercel项目设置中绑定自定义域名

项目部署后，每次在GitHub上更新代码，Vercel将自动重新部署。

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
