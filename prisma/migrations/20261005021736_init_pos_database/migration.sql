-- CreateTable
CREATE TABLE "Staff" (
    "staff_id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "posisi" TEXT NOT NULL,
    "desk" TEXT,
    "shift" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "MasterItem" (
    "item_code" TEXT NOT NULL PRIMARY KEY,
    "desk" TEXT,
    "kategori" TEXT,
    "nama_item" TEXT NOT NULL,
    "billing_type" TEXT,
    "harga" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "no_transaksi" TEXT NOT NULL PRIMARY KEY,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waktu" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "desk" TEXT,
    "nama_tamu" TEXT,
    "room" TEXT,
    "reference" TEXT,
    "grand_total" INTEGER NOT NULL,
    "amount_paid" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "payment_status" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "remark" TEXT,
    "staff_id" TEXT NOT NULL,
    CONSTRAINT "Transaksi_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "Staff" ("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetailTransaksi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "qty" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "rate" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "notes" TEXT,
    "no_transaksi" TEXT NOT NULL,
    "item_code" TEXT NOT NULL,
    CONSTRAINT "DetailTransaksi_no_transaksi_fkey" FOREIGN KEY ("no_transaksi") REFERENCES "Transaksi" ("no_transaksi") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetailTransaksi_item_code_fkey" FOREIGN KEY ("item_code") REFERENCES "MasterItem" ("item_code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseFollowUp" (
    "case_no" TEXT NOT NULL PRIMARY KEY,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waktu" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "desk" TEXT,
    "case_type" TEXT,
    "nama_tamu" TEXT,
    "room" TEXT,
    "priority" TEXT,
    "status" TEXT NOT NULL,
    "due_date" DATETIME,
    "description" TEXT,
    "assigned_to" TEXT NOT NULL,
    CONSTRAINT "CaseFollowUp_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "Staff" ("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShiftClosing" (
    "close_no" TEXT NOT NULL PRIMARY KEY,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shift" TEXT,
    "opening_cash" INTEGER NOT NULL,
    "cash_sales" INTEGER NOT NULL,
    "card_sales" INTEGER NOT NULL,
    "expected_cash" INTEGER NOT NULL,
    "actual_cash" INTEGER NOT NULL,
    "variance" INTEGER NOT NULL,
    "staff_id" TEXT NOT NULL,
    CONSTRAINT "ShiftClosing_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "Staff" ("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
