import { AzureOpenAI, OpenAI } from 'openai';

export type OpenAIProvider = 'openai' | 'azure' | 'auto';
export type OpenAIAPIMode = 'chat_completions' | 'responses';

export type OpenAIConfig = {
  provider: OpenAIProvider;
  apiMode: OpenAIAPIMode;
  chatModel: string;
  openaiApiKey?: string;
  openaiBaseUrl?: string;
  azureApiKey?: string;
  azureEndpoint?: string;
  azureApiVersion?: string;
  /** Azure deployment name (required for Azure, defaults to chatModel if not provided) */
  azureDeployment?: string;
};

type OpenAIClient = AzureOpenAI | OpenAI;
type CacheKey = `${'openai' | 'azure'}:${OpenAIAPIMode}`;

const cachedClients = new Map<CacheKey, OpenAIClient>();

function resolveProvider(config: OpenAIConfig): 'openai' | 'azure' {
  if (config.provider === 'openai') return 'openai';
  if (config.provider === 'azure') return 'azure';
  // auto
  if (config.openaiApiKey) return 'openai';
  if (config.azureApiKey && config.azureEndpoint) return 'azure';
  throw new Error(
    'No OpenAI credentials configured. Set openaiApiKey or azureApiKey + azureEndpoint.',
  );
}

export function getOpenAIClient(config: OpenAIConfig): OpenAIClient {
  const provider = resolveProvider(config);
  const apiMode = config.apiMode;
  const cacheKey = `${provider}:${apiMode}` as CacheKey;
  const existing = cachedClients.get(cacheKey);

  console.log('[OpenAI Client] Config received:', {
    provider: config.provider,
    resolvedProvider: provider,
    apiMode,
    chatModel: config.chatModel,
    hasOpenAIKey: !!config.openaiApiKey,
    hasAzureKey: !!config.azureApiKey,
    azureEndpoint: config.azureEndpoint,
    azureApiVersion: config.azureApiVersion,
    azureDeployment: config.azureDeployment,
  });

  if (existing) {
    console.log('[OpenAI Client] Returning cached client for:', cacheKey);
    return existing;
  }

  if (provider === 'openai') {
    if (!config.openaiApiKey) {
      throw new Error("OpenAI provider selected but openaiApiKey isn't set.");
    }

    console.log('[OpenAI Client] Creating OpenAI client:', {
      baseURL: config.openaiBaseUrl || 'default',
    });

    const client = new OpenAI({
      apiKey: config.openaiApiKey,
      baseURL: config.openaiBaseUrl,
      maxRetries: 2,
      timeout: 10 * 60 * 1000,
    });
    cachedClients.set(cacheKey, client);
    return client;
  }

  // azure - force chat_completions mode as Responses API isn't widely supported yet
  if (!config.azureApiKey || !config.azureEndpoint) {
    throw new Error("Azure OpenAI provider selected but azureApiKey/azureEndpoint isn't set.");
  }

  const apiVersion = config.azureApiVersion || '2024-12-01-preview';
  const deployment = config.azureDeployment || config.chatModel;

  if (apiMode === 'responses') {
    console.warn('[OpenAI Client] WARNING: Responses API not well-supported on Azure yet. Forcing chat_completions mode.');
  }

  console.log('[OpenAI Client] Creating AzureOpenAI client:', {
    endpoint: config.azureEndpoint,
    deployment,
    apiVersion,
    forcedMode: apiMode === 'responses' ? 'chat_completions' : apiMode,
  });

  const client = new AzureOpenAI({
    apiKey: config.azureApiKey,
    endpoint: config.azureEndpoint,
    apiVersion,
    deployment,
    maxRetries: 2,
    timeout: 10 * 60 * 1000,
  });

  cachedClients.set(cacheKey, client);
  return client;
}
