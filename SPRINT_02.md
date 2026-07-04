# Sprint 2

Module

Shopping-style Product Catalog

Goal

Implement a public shopping-style procurement catalog.

This is NOT an e-commerce website.

It is a procurement catalog inspired by modern online shopping websites.

----------------------------------------

Routes

/

Landing Page

/catalog

Public Product Catalog

/catalog/[id]

Product Details

----------------------------------------

Requirements

Landing Page

Hero

Search Bar

Categories

Popular Products

Recently Updated

Statistics

----------------------------------------

Catalog

Grid Layout

Filters

Category

Brand

Availability

Price Range

Sort

Lowest Price

Highest Price

Newest

Most Popular

Search

Pagination

----------------------------------------

Product Card

Image

Product Name

Brand

Category

Lowest Price

Supplier Count

Availability Badge

View Details

----------------------------------------

Product Details

Large Image Gallery

Specifications

Supplier Price Comparison

Historical Prices

Related Products

Add to PPMP

----------------------------------------

No Checkout

No Cart

No Payment

----------------------------------------

Data

CatalogProduct

Category

Brand

ProductImage

SupplierProductPrice

ProductPriceHistory

ProductSpecification

----------------------------------------

Use

Server Components

Server Actions

Prisma

shadcn/ui

TailwindCSS

Responsive Design

----------------------------------------

Expected Folder Structure

app

catalog

[id]

page.tsx

page.tsx

components

catalog

ProductCard.tsx

ProductGrid.tsx

ProductFilters.tsx

ProductSearch.tsx

CategorySidebar.tsx

SupplierPriceTable.tsx

ProductGallery.tsx

HistoricalPriceChart.tsx

lib

catalog.ts

actions

catalog.ts

----------------------------------------

Definition of Done

Public Catalog works.

Search works.

Filtering works.

Product Details works.

Supplier Prices display correctly.

Responsive on Desktop and Mobile.

Professional UI.
