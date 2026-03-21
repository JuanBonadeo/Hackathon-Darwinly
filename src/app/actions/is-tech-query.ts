"use server";

import { getOpenAI } from "@/lib/openai";

// Returns the GitHub "owner/repo" if the query is a known tech project, null otherwise.
export async function detectGitHubRepo(query: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  const prompt = `Does "${query}" refer to a specific software project with a public GitHub repository?

If yes, return the GitHub full name (owner/repo) of the most official or well-known repository.
If no, return exactly: false

Examples:
"react" → facebook/react
"angularjs" → angularjs/angular.js
"angular" → angular/angular
"python" → python/cpython
"nodejs" → nodejs/node
"node" → nodejs/node
"tensorflow" → tensorflow/tensorflow
"next.js" → vercel/next.js
"nextjs" → vercel/next.js
"typescript" → microsoft/TypeScript
"docker" → moby/moby
"kubernetes" → kubernetes/kubernetes
"bitcoin" → bitcoin/bitcoin
"vue" → vuejs/vue
"svelte" → sveltejs/svelte
"django" → django/django
"laravel" → laravel/framework
"rust" → rust-lang/rust
"golang" → golang/go
"go" → golang/go
"cooking" → false
"climate change" → false
"feminism" → false
"agile" → false

Return ONLY the repository full name like owner/repo or the word false. No quotes, no explanation, nothing else.`;

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
    });
    const text = (completion.choices[0].message.content ?? "").trim().toLowerCase().replace(/^"|"$/g, "");
    if (text === "false" || !text.includes("/")) return null;
    return text;
  } catch {
    return null;
  }
}
