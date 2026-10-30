# Trade.Place — Concept Decision & Phase-wise Build Prompts

## 1. Concept decision (scored)

| Concept for "Trade.Place" | Ad RPM potential | Lead value | AdSense approval odds | Works on free static hosting | Domain fit | Competition gap | **Total /60** |
|---|---|---|---|---|---|---|---|
| **A. Global trade & sourcing hub** (import/export guides, free trade calculators, RFQ / freight-quote lead engine) | 8 | 10 | 9 | 10 | 10 | 7 | **54** |
| B. Stock / forex / crypto trading education | 10 | 7 | 5 (YMYL, strict) | 9 | 6 | 3 | 40 |
| C. Skilled-trades careers + contractor quotes | 8 | 8 | 8 | 7 (needs local fulfilment) | 6 | 5 | 42 |
| D. Classifieds / buy-sell-swap marketplace | 4 | 5 | 3 (thin UGC) | 2 (needs backend) | 9 | 2 | 25 |

**Winner: A — "Trade.Place: where global trade gets done."**

Why it wins:
- **Lead gen is the engine, AdSense is the floor.** A small importer's buying request (product, quantity, target price, destination) is a high-intent B2B lead. Business-services leads cost advertisers ~US$100+ each on Google Ads, so even a few hundred qualified RFQs/freight requests per month are worth far more than display ads at the same traffic.
- **Evergreen, tool-driven traffic.** "CBM calculator", "landed cost calculator", "Incoterms 2020", "HS code", "volumetric weight" are high-volume, repeat-use searches. Tools = long sessions = more ad impressions.
- **AdSense-safe.** Original educational content + utilities, no user-generated listings, full legal pages → strong approval profile.
- **100% static.** Everything (tools, forms via an email relay, search) runs on GitHub Pages free plan.
- **Exact-match semantics.** "Trade" + "Place" = the place where trade happens — no stretching.

Revenue stack (in order of impact): RFQ/freight/consultation leads → sponsorships & featured supplier/forwarder slots → AdSense auto ads → trade-show & tool sponsorships → donations/supporters → contests (sponsor-funded prizes).

---

## 2. Phase-wise build prompts

Use each phase as a standalone prompt. Global constraints apply to every phase.

### Global constraints (paste on top of every phase)
```
Project: Trade.Place — global trade, import/export & B2B sourcing hub.
Stack: pure static HTML5 + CSS3 + vanilla JS. No frameworks, no build step required at runtime.
Hosting: GitHub Pages free plan, repo WEBWORKSA1/trade-place, branch main, root folder. Include .nojekyll.
All internal links RELATIVE (site must work at both https://trade.place/ and https://webworksa1.github.io/trade-place/).
AdSense: in <head> of EVERY page:
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>
<meta name="google-adsense-account" content="ca-pub-6620975821265271">; ads.txt at root: google.com, pub-6620975821265271, DIRECT, f08c47fec0942fa0
Top of EVERY page: banner "Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership" → https://web.works/contact
Email: every form submits to ONE address via FormSubmit AJAX. The address must never appear in HTML, text, mailto, or plain JS — assemble it at runtime from an obfuscated string.
Brand: "Trade.Place" (always with the dot). Never use "TradePlace"/"Tradeplace" as one word. Not affiliated with any third-party "Tradeplace" brand.
Incoterms® is a registered trademark of the International Chamber of Commerce — mark it and credit ICC.
Design: modern, fast, accessible (WCAG AA), responsive 320px→1440px+, light/dark mode, no layout shift.
Content: 100% original, educational, no copied text, no fake listings, no fake testimonials, no fake statistics.
```

### Phase 1 — Foundation & design system
```
Create the folder structure (assets/css, assets/js, assets/img, tools/, guides/, src/ generator, docs/).
Build a design system in style.css: CSS variables (ink navy, container-orange accent, teal secondary, sand neutrals; dark-mode set),
Space Grotesk headings + Inter body, 8px spacing scale, container widths, buttons (primary/secondary/ghost), cards, badges,
grids, tabs, steppers, form fields with validation states, accordions (<details>), tables, callouts, breadcrumb, article prose,
tool panels (inputs left / results right), CTA bands, footer, cookie bar, search modal, sticky mobile CTA, reveal animations
(respect prefers-reduced-motion).
Write a small Python generator (src/build.py) that wraps page fragments with a shared <head> (SEO meta, OG/Twitter, canonical,
JSON-LD, AdSense), the top contact banner, header with mega-menu, footer, and emits sitemap.xml + search-index.json.
```

