install:
	go mod vendor
	bun install --frozen-lockfile
	bun install -g prettier

clean:
	rm -rf dist/

# Single consolidated binary. jxscout-pro-v2 alias keeps upstream agent skills
# (which invoke `jxscout-pro-v2 -c ...`) working without modification.
go-build:
	go build -o jxscout ./cmd/jxscout
	ln -sf jxscout jxscout-pro-v2

build:
	bun run rsbuild build
	mv dist/sourceMaps.js internal/modules/sourcemaps/sourcemaps.js
	mv dist/astAnalyzer.js internal/modules/ast-analyzer/ast-analyzer.js
	bun run scripts/patch-ast-analyzer-build/patch.ts internal/modules/ast-analyzer/ast-analyzer.js
	mv dist/chunkDiscoverer.js internal/modules/chunk-discoverer/chunk-discoverer.js
	cp node_modules/source-map/lib/mappings.wasm internal/modules/sourcemaps/mappings.wasm
	bun build --target=node --outdir dist/optimizer pkg/optimizer/optimizer.ts
	cp dist/optimizer/optimizer.js internal/modules/optimizer/optimizer.js
	node -e "const fs=require('fs');const p='internal/modules/optimizer/optimizer.js';let s=fs.readFileSync(p,'utf8');s=s.replace('nativeBinding = __require(process.env.NAPI_RS_NATIVE_LIBRARY_PATH);','var __dlmod = { exports: {} };\n        process.dlopen(__dlmod, process.env.NAPI_RS_NATIVE_LIBRARY_PATH);\n        nativeBinding = __dlmod.exports;\n        return nativeBinding;');fs.writeFileSync(p,s);console.log('patched optimizer.js')"
	cp node_modules/@oxc-parser/binding-linux-x64-gnu/parser.linux-x64-gnu.node internal/modules/optimizer/ 2>/dev/null || true
	cp node_modules/@oxc-parser/binding-linux-x64-musl/parser.linux-x64-musl.node internal/modules/optimizer/ 2>/dev/null || true
