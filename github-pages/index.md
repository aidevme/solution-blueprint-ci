---
layout: home

hero:
  name: solution-blueprint-ci
  text: Solution documentation, generated in CI/CD
  tagline: Architecture documentation for Power Platform and Dataverse solutions, on every build.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/aidevme/solution-blueprint-ci

features:
  - title: Runs in your pipeline
    details: An npm CLI, a GitHub Action and an Azure DevOps task, all calling the same headless core.
    link: /guide/getting-started
    linkText: How it works
  - title: Everything PPSB documents
    details: Tables, plugins, flows, web resources, apps, agents, security roles and the links between them.
    link: /guide/features
    linkText: What it documents
  - title: Markdown, HTML and JSON
    details: Markdown for an Azure DevOps Wiki, HTML for stakeholders, JSON for automation and baselines.
    link: /guide/output
    linkText: See the output
  - title: Quality gates
    details: Fail the build on high-risk findings, and review documentation changes in pull requests.
    link: /reference/options
    linkText: Options
---

<!-- The home layout renders the hero text as the page's h1. -->
<!-- markdownlint-disable-next-line MD041 -->
![An automated pipeline feeds a glowing engine that produces an entity relationship diagram, a document with a flowchart, and a report with charts.](../assets/solution-blueprint-ci-preview.png)

::: warning Early development
The commands, inputs and package names on this site describe the target design and may change before the first
release.
:::
