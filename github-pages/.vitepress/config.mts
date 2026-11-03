import { defineConfig } from 'vitepress';

const repo = 'https://github.com/aidevme/solution-blueprint-ci';

export default defineConfig({
  title: 'solution-blueprint-ci',
  description:
    'Generate architecture documentation for Power Platform and Dataverse solutions in CI/CD.',
  base: '/solution-blueprint-ci/',
  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/options' },
      { text: 'Decisions', link: '/decisions' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'What it documents', link: '/guide/features' },
          { text: 'Prerequisites', link: '/guide/prerequisites' },
          { text: 'CLI', link: '/guide/cli' },
          { text: 'GitHub Actions', link: '/guide/github-action' },
          { text: 'Azure Pipelines', link: '/guide/azure-pipelines' },
          { text: 'Output', link: '/guide/output' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Options and inputs', link: '/reference/options' },
          { text: 'Environment variables', link: '/reference/environment-variables' },
        ],
      },
      {
        text: 'Project',
        items: [{ text: 'Decisions', link: '/decisions' }],
      },
    ],

    socialLinks: [{ icon: 'github', link: repo }],

    editLink: {
      pattern: `${repo}/edit/main/github-pages/:path`,
      text: 'Edit this page on GitHub',
    },

    search: { provider: 'local' },

    footer: {
      message: 'Released under the MIT License. Built on Power Platform Solution Blueprint (PPSB).',
      copyright: '© Zsolt Zombik / AIDevMe',
    },
  },
});
