export interface ThoughtMap { [messageId: string]: string }

const getKey = (conversationId: string) => `thoughts_${conversationId}`;

export const saveThought = (conversationId: string, messageId: string, summary: string) => {
  if (typeof window === 'undefined') return; // SSR safety
  try {
    const key = getKey(conversationId);
    const existing: ThoughtMap = JSON.parse(localStorage.getItem(key) || '{}');
    existing[messageId] = summary;
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to save thought', err);
  }
};

export const loadThoughts = (conversationId: string): ThoughtMap => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(getKey(conversationId)) || '{}');
  } catch {
    return {};
  }
}; 