import { GoogleGenAI } from "@google/genai";
import { Habit, HabitLog, UserProfile } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateHabitAdvice = async (
  habits: Habit[],
  logs: HabitLog[],
  user: UserProfile
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "请配置 API Key 以使用智能助手功能。";

  // Calculate some basic stats to feed the AI
  const totalCompleted = logs.length;
  const recentLogs = logs.filter(l => {
    const logDate = new Date(l.date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - logDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  const prompt = `
    你是一个充满活力、积极向上的个人成长教练。请根据以下用户的习惯数据，给出一段简短、个性化且鼓舞人心的中文建议（不超过100字）。
    
    用户档案:
    - 当前等级: ${user.level}
    - 总经验值: ${user.xp}
    
    习惯列表: ${habits.map(h => h.name).join(', ')}
    
    数据概览:
    - 历史总打卡次数: ${totalCompleted}
    - 过去7天打卡次数: ${recentLogs}
    
    请分析他们的表现，如果有进步则表扬，如果停滞则温和鼓励。可以引用一句简短的名言。
    不要使用Markdown格式，直接输出纯文本。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "继续保持！每一步都算数。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "暂时无法连接到智能教练，请稍后再试。但请记住，坚持就是胜利！";
  }
};

export const suggestNewHabits = async (currentHabits: Habit[]): Promise<{name: string, description: string, icon: string}[]> => {
    const ai = getClient();
    if (!ai) return [];

    const prompt = `
      用户目前正在养成的习惯有：${currentHabits.map(h => h.name).join(', ')}。
      请根据这些习惯，推荐3个能够补充或平衡用户生活的**新习惯**。
      例如，如果用户有很多运动习惯，可以推荐阅读或冥想。
      
      请严格按照以下JSON数组格式返回，不要包含Markdown标记：
      [
        {"name": "习惯名称", "description": "简短描述", "icon": "单个Emoji图标"}
      ]
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        
        const text = response.text;
        if (!text) return [];
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Suggestion Error", error);
        return [];
    }
}