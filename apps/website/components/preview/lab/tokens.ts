/**
 * 预览页 v8 的单一真源：协议、端点、文案。
 *
 * 为什么单独一个文件：首屏的协议切换器、下面的地址表、接入示例三处都要用同一份
 * 协议与端点。各写一份迟早漂移（文档 7.2 要求单一真源，C-D-05 要求口径唯一）。
 *
 * 端点路径与厂商官方文档一致，不是我们编的：
 *   OpenAI          POST /v1/chat/completions
 *   OpenAI Responses POST /v1/responses
 *   Anthropic       POST /v1/messages
 *   Google Gemini   POST /v1beta/models/{model}:generateContent
 */

export type ProtocolId = 'openai-chat' | 'openai-responses' | 'claude' | 'gemini';
export type LanguageId = 'curl' | 'python' | 'node' | 'go';

export type Protocol = {
  id: ProtocolId;
  /** 切换器上的文字 */
  tab: string;
  /** 归属厂商，用来告诉读者这四种写法分别对应谁的 SDK */
  family: string;
  /** 端点路径 */
  endpoint: string;
  /** 鉴权方式 */
  auth: string;
  /** 每种语言的请求示例（多语言切换） */
  snippets: Record<LanguageId, string>;
};

export const BASE_URL_TOKEN = '$BASE_URL';

export const LANGUAGES: { id: LanguageId; label: string }[] = [
  { id: 'curl', label: 'cURL' },
  { id: 'python', label: 'Python' },
  { id: 'node', label: 'Node.js' },
  { id: 'go', label: 'Go' },
];

export const PROTOCOLS: Protocol[] = [
  {
    id: 'openai-chat',
    tab: 'OpenAI Chat',
    family: 'OpenAI SDK',
    endpoint: '/v1/chat/completions',
    auth: 'Authorization: Bearer <Key>',
    snippets: {
      curl: `curl -X POST "${BASE_URL_TOKEN}/v1/chat/completions" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "glm-5.3",
    "messages": [{ "role": "user", "content": "你好" }],
    "stream": true
  }'`,
      python: `from openai import OpenAI

client = OpenAI(
    base_url="${BASE_URL_TOKEN}/v1",
    api_key="$API_KEY",
)

response = client.chat.completions.create(
    model="glm-5.3",
    messages=[{"role": "user", "content": "你好"}],
    stream=True,
)
for chunk in response:
    print(chunk.choices[0].delta.content, end="")`,
      node: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${BASE_URL_TOKEN}/v1",
  apiKey: "$API_KEY",
});

const response = await client.chat.completions.create({
  model: "glm-5.3",
  messages: [{ role: "user", content: "你好" }],
  stream: true,
});

for await (const chunk of response) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}`,
      go: `package main

import (
    "context"
    "fmt"
    openai "github.com/sashabaranov/go-openai"
)

func main() {
    config := openai.DefaultConfig("$API_KEY")
    config.BaseURL = "${BASE_URL_TOKEN}/v1"
    client := openai.NewClientWithConfig(config)

    resp, _ := client.CreateChatCompletion(context.Background(),
        openai.ChatCompletionRequest{
            Model: "glm-5.3",
            Messages: []openai.ChatCompletionMessage{
                {Role: "user", Content: "你好"},
            },
        })
    fmt.Println(resp.Choices[0].Message.Content)
}`,
    },
  },
  {
    id: 'openai-responses',
    tab: 'OpenAI Responses',
    family: 'OpenAI SDK（新接口）',
    endpoint: '/v1/responses',
    auth: 'Authorization: Bearer <Key>',
    snippets: {
      curl: `curl -X POST "${BASE_URL_TOKEN}/v1/responses" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-6.1-sol",
    "input": "总结这段会议记录",
    "stream": true
  }'`,
      python: `from openai import OpenAI

client = OpenAI(
    base_url="${BASE_URL_TOKEN}/v1",
    api_key="$API_KEY",
)

response = client.responses.create(
    model="gpt-6.1-sol",
    input="总结这段会议记录",
    stream=True,
)
for event in response:
    print(event)`,
      node: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${BASE_URL_TOKEN}/v1",
  apiKey: "$API_KEY",
});

