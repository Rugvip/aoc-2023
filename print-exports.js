#!/usr/bin/env node --stack-size=32768 --max-old-space-size=65536

const fs = require('fs');
const typescript = require('typescript');
const { resolve: resolvePath } = require('path');
const { compilerOptions } = require('./tsconfig.json');
const { Worker } = require('worker_threads');

function sumExports(filePath, exportPrefix) {
  if (!exportPrefix) {
    throw new Error('No export pattern provided');
  }
  const program = typescript.createProgram([filePath], {
    ...compilerOptions,
    lib: ['lib.es2023.full.d.ts'],
    target: typescript.ScriptTarget.ES2022,
    module: typescript.ModuleKind.NodeNext,
    moduleResolution: typescript.ModuleResolutionKind.NodeNext,
  });

  const sourceFile = program.getSourceFileByPath(filePath.toLowerCase());

  const checker = program.getTypeChecker();

  const sourceFileSymbol = checker.getSymbolAtLocation(sourceFile);

  const moduleExports = checker
    .getExportsOfModule(sourceFileSymbol)
    .map((exp) => exp.name)
    .filter((name) => name.startsWith(exportPrefix));

  const results = [];

  for (const exp of moduleExports) {
    const worker = new Worker(
      `(${() => {
        const typescript = require('typescript');
        const { compilerOptions } = require('./tsconfig.json');
        const { parentPort, workerData } = require('worker_threads');

        const program = typescript.createProgram([workerData.filePath], {
          ...compilerOptions,
          lib: ['lib.es2023.full.d.ts'],
          target: typescript.ScriptTarget.ES2022,
          module: typescript.ModuleKind.NodeNext,
          moduleResolution: typescript.ModuleResolutionKind.NodeNext,
        });

        const sourceFile = program.getSourceFileByPath(workerData.filePath.toLowerCase());

        const checker = program.getTypeChecker();

        const sourceFileSymbol = checker.getSymbolAtLocation(sourceFile);

        const moduleExport = checker
          .getExportsOfModule(sourceFileSymbol)
          .find((exp) => exp.name === workerData.exportName);

        if (!moduleExport) {
          throw new Error('No export found');
        }

        const expType = checker.getTypeOfSymbolAtLocation(
          moduleExport,
          moduleExport.declarations[0],
        );
        parentPort.postMessage(
          checker.typeToString(expType, undefined, typescript.TypeFormatFlags.NoTruncation),
        );
      }})()`,
      {
        workerData: { exportName: exp, filePath },
        eval: true,
      },
    );

    results.push(
      new Promise((resolve) => {
        worker.on('message', (msg) => {
          console.log(`Received '${msg}' for ${exp}`);
          resolve(parseInt(String(msg), 10));
        });
      }),
    );
  }

  Promise.all(results).then((values) => {
    const sum = values.reduce((a, b) => a + b);
    console.log(`Sum of ${exportPrefix} exports: ${sum}`);
  });
}

function printExports(filePath, exportName) {
  const program = typescript.createProgram([filePath], {
    ...compilerOptions,
    lib: ['lib.es2023.full.d.ts'],
    target: typescript.ScriptTarget.ES2022,
    module: typescript.ModuleKind.NodeNext,
    moduleResolution: typescript.ModuleResolutionKind.NodeNext,
  });

  const sourceFile = program.getSourceFileByPath(filePath.toLowerCase());

  const checker = program.getTypeChecker();

  const sourceFileSymbol = checker.getSymbolAtLocation(sourceFile);

  let moduleExports = checker.getExportsOfModule(sourceFileSymbol);
  if (exportName) {
    moduleExports = moduleExports.filter((exp) => exp.name === exportName);
  }
  for (const exp of moduleExports) {
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

function main(command, pathArg, ...args) {
  const path = command === 'sum' ? pathArg : command;
  const filePath = resolvePath(path.endsWith('.ts') ? path : `src/day-${path.padStart(2, '0')}.ts`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  if (command === 'sum') {
    sumExports(filePath, ...args);
  } else {
    printExports(filePath, ...args);
  }
}

main(...process.argv.slice(2));
