import { NextResponse } from 'next/server';
import { executeDocumentIngestion } from '@/lib/ingestion';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const dealId = formData.get('deal_id') as string | null;

    if (!dealId) {
      return NextResponse.json({ success: false, error: 'deal_id is required' }, { status: 400 });
    }

    const fileName = file ? file.name : (formData.get('file_name') as string) || 'Audited_Financial_Statement_FY2025.pdf';
    let fileBuffer: Buffer | ArrayBuffer;

    if (file) {
      fileBuffer = await file.arrayBuffer();
    } else {
      // Mock sample financial statement buffer if triggered via UI quick ingest button
      fileBuffer = Buffer.from('Mock Financial Document Buffer containing Markdown Tables and Balance Sheets');
    }

    const result = await executeDocumentIngestion(dealId, fileName, fileBuffer);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Document ingested successfully into Qdrant collection (2048-dim vectors, ${result.tablesProcessed} Markdown tables, ${result.chartsProcessed} visual charts).`,
    });
  } catch (error: any) {
    console.error('Ingestion API Route Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Ingestion failed' }, { status: 500 });
  }
}
