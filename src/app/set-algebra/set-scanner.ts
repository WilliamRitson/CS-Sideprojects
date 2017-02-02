export enum TokenType {
    variable,
    left_paren,
    right_paren,
    union,
    intersection,
    complement,
    difference
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
        'or': TokenType.union,
        'union': TokenType.union,
        '∪': TokenType.union,
        'and': TokenType.intersection,
        'intersection': TokenType.intersection,
        '∩': TokenType.intersection,
        '-': TokenType.difference,
        '\\': TokenType.difference
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
        while (this.pos + len < this.source.length) {
            len++;
            let sub = this.source.substr(this.pos, len);
            if (this.keySymbols[sub]) {
                this.pos += len;
                return new Token(this.keySymbols[sub]);
            }
            else if (this.source.charAt(this.pos + len).match(/[^\w]/)) {
                this.pos += len;
                return new Token(TokenType.variable, sub);
            }
        }
        this.pos += len;
        return new Token(TokenType.variable, this.source.substr(this.pos, len));
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

        let iterMax = 100;
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