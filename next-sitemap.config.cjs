/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  generateRobotsTxt: true,
  // /tour to niepubliczny poradnik dla właściciela; admin i api nie należą do sitemap
  exclude: ['/tour', '/admin*', '/api*', '/next*'],
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/tour'] }],
  },
}
