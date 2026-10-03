import { NextResponse } from 'next/server';
import { getSemanticCacheStats, invalidateSemanticCache } from '@/lib/semantic-cache';

export async function GET() {
  try {
    const stats = getSemanticCacheStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve cache stats' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, deal_id } = body;

    if (action === 'invalidate' || action === 'clear') {
      const result = await invalidateSemanticCache(deal_id);
      return NextResponse.json({
        success: true,
        message: deal_id
          ? `Semantic cache for deal "${deal_id}" invalidated (${result.deletedCount} entries removed)`
          : `All semantic cache entries invalidated (${result.deletedCount} entries removed)`,
        data: result,
      });
    }

    return NextResponse.json(
      { success: false, error: `Invalid action "${action}". Supported actions: 'invalidate', 'clear'` },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to manage semantic cache' },
      { status: 500 }
    );
  }
}
