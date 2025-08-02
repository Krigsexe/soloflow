import type { DocsConfig } from "~/types";

export const getDocsConfig = (_lang: string): DocsConfig => {
  return {
    mainNav: [
      {
        title: "Documentation",
        href: `/docs`,
      },
      {
        title: "Guides",
        href: `/guides`,
      },
    ],
    sidebarNav: [
      {
        id: "docs",
        title: "Getting Started",
        items: [
          {
            title: "Introduction",
            href: `/docs`,
          },
          {
            title: "Authentication",
            href: `/docs/authentication`,
          },
        ],
      },
      {
        id: "documentation",
        title: "Documentation",
        items: [
          {
            title: "Introduction",
            href: `/docs/documentation`,
          },
          {
            title: "Components",
            href: `/docs/documentation/components`,
          },
          {
            title: "Code Blocks",
            href: `/docs/documentation/code-blocks`,
          },
          {
            title: "Style Guide",
            href: `/docs/documentation/style-guide`,
          },
        ],
      },
      {
        id: "guides",
        title: "Guides",
        items: [
          {
            title: "Démarrage rapide",
            href: `/docs/guides/quick-start`,
          },
          {
            title: "Déploiement",
            href: `/docs/guides/deployment`,
          },
        ],
      },
      {
        id: "api",
        title: "API",
        items: [
          {
            title: "Introduction",
            href: `/docs/api`,
          },
          {
            title: "Authentification",
            href: `/docs/api/auth`,
          },
          {
            title: "Webhooks",
            href: `/docs/api/webhooks`,
          },
        ],
      },
    ],
  };
};
