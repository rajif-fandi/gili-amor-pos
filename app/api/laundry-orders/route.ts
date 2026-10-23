import { NextResponse } from 'next/server';
import { prisma } from '../../db';

export async function GET() {
  try {
    const orders = await prisma.laundryOrder.findMany({
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}