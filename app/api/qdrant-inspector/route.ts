import { NextResponse } from 'next/server';
import { getAllQdrantPayloads, clearQdrantCollection, COLLECTION_NAME, VECTOR_DIMENSION } from '@/lib/qdrant';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('deal_id') || undefined;

    const payloads = await getAllQdrantPayloads(dealId);

    const tablesCount = payloads.filter(p => p.chunk_type === 'table').length;
    const chartsCount = payloads.filter(p => p.chunk_type === 'chart').length;
    const textCount = payloads.filter(p => p.chunk_type === 'text').length;

    return NextResponse.json({
      success: true,
      meta: {
        collection_name: COLLECTION_NAME,
        vector_dimension: VECTOR_DIMENSION,
        total_points: payloads.length,
        tables_count: tablesCount,
        charts_count: chartsCount,
        text_count: textCount,
        parent_child_table_payload_active: true,
      },
      data: payloads,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to inspect Qdrant payloads' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('deal_id') || undefined;

    await clearQdrantCollection(dealId);

    return NextResponse.json({
      success: true,
      message: dealId ? `Cleared vector points for deal ${dealId}` : 'Cleared all collection vector points',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to clear vectors' }, { status: 500 });
  }
}
