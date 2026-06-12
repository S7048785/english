import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

export const createModel = () => {
  return new ChatOpenAI({
    model: process.env.AI_MODEL,
    apiKey: process.env.AI_MODEL_API_KEY,
    configuration: {
      baseURL: process.env.AI_BASE_URL,
    },
    temperature: 1.3,
    maxTokens: 4396,
    streaming: true,
    modelKwargs: {
      // 关闭深度思考
      enable_thinking: false,
    },
  });
};

export const createCheckPoint = async () => {
  const checkPointer = PostgresSaver.fromConnString(
    process.env.AI_DATABASE_URL!,
  );
  await checkPointer.setup();
  return checkPointer;
};
