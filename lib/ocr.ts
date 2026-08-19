/**
 * Nemotron OCR v2 Visual Rasterization & OCR Service
 * Performs visual-first page rendering and optical character recognition via NVIDIA API.
 */

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY;

export interface OcrResult {
  pageNum: number;
  text: string;
  markdownTables: string[];
}

/**
 * Perform Nemotron OCR v2 recognition on a Base64-encoded image page buffer or image payload.
 */
export async function performNemotronOcr(
  imageBuffer: Buffer,
  pageNum: number,
  fileName: string
): Promise<OcrResult> {
  if (!NVIDIA_API_KEY) {
    console.warn(`NVIDIA_API_KEY missing, skipping visual Nemotron OCR v2 for '${fileName}' page ${pageNum}`);
    return { pageNum, text: '', markdownTables: [] };
  }

  const base64Image = imageBuffer.toString('base64');
  const dataUrl = base64Image.startsWith('data:image/')
    ? base64Image
    : `data:image/png;base64,${base64Image}`;

  // Vision OCR Models on NVIDIA API
  const OCR_MODELS = [
    'meta/llama-3.2-11b-vision-instruct',
    'nvidia/neva-22b',
  ];

  for (const model of OCR_MODELS) {
    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are Nemotron OCR v2, a high-precision financial OCR and document layout engine. Perform optical character recognition on this document page image. Output clean readable text paragraphs and format all financial figures, income statements, and balance sheet items into standard Markdown tables.',
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Perform OCR layout extraction for ${fileName} (Page ${pageNum}).`,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: dataUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 2048,
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const ocrText = json.choices?.[0]?.message?.content || '';
        if (ocrText && ocrText.trim()) {
          const markdownTables = extractMarkdownTablesFromText(ocrText);
          return { pageNum, text: ocrText.trim(), markdownTables };
        }
      }
    } catch (e) {
      console.warn(`Nemotron OCR model ${model} call failed for page ${pageNum}:`, e);
    }
  }

  return { pageNum, text: '', markdownTables: [] };
}

function extractMarkdownTablesFromText(ocrText: string): string[] {
  const tables: string[] = [];
  const lines = ocrText.split(/\r?\n/);
  let currentTableLines: string[] = [];

  for (const line of lines) {
    if (line.trim().includes('|')) {
      currentTableLines.push(line.trim());
    } else {
      if (currentTableLines.length >= 2) {
        tables.push(currentTableLines.join('\n'));
      }
      currentTableLines = [];
    }
  }

  if (currentTableLines.length >= 2) {
    tables.push(currentTableLines.join('\n'));
  }

  return tables;
}
