import fs from 'node:fs'
import path from 'node:path'

// Test-only bridge: typecheck documented aliases before adapting imports for
// Node. This is not a production alias loader or an architecture checker.
export function rewriteExampleImports(code, filename, sourceRoot, extension) {
  return code.replace(/((?:from\s*|(?:import|require)\s*(?:\(\s*)?)['"])(@\/[^'"]+|\.[^'"]+)(['"])/g,
    (_match, before, imported, after) => {
      let relative = imported.startsWith('@/')
        ? path.posix.relative(path.posix.dirname(filename), imported.slice(2)) : imported
      if (!relative.startsWith('.')) relative = './' + relative
      const target = path.resolve(sourceRoot, path.posix.dirname(filename), relative)
      if (fs.existsSync(target + '.ts') || fs.existsSync(target + '.tsx')) relative += extension
      else if (fs.existsSync(path.join(target, 'index.ts'))) relative += '/index' + extension
      return before + relative + after
    })
}
