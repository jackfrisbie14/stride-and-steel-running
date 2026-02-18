let _client = null;

export async function getAnthropicClient() {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your-anthropic-api-key-here") {
      throw new Error("ANTHROPIC_API_KEY is not configured. Add your API key to .env.local");
    }
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    _client = new Anthropic({ apiKey });
  }
  return _client;
}
