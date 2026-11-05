; Comment language (TODO/FIXME etc. via comment parser).
((comment) @injection.content
 (#set! injection.language "comment"))

; HTML host markup between Nunjucks tags.
; Combined: stitch split `content` nodes into one HTML document so tags
; spanning `{{ }}` / `{% %}` still parse. Do NOT re-highlight HTML here —
; html highlights.scm owns tag/attr/string colors. Nunjucks highlights use
; priority 110 so delimiters/exprs win over any injection bleed.
((content) @injection.content
 (#set! injection.language "html")
 (#set! injection.combined))
