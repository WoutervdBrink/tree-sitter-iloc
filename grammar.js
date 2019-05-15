const MINUS = '-';
const COMMA = ',';
const SEMI = ';';
const LSQ = '[';
const RSQ = ']';
const DARROW = '=>';
const ARROW = '->';
const ASS = '<-';

const ID = /[a-zA-Z]([a-zA-Z0-9-_])*/;
const SYMB = /@[a-zA-Z]([a-zA-Z0-9-_])*/;
const LAB = /#[a-zA-Z]([a-zA-Z0-9-_])*/;
const NUM = /-?[0-9]+/;
const STR = /"([^\n\r]|\\")*"/;
const COMMENT = /\/\/[^\r\n]*/;
const WS = /[ \t]+/;
const EOL = /[\r\n]+/;

module.exports = grammar({
    name: 'iloc',
    extras: $ => [
        WS
    ],
    rules: {
        // program: decl* instr (EOL+ instr)* EOL* EOF;
        program: $ => seq(
            repeat($.decl),
            $.instr,
            repeat(seq(
                repeat1(EOL),
                $.instr
            )),
            repeat(EOL)
        ),

        // decl: ID ASS NUM COMMENT? EOL+
        decl: $ => seq(
            ID,
            ASS,
            NUM,
            optional(COMMENT),
            repeat1(EOL)
        ),

        /** Instruction: single op or []-bracketed non-empty op sequence. */
        // instr
        //     : (label ':')?
        //       op           #singleInstr
        //     | (label ':')?
        //       LSQ
        //       EOL*
        //       op
        //       (EOL+ op)*
        //       EOL*
        //       RSQ          #instrList
        instr: $ => choice(
            seq(optional(seq($.label, ':')), $.op),
            seq(
                optional(seq($.label, ':')),
                LSQ,
                repeat(EOL),
                $.op,
                repeat(seq(repeat1(EOL), $.op)),
                repeat(EOL),
                RSQ
            )
        ),

        /** Single operation. */
        // op  : COMMENT                   #comment
        //     | opCode sources ((ARROW|DARROW) targets)?
        //       SEMI?
        //       COMMENT?                  #realOp
        //     ;
        op: $ => choice(
            COMMENT,
            seq(
                $.opCode,
                optional($.sources),
                optional(seq(
                    choice(ARROW, DARROW),
                    $.targets
                )),
                optional(SEMI),
                optional(COMMENT)
            )
        ),

        // sources: (operand (COMMA operand)*)?;
        sources: $ => seq(
            $.operand,
            repeat(seq(
                COMMA, $.operand
            ))
        ),

        // targets: operand (COMMA operand)*;
        targets: $ => seq(
            $.operand,
            repeat(seq(
                COMMA,
                $.operand
            ))
        ),


        /** Operation label. */
        // label: ID;
        label: $ => ID,

        /** Opcode: not distinguished by the parser. */
        // opCode: ID;
        opCode: $ => ID,

        /** Operand: ID (label or register), number or string. */
        // operand : ID | NUM | SYMB | LAB | STR;
        operand: $ => choice(ID, NUM, SYMB, LAB, STR)
    }
});