### Phase 2 — Lead-generation engine (the money page)
```
Build get-quotes.html with 4 tabs, each a high-converting form:
1) Post a Buying Request (RFQ) — 3-step wizard: product → quantity/target price/destination/Incoterm/timeline → contact
   (name, company, country, email, phone/WhatsApp, consent). Progress bar, inline validation, trust badges, "what happens next".
2) Freight Quote — origin, destination, mode (sea FCL/LCL, air, courier, rail), cargo, weight/volume, ready date.
3) List Your Company (suppliers, forwarders, customs brokers, inspection firms) — featured-listing interest.
4) Expert Help — customs, compliance, trade finance, market entry.
Also: sticky "Post a Buying Request" CTA in header and mobile, inline RFQ mini-forms on home, every tool and every guide,
exit-intent-free (no dark patterns). All submissions → FormSubmit AJAX with hidden lead_type, page, and UTM fields.
```

### Phase 3 — Free trade tools (traffic engine)
```
Build tools/index.html and 10 tool pages, each with: interactive calculator, explanation, formula, worked example, FAQ,
related tools, inline lead CTA. Tools: Landed Cost, Import Duty & Tax, CBM, Container Load (20ft/40ft/40HC/45HC),
Volumetric/Chargeable Weight (air 6000, courier 5000, sea 1 CBM = 1,000 kg), Incoterms® 2020 interactive matrix,
HS Code chapter finder (97 chapters + official lookup links), Currency Converter (free open.er-api.com feed with offline fallback),
Profit Margin & Markup (incl. break-even quantity), Pallet Calculator.
```

### Phase 4 — Content hub (SEO + AdSense approval)
```
12+ original long-form guides (900–1,500 words each) with table of contents, reading time, key takeaways, FAQs,
related tools, author/editorial note, Article JSON-LD:
How to import products step by step; How to find & verify suppliers; Incoterms 2020 explained; HS codes explained;
Landed cost explained; Choosing a freight mode; Customs clearance basics; International payment terms; Avoiding supplier scams;
Quality inspection; Export documents checklist; Making trade shows pay off.
Plus: Glossary (120+ terms, live filter), Trade Shows directory (typical month, city, sector, official link),
Resources directory (official customs/trade agencies), Videos page (verified YouTube embeds, click-to-load facade).
```

### Phase 5 — Community & revenue extras
```
support.html — donation/supporter pledges (one-time & monthly tiers, purpose split: operations, promotion/marketing,
hiring talent, contest prizes); payment link is sent by reply (no card data on site).
contests.html — running contests (trade-tool challenge, best sourcing story, student trade essay), rules, prizes, entry form.
careers.html — open roles (trade writers, video creators, sales/partnerships, community moderators), application form.
advertise.html — sponsorship packages (tool sponsor, featured supplier/forwarder, newsletter, trade-show partner), media kit form.
about.html (mission, editorial policy), contact.html (form only).
```

### Phase 6 — Compliance, SEO & performance
```
privacy.html (Google/AdSense cookies, third-party vendors, opt-out links, GDPR/CCPA rights), terms.html, disclaimer.html
(no professional advice, trademark & copyright disclosure), cookie consent bar, 404.html, robots.txt, sitemap.xml, ads.txt,
manifest, favicon, OG image. Lighthouse targets: Performance ≥ 90, Accessibility ≥ 95, SEO 100.
Ad placement rules: Auto ads only until approval; never place ads next to form buttons or calculators' submit controls.
```

### Phase 7 — QA, deploy, launch
```
Automated checks: every internal link resolves, no exposed email string anywhere, every page has AdSense script + banner,
calculators produce correct results on test inputs, mobile (375px) and desktop screenshots render, no console errors.
Push to WEBWORKSA1/trade-place main. Enable GitHub Pages (Deploy from branch → main → /root).
Custom domain: add CNAME "trade.place", DNS A records 185.199.108.153 / .109.153 / .110.153 / .111.153, enforce HTTPS.
Submit sitemap to Google Search Console, then apply for AdSense once the site is live on trade.place.
```

### Phase 8 — Growth (post-launch, expandable)
```
Add a new guide every week (src/pages/guides/*.html → run python3 src/build.py).
Country import guides (US, UK, EU, Canada, India, Australia, UAE) — highest-intent long-tail.
Product-category sourcing pages (furniture, apparel, electronics, packaging, machinery).
Monthly newsletter; partner/affiliate links for freight marketplaces and trade-finance providers once traffic proves out.
Sell verified RFQs to vetted forwarders/sourcing agents (per-lead or monthly subscription).
```
