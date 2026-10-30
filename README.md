# Trade.Place

**Where global trade gets done.** Free import & export calculators, plain-English trade guides and a buying-request / lead-generation desk for importers, exporters and sourcing teams.

Live domain: https://trade.place · Preview: https://webworksa1.github.io/trade-place/

## What's inside

| Area | Pages |
|---|---|
| Lead generation | `get-quotes.html` — 3-step buying request (RFQ) wizard, freight quote, company listing, expert help + quick RFQ on the homepage |
| Free tools (10) | Landed cost, import duty & tax, CBM, container load, chargeable weight, Incoterms® 2020 explorer, HS chapter finder, currency converter, margin & markup, pallet calculator |
| Content | 14 long-form guides, 150+ term glossary, trade show directory, official resources, videos |
| Revenue & community | Advertise / sponsor, support (donations), contests & prizes, careers |
| Compliance | Privacy (AdSense disclosures), terms, disclaimer with trademark & copyright disclosure, cookie notice, `ads.txt`, `robots.txt`, `sitemap.xml` |

## Tech

- 100% static HTML/CSS/vanilla JS — runs on the GitHub Pages free plan (branch `main`, folder `/root`). `.nojekyll` included.
- All internal links are relative, so the site works on both the custom domain and the `github.io/trade-place/` preview.
- Google AdSense (`ca-pub-6620975821265271`) auto-ads script in the `<head>` of every page.
- Forms post via FormSubmit AJAX. The destination address is assembled at runtime and never appears in the markup.

## Editing & adding pages (no build step needed)

- Every page is plain HTML. The top contact banner, logo, main links, footer legal text and the AdSense `<head>` tags are in each file.
- The mega-menus, mobile drawer, search box, full footer columns, cookie notice and sticky mobile CTA are injected from **`assets/js/chrome.js`**, so changing one file updates every page.
- **Add a guide:** copy any file in `guides/`, change the `<title>`, meta description, canonical URL and the content inside `<main>`. Then add it to `guides/index.html`, `sitemap.xml` and `search-index.json`.
- Calculators live in `assets/js/tools.js`; forms, search, tabs and the theme are in `assets/js/main.js`; the design system is `assets/css/style.css`.

## Go-live checklist

1. **GitHub Pages:** Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)` → Save.
2. **Forms:** submit any form once on the live site, then click *Activate* in the FormSubmit confirmation email.
3. **Custom domain:** Settings → Pages → Custom domain `trade.place`. At the registrar add A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (and AAAA `2606:50c0:8000::153` … `8003::153` if desired), then tick *Enforce HTTPS*.
4. **Search Console:** verify `trade.place` and submit `https://trade.place/sitemap.xml`.
5. **AdSense:** add the site `trade.place` in AdSense (ads.txt is already at the root), and enable a Google-certified consent message for EEA/UK/CH visitors under Privacy & messaging.

## Legal

Trade.Place is not affiliated with any company or platform operating under the name “Tradeplace” or similar marks. Incoterms® is a registered trademark of the International Chamber of Commerce. See `disclaimer.html`.

Domain, sponsorship, advertising or partnership enquiries: https://web.works/contact
