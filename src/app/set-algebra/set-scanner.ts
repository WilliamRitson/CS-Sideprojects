export enum TokenType {
    variable,
    left_paren,
    right_paren,
    union,
    intersection,
    complement,
    difference,
    universal,
    empty
}

export class Token {
    type: TokenType;
    identifier: string;

    constructor(type: TokenType, identifier: string = null) {
        this.type = type;
        this.identifier = identifier;
    }
}

export class Scanner {
    keySymbols = {
        '(': TokenType.left_paren,
        ')': TokenType.right_paren,
        '[': TokenType.left_paren,
        ']': TokenType.right_paren,
        'or': TokenType.union,
        'union': TokenType.union,
        '∪': TokenType.union,
        'and': TokenType.intersection,
        'intersection': TokenType.intersection,
        '&': TokenType.intersection,
        '∩': TokenType.intersection,
        'difference': TokenType.difference,
        '-': TokenType.difference,
        '−': TokenType.difference,
        '\\': TokenType.difference,
        '^C': TokenType.complement,
        '!': TokenType.complement,
        '^∁': TokenType.complement,
        '∁': TokenType.complement,
        'complement': TokenType.complement,
        'universal': TokenType.universal,
        '𝕌': TokenType.universal,
        'Ω': TokenType.universal,
        'empty': TokenType.empty,
        '∅': TokenType.empty
    }

    private tokens: Array<Token>;
    private pos: number;
    private source: string;

    private addNextToken() {
        let next = this.nextToken();
        if (next) {
            this.tokens.push(next);
        }
    }

    private nextToken() {
        let len = 0;
        let token = undefined;
        while (this.pos + len < this.source.length) {
            len++;
            let sub = this.source.substr(this.pos, len);
            if (this.keySymbols[sub]) {
                token = new Token(this.keySymbols[sub]);
                break;
            }
            else if (this.source.charAt(this.pos + len).match(/[^\w]/)) {
                token = new Token(TokenType.variable, sub);
                break;
            }
        }
        if (!token) {
            token = new Token(TokenType.variable, this.source.substr(this.pos, len));
        }
        this.pos += len;
        return token
    }

    private nextChar() {
        return this.source.charAt(this.pos);
    }

    private isWhiteSpace() {
        return this.nextChar().match(/\s/);
    }

    private ignoreSpace() {
        while (this.isWhiteSpace() && this.pos < this.source.length)
            this.pos++;
    }

    tokenize(source: string): Array<Token> {
        this.tokens = [];
        this.pos = 0;
        this.source = source;

        let iterMax = 1000;
        while (this.pos < this.source.length && iterMax > 0) {
            this.ignoreSpace();
            this.addNextToken();
            this.ignoreSpace();
            //console.log(this.pos, this.source.length, this.source.substring(this.pos, this.source.length), this.tokens);
            iterMax--;
        }

        return this.tokens;
    }

}