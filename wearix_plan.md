
You act as an senior web devoloper with 4 years of experience. also expert on ui/ux designer. Create this Website of Wearix.


# Wearix — Fashion E-Commerce Website | Full Development Prompt

> **How to use this document:** This is a complete build specification for a Bangladesh-focused fashion e-commerce website. Paste this whole document into an AI coding assistant (Claude Code, Cursor, etc.) as your build instructions, or hand it to a developer as a PRD. "Vastra" is just a placeholder name — rename freely.

---

## 1. Project Summary

Build a full-stack fashion e-commerce platform selling **shirts, t-shirts, jerseys, pants/trousers, panjabi, hoodies, polos, women's fashion, kids' wear, and accessories** (belts, caps, wallets). Style/UX reference: Fabrilife and Tyzo (clean product-first cards, sale badges, size selectors, WhatsApp-friendly for BD customers). Currency: BDT (৳).

**Feel:** Light mode, premium, minimal, fast, mobile-first (majority of BD traffic is mobile).

---

## 2. Brand & Design System

| Token | Value |
|---|---|
| Primary Blue (buttons, links, active states) | `#2563EB` (Tailwind blue-600) |
| Primary Hover | `#1D4ED8` (blue-700) |
| Light Accent BG (badges, hover, selected chips) | `#EFF6FF` (blue-50) |
| Background | `#FFFFFF` |
| Text primary | `#111827` (gray-900) |
| Text secondary | `#6B7280` (gray-500) |
| Border | `#E5E7EB` (gray-200) |
| Sale/Discount | `#DC2626` (red-600) |
| Success/In-stock | `#16A34A` (green-600) |

- **Font:** Inter (via `next/font/google`) — clean, premium, great BD/English mix legibility.
- **Corners:** 8–12px radius on cards/buttons, 16px on modals.
- **Shadows:** soft, `shadow-sm`/`shadow-md` only — no harsh drop shadows.
- **Motion:** 150–200ms ease transitions on hover/tap, skeleton loaders (never blank white flashes).
- **Buttons:** Primary = solid blue, white text. Secondary = white bg, blue border + blue text. Ghost = text-only blue.
- **Grid:** 2 columns mobile, 3 tablet, 4 desktop for product grids.
- **Icons:** lucide-react (blue on hover/active, gray default).

---

## 3. Tech Stack

- **Framework:** Next.js 14+ (App Router), TypeScript throughout (frontend + backend via API routes/Route Handlers)
- **Styling:** Tailwind CSS
- **UI primitives:** shadcn/ui (customized to blue theme) — optional but speeds up buttons/modals/dropdowns
- **Client state:** Zustand (cart, wishlist, filters)
- **Server state/caching:** TanStack Query (React Query)
- **Forms & validation:** React Hook Form + Zod
- **Auth + Database:** Firebase Auth + Cloud Firestore
- **File storage:** Cloudflare R2 (S3-compatible API) for product images, banners, avatars
- **Payments (BD market):** bKash + Nagad + SSLCommerz (cards) + Cash on Delivery
- **Hosting:** Vercel
- **Icons:** lucide-react
- **Optional:** Algolia (fast search at scale), Resend/SendGrid (transactional email), Twilio or local SMS gateway (order SMS)

---

## 4. Full Sitemap

### Customer-facing
1. **Home** `/` — hero slider, category shortcuts (Men/Women/Kids/Teens), new arrivals carousel, best sellers, promo banner blocks, testimonials, newsletter signup
2. **Shop (all products)** `/shop` — filters (category, size, color, price, gender), sort, **infinite scroll grid**
3. **Category page** `/shop/[category]` — e.g. `/shop/men`, `/shop/jersey`, `/shop/panjabi`
4. **Product detail** `/product/[slug]` — image gallery with zoom, size selector, size chart modal, price + discount badge, Add to Cart / Buy Now, description tabs, reviews, related products, wishlist toggle
5. **Search** `/search?q=` — live suggestions dropdown + infinite scroll results
6. **Cart** `/cart` — line items, qty stepper, coupon input, price summary
7. **Checkout** `/checkout` — shipping address → payment method (bKash/Nagad/SSLCommerz/COD) → review & place order; guest checkout allowed
8. **Order confirmation** `/order-confirmation/[orderId]`
9. **Wishlist** `/wishlist`
10. **Account (protected)** `/account/*`
    - `/account` — dashboard overview
    - `/account/orders`, `/account/orders/[orderId]` — history + tracking
    - `/account/addresses` — CRUD, default address
    - `/account/settings` — profile, password
