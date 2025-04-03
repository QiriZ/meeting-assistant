import sys
import os
from dotenv import load_dotenv

# 添加应用目录到路径 - 请修改为你的实际用户名
username = "填写你的pythonanywhere用户名"
path = f'/home/{username}/meeting-assistant'

if path not in sys.path:
    sys.path.append(path)

# 加载环境变量
load_dotenv(os.path.join(path, '.env'))

# 导入应用
from app import app as application
