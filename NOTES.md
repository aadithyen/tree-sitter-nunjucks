# Notes: tree-sitter-nunjucks

## Reference

- [dbt-labs/tree-sitter-jinja2](https://github.com/dbt-labs/tree-sitter-jinja2) — same delimiter model (`{{ }}`, `{% %}`, `{# #}`), statement/comment bodies matched with regex (not full statement grammar), partial expression parsing inside `{{ }}`. Output tags use `seq('{{', $._expr, '}}')` only (no `optional(/\s*/)` before `}}`); optional whitespace there conflicts with filter `|` and breaks `{{ a | b }}`.

## Nunjucks vs Jinja2 (grammar impact)

| Area | Jinja2 (dbt grammar) | Nunjucks / 11ty |
|------|----------------------|-----------------|
| Booleans | `True`, `False` | `true`, `false` |
| Null | — | `none` |
| Output `{{ }}` | Literals, calls, list, dict | + bare `identifier`, `.` member access, `\|` filter chains |
| Statements `{% %}` | Regex blob | Structured (if/for/set/extends/block/macro/…) + generic tag fallback |
| Comments `{# #}` | `#+}` closing | Same |
| Dict keys | String only | String or identifier |

## Intentionally incomplete (like jinja2)

- Statement *bodies* between tags are not nested blocks (no `if`…`endif` tree); only the tag line is structured.
- No operators (`+`, `==`, `and`, …) yet.
- No `{{ expr if cond else other }}` inline if.
- No `{% raw %}` … special casing beyond regex.
- HTML host text is named `content` (not a full HTML grammar); `queries/injections.scm` injects HTML into it for Neovim.

## Highlighting

- `queries/highlights.scm` — nvim-treesitter captures; Sublime [alsolovyev/Nunjucks](https://github.com/alsolovyev/Nunjucks) scopes mapped to tree-sitter (`@tag.delimiter`, `@keyword.conditional` / `@keyword.repeat`, `@function.call` for filters, …). Priority 110 so combined HTML injection does not paint over Nunjucks.
- `queries/injections.scm` — HTML into `content` (`injection.combined`), comment language into `comment`. HTML colours come only from the html parser — do not duplicate HTML rules here.
- Neovim needs **both** query files under `queries/nunjucks/` plus an installed `html` parser. Symlink `injections.scm` as well as `highlights.scm`.
- `comment` and `content` are named so queries can target them. `{#` body stays an opaque regex; `{% %}` is structured (Twig-style) for keyword precision.
- Style refs: nvim-treesitter `twig` / `liquid`; gbprod/tree-sitter-twig; Sublime Nunjucks.

## 11ty

- File extension `.njk`; often `{% extends %}`, `{% include %}`, collections in `{{ }}`.
- Shortcodes and arbitrary JS in data are outside this grammar.

## Next steps

1. Binary/unary operators and comparison expressions.
2. Subscript `foo[0]`, string concat `~`.
3. Optional external scanner for ambiguous `%}` inside strings in statements.
4. Nested block structure (`if`…`endif` as one node) and richer expression operators.
