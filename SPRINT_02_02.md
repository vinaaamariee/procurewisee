# Sprint 2.2

## Module

Procurement Marketplace

---

## Objective

Create a public procurement marketplace where users can browse products, compare prices, and prepare procurement planning.

This is NOT an e-commerce website.

No shopping cart.
No checkout.

The marketplace supports PPMP and Purchase Request creation.

---

## Routes

/catalog
/catalog/[id]

---

## Catalog Page

Display products in a responsive grid.

Each product card must display:

- Product Image
- Product Name
- Brand
- Category
- Lowest Available Price
- Available Suppliers
- Last Price Update
- View Details button

---

## Search

Search by:

- Product Name
- Brand
- Category

Real-time search.

---

## Filters

Category

Brand

Price Range

Availability

Sort By

- Lowest Price
- Highest Price
- Recently Updated
- Most Requested

---

## Product Details

Display

Product Images

Product Information

Technical Specifications

Supplier Price Comparison

Historical Prices

Related Products

Buttons

Add to PPMP

Add to Purchase Request

---

## Supplier Price Comparison

Display

Supplier

Price

Delivery Days

Reliability Rating

Last Updated

Lowest Price highlighted.

---

## Historical Prices

Display

Average Price

Lowest Price

Highest Price

Price Trend Chart

Monthly Updates

---

## Database

Use Prisma.

Tables

CatalogProduct

Category

Supplier

MarketScoping

PurchaseRequestItem

PriceHistory (if available)

---

## Components

ProductGrid

ProductCard

ProductFilters

ProductSearch

CategorySidebar

SupplierComparisonTable

HistoricalPriceChart

ProductGallery

RelatedProducts

EmptyState

LoadingSkeleton

---

## Technical Requirements

Next.js 15

Server Components

Server Actions

Prisma

TailwindCSS

shadcn/ui

Lucide Icons

Responsive

Accessible

SEO

---

## Business Rules

No login required.

No shopping cart.

No checkout.

Products are maintained by Procurement Office.

Supplier prices are encoded by Procurement Office.

Historical prices are read-only.

---

## Definition of Done

Browse products.

Search works.

Filters work.

Sorting works.

Product details work.

Supplier comparison works.

Historical prices display.

Responsive.

Production-ready.