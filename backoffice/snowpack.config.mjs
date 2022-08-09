import endpoints from "../endpoints.json" assert { type: "json" };

/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  mount: {
    public: { url: "/" },
    src: { url: "/dist" },
  },
  exclude: ["shared/modules/*"],
  routes: [
    /* Enable an SPA Fallback in development: */
    { match: "routes", src: ".*", dest: "/index.html" },
  ],
  optimize: {
    /* If we were to deploy the site publicly this would be a performance improvement */
    // "bundle": true,
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    port: 5000,
  },
  workspaceRoot: "..",
  buildOptions: {
    baseUrl: endpoints.BACKOFFICE_ENDPOINT,
  },
};
