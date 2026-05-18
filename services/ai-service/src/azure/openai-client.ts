import { azureConfigured, config } from '../config';
import type { AnalysisResult } from '../analytics/analyze';

// Calls Azure OpenAI chat-completions REST endpoint with the computed
// analysis facts and asks for a tight Slovenian narrative. Returns the text
// when successful; returns null when Azure isn't configured or the call
// fails — caller falls back to the templated summary.
//
// === To plug your model in: ===
// Set these env vars (e.g. via compose.yaml or a .env file shipped with
// ai-service):
//   AZURE_OPENAI_ENDPOINT     = https://YOUR-RESOURCE.openai.azure.com
//   AZURE_OPENAI_API_KEY      = <key from Azure portal>
//   AZURE_OPENAI_DEPLOYMENT   = <deployment name, e.g. gpt-4o>
//   AZURE_OPENAI_API_VERSION  = 2024-08-01-preview   (override if needed)
// No code changes required — the rest of the prompt and request shape is
// already correct for the Azure Chat Completions API.
export async function summarizeWithAzure(analysis: AnalysisResult): Promise<string | null> {
  if (!azureConfigured()) return null;

  const { endpoint, apiKey, deployment, apiVersion, maxTokens, temperature } = config.azure;
  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;

  const facts = JSON.stringify({
    totals: analysis.totals,
    alerts: analysis.alerts.slice(0, 10),
    reorderSuggestions: analysis.reorderSuggestions.slice(0, 10),
  });

  const body = {
    messages: [
      {
        role: 'system',
        content:
          'Si analitik logistike. Pišeš v slovenščini, jasno in konkretno. ' +
          'Tvoja naloga je iz strukturiranih podatkov o zalogah pripraviti tri stavke za vodjo skladišča: ' +
          '(1) splošno stanje, (2) najnujnejše tveganje, (3) priporočilo za naslednje 24 ur. ' +
          'Brez markdown formatiranja. Brez ponavljanja podatkov, ki jih bo videl spodaj.',
      },
      {
        role: 'user',
        content: `Podatki:\n${facts}\nNapiši kratek povzetek (do 60 besed).`,
      },
    ],
    temperature,
    max_tokens: maxTokens,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key':      apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn(`[AI] Azure call ${res.status} — falling back to template`);
      return null;
    }

    const json = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    return text && text.length > 0 ? text : null;
  } catch (err) {
    console.warn(`[AI] Azure call failed: ${(err as Error).message} — falling back to template`);
    return null;
  }
}
