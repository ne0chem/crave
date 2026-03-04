const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://88.210.52.152:8081",
      changeOrigin: true,
    }),
  );
};
