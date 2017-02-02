import { TokenError } from '@angular/compiler/src/ml_parser/lexer';
import { Scanner, Token, TokenType } from './set-scanner';
import * as exprs from './set-expr';

enum TokenEvalType {
    infix, groupingLeft, groupingRight, rightUnary, value
}


class TokenSetting {
    type: TokenEvalType;
    priority: number;
    generator: exprs.SetExprNewable;

    constructor(type: TokenEvalType, priority: number, generator: exprs.SetExprNewable) {
        this.type = type;
        this.priority = priority;
        this.generator = generator;
    }
}

const parserSettings = new Map<TokenType, TokenSetting>([
    [TokenType.variable, new TokenSetting(TokenEvalType.value, 1, exprs.VariableSetExpr)],
    [TokenType.left_paren, new TokenSetting(TokenEvalType.groupingLeft, 4, exprs.ParenSetExpr)],
    [TokenType.right_paren, new TokenSetting(TokenEvalType.groupingRight, 4, exprs.ParenSetExpr)],
    [TokenType.union, new TokenSetting(TokenEvalType.infix, 2, exprs.UnionSetExpr)],
    [TokenType.intersection, new TokenSetting(TokenEvalType.infix, 2, exprs.IntersectionSetExpr)],
    [TokenType.complement, new TokenSetting(TokenEvalType.rightUnary, 1, exprs.ComplementSetExpr)],
    [TokenType.difference, new TokenSetting(TokenEvalType.infix, 2, exprs.DifferenceSetExpr)],
]);


export class Parser {
    private scanner: Scanner;

    constructor() {
        this.scanner = new Scanner();
    }

    parse(source: string): exprs.SetTreeExpr {
        let tokens = this.scanner.tokenize(source);

        return this.parseTokens(tokens);
    }

    private getLowestPriority(tokens: Array<Token>): number {
        let lowestIndex = {
            index: 0,
            priority: Infinity,
            parenLevel: Infinity
        }

        let parenLevel = 0;
        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            if (token.type === TokenType.left_paren)
                parenLevel++;

            let priority = -parserSettings.get(tokens[i].type).priority;
            //console.log(parenLevel, TokenType[token.type], priority, parenLevel, parenLevel <= lowestIndex.parenLevel, priority <= lowestIndex.priority);
            if (parenLevel < lowestIndex.parenLevel || parenLevel == lowestIndex.parenLevel && priority <= lowestIndex.priority) {
                lowestIndex = { index: i, priority: priority, parenLevel: parenLevel };
                //console.log('lin', lowestIndex);
            }

            if (token.type === TokenType.right_paren)
                parenLevel--;
        }

        return lowestIndex.index;
    }

    private getGroupEnd(type: TokenType, tokens: Array<Token>): number {
        let complement = type == TokenType.left_paren ? TokenType.right_paren : TokenType.left_paren;

        let counter = 1;
        for (let i = tokens.length - 1; i >= 0; i--) {
            if (tokens[i].type == type)
                counter++;
            if (tokens[i].type == complement)
                counter--;
            if (counter == 0)
                return i + 1;
        }

        return tokens.length - 1;
    }

    private parseTokens(tokens: Array<Token>): exprs.SetTreeExpr {
        let index = this.getLowestPriority(tokens);
        let token = tokens[index];
        let settings = parserSettings.get(token.type);
        let left = tokens.slice(0, index);
        let right = tokens.slice(index + 1, tokens.length);

       // console.log("pt", index, TokenType[tokens[index].type]);

        switch (settings.type) {
            case (TokenEvalType.infix):
                return new settings.generator(
                    token,
                    this.parseTokens(left),
                    this.parseTokens(right)
                );
            case (TokenEvalType.groupingRight):
                let groupedTokens = left.slice(this.getGroupEnd(token.type, left), left.length);
                return new settings.generator(
                    token,
                    this.parseTokens(groupedTokens),
                    null
                );;
            case (TokenEvalType.rightUnary):
                return new settings.generator(
                    token,
                    this.parseTokens(left),
                    null
                );
            case (TokenEvalType.value):
                return new settings.generator(token, null, null);
        }
    }

}
