import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/espace",
        "/admin",
        "/api",
        "/auth",
        "/connexion",
        "/inscription",
        "/mot-de-passe-oublie",
        "/reinitialiser-mot-de-passe",
        "/acces",
        "/simulation",
        "/createurs",
      ],
    },
    sitemap: "https://www.saasfounder.fr/sitemap.xml",
  };
}
