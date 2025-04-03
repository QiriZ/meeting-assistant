// Cloudflare Worker

// 环境变量会在Cloudflare Dashboard中设置
// API_KEY = 你的DeepSeek API密钥

// 系统提示部分
const SYSTEM_PROMPT_COMMON = `你是一个专业的会议记录整理助手，擅长将口语化的会议记录转换为结构化的专业文稿。
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
  * 使用\`##\`标记重要标题
  * 使用\`**粗体**\`突出关键术语
  * 使用\`>引用块\`标记重要观点
  * 请在输出时检查一下是否类似"以下是根据要求整理的专业文稿（Markdown格式）："这样的提示输出字样，如果有，请删除

【处理示例】：
原始输入：
说话人 5 10:09
感谢主办方的邀请，也很高兴可以在这里跟大家。嗯，分享跟大模型推力有关的一些技术，包括我们整个团队在过去，其实整个这个领域发展还是非常快的。早上也在跟几位朋友聊天，大模型的推理可能是今年我们认为非常重要的一个时间点，那我今天也是把我们团队在于大模型推理上的一些思考，包括最近的非常新的一些工作，能够在这里跟大家去做一个分享。

目标输出：
【发言人】[10:09] 
感谢主办方邀请。今天很高兴与大家分享关于大模型推理的技术进展，我们整个团队在这个领域发展还是非常快的。早上也在跟几位朋友聊天，大模型的推理可能是今年我们认为非常重要的一个时间点，我今天也是把我们团队在大模型推理上的一些思考，包括最近的非常新的工作，在这里跟大家去做一个分享。`;

// 采访稿模式
const SYSTEM_PROMPT_INTERVIEW = SYSTEM_PROMPT_COMMON + `
采访稿模式处理要求：
- 使用Q&A格式，优化问题表述
- 尽可能保留回答原文，只去除口水话
- 保持回答的专业性
- 问题使用\`## Q: \`格式，答案使用\`## A: \`格式`;

// 演讲提纲模式
const SYSTEM_PROMPT_SPEECH_OUTLINE = SYSTEM_PROMPT_COMMON + `
演讲提纲模式处理要求：
- 构建金字塔结构，提取核心观点和关键内容
- 添加演讲节奏标记，如起承转合
- 使用大纲形式，主标题使用\`# \`，一级标题使用\`## \`，二级标题使用\`### \`
- 在要点后添加时间戳引用，格式如\`[10:15]\`
- 使用适当的列表格式组织内容`;

// 演讲稿模式
const SYSTEM_PROMPT_SPEECH = SYSTEM_PROMPT_COMMON + `
演讲稿模式处理要求：
- 使用分段描述模式，一个话题/观点一个段落，不需要对每个观点做总结，就直接一个段落输出就好。
- 尽可能保持原文语气，只去除口水话，长度也和原文一致，一段一段的话，还原度要高
- 保持专业性和名词的一致性
- 使用\`## \`标记段落主题`;

// 获取对应模式的系统提示
function getSystemPrompt(mode) {
  switch (mode) {
    case 'interview':
      return SYSTEM_PROMPT_INTERVIEW;
    case 'speech-outline':
      return SYSTEM_PROMPT_SPEECH_OUTLINE;
    case 'speech':
      return SYSTEM_PROMPT_SPEECH;
    default:
      return SYSTEM_PROMPT_INTERVIEW;
  }
}

// 处理CORS预检请求
function handleOptions(request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  });
}

// 生成唯一请求ID
function generateRequestId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 15);
}

// 处理状态查询
async function handleStatusCheck(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };
  
  // 处理OPTIONS请求
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }
  
  try {
    const url = new URL(request.url);
    const requestId = url.searchParams.get('requestId');
    
    if (!requestId) {
      return new Response(JSON.stringify({ success: false, error: '缺少请求ID' }), {
        headers,
        status: 400
      });
    }
    
    // 检查请求状态
    if (requestsInProgress[requestId]) {
      const requestInfo = requestsInProgress[requestId];
      
      if (requestInfo.completed) {
        // 请求已完成，返回结果
        const result = requestInfo.result;
        // 请求完成后删除记录
        delete requestsInProgress[requestId];
        
        return new Response(JSON.stringify({
          success: true,
          completed: true,
          ...result
        }), { headers });
      } else {
        // 请求仍在处理中
        return new Response(JSON.stringify({
          success: true,
          completed: false,
          message: '文本处理中，请稍后再查询'
        }), { headers });
      }
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: '请求不存在或已过期'
      }), {
        headers,
        status: 404
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: `状态查询错误: ${error.message}`
    }), {
      headers,
      status: 500
    });
  }
}

// 主要函数处理
async function handleRequest(request) {
  // 处理CORS预检请求
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }
  
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };
  
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: '只支持POST请求' }), {
        headers,
        status: 405
      });
    }
    
    // 解析请求体
    const data = await request.json();
    const { text, mode = 'interview' } = data;
    
    if (!text) {
      return new Response(JSON.stringify({ success: false, error: '文本不能为空' }), {
        headers,
        status: 400
      });
    }
    
    // 生成唯一请求ID
    const requestId = generateRequestId();
    
    // 存储请求信息
    requestsInProgress[requestId] = {
      completed: false,
      result: null,
      timestamp: Date.now()
    };
    
    // 异步处理请求，不等待完成
    processTextAsync(text, mode, requestId);
    
    // 立即返回请求ID
    return new Response(JSON.stringify({
      success: true,
      requestId: requestId,
      message: '请求已提交，请使用请求ID查询进度'
    }), { headers });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: `处理错误: ${error.message}` 
    }), {
      headers,
      status: 500
    });
  }
}

// 异步处理文本
async function processTextAsync(text, mode, requestId) {
  try {
    // 获取系统提示
    const systemPrompt = getSystemPrompt(mode);
    
    // 构建请求
    const promptText = `请将以下内容按照${mode}模式转换为专业文稿（保持时间戳和发言人标记）：\n\n${text}`;
    
    // 调用DeepSeek API
    const apiResponse = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-R1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptText }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      })
    });
    
    // 处理API响应
    const result = await apiResponse.json();
    
    if (apiResponse.status !== 200) {
      requestsInProgress[requestId] = {
        completed: true,
        result: { 
          success: false, 
          error: `API错误: ${apiResponse.status}`, 
          details: result 
        },
        timestamp: Date.now()
      };
    } else {
      // 成功处理
      requestsInProgress[requestId] = {
        completed: true,
        result: {
          success: true,
          processed_text: result.choices[0].message.content
        },
        timestamp: Date.now()
      };
    }
  } catch (error) {
    // 记录错误
    requestsInProgress[requestId] = {
      completed: true,
      result: { 
        success: false, 
        error: `处理错误: ${error.message}` 
      },
      timestamp: Date.now()
    };
  }
  
  // 设置过期时间（1小时后自动删除）
  setTimeout(() => {
    if (requestsInProgress[requestId]) {
      delete requestsInProgress[requestId];
    }
  }, 3600000);
}

// 存储正在处理的请求
let requestsInProgress = {};

// Worker入口点
addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 路由处理
  if (url.pathname === '/process') {
    return event.respondWith(handleRequest(request));
  } else if (url.pathname === '/status') {
    // 处理状态查询请求
    return event.respondWith(handleStatusCheck(request));
  } else {
    return event.respondWith(
      new Response('会议转写小助手API服务 - 请使用POST请求访问/process，使用GET访问/status?requestId=xxx查询状态', {
        headers: { 'Content-Type': 'text/plain' }
      })
    );
  }
});
