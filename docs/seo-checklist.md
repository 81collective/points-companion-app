# SEO Release Checklist

Use this checklist for all deploys affecting templates, routing, or metadata.

## Routing & Metadata

- [ ] **Canonical URL** set correctly; one per page
- [ ] **Title tag** optimized (50–60 characters, includes primary keyword)
- [ ] **Meta description** written (120–160 characters, compelling CTA)
- [ ] **H1 tag** present and matches page intent
- [ ] **Robots meta** only intended pages set to `noindex`
- [ ] **Open Graph tags** set for social sharing
- [ ] **Twitter Card tags** set

## Sitemaps & Indexing

- [ ] **Sitemap** updated with new/changed URLs
- [ ] **Sitemap** validates (< 50k URLs, < 50MB)
- [ ] **Canonical URLs** return 200 status
- [ ] **No redirect chains** (verify with redirect checker)
- [ ] **Old URLs** 301 redirect to new locations
- [ ] **robots.txt** allows intended pages

## Performance & Rendering

- [ ] **Core Web Vitals** within budget:
  - LCP ≤ 2.5s
  - CLS ≤ 0.1
  - TBT ≤ 300ms
- [ ] **Primary content** server-rendered (view source check)
- [ ] **JavaScript** not required for main content
- [ ] **Mobile rendering** verified
- [ ] **Page speed** tested (Lighthouse, PageSpeed Insights)

## Structured Data

- [ ] **JSON-LD** present on relevant pages
- [ ] **Schema validated** (Google Rich Results Test)
- [ ] **No errors** in structured data
- [ ] **Correct schema type** for content (Product, Article, FAQ, etc.)

## Content & Links

- [ ] **Internal links** use descriptive anchor text
- [ ] **Broken links** checked (no 404s)
- [ ] **External links** use `rel="noopener"` when appropriate
- [ ] **Duplicate content** avoided
- [ ] **Content length** appropriate for intent

## Images

- [ ] **Alt text** descriptive and present
- [ ] **Dimensions** (width/height) set to prevent CLS
- [ ] **Modern formats** (WebP/AVIF) used
- [ ] **Lazy loading** for below-fold images
- [ ] **File sizes** optimized

## Security & Headers

- [ ] **HTTPS** enforced
- [ ] **HSTS** header present
- [ ] **No mixed content** warnings
- [ ] **Sensitive pages** marked `noindex`

## Monitoring

- [ ] **404 errors** reviewed in analytics
- [ ] **Redirect performance** checked
- [ ] **GSC coverage** report clean
- [ ] **Crawl errors** addressed
- [ ] **Structured data report** reviewed

---

## Post-Deploy Verification

After deploying, verify:

1. [ ] New pages appear in sitemap
2. [ ] Request indexing in GSC for critical pages
3. [ ] Monitor crawl stats for 24-48 hours
4. [ ] Check for new 404s in analytics
5. [ ] Verify structured data in Rich Results Test

---

**Sign-off:**

| Role | Name | Date |
|------|------|------|
| Developer | | |
| SEO Review | | |
