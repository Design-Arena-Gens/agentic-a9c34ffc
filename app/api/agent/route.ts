import { NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const MODEL_NAME = 'gemini-1.5-flash';

function mapMessages(messages: ChatMessage[]) {
  return messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));
}

function fallbackResponse(messages: ChatMessage[]) {
  const latestUser = [...messages].reverse().find((entry) => entry.role === 'user');
  const rawContent = latestUser?.content ?? '';

  const sanitized = rawContent
    .replace(/\s+/g, ' ')
    .replace(/[!?]+/g, '.')
    .trim();

  const possibleTasks = sanitized
    .split(/[.,]/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .slice(0, 5);

  const checklist =
    possibleTasks.length > 0
      ? possibleTasks
          .map(
            (task, index) =>
              `${index + 1}. ${task.charAt(0).toUpperCase()}${task.slice(1)}`,
          )
          .join('\n')
      : '1. Apne mission ko detail mein likhiye\n2. JarviSpark se timeline ya reminders bhi maang sakte hain';

  return [
    'Server-side Gemini abhi available nahi hai, lekin JarviSpark phir bhi aapka saath dega! ✨',
    '',
    latestUser
      ? `Aapka mission summary mujhe samajh aa gaya: “${rawContent}”`
      : 'Mission details mujhe clear nahi mile. Jo bhi karwana ho seedha likh bhej dijiye.',
    '',
    'Chaliye turbo mode mein ek quick checklist banate hain:',
    checklist,
    '',
    'Aap chahein to mujhe deadline ya reminders bhi bata sakte hain — main ek friendly ping bhej dunga!',
  ].join('\n');
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { messages?: ChatMessage[] };
    const messages = payload.messages ?? [];

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ text: fallbackResponse(messages) });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.95,
        topP: 0.9,
        topK: 32,
        maxOutputTokens: 512,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    const result = await model.generateContent({
      contents: mapMessages([
        {
          role: 'user',
          content:
            'Tum JarviSpark ho – ek pyara, friendly Hindi-English bolne wala AI jo user ke tasks ko plan karke clear guidance deta hai. Tone warm aur upbeat rakho, video call ke dost jaisa. Agar koi task aata hai, to steps, reminders, aur helpful prompts do. Zarurat pade to time estimates aur checklist style pointers bhi do. Humesha positive closure karo.',
        },
        ...messages,
      ] as ChatMessage[]),
    });

    const text = result.response?.text();

    if (!text) {
      return NextResponse.json(
        { error: 'Gemini ne khaali response diya. Thodi der baad try karein.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('[agent-route-error]', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Agent ko response banane mein dikkat aa rahi hai.',
      },
      { status: 500 },
    );
  }
}
