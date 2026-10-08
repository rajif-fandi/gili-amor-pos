import { NextResponse } from "next/server";
import { prisma } from "../../db";

export async function GET() {
  try {
    // Data bersih dan lengkap dengan ikon yang tepat
    const seedData = [
      // RECEPTION
      { item_code: "1", nama_item: "Late Check-out", harga: 150000, kategori: "Room Charges", desk: "clock" },
      { item_code: "2", nama_item: "Bicycle Rental", harga: 75000, kategori: "Miscellaneous", desk: "bike" },
      { item_code: "3", nama_item: "Extra Bed", harga: 250000, kategori: "Room Charges", desk: "bed" },
      { item_code: "4", nama_item: "Breakfast", harga: 120000, kategori: "Room Charges", desk: "coffee" },
      { item_code: "5", nama_item: "Laundry Service", harga: 85000, kategori: "Miscellaneous", desk: "laundry" },
      { item_code: "6", nama_item: "Spa Treatment", harga: 350000, kategori: "Miscellaneous", desk: "spa" },
      { item_code: "7", nama_item: "Airport Transfer", harga: 450000, kategori: "Miscellaneous", desk: "car" },
      { item_code: "8", nama_item: "Birthday Setup", harga: 300000, kategori: "Room Charges", desk: "cake" },
      { item_code: "9", nama_item: "Restaurant Deposit", harga: 500000, kategori: "Deposits", desk: "utensils" },

      // RENT
      { item_code: "101", nama_item: "Bicycle", harga: 100000, kategori: "Vehicles", desk: "bike" },
      { item_code: "102", nama_item: "E-Bike", harga: 150000, kategori: "Vehicles", desk: "rent" },
      { item_code: "103", nama_item: "Snorkeling Equipment", harga: 75000, kategori: "Equipment", desk: "dive" },
      { item_code: "104", nama_item: "Go Pro", harga: 250000, kategori: "Equipment", desk: "camera" },

      // BOAT
      { item_code: "201", nama_item: "Diving", harga: 750000, kategori: "Activities", desk: "dive" },
      { item_code: "202", nama_item: "Fishing", harga: 100000, kategori: "Activities", desk: "fish" },
      { item_code: "203", nama_item: "Public Boat", harga: 35000, kategori: "Transport", desk: "boat" },
      { item_code: "204", nama_item: "Speed Boat Fast", harga: 400000, kategori: "Transport", desk: "boat" },

      // BUY
      { item_code: "301", nama_item: "Sunscreen", harga: 120000, kategori: "Essentials", desk: "sun" },
      { item_code: "302", nama_item: "Mineral Water", harga: 20000, kategori: "Essentials", desk: "water" },
      { item_code: "303", nama_item: "Dry Bag", harga: 150000, kategori: "Essentials", desk: "buy" },
      { item_code: "304", nama_item: "Gili Amor T-Shirt", harga: 200000, kategori: "Apparel", desk: "shirt" },
    ];

    // Hapus isi database lama yang berantakan (hapus transaksi dulu agar relasi aman)
    await prisma.detailTransaksi.deleteMany();
    await prisma.transaksi.deleteMany();
    await prisma.masterItem.deleteMany();

    // Tulis ulang database dengan data yang bersih
    for (const item of seedData) {
      await prisma.masterItem.create({ data: item });
    }

    return NextResponse.json({ success: true, message: "Semua menu berhasil dimasukkan dengan ikon yang tepat!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}