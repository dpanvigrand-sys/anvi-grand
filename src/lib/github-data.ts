import { AsyncLocalStorage } from "async_hooks";

/**
 * Persist CMS files to GitHub when the host FS is read-only (Vercel).
 * Token from request header (ops Photos UI) or ANVI_GITHUB_TOKEN / GITHUB_TOKEN.
 */

const OWNER = process.env.ANVI_GITHUB_OWNER || "dpanvigrand-sys";
const REPO = process.env.ANVI_GITHUB_REPO || "anvi-grand";
const BRANCH = process.env.ANVI_GITHUB_BRANCH || "main";

type Store = { token?: string };
const als = new AsyncLocalStorage<Store>();

export function runWithDataToken<T>(
  token: string | undefined,
  fn: () => Promise<T>,
): Promise<T> {
  return als.run({ token: token?.trim() || undefined }, fn);
}

function resolveToken(): string {
  const fromAls = als.getStore()?.token?.trim();
  if (fromAls) return fromAls;
  return (
    process.env.ANVI_GITHUB_TOKEN?.trim() ||
    process.env.GITHUB_TOKEN?.trim() ||
    ""
  );
}

export function hasDataWriteToken(): boolean {
  return Boolean(resolveToken());
}

async function githubApi(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = resolveToken();
  if (!token) {
    throw new Error(
      "Live site cannot save files. Paste a GitHub PAT (repo) in Photos → Live save token, then retry.",
    );
  }
  const headers = new Headers(init?.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("X-GitHub-Api-Version", "2022-11-28");
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`https://api.github.com${path}`, { ...init, headers });
}

function encodeRepoPath(repoPath: string): string {
  return repoPath
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
}

/** Create or update a file in the GitHub repo (path relative to repo root). */
export async function upsertGithubFile(
  repoPath: string,
  content: Buffer | string,
  message: string,
): Promise<void> {
  const encoded = encodeRepoPath(repoPath);
  const bytes = Buffer.isBuffer(content)
    ? content
    : Buffer.from(content, "utf8");
  const contentB64 = bytes.toString("base64");

  let sha: string | undefined;
  const getRes = await githubApi(
    `/repos/${OWNER}/${REPO}/contents/${encoded}?ref=${BRANCH}`,
  );
  if (getRes.ok) {
    const existing = (await getRes.json()) as { sha?: string };
    sha = existing.sha;
  } else if (getRes.status !== 404) {
    const err = await getRes.text();
    throw new Error(`GitHub read failed (${getRes.status}): ${err.slice(0, 180)}`);
  }

  const putRes = await githubApi(`/repos/${OWNER}/${REPO}/contents/${encoded}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: contentB64,
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(
      `GitHub save failed (${putRes.status}): ${err.slice(0, 220)}`,
    );
  }
}

export function isReadonlyFsError(err: unknown): boolean {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code?: string }).code)
      : "";
  const msg = err instanceof Error ? err.message : String(err);
  return (
    code === "EROFS" ||
    code === "EACCES" ||
    /read-only file system/i.test(msg) ||
    /EROFS/i.test(msg)
  );
}
