import { NextResponse } from 'next/server';
import { executeDueDiligenceQuery } from '@/lib/rag';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deal_id, query } = body;

    if (!deal_id || !query) {
      return NextResponse.json({ success: false, error: 'deal_id and query are required' }, { status: 400 });
    }

    const response = await executeDueDiligenceQuery(deal_id, query);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error('Query API Route Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Due diligence query failed' }, { status: 500 });
  }
}
