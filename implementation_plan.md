# Historical Price Engine — Implementation Plan

This plan details the implementation of the Historical Price Engine for ProcureWise. The system will store, parse, and query historical procurement records from 12 Monthly SVP Excel workbooks in `historical data/` directory.

---

## Proposed Changes

### Database Schema

#### [MODIFY] [schema.prisma](file:///c:/Users/Syra%20Cabrera/Desktop/procurewise/prisma/schema.prisma)
- Add the `HistoricalPrice` model to store historical data.
- Add `historicalPrices HistoricalPrice[]` relationship to the `CatalogProduct` model.

##### Model Design
```prisma
model HistoricalPrice {
  id                Int             @id @default(autoincrement()) @map("id")
  productId         Int?            @map("product_id")
  product           CatalogProduct? @relation(fields: [productId], references: [id])
  rawProductName    String          @map("raw_product_name") @db.VarChar(255)
  supplierName      String          @map("supplier_name") @db.VarChar(150)
  procurementNumber String          @map("procurement_number") @db.VarChar(100)
  procurementDate   DateTime        @map("procurement_date") @db.Date
  quantity          Int             @map("quantity")
  unit              String          @map("unit") @db.VarChar(50)
  unitPrice         Decimal         @map("unit_price") @db.Decimal(12, 2)
  totalPrice        Decimal         @map("total_price") @db.Decimal(12, 2)
  sourceMonth       String          @map("source_month") @db.VarChar(20)
  sourceYear        Int             @map("source_year")
  createdAt         DateTime        @default(now()) @map("created_at")

  @@unique([procurementNumber, rawProductName])
  @@index([productId])
  @@map("historical_prices")
}
```

---

### Data Import Script

#### [NEW] [import-historical-prices.ts](file:///c:/Users/Syra%20Cabrera/Desktop/procurewise/scripts/import-historical-prices.ts)
A TypeScript command-line script to:
- Scan `historical data/` and `historical-data/` folders for `.xlsx` files.
- Parse the `DATA` worksheet from each file.
- Ignore blank/incomplete rows.
- Dynamic key cleaning (trim whitespace from row keys to avoid issues like `" Unit LCRB "` or `" Total "`).
- Fuzzy/exact lookups against `CatalogProduct` using the `Item` name to set the `productId` FK.
- Excel date deserialization supporting both serial numbers and date string values.
- Skip duplicate entries using the `procurementNumber` + `rawProductName` unique constraint.
- Log parsing metrics per workbook: total rows, imported, skipped (duplicates), and failed.

---

### Database Queries

#### [NEW] [historical-price-queries.ts](file:///c:/Users/Syra%20Cabrera/Desktop/procurewise/src/lib/historical-price-queries.ts)
A library of functions for retrieving historical price analytics:
- `getAveragePrice(productId: number): Promise<number | null>`
- `getLowestPrice(productId: number): Promise<number | null>`
- `getHighestPrice(productId: number): Promise<number | null>`
- `getLatestPrice(productId: number): Promise<number | null>`
- `getSupplierCount(productId: number): Promise<number>`
- `getMonthlyTrend(productId: number): Promise<{ month: string; year: number; avgPrice: number }[]>`

---

## Verification Plan

### Automated Tests / Scripts
- Run `pnpm prisma migrate dev --name add_historical_prices` to create and apply the schema migration.
- Execute `npx tsx scripts/import-historical-prices.ts` to run the importer and verify success metrics.
- Write a quick scratch script `scratch/test-historical-queries.ts` to invoke the queries and print the outputs.
- Run `pnpm build` to verify there are no compilation or type-check errors.
