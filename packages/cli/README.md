# @aidevme/blueprint-cli

The command-line interface for [solution-blueprint-ci](https://github.com/aidevme/solution-blueprint-ci).

> [!NOTE]
> This package is in early development. Blueprint generation isn't implemented yet.

```bash
npx @aidevme/blueprint-cli generate \
  --env-url https://contoso.crm4.dynamics.com \
  --solutions ContosoCore,ContosoSales
```

`--solutions` takes one solution unique name, or several separated by commas. Run `blueprint --help` for every option.

## License

[MIT](LICENSE)