11. **Auth** `/login`, `/register`, `/forgot-password` — email/password, Google sign-in
12. **Static pages** `/about`, `/contact`, `/faq`, `/return-policy`, `/shipping-policy`, `/terms`, `/privacy`
13. **Blog (SEO)** `/blog`, `/blog/[slug]` — style guides, size guides
14. **404** — custom not-found page

### Admin panel `/wxadmin/*` (role-protected)
1. **Dashboard** — sales overview, recent orders, low-stock alerts, charts
2. **Products** — list/search/filter, add/edit (multi-image upload → R2, variants: size/color/stock), bulk actions
3. **Categories** — manage categories/subcategories
4. **Orders** — list/filter by status, detail view, update status/tracking, invoice print
5. **Customers** — list + order history per customer
6. **Coupons** — create % / flat discounts, expiry, usage limits
7. **Reviews** — approve/reject customer reviews
8. **Homepage content** — manage banners/hero without redeploying
9. **Settings** — store info, shipping rates, payment gateway keys

---

## 5. Folder Structure (Next.js App Router + TypeScript)

```
vastra/
├── src/
│   ├── app/
│   │   ├── (main)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                     # Home
│   │   │   ├── shop/
│   │   │   │   ├── page.tsx                 # All products (infinite scroll)
│   │   │   │   └── [category]/page.tsx
│   │   │   ├── product/[slug]/page.tsx
│   │   │   ├── search/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   ├── order-confirmation/[orderId]/page.tsx
│   │   │   ├── wishlist/page.tsx
│   │   │   ├── account/
│   │   │   │   ├── layout.tsx               # auth guard
│   │   │   │   ├── page.tsx
│   │   │   │   ├── orders/page.tsx
│   │   │   │   ├── orders/[orderId]/page.tsx
│   │   │   │   ├── addresses/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── faq/page.tsx
│   │   │   ├── return-policy/page.tsx
│   │   │   ├── shipping-policy/page.tsx
│   │   │   ├── terms/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   └── blog/
│   │   │       ├── page.tsx
│   │   │       └── [slug]/page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── wxadmin/
│   │   │   ├── layout.tsx                   # role guard
│   │   │   ├── page.tsx
│   │   │   ├── products/page.tsx
│   │   │   ├── products/new/page.tsx
│   │   │   ├── products/[id]/edit/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── orders/[id]/page.tsx
│   │   │   ├── customers/page.tsx
│   │   │   ├── coupons/page.tsx
│   │   │   ├── reviews/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── api/
│   │   │   ├── products/route.ts            # GET (paginated), POST
│   │   │   ├── products/[id]/route.ts
│   │   │   ├── orders/route.ts
│   │   │   ├── checkout/route.ts
│   │   │   ├── payment/bkash/route.ts
│   │   │   ├── payment/sslcommerz/route.ts
│   │   │   ├── upload/presign/route.ts      # R2 presigned URL
│   │   │   ├── search/route.ts
│   │   │   ├── coupons/validate/route.ts
│   │   │   └── webhooks/payment/route.ts
│   │   ├── layout.tsx                       # Root layout
│   │   ├── globals.css
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                              # buttons, inputs, modal, dropdown
│   │   ├── layout/                          # Navbar, Footer, MobileMenu
│   │   ├── product/                         # ProductCard, ProductGrid, Gallery, SizeSelector, SizeChart
│   │   ├── cart/                            # CartItem, CartSummary
│   │   ├── checkout/                        # AddressForm, PaymentMethodSelector
│   │   ├── home/                            # HeroSlider, CategoryShortcuts, FeaturedCarousel
│   │   └── admin/                           # DataTable, ProductForm, StatsCard
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── client.ts                    # Firebase client SDK init
│   │   │   ├── admin.ts                     # Firebase Admin SDK init (server-only)
│   │   │   ├── auth.ts
│   │   │   └── firestore.ts
│   │   ├── r2/
│   │   │   └── client.ts                    # S3 client configured for R2
│   │   ├── payments/
│   │   │   ├── bkash.ts
│   │   │   └── sslcommerz.ts
│   │   ├── validators/                      # Zod schemas
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useInfiniteProducts.ts           # cursor pagination hook
│   │   └── useWishlist.ts
│   ├── store/
│   │   ├── cartStore.ts                     # Zustand
│   │   └── wishlistStore.ts
│   ├── types/
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── user.ts
│   ├── constants/
│   │   └── index.ts
│   └── middleware.ts                        # protects /account/* and /admin/*
├── public/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 6. Firestore Data Model

```ts
// users/{uid}
{ name, email, phone, role: "customer" | "admin", createdAt }
// users/{uid}/addresses/{addressId}
{ label, fullName, phone, division, district, area, addressLine, isDefault }

