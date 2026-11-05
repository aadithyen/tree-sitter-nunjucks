// Nunjucks template grammar for tree-sitter.
// Structure follows https://github.com/dbt-labs/tree-sitter-jinja2 and
// gbprod/tree-sitter-twig (named output/statement, HTML host as `content`).
// Keyword set aligned with https://github.com/alsolovyev/Nunjucks Sublime scopes.

function commaSep1(rule) {
  return sep1(rule, ',');
}

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

module.exports = grammar({
  name: 'nunjucks',

  extras: $ => [/\s/],

  rules: {
    source_file: $ => repeat(choice(
      $.output,
      $.statement,
      $.comment,
      $.content,
    )),

    // `{{ expr }}` — Sublime: punctuation.expression + meta.expression
    output: $ => seq(
      choice('{{', '{{-'),
      field('expr', $._expr),
      choice('}}', '-}}'),
    ),

    // `{% ... %}` — Sublime: punctuation.statement + meta.statement
    statement: $ => seq(
      choice('{%', '{%-'),
      $._statement,
      choice('%}', '-%}'),
    ),

    _statement: $ => choice(
      $.if_statement,
      $.for_statement,
      $.set_statement,
      $.extends_statement,
      $.include_statement,
      $.block_statement,
      $.macro_statement,
      $.import_statement,
      $.from_statement,
      $.filter_statement,
      $.call_statement,
      $.with_statement,
      $.raw_statement,
      $.tag_statement,
    ),

    if_statement: $ => choice(
      seq(
        field('tag', alias(choice('if', 'elif', 'elseif'), $.conditional)),
        field('condition', $._expr),
      ),
      field('tag', alias('else', $.conditional)),
    ),

    for_statement: $ => seq(
      field('tag', alias(choice('for', 'asyncEach', 'asyncAll'), $.repeat)),
      field('left', $.identifier),
      repeat(seq(',', field('left', $.identifier))),
      alias('in', $.keyword),
      field('right', $._expr),
    ),

    set_statement: $ => seq(
      field('tag', alias('set', $.keyword)),
      field('name', $.identifier),
      optional(seq('=', field('value', $._expr))),
    ),

    extends_statement: $ => seq(
      field('tag', alias('extends', $.keyword)),
      field('target', $._expr),
    ),

    include_statement: $ => seq(
      field('tag', alias('include', $.keyword)),
      field('target', $._expr),
      optional(alias('ignore missing', $.keyword)),
      optional(seq(alias('with', $.keyword), field('context', $._expr))),
      optional(alias('only', $.keyword)),
    ),

    block_statement: $ => seq(
      field('tag', alias('block', $.keyword)),
      field('name', $.identifier),
    ),

    macro_statement: $ => seq(
      field('tag', alias('macro', $.keyword)),
      field('name', $.identifier),
      optional(field('parameters', $.argument_list)),
    ),

    import_statement: $ => seq(
      field('tag', alias('import', $.keyword)),
      field('target', $._expr),
      optional(seq(alias('as', $.keyword), field('alias', $.identifier))),
    ),

    from_statement: $ => seq(
      field('tag', alias('from', $.keyword)),
      field('target', $._expr),
      alias('import', $.keyword),
      field('name', $.identifier),
      optional(seq(alias('as', $.keyword), field('alias', $.identifier))),
    ),

    filter_statement: $ => seq(
      field('tag', alias('filter', $.keyword)),
      field('name', $.identifier),
      optional(field('arguments', $.argument_list)),
    ),

    call_statement: $ => seq(
      field('tag', alias('call', $.keyword)),
      field('callee', $._expr),
    ),

    with_statement: $ => seq(
      field('tag', alias('with', $.keyword)),
      optional(field('context', $._expr)),
      optional(alias('context', $.keyword)),
    ),

    raw_statement: $ => field(
      'tag',
      alias(choice('raw', 'verbatim'), $.keyword),
    ),

    // endif/endfor/… plus unknown tags (`{% css %}`, Eleventy shortcodes).
    tag_statement: $ => seq(
      field('tag', choice(
        alias('endif', $.conditional),
        alias(choice('endfor', 'endeach', 'endall'), $.repeat),
        alias(choice(
          'endblock',
          'endmacro',
          'endset',
          'endfilter',
          'endcall',
          'endraw',
          'endverbatim',
        ), $.keyword),
        alias($.identifier, $.tag),
      )),
      optional(field('argument', $._expr)),
    ),

    // Named so queries can capture whole comment (body is opaque regex).
    comment: $ => seq(
      choice('{#', '{#-'),
      new RegExp(
        '(' +
        '(' +
        '[^#]' +
        '|' +
        '#[^}]' +
        ')*' +
        ')#+}',
      ),
    ),

    _expr: $ => $.filter_chain,

    filter_chain: $ => seq(
      field('base', $._primary),
      repeat(seq(
        '|',
        field('name', $.identifier),
        optional(field('arguments', $.argument_list)),
      )),
    ),

    _primary: $ => choice(
      $.fn_call,
      $.member_expression,
      $.identifier,
      $.list,
      $.dict,
      $.lit_string,
      $.bool,
      $.null,
      $.integer,
      $.float,
    ),

    member_expression: $ => prec.left(2, seq(
      field('object', choice($.identifier, $.fn_call)),
      repeat1(seq(
        '.',
        field('property', $.identifier),
      )),
    )),

    fn_call: $ => seq(
      field('fn_name', $.identifier),
      field('argument_list', $.argument_list),
    ),

    argument_list: $ => seq(
      '(',
      optional(commaSep1(choice(
        $._primary,
        $.kwarg,
      ))),
      optional(','),
      ')',
    ),

    lit_string: $ => choice(
      seq("'", /([^']|\\')*/, "'"),
      seq('"', /([^"]|\\")*/, '"'),
    ),

    bool: $ => choice('true', 'false'),

    null: $ => 'none',

    list: $ => seq(
      '[',
      optional(commaSep1($._expr)),
      optional(','),
      ']',
    ),

    dict: $ => seq(
      '{',
      optional(commaSep1($.pair)),
      optional(','),
      '}',
    ),

    pair: $ => seq(
      field('key', choice($.lit_string, $.identifier)),
      ':',
      field('value', $._expr),
    ),

    identifier: $ => $._identifier,

    _identifier: $ => token(new RegExp(
      '[a-zA-Z_][a-zA-Z0-9_]*',
    )),

    kwarg: $ => seq(
      field('key', $.identifier),
      '=',
      field('value', $._expr),
    ),

    // Named for HTML injection (see queries/injections.scm).
    // Twig-style: runs of non-`{` or a lone `{` not starting a delimiter.
    content: $ => prec.right(repeat1(choice(
      /[^{]+/,
      /\{[^{%#]/,
    ))),

    integer: $ => token(seq(
      optional(/[+-]/),
      repeat1(/_?[0-9]+/),
    )),

    float: $ => {
      const digits = repeat1(/[0-9]+_?/);
      const exponent = seq(/[eE][+-]?/, digits);
      const sign = /[+-]/;

      return token(choice(
        seq(optional(sign), digits, '.', optional(digits), optional(exponent)),
        seq(optional(sign), optional(digits), '.', digits, optional(exponent)),
        seq(digits, exponent),
      ));
    },
  },
});
