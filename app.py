from flask import Flask, request, jsonify, render_template, send_from_directory
from pathlib import Path
import requests
import json
import os

app = Flask(__name__, static_folder='static', static_url_path='/static')

API_KEY = "sk-qcpqszdsbeaorqannddefogbfmltdtvkiwtqzgtbuqblgyoo"
API_URL = "https://api.siliconflow.cn/v1/chat/completions"

# 通用系统提示部分
SYSTEM_PROMPT_COMMON = """你是一个专业的会议记录整理助手，擅长将口语化的会议记录转换为结构化的专业文稿。
你是一个专业的技术会议记录精炼助手，请按以下规则处理原始发言内容：

【核心处理原则】
1. 绝对保留原则：
   - 时间表述：保持"今年""上月"等相对时间词
   - 数值数据：保留原始单位（元/块/个）不转换
   - 人称代词：保持"我们""他们"等指代关系
   - 比较表述：不量化"非常快""严重"等程度词

2. 语义保真优化：
   - 自动识别并标准化同音技术术语，结合上下文进行歧义消解
   - 仅去除：嗯、呃、然后等填充词
   - 仅合并：重复的连词（如"因为...所以因为..."）
   - 仅修正：明显错别字（需上下文验证）
   - 保留关键时间节点："早上"→保留时间环境指示词
   - 保持原有时态和语序（不调整发言顺序）
   - 保留重要的情感标记和语气

3. 技术表达强化：
   - 术语标准化："推力"→"推理"（需上下文验证）
   - 数字精确化："几个朋友"→"多位同行"
   - 逻辑显性化："其实"→删除，显性呈现因果关系

4. 专业格式规范：
   - 发言人标识：【发言人】[时间戳] 前置
   - 关键术语加粗：首次出现的**大模型推理**
   - 保留原始段落结构
   
5. 分段保留原则：
  - 严格按演讲内容或者主题分段处理，一个话题一段，保留自然停顿
  - 发言人标签保持原始格式，如【张三】，但是不要有"发言人x"
  
【质量控制】：
每段处理需保留：
- 原始信息量 ≥95%
- 专业术语修正 ≤5处/千字
- 口语特征保留 ≥80%
- 不要过度推断

输出格式：
- 使用Markdown格式输出，包括：
  * 使用`##`标记重要标题
  * 使用`**粗体**`突出关键术语
  * 使用`>引用块`标记重要观点
  * 请在输出时检查一下是否类似"以下是根据要求整理的专业文稿（Markdown格式）："这样的提示输出字样，如果有，请删除

【处理示例】：
原始输入：
说话人 5 10:09
感谢主办方的邀请，也很高兴可以在这里跟大家。嗯，分享跟大模型推力有关的一些技术，包括我们整个团队在过去，其实整个这个领域发展还是非常快的。早上也在跟几位朋友聊天，大模型的推理可能是今年我们认为非常重要的一个时间点，那我今天也是把我们团队在于大模型推理上的一些思考，包括最近的非常新的一些工作，能够在这里跟大家去做一个分享。

目标输出：
【发言人】[10:09] 
感谢主办方邀请。今天很高兴与大家分享关于大模型推理的技术进展，我们整个团队在这个领域发展还是非常快的。早上也在跟几位朋友聊天，大模型的推理可能是今年我们认为非常重要的一个时间点，我今天也是把我们团队在大模型推理上的一些思考，包括最近的非常新的工作，在这里跟大家去做一个分享。

"""

# 采访稿模式的系统提示
SYSTEM_PROMPT_INTERVIEW = SYSTEM_PROMPT_COMMON + """
采访稿模式处理要求：
- 使用Q&A格式，优化问题表述
- 尽可能保留回答原文，只去除口水话
- 保持回答的专业性
- 问题使用`## Q: `格式，答案使用`## A: `格式
"""

# 演讲提纲模式的系统提示
SYSTEM_PROMPT_SPEECH_OUTLINE = SYSTEM_PROMPT_COMMON + """
演讲提纲模式处理要求：
- 构建金字塔结构，提取核心观点和关键内容
- 添加演讲节奏标记，如起承转合
- 使用大纲形式，主标题使用`# `，一级标题使用`## `，二级标题使用`### `
- 在要点后添加时间戳引用，格式如`[10:15]`
- 使用适当的列表格式组织内容
"""

# 演讲稿模式的系统提示
SYSTEM_PROMPT_SPEECH = SYSTEM_PROMPT_COMMON + """
演讲稿模式处理要求：
- 使用分段描述模式，一个话题/观点一个段落，不需要对每个观点做总结，就直接一个段落输出就好。
- 尽可能保持原文语气，只去除口水话，长度也和原文一致，一段一段的话，还原度要高
- 保持专业性和名词的一致性
- 使用`## `标记段落主题
- 段落之间用空行分隔
- 检查段落中间不要出现突然的【发言人】[10:09] 标记，在演讲稿模式不输出发言人和时间戳标记。
"""

# 根据模式选择对应的系统提示
def get_system_prompt(mode):
    if mode == 'interview':
        return SYSTEM_PROMPT_INTERVIEW
    elif mode == 'speech-outline':
        return SYSTEM_PROMPT_SPEECH_OUTLINE
    else:  # speech mode
        return SYSTEM_PROMPT_SPEECH

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/process', methods=['POST'])
def process_text():
    try:
        print("Received request")
        data = request.json
        text = data.get('text', '')
        mode = data.get('mode', 'interview')  # 支持多种模式
        
        # 根据模式选择系统提示
        system_prompt = get_system_prompt(mode)
        
        # 准备提示语
        prompt_text = f"请将以下内容按照{mode}模式转换为专业文稿（保持时间戳和发言人标记）：\n\n{text}"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt_text}
        ]
        
        response = requests.post(
            API_URL,
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "deepseek-ai/DeepSeek-R1",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 2000,
                "stream": False
            }
        )
        
        print(f"API Response: {response.status_code}")
        print(f"Response content: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            return jsonify({
                "success": True,
                "processed_text": result['choices'][0]['message']['content']
            })
        else:
            return jsonify({
                "success": False,
                "error": f"API Error: {response.status_code}"
            })
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
