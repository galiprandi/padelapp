const MAGIC_LINK_PATHS = {
  match: "m",
  player: "j",
  turn: "t",
  user: "u",
  ranking: "ranking",
  comment: "c",
} as const;

export type MagicLinkResource = keyof typeof MAGIC_LINK_PATHS | (string & {});

export type MagicLinkQuery = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface CreateMagicLinkOptions {
  resource: MagicLinkResource;
  identifier?: string;
  extraSegments?: Array<string | number>;
  query?: MagicLinkQuery;
  baseUrl?: string;
  tokenLength?: number;
}

const DEFAULT_TOKEN_LENGTH = 12;
const TOKEN_ALPHABET =
  "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function resolveBaseUrl(override?: string): string {
  const candidate =
    override ?? process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL;

  if (candidate && candidate.length > 0) {
    if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
      return candidate;
    }
    return `https://${candidate}`;
  }

  return "http://localhost:3000";
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

export function generateMagicToken(length = DEFAULT_TOKEN_LENGTH): string {
  if (length <= 0) {
    throw new Error("token length must be greater than zero");
  }

  const cryptoApi = globalThis.crypto;
  if (!cryptoApi || typeof cryptoApi.getRandomValues !== "function") {
    throw new Error("crypto.getRandomValues is not available in this environment");
  }

  const bytes = cryptoApi.getRandomValues(new Uint8Array(length));
  let token = "";

  for (let index = 0; index < length; index += 1) {
    const characterIndex = bytes[index] % TOKEN_ALPHABET.length;
    token += TOKEN_ALPHABET[characterIndex];
  }

  return token;
}

export function getMagicLinkBaseUrl(override?: string): string {
  return ensureTrailingSlash(resolveBaseUrl(override));
}

export function createMagicLink({
  resource,
  identifier,
  extraSegments = [],
  query,
  baseUrl,
  tokenLength,
}: CreateMagicLinkOptions): { url: string; identifier: string } {
  const mappedResource =
    MAGIC_LINK_PATHS[resource as keyof typeof MAGIC_LINK_PATHS] ?? resource;

  const effectiveIdentifier =
    identifier ?? generateMagicToken(tokenLength ?? DEFAULT_TOKEN_LENGTH);

  const segments: string[] = [mappedResource];

  if (effectiveIdentifier) {
    segments.push(effectiveIdentifier);
  }

  extraSegments.forEach((segment) => {
    const value = `${segment}`.trim();
    if (value.length > 0) {
      segments.push(value);
    }
  });

  const base = getMagicLinkBaseUrl(baseUrl);
  const pathname = segments.filter(Boolean).join("/");
  const url = new URL(pathname, base);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }
      url.searchParams.append(key, String(value));
    });
  }

  return {
    url: url.toString(),
    identifier: effectiveIdentifier,
  };
}

export { MAGIC_LINK_PATHS };
