Prism.languages['powerpc-asm'] = {
    'comment': [
        {
            pattern: /\/\*[\s\S]*?\*\//, // Multiline comments
            greedy: true
        },
        {
            pattern: /#.*/, // Single line comments
            greedy: true
        }
    ],
    'directive': {
        pattern: /\.(?:\w+)\b/,
        alias: 'keyword'
    },
    'string': {
        pattern: /"(?:\\.|[^"\\])*"/,
        greedy: true
    },
    'instruction': {
        pattern: /\b(?:addi|add|stw|stwu|blr|mul|div|sub|and|or|xor|cmp|mov|l|cmp|j|b|nop|call|ret|jump|nop|beq|bne|blt|bgt|ble|bge|mflr|li|bl|lwz|mtlr)\b/i,
        alias: 'function'
    },
    'register': {
        pattern: /\br\d{1,2}\b/,
        alias: 'variable'
    },
    'label': {
        pattern: /^[.\w]+:/m,
        alias: 'symbol'
    },
    'number': {
        pattern: /\b0x[\da-fA-F]+|\b\d+\b/,
        alias: 'number'
    },
    'punctuation': /[(),]/
};

// Apply to general 'asm' blocks
Prism.languages.asm = Prism.languages['powerpc-asm'];
