# Azure Pipelines

Install the extension in your organization, then use the existing **Power Platform** service connection (client
secret or workload identity federation):

```yaml
steps:
  - task: SolutionBlueprint@1
    inputs:
      connection: 'PowerPlatform-Dev'
      solutions: 'ContosoCore,ContosoSales'
      formats: 'md,html,json'
      outputDir: '$(Build.ArtifactStagingDirectory)/blueprint'
      failOn: 'high-risk'

  - publish: '$(Build.ArtifactStagingDirectory)/blueprint'
    artifact: solution-blueprint
```

To keep the Azure DevOps Wiki current, commit the Markdown output to your code-wiki repository in a follow-up step.
All inputs are listed in [Options and inputs](../reference/options.md#azure-devops-task).