const response = await client.responses.create({
  model: "gpt-6.1-sol",
  input: "总结这段会议记录",
  stream: true,
});

for await (const event of response) {
  console.log(event);
}`,
      go: `// Responses API 是 OpenAI 新接口，Go SDK 支持中
// 示例略，参考官方 go-openai 库文档`,
    },
  },
  {
    id: 'claude',
    tab: 'Claude',
    family: 'Anthropic SDK',
    endpoint: '/v1/messages',
    auth: 'x-api-key: <Key>',
    snippets: {
      curl: `curl -X POST "${BASE_URL_TOKEN}/v1/messages" \\
  -H "x-api-key: $API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "kimi-k3",
    "max_tokens": 1024,
    "messages": [{ "role": "user", "content": "你好" }]
  }'`,
      python: `import anthropic

client = anthropic.Anthropic(
    base_url="${BASE_URL_TOKEN}",
    api_key="$API_KEY",
)

message = client.messages.create(
    model="kimi-k3",
    max_tokens=1024,
    messages=[{"role": "user", "content": "你好"}],
)
print(message.content[0].text)`,
      node: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  baseURL: "${BASE_URL_TOKEN}",
  apiKey: "$API_KEY",
});

const message = await client.messages.create({
  model: "kimi-k3",
  max_tokens: 1024,
  messages: [{ role: "user", content: "你好" }],
});
console.log(message.content[0].text);`,
      go: `package main

import (
    "context"
    "fmt"
    anthropic "github.com/anthropics/anthropic-sdk-go"
)

func main() {
    client := anthropic.NewClient()
    msg, _ := client.Messages.New(context.Background(),
        anthropic.MessageNewParams{
            Model:     anthropic.String("kimi-k3"),
            MaxTokens: anthropic.Int(1024),
            Messages: []anthropic.MessageParam{
                anthropic.NewUserMessage(anthropic.NewTextBlock("你好")),
            },
        })
    fmt.Println(msg.Content[0].Text)
}`,
    },
  },
  {
    id: 'gemini',
    tab: 'Gemini',
    family: 'Google SDK',
    endpoint: '/v1beta/models/{model}:generateContent',
    auth: 'x-goog-api-key: <Key>',
    snippets: {
      curl: `curl -X POST "${BASE_URL_TOKEN}/v1beta/models/qwen3.8-max:generateContent" \\
  -H "x-goog-api-key: $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [{ "parts": [{ "text": "你好" }] }]
  }'`,
      python: `import google.generativeai as genai

genai.configure(
    api_key="$API_KEY",
    client_options={"api_endpoint": "${BASE_URL_TOKEN}"},
)

model = genai.GenerativeModel("qwen3.8-max")
response = model.generate_content("你好")
print(response.text)`,
      node: `import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("$API_KEY");
// 注意：Node SDK 暂不支持自定义 endpoint，需用 fetch 直调
// 或等官方支持后更新

const model = genAI.getGenerativeModel({ model: "qwen3.8-max" });
const result = await model.generateContent("你好");
console.log(result.response.text());`,
      go: `package main

import (
    "context"
    "fmt"
    "google.golang.org/genai"
)

func main() {
    client, _ := genai.NewClient(context.Background(),
        genai.WithAPIKey("$API_KEY"),
        genai.WithEndpoint("${BASE_URL_TOKEN}"))
    
    model := client.GenerativeModels("qwen3.8-max")
    resp, _ := model.GenerateContent(context.Background(),
        genai.Text("你好"))
    fmt.Println(resp.Candidates[0].Content.Parts[0].Text)
}`,
    },
  },
];

/** 首屏三根数字带的文案；数字里只有「模型数」是动态的，另外两个是事实常量 */
export const STATIC_STATS = {
  protocols: { value: '3', label: '种协议' },
  address: { value: '1', label: '个地址' },
} as const;
