import { createAgent } from 'langchain';
import { tool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { ConfigService } from '@nestjs/config';
// 定义 Bocha Web Search 工具（使用 fetch）
export const bochaWebSearchTool = (configService: ConfigService) => {
  const apiKey = configService.get<string>('AI_WEB_SEARCH_API_KEY');
  // const modelKey = configService.get<string>('AI_MODLE_API_KEY');

  return tool(
    async ({ query, count = 10 }) => {
      const url = 'https://api.bochaai.com/v1/web-search';
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };
      const body = JSON.stringify({
        query,
        freshness: 'noLimit',
        summary: true,
        count,
      });

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body,
        });

        if (!response.ok) {
          return `搜索API请求失败，状态码: ${response.status}, 错误信息: ${response.statusText}`;
        }

        const jsonResponse = await response.json();
        if (jsonResponse.code !== 200 || !jsonResponse.data) {
          return `搜索API请求失败，原因是: ${jsonResponse.msg || '未知错误'}`;
        }

        const webpages = jsonResponse.data.webPages?.value;
        if (!webpages || webpages.length === 0) {
          return '未找到相关结果。';
        }

        let formattedResults = '';
        for (let idx = 0; idx < webpages.length; idx++) {
          const page = webpages[idx];
          formattedResults += `引用: ${idx + 1}
        标题: ${page.name}
        URL: ${page.url}
        摘要: ${page.summary}
        网站名称: ${page.siteName}
        网站图标: ${page.siteIcon}
        发布时间: ${page.dateLastCrawled}
`;
        }
        return formattedResults.trim();
      } catch (error: any) {
        return `搜索API请求失败，原因是：${error.message}`;
      }
    },
    {
      name: 'BochaWebSearch',
      description:
        '使用Bocha Web Search API 进行搜索互联网网页，输入应为搜索查询字符串，输出将返回搜索结果的详细信息，包括网页标题、网页URL、网页摘要、网站名称、网站Icon、网页发布时间等。',
      schema: z.object({
        query: z.string().describe('搜索关键词'),
        count: z.number().default(10).describe('返回的搜索结果数量'),
      }),
    },
  );
}
const a = async () => {
  // 初始化 OpenAI 语言模型
  const llm = new ChatOpenAI({
    temperature: 1.3,
    model: 'deepseek-v4-flash',
    apiKey: "sk-284e840688db4cd1bd724e859c38d62e",
    configuration: {
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    },
    maxTokens: 4396,
    streaming: true,
    modelKwargs: {
      // 关闭深度思考
      enable_thinking: false
    },
  });

  // 创建代理
  const agent = createAgent({
    model: llm,
    tools: [bochaWebSearchTool(new ConfigService())],
    systemPrompt: 'You are a helpful assistant.',
  });

  // 使用代理进行查询
  const userQuestion = '请告诉我阿里巴巴2025年ESG报告中的亮点';
  const result = await agent.invoke({
    messages: [
      {
        role: 'user',
        content: userQuestion,
      },
    ],
  });

  /**
   * HumanMessage 用户消息 [props]
   * AIMessageChunk 代理回复 [我需要先搜索阿里巴巴2025年ESG报告的相关信息。]
   * ToolMessage 工具调用 [引用...文章名称...文章内容...链接... * 10]
   * AIMessageChunk 代理回复 [根据搜索到的消息....]
   */
  console.log(result.messages[3].content);
};
