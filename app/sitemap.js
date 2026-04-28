export default function sitemap() {
  return [
    { url: 'https://www.guardianhours.com', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://www.guardianhours.com/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://www.guardianhours.com/subscribe', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];
}
