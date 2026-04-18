import type { Priority } from '@/types';

const BASE = 'https://api.openai.com/v1';
const MODEL = 'gpt-4o-mini';

function key(): string {
  const k = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!k) throw new Error('EXPO_PUBLIC_OPENAI_API_KEY is not set');
  return k;
}

async function chat<T>(system: string, user: string): Promise<T> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: 'json_object' },
      max_tokens: 400,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: user },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message ?? `OpenAI error ${res.status}`);
  }

  const data = await res.json();
  return JSON.parse(data.choices[0].message.content) as T;
}

// ─── Whisper ────────────────────────────────────────────────────────────────

export async function transcribeAudio(audioUri: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as unknown as Blob);
  formData.append('model', 'whisper-1');

  const res = await fetch(`${BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key()}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message ?? `Whisper error ${res.status}`);
  }

  const data = await res.json();
  return ((data as any).text as string).trim();
}

// ─── Priority suggestion ─────────────────────────────────────────────────────

export interface PrioritySuggestion {
  priority: Priority;
  reason: string;
}

export async function suggestPriority(
  title: string,
  description: string,
): Promise<PrioritySuggestion> {
  const result = await chat<{ priority: string; reason: string }>(
    'Suggest a priority level for the given task. Reply with JSON only: {"priority":"low|medium|high","reason":"under 6 words"}',
    `Task: ${title}\nDescription: ${description || 'none'}`,
  );
  return {
    priority: (result.priority as Priority) ?? 'medium',
    reason: result.reason ?? '',
  };
}

// ─── Voice → structured task ─────────────────────────────────────────────────

export interface ParsedVoiceTask {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
}

export async function parseVoiceTask(transcript: string): Promise<ParsedVoiceTask> {
  const now = new Date();
  const tzOffsetMin = -now.getTimezoneOffset();
  const tzSign = tzOffsetMin >= 0 ? '+' : '-';
  const tzH = String(Math.floor(Math.abs(tzOffsetMin) / 60)).padStart(2, '0');
  const tzM = String(Math.abs(tzOffsetMin) % 60).padStart(2, '0');
  const tzOffset = `${tzSign}${tzH}:${tzM}`;

  const localDatetime = now.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  const result = await chat<{
    title: string;
    description: string | null;
    priority: string;
    dueDate: string | null;
  }>(
    `Current local date and time: ${localDatetime} (UTC${tzOffset}).
Parse the user's spoken task into structured data.
- title: 2–6 word imperative phrase summarising the core action — never copy the transcript verbatim (e.g. "Buy groceries" not "I need to go to the store and buy groceries")
- description: any extra context, details, or constraints mentioned beyond the core action; null if nothing meaningful remains after writing the title
- priority: "low" | "medium" | "high" based on urgency/importance cues
- dueDate: ISO 8601 with timezone offset ${tzOffset} at 23:59:00 if a date is mentioned, otherwise null (e.g. "2025-01-15T23:59:00${tzOffset}")

Reply with JSON only: {"title":"...","description":"extra context or null","priority":"low|medium|high","dueDate":"2025-01-15T23:59:00+03:00 or null"}`,
    `Voice input: "${transcript}"`,
  );

  const desc = result.description;
  return {
    title:       result.title ?? '',
    description: (!desc || desc === 'null') ? '' : desc,
    priority:    (result.priority as Priority) ?? 'medium',
    dueDate:     result.dueDate ?? null,
  };
}
