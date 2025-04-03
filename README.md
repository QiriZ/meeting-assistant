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

## 部署到PythonAnywhere

本项目可以部署到PythonAnywhere免费托管（支持中国访问）：

### 1. 准备工作

- 确保GitHub仓库已创建（https://github.com/QiriZ/meeting-assistant）
- 已经将所有代码推送到GitHub

### 2. 在PythonAnywhere上注册并登录

- 访问 https://www.pythonanywhere.com 登录你的账户
- 如果已有账户，可以使用现有账户（免费版可以创建多个网站，但同时只能有一个活跃）

### 3. 从 GitHub 克隆仓库

1. 在PythonAnywhere页面点击顶部的"Consoles"标签
2. 选择打开"Bash"控制台
3. 在控制台中克隆你的仓库：
```bash
git clone https://github.com/QiriZ/meeting-assistant.git
```

### 4. 设置虚拟环境

在控制台中创建和激活虚拟环境：

```bash
cd meeting-assistant

# 创建虚拟环境
mkvirtualenv --python=/usr/bin/python3.9 meeting_assistant_env

# 如果已经创建，可以激活它
workon meeting_assistant_env

# 安装依赖
pip install -r requirements.txt
```

### 5. 创建.env文件

```bash
echo "API_KEY=你的DeepSeek_API密钥" > .env
```

### 6. 配置 Web 应用

1. 在PythonAnywhere页面上点击"Web"标签
2. 点击"Add a new web app"
3. 点击"Next"并选择手动配置 (manual configuration)
4. 选择Python 3.9
5. 点击"Next"

### 7. 配置WSGI文件

1. 找到并点击编辑WSGI文件的链接（通常在网页应用设置页面的中间部分）
2. 删除所有代码，并替换为以下内容：

```python
import sys
import os
from dotenv import load_dotenv

# 添加应用目录到路径
path = '/home/你的PythonAnywhere用户名/meeting-assistant'
if path not in sys.path:
    sys.path.append(path)

# 加载环境变量
load_dotenv(os.path.join(path, '.env'))

# 导入应用
from app import app as application
```

记得将上面的`你的PythonAnywhere用户名`替换为你的实际用户名。

### 8. 配置虚拟环境路径

在Web应用设置页面中：

1. 在"Virtualenv"部分，输入虚拟环境路径：
```
/home/你的PythonAnywhere用户名/.virtualenvs/meeting_assistant_env
```

2. 在"Static files"部分，添加静态文件映射：
   - URL: `/static/`
   - Directory: `/home/你的PythonAnywhere用户名/meeting-assistant/static`

### 9. 重启网站

点击网页应用设置页面顶部的"Reload"按钮。

### 10. 访问你的网站

现在你可以通过以下地址访问你的网站：
```
http://你的PythonAnywhere用户名.pythonanywhere.com
```

### 注意事项

1. PythonAnywhere免费账户同时只能有一个活动网站，如果你已经有了一个网站，需要先禁用它
2. API调用可能会受到PythonAnywhere免费账户的外部访问限制，需要添加到白名单
3. CPU时间有限制，但对于中等规模使用应该足够

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
