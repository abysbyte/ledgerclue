import { NextResponse } from 'next/server';
import { fetchDeals, createDeal } from '@/lib/supabase';

export async function GET() {
  try {
    const deals = await fetchDeals();
    return NextResponse.json({ success: true, data: deals });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, target_company, sector, deal_size } = body;
    if (!name) {
      return NextResponse.json({ success: false, error: 'Deal name is required' }, { status: 400 });
    }

    const deal = await createDeal(name, target_company, sector, deal_size);
    return NextResponse.json({ success: true, data: deal });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create deal' }, { status: 500 });
  }
}