// products/{productId}
{
  name, slug, description, category, subcategory,
  gender: "men" | "women" | "kids" | "unisex",
  price, discountPrice,
  images: string[],          // R2 URLs
  sizes: string[],           // ["M","L","XL","2XL"]
  colors: string[],
  stock: { [size: string]: number },
  tags: string[], rating, reviewCount,
  isFeatured, isActive, createdAt
}

// categories/{categoryId}
{ name, slug, image, parentId }

// orders/{orderId}
{
  userId, items: OrderItem[], shippingAddress,
  paymentMethod: "bkash" | "nagad" | "sslcommerz" | "cod",
  paymentStatus, orderStatus, subtotal, discount,
  shippingFee, total, trackingUpdates: [], createdAt
}

// reviews/{reviewId}
{ productId, userId, rating, comment, images, approved, createdAt }

// coupons/{couponId}
{ code, type: "percent" | "flat", value, minOrder, expiry, usageLimit, usedCount }

// wishlists/{uid}
{ productIds: string[] }
```

---

## 7. Firebase Auth Setup

- Email/password + Google OAuth
- Custom claims for `role: admin` set via Admin SDK (never trust client-side role)
- `middleware.ts` checks the Firebase session cookie to protect `/account/*` and `/admin/*`
- API routes verify Firebase ID tokens server-side via Admin SDK before any write

---

## 8. Cloudflare R2 Storage

- Buckets/paths: `products/{productId}/{filename}`, `banners/`, `avatars/`
- **Upload flow:** client requests a presigned PUT URL from `/api/upload/presign` (using the AWS S3 SDK, R2-compatible) → uploads directly from browser to R2 → save resulting public URL in Firestore
- Serve images through a custom R2 public domain + Cloudflare's CDN caching
- Use `next/image` with a custom loader pointed at the R2/CDN domain for automatic resizing

---

## 9. Performance Strategy — "load as you scroll"

This is the key requirement to keep the shop page light:

- **Cursor-based pagination:** Firestore query `orderBy("createdAt").startAfter(lastDoc).limit(16)` — never fetch the whole collection.
- **Infinite scroll:** an `IntersectionObserver` on a sentinel element at the bottom of the grid triggers the next page fetch.
- **React Query** caches each page so scrolling back up doesn't re-fetch.
- **Skeleton cards** while a page loads — no blank flashes.
- `next/image` with lazy loading, responsive `sizes`, and blur placeholders.
- Route-level code splitting is automatic with the App Router — keep client components small and push data fetching to server components/route handlers where possible.
- Debounce the search input (~300ms) before querying.
- Optimistic UI for cart/wishlist add/remove (update UI instantly, sync in background).

---

## 10. Bangladesh-Specific Additions (suggested)

- **Payments:** bKash + Nagad + SSLCommerz (covers cards/mobile banking) + Cash on Delivery — COD is still dominant in BD fashion e-commerce, keep it prominent at checkout.
- **WhatsApp button:** floating WhatsApp chat icon for quick customer support (matches the reference sites' habits).

## 11. Extra Feature Ideas (beyond the base request)

- Size guide chart per category (shirts vs jersey vs panjabi sizing differs)
- "Recently viewed" products strip
- Low-stock urgency badge ("Only 3 left")
- Bundle/combo offers (buy 2 get 10% off)
- Loyalty points (phase 2)
- PWA support — installable, app-like feel on mobile
- "Notify me" for out-of-stock sizes

---

## 12. SEO & Non-Functional Requirements

- Dynamic metadata per product/category page (Next.js Metadata API)
- Product structured data (schema.org) + breadcrumbs
- Auto-generated `sitemap.xml` and `robots.txt`
- Google Analytics / Meta Pixel
- Target: Lighthouse performance ≥ 90 on product listing pages, LCP < 2.5s on 4G
- Fully responsive: 360px (mobile) → 768px (tablet) → 1280px+ (desktop)
- Basic accessibility: proper contrast on blue/white, keyboard-navigable menus, alt text on all product images

---

## 13. Environment Variables Checklist

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
BKASH_APP_KEY=
BKASH_APP_SECRET=
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=
NEXT_PUBLIC_SITE_URL=
```

