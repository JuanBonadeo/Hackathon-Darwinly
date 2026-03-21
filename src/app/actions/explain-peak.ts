'use server'

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

export async function explainPeak(
  query: string,
  year: number,
  counts: Record<string, number>
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return ''
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `En ${year}, el concepto "${query}" tuvo estos niveles de actividad en distintas fuentes: ${JSON.stringify(counts)}. En 2-3 oraciones cortas, explica que eventos historicos, culturales o cientificos de ese ano pueden explicar este nivel de actividad. Responde en espanol, sin listas, solo parrafo.`,
                },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      return ''
    }

    const data = (await response.json()) as GeminiResponse
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
  } catch {
    return ''
  }
}
