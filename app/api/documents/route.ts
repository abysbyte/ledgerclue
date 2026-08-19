import { NextResponse } from 'next/server';
import { fetchDocumentsByDeal, createDocumentRecord } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('deal_id');
    if (!dealId) {
      return NextResponse.json({ success: false, error: 'deal_id parameter is required' }, { status: 400 });
    }

    const documents = await fetchDocumentsByDeal(dealId);
    return NextResponse.json({ success: true, data: documents });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deal_id, file_name, storage_path, file_size } = body;
    
    if (!deal_id || !file_name) {
      return NextResponse.json({ success: false, error: 'deal_id and file_name are required' }, { status: 400 });
    }

    const doc = await createDocumentRecord({
      deal_id,
      file_name,
      storage_path: storage_path || `deals/${deal_id}/${file_name}`,
      file_size: file_size || 2500000,
      mime_type: 'application/pdf',
      parsing_status: 'completed',
    });

    return NextResponse.json({ success: true, data: doc });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to record document' }, { status: 500 });
  }
}
