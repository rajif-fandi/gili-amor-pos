import { NextResponse } from "next/server";
import { prisma } from "../../db";

export async function GET() {
  try {
    // Data bersih disesuaikan dengan skema database baru
    const seedData = [
      // RECEPTION
      { item_code: "REC-LATE", item_service: "Late Check-out", default_rate: 150000, category: "CHARGE", billing_type: "PER_UNIT", desk: "clock" },
      { item_code: "REC-BED", item_service: "Extra Bed", default_rate: 250000, category: "CHARGE", billing_type: "PER_UNIT", desk: "bed" },
      { item_code: "REC-BF", item_service: "Breakfast", default_rate: 120000, category: "CHARGE", billing_type: "PER_UNIT", desk: "coffee" },
      { item_code: "REC-LND", item_service: "Laundry Service", default_rate: 85000, category: "CHARGE", billing_type: "PER_UNIT", desk: "laundry" },
      { item_code: "REC-SPA", item_service: "Spa Treatment", default_rate: 350000, category: "CHARGE", billing_type: "PER_UNIT", desk: "spa" },
      { item_code: "REC-TRF", item_service: "Airport Transfer", default_rate: 450000, category: "TRANSFER", billing_type: "PER_TRIP", desk: "car" },
      { item_code: "REC-BTH", item_service: "Birthday Setup", default_rate: 300000, category: "CHARGE", billing_type: "PER_UNIT", desk: "cake" },
      { item_code: "REC-DEP", item_service: "Restaurant Deposit", default_rate: 500000, category: "CHARGE", billing_type: "PER_UNIT", desk: "utensils" },

      // RENT
      { item_code: "RENT-BIKE", item_service: "Bicycle", default_rate: 100000, category: "RENTAL", billing_type: "PER_DAY", desk: "bike" },
      { item_code: "RENT-EBIKE", item_service: "E-Bike", default_rate: 150000, category: "RENTAL", billing_type: "PER_DAY", desk: "rent" },
      { item_code: "RENT-SNORK", item_service: "Snorkeling Equipment", default_rate: 75000, category: "RENTAL", billing_type: "PER_DAY", desk: "dive" },
      { item_code: "RENT-GOPRO", item_service: "Go Pro", default_rate: 250000, category: "RENTAL", billing_type: "PER_DAY", desk: "camera" },

      // BOAT
      { item_code: "BOAT-DIVE", item_service: "Diving", default_rate: 750000, category: "ACTIVITY", billing_type: "PER_PAX", desk: "dive" },
      { item_code: "BOAT-FISH", item_service: "Fishing", default_rate: 100000, category: "ACTIVITY", billing_type: "PER_TRIP", desk: "fish" },
      { item_code: "BOAT-PUB", item_service: "Public Boat", default_rate: 35000, category: "TRANSFER", billing_type: "PER_PAX", desk: "boat" },
      { item_code: "BOAT-FAST", item_service: "Speed Boat Fast", default_rate: 400000, category: "TRANSFER", billing_type: "PER_PAX", desk: "boat" },

      // BUY
      { item_code: "BUY-SUN", item_service: "Sunscreen", default_rate: 120000, category: "RETAIL", billing_type: "PER_UNIT", desk: "sun" },
      { item_code: "BUY-WATER", item_service: "Mineral Water", default_rate: 20000, category: "RETAIL", billing_type: "PER_UNIT", desk: "water" },
      { item_code: "BUY-DRY", item_service: "Dry Bag", default_rate: 150000, category: "RETAIL", billing_type: "PER_UNIT", desk: "buy" },
      { item_code: "BUY-SHIRT", item_service: "Gili Amor T-Shirt", default_rate: 200000, category: "RETAIL", billing_type: "PER_UNIT", desk: "shirt" },
    ];

    // Hapus isi database lama yang berantakan (hapus transaksi dulu agar relasi aman)
    await prisma.detailTransaksi.deleteMany();
    await prisma.transaksi.deleteMany();
    await prisma.masterItem.deleteMany();

    // Tulis ulang database dengan data yang bersih
    for (const item of seedData) {
      await prisma.masterItem.create({ data: item });
    }

    return NextResponse.json({ success: true, message: "Semua menu berhasil dimasukkan dengan skema baru!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}