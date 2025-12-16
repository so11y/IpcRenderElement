import axios from "axios";

// Ollama 本地服务配置
const OLLAMA_API_URL = "http://127.0.0.1:11434/api/generate"; // Ollama 默认端口
const MODEL_NAME = "gemma3:1b"; // 替换为你实际使用的模型名称

export async function translateText(chineseText: string) {
  try {
    const response = await axios.post(OLLAMA_API_URL, {
      model: MODEL_NAME,
      prompt: `请将以下中文翻译成英文，只返回英文翻译结果，不要任何其他内容或标点符号：${chineseText}`,
      stream: false, // 关闭流式输出
      options: {
        temperature: 0.3 // 降低随机性以获得更确定性的结果
      }
    });

    // 提取纯英文结果（移除可能的多余空格和标点）
    const englishText = response.data.response
      .replace(/[^\w\s]/g, "") // 移除所有标点符号
      .trim(); // 移除首尾空格

    return englishText;
  } catch (error: any) {
    console.error("翻译请求失败:", error.message);
    throw new Error("翻译服务暂不可用");
  }
}
