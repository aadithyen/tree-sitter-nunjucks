# tree-sitter-nunjucks

Incremental [Tree-sitter](https://tree-sitter.github.io/) grammar for [Nunjucks](https://mozilla.github.io/nunjucks/) templates (`.njk`), including typical [Eleventy](https://www.11ty.dev/) usage.

Based on ideas and structure from [dbt-labs/tree-sitter-jinja2](https://github.com/dbt-labs/tree-sitter-jinja2) (Apache-2.0). See [NOTES.md](./NOTES.md) for design choices and gaps.

Much of this grammar was drafted with AI assistance; review before treating as production-ready.

## Status

Early / incomplete: reliable mixed template parsing; expression parsing covers common `{{ }}` patterns (variables, filters, calls, literals). `{% statements %}` are recognized but not structured.

## Develop

```bash
tree-sitter generate
tree-sitter test
```

Requires [tree-sitter CLI](https://github.com/tree-sitter/tree-sitter/tree/master/cli) (0.20+).

## License

Apache License 2.0, same as [tree-sitter-jinja2](https://github.com/dbt-labs/tree-sitter-jinja2). See [LICENSE](./LICENSE).
