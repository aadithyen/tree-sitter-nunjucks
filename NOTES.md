# Notes: tree-sitter-nunjucks

## Reference

- [dbt-labs/tree-sitter-jinja2](https://github.com/dbt-labs/tree-sitter-jinja2) — same delimiter model (`{{ }}`, `{% %}`, `{# #}`), statement/comment bodies matched with regex (not full statement grammar), partial expression parsing inside `{{ }}`. Output tags use `seq('{{', $._expr, '}}')` only (no `optional(/\s*/)` before `}}`); optional whitespace there conflicts with filter `|` and breaks `{{ a | b }}`.

## Nunjucks vs Jinja2 (grammar impact)

| Area | Jinja2 (dbt grammar) | Nunjucks / 11ty |
|------|----------------------|-----------------|
| Booleans | `True`, `False` | `true`, `false` |
| Null | — | `none` |
| Output `{{ }}` | Literals, calls, list, dict | + bare `identifier`, `.` member access, `\|` filter chains |
| Statements `{% %}` | Regex blob | Same (for/if/set/extends/block/macros) |
| Comments `{# #}` | `#+}` closing | Same |
| Dict keys | String only | String or identifier |

## Intentionally incomplete (like jinja2)

- No full statement AST (`if`/`for`/`macro` bodies stay opaque).
- No operators (`+`, `==`, `and`, …) yet.
- No `{{ expr if cond else other }}` inline if.
- No `{% raw %}` … special casing beyond regex.
- HTML in templates is `_text`, not injected HTML grammar.

## 11ty

- File extension `.njk`; often `{% extends %}`, `{% include %}`, collections in `{{ }}`.
- Shortcodes and arbitrary JS in data are outside this grammar.

## Next steps

1. Binary/unary operators and comparison expressions.
2. Subscript `foo[0]`, string concat `~`.
3. Optional external scanner for ambiguous `%}` inside strings in statements.
4. `queries/highlights.scm` for editor highlighting.
