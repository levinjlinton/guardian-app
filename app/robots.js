export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/api/'] },
    sitemap: 'https://www.guardianhours.com/sitemap.xml',
  };
}
