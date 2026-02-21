# SEO Baseline

## SITE_URL

- Set `SITE_URL` di environment Wrangler untuk production.
- Format: URL absolut tanpa trailing slash, contoh `https://ahwal.example.com`.
- Dipakai untuk `canonical`, Open Graph URL, dan `sitemap.xml`.

## Endpoint SEO

- `GET /robots.txt`
- `GET /sitemap.xml`

## Catatan

- Halaman admin dan endpoint API diberi kebijakan noindex.
- Halaman public LMS (`/`, `/login`, `/courses/*`) tetap indexable.
