# tree-sitter-nunjucks

Incremental
[Tree-sitter](https://tree-sitter.github.io/) grammar for
[Nunjucks](https://mozilla.github.io/nunjucks/) templates (`.njk`), including
typical [Eleventy](https://www.11ty.dev/) usage.

Based on ideas and structure from
[dbt-labs/tree-sitter-jinja2](https://github.com/dbt-labs/tree-sitter-jinja2)
(Apache-2.0). Also helped by
[alsolovyev/Nunjucks](https://github.com/alsolovyev/Nunjucks)
(Sublime Text Nunjucks grammar). See [NOTES.md](./NOTES.md) for design choices and
gaps.

This grammar is entirely AI-generated; review before treating as
production-ready.

## Status

Early / incomplete: mixed template parsing; `{{ }}` expressions (variables,
filters, calls, literals); structured `{% %}` tags
(if/for/set/extends/block/…); Neovim highlight + HTML injection queries under
`queries/`.

## Layout

Standard tree-sitter grammar repo:

| Path               | Role                        |
| ------------------ | --------------------------- |
| `grammar.js`       | Grammar source              |
| `src/parser.c`     | Generated C parser (ABI 15) |
| `queries/*.scm`    | Highlights + injections     |
| `test/corpus/`     | Corpus tests                |
| `tree-sitter.json` | CLI / editor metadata       |

No external scanner. Node/Python/Rust bindings are not generated yet; Neovim
only needs `src/parser.c` and `queries/`.

## Develop

```bash
tree-sitter generate
tree-sitter test
tree-sitter query queries/highlights.scm test.njk
```

Requires
[tree-sitter CLI](https://github.com/tree-sitter/tree-sitter/tree/master/cli)
(0.20+). Nix users: `direnv allow` / `nix develop`.

## Install in Neovim

Needs
[nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter)
(master / `main` branch API) and the `html` parser (`:TSInstall html`).
Filetype for `.njk` is `nunjucks`.

### 1. Register filetype + language

Put this in your Neovim config (runs once at startup):

```lua
vim.filetype.add({
  extension = { njk = "nunjucks", nunjucks = "nunjucks" },
})
vim.treesitter.language.register("nunjucks", "nunjucks")
```

### 2. Register the parser (pick one)

**From GitHub** (recommended):

```lua
vim.api.nvim_create_autocmd("User", {
  pattern = "TSUpdate",
  callback = function()
    require("nvim-treesitter.parsers").nunjucks = {
      install_info = {
        url = "https://github.com/aadithyen/tree-sitter-nunjucks",
        revision = "main", -- or a tag / commit
        queries = "queries",
      },
    }
  end,
})
```

**Local clone** (develop against a checkout):

```lua
vim.api.nvim_create_autocmd("User", {
  pattern = "TSUpdate",
  callback = function()
    require("nvim-treesitter.parsers").nunjucks = {
      install_info = {
        -- path to your local clone
        path = vim.fn.expand("~/path/to/tree-sitter-nunjucks"),
        queries = "queries",
      },
    }
  end,
})
```

`queries = "queries"` tells nvim-treesitter to install `highlights.scm` and
`injections.scm` under `queries/nunjucks/`. Both files are required: without
`injections.scm`, HTML between tags stays uncoloured.

### 3. Install the parser

```vim
:TSInstall nunjucks
:TSInstall html
```

Open a `.njk` file. Check with `:InspectTree` and `:Inspect` (highlight
captures).

### Manual install (no nvim-treesitter install API)

```bash
tree-sitter build -o nunjucks.so
mkdir -p ~/.local/share/nvim/site/parser
cp nunjucks.so ~/.local/share/nvim/site/parser/nunjucks.so

mkdir -p ~/.config/nvim/queries/nunjucks
ln -sf "$PWD/queries/highlights.scm" \
  ~/.config/nvim/queries/nunjucks/highlights.scm
ln -sf "$PWD/queries/injections.scm" \
  ~/.config/nvim/queries/nunjucks/injections.scm
```

Still register filetype + language as in step 1. Install the `html` parser
somehow (`:TSInstall html` or system package).

### How highlighting works

- `queries/highlights.scm` — Nunjucks captures (`@keyword.directive`,
  `@function.call`, …), priority 110 so they win over HTML injection bleed.
- `queries/injections.scm` — HTML into `(content)` (`injection.combined`);
  comment language into `(comment)`.
- HTML tag/attr colours come from the `html` parser, not from this grammar.

Older nvim-treesitter (`get_parser_configs()`) still works if you prefer that
API; point `install_info.url` / `files = { "src/parser.c" }` at this repo and
put queries on the runtimepath the same way.

## License

Apache License 2.0, same as
[tree-sitter-jinja2](https://github.com/dbt-labs/tree-sitter-jinja2).
See [LICENSE](./LICENSE).
