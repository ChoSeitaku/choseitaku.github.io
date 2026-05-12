// offline config passed to workbox-build.
module.exports = {
  globPatterns: ["404.html", "css/index.css"],
  globDirectory: "public",
  swDest: "public/service-worker.js",
  maximumFileSizeToCacheInBytes: 10485760,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/npm\.elemecdn\.com\/anzhiyu-blog/,
      handler: "CacheFirst",
    },
  ],
  manifestTransforms: [
    async (manifestEntries) => {
      const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
      manifestEntries.push(
        { url: "/", revision: `index-${timestamp}` },
        { url: "about/", revision: `about-${timestamp}` },
        { url: "link/", revision: `link-${timestamp}` },
        { url: "comments/", revision: `comments-${timestamp}` }
      );
      return { manifest: manifestEntries };
    },
  ],
};
