#!/usr/bin/env node --stack-size=16384 --max-old-space-size=32768

const fs = require('fs');
const typescript = require('typescript');
const { resolve: resolvePath } = require('path');
const { compilerOptions } = require('./tsconfig.json');

function main(/** @type {string} */ path) {
  const filePath = resolvePath(path.endsWith('.ts') ? path : `src/day-${path.padStart(2, '0')}.ts`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const program = typescript.createProgram([filePath], {
    ...compilerOptions,
    lib: ['lib.es2023.full.d.ts'],
    target: typescript.ScriptTarget.ES2022,
    module: typescript.ModuleKind.NodeNext,
    moduleResolution: typescript.ModuleResolutionKind.NodeNext,
  });

  const sourceFile = program.getSourceFileByPath(filePath.toLowerCase());

  program.emit(sourceFile);

  const checker = program.getTypeChecker();

  const sourceFileSymbol = checker.getSymbolAtLocation(sourceFile);

  for (const exp of checker.getExportsOfModule(sourceFileSymbol)) {
    const expType = checker.getTypeOfSymbolAtLocation(exp, exp.declarations[0]);
    if (expType.isStringLiteral()) {
      console.log(`${exp.name} = ${expType.value}`);
    } else {
      console.log(
        `${exp.name} = ${checker.typeToString(
          expType,
          undefined,
          typescript.TypeFormatFlags.NoTruncation,
        )}`,
      );
    }
  }
}

main(...process.argv.slice(2));
