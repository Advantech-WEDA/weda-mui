type Token =
  | { kind: 'number'; text: string; pos: number }
  | { kind: 'variable'; text: string; pos: number }
  | { kind: 'op'; text: '+' | '-' | '*' | '/'; pos: number }
  | { kind: 'open'; text: '(' | '['; pos: number }
  | { kind: 'close'; text: ')' | ']'; pos: number };

const CLOSE_OF: Record<'(' | '[', ')' | ']'> = { '(': ')', '[': ']' };

class ExpressionError extends Error {}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      const match = /^(\d+(\.\d+)?|\.\d+)/.exec(input.slice(i));

      if (!match) {
        throw new ExpressionError(`Invalid number at position ${i + 1}`);
      }

      tokens.push({ kind: 'number', text: match[0], pos: i });
      i += match[0].length;
      continue;
    }

    if (/[A-Za-z_]/.test(ch)) {
      const name = /^[A-Za-z_]\w*/.exec(input.slice(i))![0];

      tokens.push({ kind: 'variable', text: name, pos: i });
      i += name.length;
      continue;
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      tokens.push({ kind: 'op', text: ch, pos: i });
    } else if (ch === '(' || ch === '[') {
      tokens.push({ kind: 'open', text: ch, pos: i });
    } else if (ch === ')' || ch === ']') {
      tokens.push({ kind: 'close', text: ch, pos: i });
    } else {
      throw new ExpressionError(
        `Unsupported character "${ch}"; supported operators are +, -, *, /, ( ), [ ]`
      );
    }

    i += 1;
  }

  return tokens;
}

function parse(tokens: Token[], variable: string): void {
  let index = 0;
  const peek = () => tokens[index];

  const describe = (token: Token | undefined) =>
    token
      ? `"${token.text}" at position ${token.pos + 1}`
      : 'end of expression';

  const expr = (): void => {
    term();

    while (peek()?.kind === 'op' && /[+-]/.test(peek()!.text)) {
      index += 1;
      term();
    }
  };

  const term = (): void => {
    unary();

    while (peek()?.kind === 'op' && /[*/]/.test(peek()!.text)) {
      index += 1;
      unary();
    }
  };

  const unary = (): void => {
    const token = peek();

    if (token?.kind === 'op' && /[+-]/.test(token.text)) {
      index += 1;
      unary();
      return;
    }

    primary();
  };

  const primary = (): void => {
    const token = peek();

    if (token?.kind === 'number' || token?.kind === 'variable') {
      index += 1;
      return;
    }

    if (token?.kind === 'open') {
      index += 1;
      expr();

      const close = peek();
      const expected = CLOSE_OF[token.text];

      if (close?.kind !== 'close' || close.text !== expected) {
        throw new ExpressionError(
          `Missing "${expected}" for "${token.text}" at position ${token.pos + 1}`
        );
      }

      index += 1;
      return;
    }

    throw new ExpressionError(
      `Expected a number or "${variable}" before ${describe(token)}`
    );
  };

  expr();

  const rest = peek();

  if (rest) {
    throw new ExpressionError(
      rest.kind === 'close'
        ? `Unmatched "${rest.text}" at position ${rest.pos + 1}`
        : `Missing operator before ${describe(rest)}`
    );
  }
}

export function getTransferFunctionExpressionError(
  expression: string,
  variable: string
): string | undefined {
  try {
    const tokens = tokenize(expression);

    parse(tokens, variable);

    if (!tokens.some((t) => t.kind === 'variable' && t.text === variable)) {
      return `Expression must use the input variable "${variable}"`;
    }

    return undefined;
  } catch (error) {
    if (error instanceof ExpressionError) return error.message;
    throw error;
  }
}
