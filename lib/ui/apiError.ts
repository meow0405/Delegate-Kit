export async function getActionError(response: Response, action: string) {
  if (response.status === 400) return `Check the information you entered, then try to ${action}.`;
  if (response.status === 401 || response.status === 403) return `This action needs permission. Reconnect the service, then try to ${action}.`;
  if (response.status === 408 || response.status === 504) return `The request took too long. Your current work is safe; try to ${action} again.`;
  if (response.status === 429) return `The model is receiving too many requests. Wait a minute, then try to ${action} again.`;
  if (response.status >= 500) return `The AI service is unavailable right now. Your current work is safe; try again or switch providers.`;

  const payload = await response.json().catch(() => undefined);
  return typeof payload?.error === "string" && payload.error.length < 180
    ? payload.error
    : `We could not ${action}. Your current work is safe, so you can try again.`;
}

export function getNetworkError(error: unknown, action: string) {
  if (error instanceof DOMException && error.name === "AbortError") return undefined;
  return `The app could not reach the service to ${action}. Check your connection or local model, then try again.`;
}
