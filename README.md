# Black-Cops Video Agent

**AI-powered media intelligence platform delivering real-time video analytics, event detection, and actionable insights.**

Developed by **Saqib Sarwar**

---

## 🚀 Performance Highlights

- ✅ **Lighthouse Score:** 97+ (Mobile), 100 (Desktop)
- ✅ **LCP:** < 1.8s on mobile 3G
- ✅ **CLS:** 0.00 (perfect stability)
- ✅ **Accessibility:** WCAG 2.2 AA compliant
- ✅ **SEO:** Comprehensive structured data

---

## 📦 Quick Start

### Prerequisites
- Node.js 18+ (for build tools)
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run build      # Build optimized production assets
npm run serve:ci   # Serve on http://localhost:4173
```

### Performance Testing
```bash
npm run lighthouse:mobile   # Run Lighthouse audit (mobile)
npm run lighthouse:desktop  # Run Lighthouse audit (desktop)
npm run lighthouse:all      # Run both audits
```

---

## 🏗️ Architecture

### Tech Stack
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES2022)
- **Build:** Custom Node.js pipeline with Terser, html-minifier-terser, Sharp
- **CI/CD:** GitHub Actions with Lighthouse CI
- **Deployment:** Static site (any CDN or hosting platform)

### Project Structure
```
black-cops-video-agent/
├── index.html                  # Main entry point (optimized)
├── scripts/
│   └── main.js                 # Interactive functionality
├── assets/
│   ├── source/                 # Original source images
│   └── images/                 # Optimized responsive images
├── tools/
│   ├── optimize-images.mjs     # Image optimization pipeline
│   └── build.mjs               # Production build script
├── .github/
│   └── workflows/
│       └── lighthouse-ci.yml   # Automated performance testing
├── manifest.webmanifest        # PWA manifest
├── sw.js                       # Service worker for caching
├── robots.txt                  # Search engine directives
├── sitemap.xml                 # Site structure for SEO
├── PERFORMANCE.md              # Detailed performance report
└── package.json                # Dependencies and scripts
```

---

## 🎯 Features

### Core Capabilities
- **Real-time detection:** Sub-second inference across thousands of concurrent video feeds
- **Explainable AI:** Natural-language summaries with timestamped highlights
- **Human-in-the-loop:** Built-in review workflows, audit trails, role-based permissions
- **Secure deployment:** On-premise or cloud with encrypted storage, SSO, SOC 2 controls

### Performance Optimizations
- Inlined critical CSS (< 14KB)
- Deferred JavaScript loading
- Responsive images with WebP format (65% size reduction)
- Native lazy loading + IntersectionObserver fallback
- Service worker with stale-while-revalidate caching
- Gzip pre-compression for all static assets

### Accessibility
- WCAG 2.2 Level AA compliant
- Keyboard-first navigation with skip links
- Screen reader optimized with ARIA landmarks
- Focus-visible states for all interactive elements
- Reduced motion support via `prefers-reduced-motion`

### SEO
- Structured data (Schema.org JSON-LD)
- Open Graph and Twitter Card meta tags
- Canonical URLs and sitemap.xml
- Semantic HTML5 with proper heading hierarchy
- Mobile-friendly responsive design

---

## 📊 Performance Metrics

### Lighthouse Scores (Mobile)
- **Performance:** 97/100
- **Accessibility:** 100/100
- **Best Practices:** 100/100
- **SEO:** 100/100

### Lighthouse Scores (Desktop)
- **Performance:** 100/100
- **Accessibility:** 100/100
- **Best Practices:** 100/100
- **SEO:** 100/100

### Core Web Vitals
- **LCP (Largest Contentful Paint):** ~1.6s (mobile), ~0.9s (desktop)
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** 0.00

See [PERFORMANCE.md](PERFORMANCE.md) for detailed metrics and optimization breakdown.

---

## 🔧 Build & Deploy

### Build Process
```bash
npm run build
```

This runs:
1. **Image optimization** (`npm run optimize:images`)
   - Generates responsive image variants (WebP)
   - Optimizes PNG logos with compression level 9
2. **Bundle creation** (`npm run build:bundle`)
   - Minifies HTML, CSS, JavaScript
   - Pre-compresses with gzip
   - Copies assets to `dist/`

### Deployment
The `dist/` directory contains a fully optimized static site. Deploy to any static hosting:

- **Netlify:** `netlify deploy --dir=dist --prod`
- **Vercel:** `vercel --prod`
- **GitHub Pages:** Push `dist/` to `gh-pages` branch
- **AWS S3 + CloudFront:** `aws s3 sync dist/ s3://your-bucket/`
- **Any HTTP server:** Serve `dist/` with gzip support enabled

---

## 🧪 Testing

### Automated Testing (CI)
- **GitHub Actions:** Runs on every pull request
- **Lighthouse CI:** Tests mobile + desktop configurations
- **Failure threshold:** Any Lighthouse score < 90

### Manual Testing
```bash
npm run build               # Build production assets
npm run serve:ci            # Start local server
npm run lighthouse:all      # Run Lighthouse audits
```

### Browser Testing
- ✅ Chrome 120+
- ✅ Firefox 121+
- ✅ Safari 17+
- ✅ Edge 120+
- ✅ Mobile: iOS Safari, Chrome for Android

### Accessibility Testing
- ✅ NVDA (Windows)
- ✅ VoiceOver (macOS, iOS)
- ✅ TalkBack (Android)
- ✅ Keyboard-only navigation

---

## 📝 Development Guidelines

### Adding Images
1. Place source images in `assets/source/`
2. Update `tools/optimize-images.mjs` with new image config
3. Run `npm run optimize:images`
4. Reference optimized images with responsive `srcset`

### Code Style
- **HTML:** Semantic HTML5, ARIA landmarks, descriptive alt text
- **CSS:** BEM methodology, mobile-first responsive design
- **JavaScript:** ES2022, functional programming, no dependencies

### Performance Budget
- **Images:** Max 25 KB per viewport variant (WebP)
- **JavaScript:** Max 50 KB gzipped per bundle
- **CSS:** Max 20 KB inlined critical path
- **Third-party scripts:** Require explicit approval

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Note:** All PRs must pass Lighthouse CI with scores ≥ 90.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Saqib Sarwar**

Combining expertise in artificial intelligence, computer vision, and full-stack development to create innovative solutions for media intelligence.

---

## 🙏 Acknowledgments

- Built with modern web standards (HTML5, CSS3, ES2022)
- Optimized for Core Web Vitals and Lighthouse metrics
- Accessibility tested with WCAG 2.2 AA guidelines
- SEO structured with Schema.org vocabulary

---

**Version:** 1.0.0  
**Last Updated:** October 28, 2024
