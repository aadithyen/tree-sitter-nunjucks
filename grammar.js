// Nunjucks template grammar for tree-sitter.
// Structure follows https://github.com/dbt-labs/tree-sitter-jinja2 (mixed text,
// {{ output }}, {% statements %}, {# comments #}). Nunjucks differs mainly in
// expression syntax (lowercase booleans, filters with |, bare identifiers).

function commaSep1(rule) {
  return sep1(rule, ',');
}

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

module.exports = grammar({
  name: 'nunjucks',

  rules: {
    source_file: $ => repeat(choice(
      $._nunjucks_value,
      $.nunjucks_statement,
      $._nunjucks_comment,
      $._text,
    )),

    _nunjucks_value: $ => seq(
      '{{',
      $._expr,
      '}}',
    ),

    // Statement body not fully parsed (same strategy as tree-sitter-jinja2).
    nunjucks_statement: $ => seq(
      '{%',
      new RegExp(
        '(' +
        '[^%]' +
        '|' +
        '%[^}]' +
        ')*' +
        '%}',
      ),
    ),

    _nunjucks_comment: $ => seq(
      '{#',
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

    _text: $ => new RegExp(
      '(' +
      '[^{]' +
      '|' +
      '[{][^{%#]' +
      ')+',
    ),

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
