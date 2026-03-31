import OpenAI from "openai";

try {
  const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1"
  });

  const completion = await openai.chat.completions.create({
    model: process.env.DASHSCOPE_MODEL || "qwen-plus",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "你是谁？" }
    ]
  });

  console.log(completion.choices?.[0]?.message?.content || "(empty)");
} catch (error) {
  console.log(`错误信息：${error}`);
  console.log("请参考文档：https://help.aliyun.com/model-studio/developer-reference/error-code");
}
