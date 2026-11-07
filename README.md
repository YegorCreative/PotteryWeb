# Stephanne Martin Pottery

A static portfolio for Stephanne Martin's handmade pottery and ceramics. Do not add another person's biography, non-ceramic work, a store, a contact form, or a mailing list.

The intended project-site address is:

https://yegorcreative.github.io/PotteryWeb/

GitHub Pages publishing is not enabled by the website files. Enable it only after a separate approval.

## Review in GitHub Codespaces

From the project folder, start a local server:

```bash
python3 -m http.server 8080
```

In the Codespaces **Ports** panel, set port `8080` to public or private as you prefer, then open the forwarded address in a browser. Do not open the HTML files directly from the file explorer. The gallery loads `data/gallery.json` with `fetch`, which browsers block on `file://` URLs.

Check:

- Home, Gallery, About, and Contact.
- Category filters and the image lightbox, including Escape, arrow keys, and Close.
- The mobile menu at a narrow width.
- Every Instagram link points to https://www.instagram.com/potteryrakugirl/.

Stop the server with `Ctrl+C` when finished.

## Update the gallery

Edit only [data/gallery.json](data/gallery.json). Place approved photographs in `assets/images/gallery/` and use a relative path.

```json
{
  "id": "studio-mug-01",
  "title": "Approved title",
  "category": "Mugs",
  "image": "assets/images/gallery/studio-mug.jpg",
  "sources": [
    {
      "src": "assets/images/gallery/studio-mug.webp",
      "type": "image/webp"
    }
  ],
  "width": 1600,
  "height": 2000,
  "alt": "Describe the actual piece.",
  "description": "Use only a description supplied by the artist.",
  "order": 10,
  "featured": true,
  "placeholder": false
}
```

- `order` controls the sequence. Lower numbers appear first.
- `featured` places a piece in the homepage selection.
- `categories` controls the filter buttons. A new category used by a piece is also added automatically.
- Set `placeholder` to `false` only for an approved photograph. Placeholder pieces do not show an inquiry link.
- Approved pieces can show “Ask About This Piece on Instagram.” Set `inquiry` to `false` to hide that link.
- Price and purchase fields are ignored. Do not add them.
- Keep paths relative, such as `assets/images/gallery/studio-mug.jpg`. A leading slash is removed so the site still works at `/PotteryWeb/` and on a later custom domain.
- For photographs, export a WebP and a JPEG at no more than 2000 pixels on the long edge. Include `width` and `height`. Write alt text that describes the real piece.

The homepage hero is `assets/images/hero.jpg`. Gallery photographs are managed in [data/gallery.json](data/gallery.json). The published images were retrieved, with authorization, from https://www.stephannemartinpottery.com/. Higher-quality JPEG masters are in `assets/images/originals/`. Do not replace them with illustrations, stock photos, or metalwork.

## GitHub Pages

All page, style, script, and image links are relative, so the same files work locally, at `https://yegorcreative.github.io/PotteryWeb/`, and later on a custom domain. `.nojekyll` stops GitHub’s Jekyll processor from skipping asset folders.

When publishing is approved:

1. Open the repository **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select branch `main` and folder `/ (root)`.
4. Save. GitHub provides HTTPS automatically.
5. Confirm the site at https://yegorcreative.github.io/PotteryWeb/.

No GitHub Actions workflow is required because there is no build step. Do not add Vercel, Netlify, Firebase, or another host.

There is no `CNAME` file. Add a custom domain only after separate approval. If that domain replaces the project URL, update the canonical and Open Graph URLs in the four HTML files, `robots.txt`, and `sitemap.xml`.

## Scope

Visitors can browse the work and open Instagram. The site does not collect messages, addresses, payments, or accounts.
