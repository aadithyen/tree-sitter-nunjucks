; Nunjucks highlights (nvim-treesitter captures).
; Scope model follows alsolovyev/Nunjucks Sublime scopes, mapped to
; tree-sitter standards (same idea as twig/liquid queries).
; priority 110: win over combined HTML injection bleed into `{{`/`{%` gaps.
; No blanket (identifier) @variable — that painted filters/calls one flat colour.

; --- Delimiters (Sublime: punctuation.expression / punctuation.statement) ---
([
  "{{"
  "}}"
  "{{-"
  "-}}"
  "{%"
  "%}"
  "{%-"
  "-%}"
] @tag.delimiter
 (#set! priority 110))

; --- Keywords (Sublime: keyword.control.*) ---
((conditional) @keyword.conditional
 (#set! priority 110))

((repeat) @keyword.repeat
 (#set! priority 110))

((keyword) @keyword
 (#set! priority 110))

((tag) @tag
 (#set! priority 110))

; --- Calls / filters (Sublime: entity.name.function / support.class) ---
((fn_call
  fn_name: (identifier) @function.call)
 (#set! priority 110))

((filter_chain
  name: (identifier) @function.call)
 (#set! priority 110))

((filter_statement
  name: (identifier) @function.call)
 (#set! priority 110))

((macro_statement
  name: (identifier) @function)
 (#set! priority 110))

; --- Variables / members (Sublime: variable.other / variable.function) ---
((filter_chain
  base: (identifier) @variable)
 (#set! priority 110))

((member_expression
  object: (identifier) @variable)
 (#set! priority 110))

((member_expression
  property: (identifier) @variable.member)
 (#set! priority 110))

((argument_list
  (identifier) @variable)
 (#set! priority 110))

((kwarg
  key: (identifier) @variable.parameter)
 (#set! priority 110))

((pair
  key: (identifier) @property)
 (#set! priority 110))

((set_statement
  name: (identifier) @variable)
 (#set! priority 110))

((for_statement
  left: (identifier) @variable)
 (#set! priority 110))

((block_statement
  name: (identifier) @variable)
 (#set! priority 110))

((import_statement
  alias: (identifier) @variable)
 (#set! priority 110))

((from_statement
  name: (identifier) @variable)
 (#set! priority 110))

((from_statement
  alias: (identifier) @variable)
 (#set! priority 110))

; --- Operators / punctuation ---
([
  "|"
  "="
] @operator
 (#set! priority 110))

([
  "."
  ","
  ":"
] @punctuation.delimiter
 (#set! priority 110))

([
  "("
  ")"
  "{"
  "}"
  "["
  "]"
] @punctuation.bracket
 (#set! priority 110))

; --- Literals ---
((lit_string) @string
 (#set! priority 110))

((integer) @number
 (#set! priority 110))

((float) @number.float
 (#set! priority 110))

((bool) @boolean
 (#set! priority 110))

((null) @constant.builtin
 (#set! priority 110))

; --- Comments ---
((comment) @comment @spell
 (#set! priority 110))

((lit_string) @spell)
