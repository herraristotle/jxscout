import { createRequire } from "node:module";
var __defProp = Object.defineProperty;
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// node_modules/@oxc-parser/binding-linux-x64-musl/parser.linux-x64-musl.node
var require_parser_linux_x64_musl = __commonJS((exports, module) => {
  module.exports = __require("./parser.linux-x64-musl-7x7ay389.node");
});

// node_modules/@oxc-parser/binding-linux-x64-gnu/parser.linux-x64-gnu.node
var require_parser_linux_x64_gnu = __commonJS((exports, module) => {
  module.exports = __require("./parser.linux-x64-gnu-3k11d7m3.node");
});

// node_modules/oxc-parser/package.json
var exports_package = {};
__export(exports_package, {
  version: () => version,
  scripts: () => scripts,
  repository: () => repository,
  publishConfig: () => publishConfig,
  optionalDependencies: () => optionalDependencies,
  napi: () => napi,
  name: () => name,
  main: () => main,
  license: () => license,
  keywords: () => keywords,
  homepage: () => homepage,
  funding: () => funding,
  files: () => files,
  engines: () => engines,
  devDependencies: () => devDependencies,
  description: () => description,
  dependencies: () => dependencies,
  default: () => package_default,
  bugs: () => bugs,
  browser: () => browser,
  author: () => author
});
var name = "oxc-parser", version = "0.68.1", main = "index.js", browser = "wasm.mjs", engines, description = "Oxc Parser Node API", keywords, author = "Boshen and oxc contributors", license = "MIT", homepage = "https://oxc.rs", bugs = "https://github.com/oxc-project/oxc/issues", repository, funding, files, publishConfig, dependencies, devDependencies, napi, optionalDependencies, scripts, package_default;
var init_package = __esm(() => {
  engines = {
    node: ">=14.0.0"
  };
  keywords = [
    "oxc",
    "parser"
  ];
  repository = {
    type: "git",
    url: "https://github.com/oxc-project/oxc.git",
    directory: "napi/parser"
  };
  funding = {
    url: "https://github.com/sponsors/Boshen"
  };
  files = [
    "index.d.ts",
    "index.js",
    "wrap.cjs",
    "wrap.mjs",
    "wasm.mjs",
    "bindings.js",
    "webcontainer-fallback.js",
    "generated/deserialize/js.js",
    "generated/deserialize/ts.js"
  ];
  publishConfig = {
    registry: "https://registry.npmjs.org/",
    access: "public"
  };
  dependencies = {
    "@oxc-project/types": "^0.68.1"
  };
  devDependencies = {
    "@codspeed/vitest-plugin": "^4.0.0",
    "@napi-rs/wasm-runtime": "^0.2.7",
    "@vitest/browser": "3.1.2",
    esbuild: "^0.25.0",
    playwright: "^1.51.0",
    vitest: "3.1.2"
  };
  napi = {
    binaryName: "parser",
    packageName: "@oxc-parser/binding",
    targets: [
      "x86_64-pc-windows-msvc",
      "aarch64-pc-windows-msvc",
      "x86_64-unknown-linux-gnu",
      "x86_64-unknown-linux-musl",
      "aarch64-unknown-linux-gnu",
      "aarch64-unknown-linux-musl",
      "armv7-unknown-linux-gnueabihf",
      "x86_64-apple-darwin",
      "aarch64-apple-darwin",
      "wasm32-wasip1-threads"
    ],
    wasm: {
      browser: {
        fs: false
      }
    },
    dtsHeaderFile: "header.js"
  };
  optionalDependencies = {
    "@oxc-parser/binding-win32-x64-msvc": "0.68.1",
    "@oxc-parser/binding-win32-arm64-msvc": "0.68.1",
    "@oxc-parser/binding-linux-x64-gnu": "0.68.1",
    "@oxc-parser/binding-linux-x64-musl": "0.68.1",
    "@oxc-parser/binding-linux-arm64-gnu": "0.68.1",
    "@oxc-parser/binding-linux-arm64-musl": "0.68.1",
    "@oxc-parser/binding-linux-arm-gnueabihf": "0.68.1",
    "@oxc-parser/binding-darwin-x64": "0.68.1",
    "@oxc-parser/binding-darwin-arm64": "0.68.1",
    "@oxc-parser/binding-wasm32-wasi": "0.68.1"
  };
  scripts = {
    "build-dev": "napi build --no-dts-cache --platform --js bindings.js",
    build: "pnpm run build-dev --features allocator --release",
    "postbuild-dev": "node patch.mjs",
    "build-wasi": "pnpm run build-dev --release --target wasm32-wasip1-threads",
    "build-npm-dir": "rm -rf npm-dir && napi create-npm-dirs --npm-dir npm-dir && pnpm napi artifacts --npm-dir npm-dir --output-dir .",
    "build-browser-bundle": "node build-browser-bundle.mjs",
    test: "pnpm run test-node run && tsc",
    "test-node": "vitest --dir ./test",
    "test-browser": "vitest -c vitest.config.browser.mts",
    bench: "vitest bench --run ./bench.bench.mjs"
  };
  package_default = {
    name,
    version,
    main,
    browser,
    engines,
    description,
    keywords,
    author,
    license,
    homepage,
    bugs,
    repository,
    funding,
    files,
    publishConfig,
    dependencies,
    devDependencies,
    napi,
    optionalDependencies,
    scripts
  };
});

// node_modules/oxc-parser/webcontainer-fallback.js
var require_webcontainer_fallback = __commonJS((exports, module) => {
  var fs = __require("node:fs");
  var childProcess = __require("node:child_process");
  var pkg = JSON.parse(fs.readFileSync(__require.resolve("/home/sysadmin/SeriousShit/bot/tools/jxsnitch/jxscout/node_modules/oxc-parser/package.json"), "utf-8"));
  var version2 = pkg.version;
  var baseDir = `/tmp/oxc-parser-${version2}`;
  var bindingEntry = `${baseDir}/node_modules/@oxc-parser/binding-wasm32-wasi/parser.wasi.cjs`;
  if (!fs.existsSync(bindingEntry)) {
    fs.rmSync(baseDir, { recursive: true, force: true });
    fs.mkdirSync(baseDir, { recursive: true });
    const bindingPkg = `@oxc-parser/binding-wasm32-wasi@${version2}`;
    console.log(`[oxc-parser] Downloading ${bindingPkg} on WebContainer...`);
    childProcess.execFileSync("pnpm", ["i", bindingPkg], {
      cwd: baseDir,
      stdio: "inherit"
    });
  }
  module.exports = __require(bindingEntry);
});

// node_modules/oxc-parser/bindings.js
var require_bindings = __commonJS((exports, module) => {
  var __filename = "/home/sysadmin/SeriousShit/bot/tools/jxsnitch/jxscout/node_modules/oxc-parser/bindings.js";
  var { createRequire: createRequire2 } = __require("node:module");
  __require = createRequire2(__filename);
  var { readFileSync } = __require("node:fs");
  var nativeBinding = null;
  var loadErrors = [];
  var isMusl = () => {
    let musl = false;
    if (process.platform === "linux") {
      musl = isMuslFromFilesystem();
      if (musl === null) {
        musl = isMuslFromReport();
      }
      if (musl === null) {
        musl = isMuslFromChildProcess();
      }
    }
    return musl;
  };
  var isFileMusl = (f) => f.includes("libc.musl-") || f.includes("ld-musl-");
  var isMuslFromFilesystem = () => {
    try {
      return readFileSync("/usr/bin/ldd", "utf-8").includes("musl");
    } catch {
      return null;
    }
  };
  var isMuslFromReport = () => {
    let report = null;
    if (typeof process.report?.getReport === "function") {
      process.report.excludeNetwork = true;
      report = process.report.getReport();
    }
    if (!report) {
      return null;
    }
    if (report.header && report.header.glibcVersionRuntime) {
      return false;
    }
    if (Array.isArray(report.sharedObjects)) {
      if (report.sharedObjects.some(isFileMusl)) {
        return true;
      }
    }
    return false;
  };
  var isMuslFromChildProcess = () => {
    try {
      return __require("child_process").execSync("ldd --version", { encoding: "utf8" }).includes("musl");
    } catch (e) {
      return false;
    }
  };
  function requireNative() {
    if (process.env.NAPI_RS_NATIVE_LIBRARY_PATH) {
      try {
        var __dlmod = { exports: {} };
        process.dlopen(__dlmod, process.env.NAPI_RS_NATIVE_LIBRARY_PATH);
        nativeBinding = __dlmod.exports;
        return nativeBinding;
      } catch (err) {
        loadErrors.push(err);
      }
    } else if (process.platform === "android") {
      if (process.arch === "arm64") {
        try {
          return (()=>{throw new Error("Cannot require module "+"./parser.android-arm64.node");})();
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-android-arm64");})();
        } catch (e) {
          loadErrors.push(e);
        }
      } else if (process.arch === "arm") {
        try {
          return (()=>{throw new Error("Cannot require module "+"./parser.android-arm-eabi.node");})();
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-android-arm-eabi");})();
        } catch (e) {
          loadErrors.push(e);
        }
      } else {
        loadErrors.push(new Error(`Unsupported architecture on Android ${process.arch}`));
      }
    } else if (process.platform === "win32") {
      if (process.arch === "x64") {
        try {
          return (()=>{throw new Error("Cannot require module "+"./parser.win32-x64-msvc.node");})();
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-win32-x64-msvc");})();
        } catch (e) {
          loadErrors.push(e);
        }
      } else if (process.arch === "ia32") {
        try {
          return (()=>{throw new Error("Cannot require module "+"./parser.win32-ia32-msvc.node");})();
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-win32-ia32-msvc");})();
        } catch (e) {
          loadErrors.push(e);
        }
      } else if (process.arch === "arm64") {
        try {
          return (()=>{throw new Error("Cannot require module "+"./parser.win32-arm64-msvc.node");})();
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-win32-arm64-msvc");})();
        } catch (e) {
          loadErrors.push(e);
        }
      } else {
        loadErrors.push(new Error(`Unsupported architecture on Windows: ${process.arch}`));
      }
    } else if (process.platform === "darwin") {
      try {
        return (()=>{throw new Error("Cannot require module "+"./parser.darwin-universal.node");})();
      } catch (e) {
        loadErrors.push(e);
      }
      try {
        return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-darwin-universal");})();
      } catch (e) {
        loadErrors.push(e);
      }
      if (process.arch === "x64") {
        try {
          return (()=>{throw new Error("Cannot require module "+"./parser.darwin-x64.node");})();
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-darwin-x64");})();
        } catch (e) {
          loadErrors.push(e);
        }
      } else if (process.arch === "arm64") {
        try {
          return (()=>{throw new Error("Cannot require module "+"./parser.darwin-arm64.node");})();
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-darwin-arm64");})();
        } catch (e) {
          loadErrors.push(e);
        }
      } else {
        loadErrors.push(new Error(`Unsupported architecture on macOS: ${process.arch}`));
      }
    } else if (process.platform === "freebsd") {
      if (process.arch === "x64") {
        try {
          return (()=>{throw new Error("Cannot require module "+"./parser.freebsd-x64.node");})();
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-freebsd-x64");})();
        } catch (e) {
          loadErrors.push(e);
        }
      } else if (process.arch === "arm64") {
        try {
          return (()=>{throw new Error("Cannot require module "+"./parser.freebsd-arm64.node");})();
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-freebsd-arm64");})();
        } catch (e) {
          loadErrors.push(e);
        }
      } else {
        loadErrors.push(new Error(`Unsupported architecture on FreeBSD: ${process.arch}`));
      }
    } else if (process.platform === "linux") {
      if (process.arch === "x64") {
        if (isMusl()) {
          try {
            return (()=>{throw new Error("Cannot require module "+"./parser.linux-x64-musl.node");})();
          } catch (e) {
            loadErrors.push(e);
          }
          try {
            return require_parser_linux_x64_musl();
          } catch (e) {
            loadErrors.push(e);
          }
        } else {
          try {
            return (()=>{throw new Error("Cannot require module "+"./parser.linux-x64-gnu.node");})();
          } catch (e) {
            loadErrors.push(e);
          }
          try {
            return require_parser_linux_x64_gnu();
          } catch (e) {
            loadErrors.push(e);
          }
        }
      } else if (process.arch === "arm64") {
        if (isMusl()) {
          try {
            return (()=>{throw new Error("Cannot require module "+"./parser.linux-arm64-musl.node");})();
          } catch (e) {
            loadErrors.push(e);
          }
          try {
            return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-linux-arm64-musl");})();
          } catch (e) {
            loadErrors.push(e);
          }
        } else {
          try {
            return (()=>{throw new Error("Cannot require module "+"./parser.linux-arm64-gnu.node");})();
          } catch (e) {
            loadErrors.push(e);
          }
          try {
            return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-linux-arm64-gnu");})();
          } catch (e) {
            loadErrors.push(e);
          }
        }
      } else if (process.arch === "arm") {
        if (isMusl()) {
          try {
            return (()=>{throw new Error("Cannot require module "+"./parser.linux-arm-musleabihf.node");})();
          } catch (e) {
            loadErrors.push(e);
          }
          try {
            return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-linux-arm-musleabihf");})();
          } catch (e) {
            loadErrors.push(e);
          }
        } else {
          try {
            return (()=>{throw new Error("Cannot require module "+"./parser.linux-arm-gnueabihf.node");})();
          } catch (e) {
            loadErrors.push(e);
          }
          try {
            return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-linux-arm-gnueabihf");})();
          } catch (e) {
            loadErrors.push(e);
          }
        }
      } else if (process.arch === "riscv64") {
        if (isMusl()) {
          try {
            return (()=>{throw new Error("Cannot require module "+"./parser.linux-riscv64-musl.node");})();
          } catch (e) {
            loadErrors.push(e);
          }
          try {
            return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-linux-riscv64-musl");})();
          } catch (e) {
            loadErrors.push(e);
          }
        } else {
          try {
            return (()=>{throw new Error("Cannot require module "+"./parser.linux-riscv64-gnu.node");})();
          } catch (e) {
            loadErrors.push(e);
          }
          try {
            return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-linux-riscv64-gnu");})();
          } catch (e) {
            loadErrors.push(e);
          }
        }
      } else if (process.arch === "ppc64") {
        try {
          return (()=>{throw new Error("Cannot require module "+"./parser.linux-ppc64-gnu.node");})();
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-linux-ppc64-gnu");})();
        } catch (e) {
          loadErrors.push(e);
        }
      } else if (process.arch === "s390x") {
        try {
          return (()=>{throw new Error("Cannot require module "+"./parser.linux-s390x-gnu.node");})();
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          return (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-linux-s390x-gnu");})();
        } catch (e) {
          loadErrors.push(e);
        }
      } else {
        loadErrors.push(new Error(`Unsupported architecture on Linux: ${process.arch}`));
      }
    } else {
      loadErrors.push(new Error(`Unsupported OS: ${process.platform}, architecture: ${process.arch}`));
    }
  }
  nativeBinding = requireNative();
  if (!nativeBinding || process.env.NAPI_RS_FORCE_WASI) {
    try {
      nativeBinding = (()=>{throw new Error("Cannot require module "+"./parser.wasi.cjs");})();
    } catch (err) {
      if (process.env.NAPI_RS_FORCE_WASI) {
        loadErrors.push(err);
      }
    }
    if (!nativeBinding) {
      try {
        nativeBinding = (()=>{throw new Error("Cannot require module "+"@oxc-parser/binding-wasm32-wasi");})();
      } catch (err) {
        if (process.env.NAPI_RS_FORCE_WASI) {
          loadErrors.push(err);
        }
      }
    }
  }
  if (!nativeBinding && globalThis.process?.versions?.["webcontainer"]) {
    try {
      nativeBinding = require_webcontainer_fallback();
    } catch (err) {
      loadErrors.push(err);
    }
  }
  if (!nativeBinding) {
    if (loadErrors.length > 0) {
      throw new Error("Failed to load native binding", { cause: loadErrors });
    }
    throw new Error(`Failed to load native binding`);
  }
  exports.ParseResult = nativeBinding.ParseResult;
  exports.ExportExportNameKind = nativeBinding.ExportExportNameKind;
  exports.ExportImportNameKind = nativeBinding.ExportImportNameKind;
  exports.ExportLocalNameKind = nativeBinding.ExportLocalNameKind;
  exports.getBufferOffset = nativeBinding.getBufferOffset;
  exports.ImportNameKind = nativeBinding.ImportNameKind;
  exports.parseAsync = nativeBinding.parseAsync;
  exports.parseSync = nativeBinding.parseSync;
  exports.parseSyncRaw = nativeBinding.parseSyncRaw;
  exports.rawTransferSupported = nativeBinding.rawTransferSupported;
  exports.Severity = nativeBinding.Severity;
});

// node_modules/oxc-parser/wrap.cjs
var require_wrap = __commonJS((exports, module) => {
  exports.wrap = function wrap(result) {
    let program, module2, comments, errors;
    return {
      get program() {
        if (!program)
          program = jsonParseAst(result.program);
        return program;
      },
      get module() {
        if (!module2)
          module2 = result.module;
        return module2;
      },
      get comments() {
        if (!comments)
          comments = result.comments;
        return comments;
      },
      get errors() {
        if (!errors)
          errors = result.errors;
        return errors;
      }
    };
  };
  function jsonParseAst(program) {
    return JSON.parse(program, transform);
  }
  function transform(key, value) {
    if (value === null && key === "value" && Object.hasOwn(this, "type") && this.type === "Literal") {
      if (Object.hasOwn(this, "bigint")) {
        return BigInt(this.bigint);
      }
      if (Object.hasOwn(this, "regex")) {
        const { regex } = this;
        try {
          return RegExp(regex.pattern, regex.flags);
        } catch (_err) {}
      }
    }
    return value;
  }
});

// node_modules/oxc-parser/generated/deserialize/js.js
var require_js = __commonJS((exports, module) => {
  module.exports = deserialize;
  var uint8;
  var uint32;
  var float64;
  var sourceText;
  var sourceIsAscii;
  var sourceLen;
  var textDecoder = new TextDecoder("utf-8", { ignoreBOM: true });
  var decodeStr = textDecoder.decode.bind(textDecoder);
  var { fromCodePoint } = String;
  function deserialize(buffer, sourceTextInput, sourceLenInput) {
    uint8 = buffer;
    uint32 = new Uint32Array(buffer.buffer, buffer.byteOffset);
    float64 = new Float64Array(buffer.buffer, buffer.byteOffset);
    sourceText = sourceTextInput;
    sourceLen = sourceLenInput;
    sourceIsAscii = sourceText.length === sourceLen;
    const metadataPos32 = 536870908;
    const data = deserializeRawTransferData(uint32[metadataPos32]);
    uint8 = uint32 = float64 = sourceText = undefined;
    return data;
  }
  function deserializeProgram(pos) {
    const body = deserializeVecDirective(pos + 88);
    body.push(...deserializeVecStatement(pos + 120));
    const start = deserializeU32(pos);
    const end = deserializeU32(pos + 4);
    const program = {
      type: "Program",
      start,
      end,
      body,
      sourceType: deserializeModuleKind(pos + 9),
      hashbang: deserializeOptionHashbang(pos + 64)
    };
    return program;
  }
  function deserializeIdentifierName(pos) {
    return {
      type: "Identifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeStr(pos + 8)
    };
  }
  function deserializeIdentifierReference(pos) {
    return {
      type: "Identifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeStr(pos + 8)
    };
  }
  function deserializeBindingIdentifier(pos) {
    return {
      type: "Identifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeStr(pos + 8)
    };
  }
  function deserializeLabelIdentifier(pos) {
    return {
      type: "Identifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeStr(pos + 8)
    };
  }
  function deserializeThisExpression(pos) {
    return {
      type: "ThisExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeArrayExpression(pos) {
    return {
      type: "ArrayExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      elements: deserializeVecArrayExpressionElement(pos + 8)
    };
  }
  function deserializeElision(pos) {
    return null;
  }
  function deserializeObjectExpression(pos) {
    return {
      type: "ObjectExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      properties: deserializeVecObjectPropertyKind(pos + 8)
    };
  }
  function deserializeObjectProperty(pos) {
    return {
      type: "Property",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      method: deserializeBool(pos + 48),
      shorthand: deserializeBool(pos + 49),
      computed: deserializeBool(pos + 50),
      key: deserializePropertyKey(pos + 16),
      value: deserializeExpression(pos + 32),
      kind: deserializePropertyKind(pos + 8)
    };
  }
  function deserializeTemplateLiteral(pos) {
    return {
      type: "TemplateLiteral",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expressions: deserializeVecExpression(pos + 40),
      quasis: deserializeVecTemplateElement(pos + 8)
    };
  }
  function deserializeTaggedTemplateExpression(pos) {
    return {
      type: "TaggedTemplateExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      tag: deserializeExpression(pos + 8),
      quasi: deserializeTemplateLiteral(pos + 24)
    };
  }
  function deserializeTemplateElement(pos) {
    const tail = deserializeBool(pos + 40), start = deserializeU32(pos), end = deserializeU32(pos + 4), value = deserializeTemplateElementValue(pos + 8);
    if (value.cooked !== null && deserializeBool(pos + 41)) {
      value.cooked = value.cooked.replace(/\uFFFD(.{4})/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
    }
    return { type: "TemplateElement", start, end, value, tail };
  }
  function deserializeTemplateElementValue(pos) {
    return {
      raw: deserializeStr(pos),
      cooked: deserializeOptionStr(pos + 16)
    };
  }
  function deserializeComputedMemberExpression(pos) {
    return {
      type: "MemberExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      object: deserializeExpression(pos + 8),
      property: deserializeExpression(pos + 24),
      computed: true,
      optional: deserializeBool(pos + 40)
    };
  }
  function deserializeStaticMemberExpression(pos) {
    return {
      type: "MemberExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      object: deserializeExpression(pos + 8),
      property: deserializeIdentifierName(pos + 24),
      computed: false,
      optional: deserializeBool(pos + 48)
    };
  }
  function deserializePrivateFieldExpression(pos) {
    return {
      type: "MemberExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      object: deserializeExpression(pos + 8),
      property: deserializePrivateIdentifier(pos + 24),
      computed: false,
      optional: deserializeBool(pos + 48)
    };
  }
  function deserializeCallExpression(pos) {
    return {
      type: "CallExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      callee: deserializeExpression(pos + 8),
      arguments: deserializeVecArgument(pos + 32),
      optional: deserializeBool(pos + 64)
    };
  }
  function deserializeNewExpression(pos) {
    return {
      type: "NewExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      callee: deserializeExpression(pos + 8),
      arguments: deserializeVecArgument(pos + 24)
    };
  }
  function deserializeMetaProperty(pos) {
    return {
      type: "MetaProperty",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      meta: deserializeIdentifierName(pos + 8),
      property: deserializeIdentifierName(pos + 32)
    };
  }
  function deserializeSpreadElement(pos) {
    return {
      type: "SpreadElement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      argument: deserializeExpression(pos + 8)
    };
  }
  function deserializeUpdateExpression(pos) {
    return {
      type: "UpdateExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      operator: deserializeUpdateOperator(pos + 8),
      prefix: deserializeBool(pos + 9),
      argument: deserializeSimpleAssignmentTarget(pos + 16)
    };
  }
  function deserializeUnaryExpression(pos) {
    return {
      type: "UnaryExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      operator: deserializeUnaryOperator(pos + 8),
      prefix: true,
      argument: deserializeExpression(pos + 16)
    };
  }
  function deserializeBinaryExpression(pos) {
    return {
      type: "BinaryExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      left: deserializeExpression(pos + 8),
      operator: deserializeBinaryOperator(pos + 24),
      right: deserializeExpression(pos + 32)
    };
  }
  function deserializePrivateInExpression(pos) {
    return {
      type: "BinaryExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      left: deserializePrivateIdentifier(pos + 8),
      operator: "in",
      right: deserializeExpression(pos + 32)
    };
  }
  function deserializeLogicalExpression(pos) {
    return {
      type: "LogicalExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      left: deserializeExpression(pos + 8),
      operator: deserializeLogicalOperator(pos + 24),
      right: deserializeExpression(pos + 32)
    };
  }
  function deserializeConditionalExpression(pos) {
    return {
      type: "ConditionalExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      test: deserializeExpression(pos + 8),
      consequent: deserializeExpression(pos + 24),
      alternate: deserializeExpression(pos + 40)
    };
  }
  function deserializeAssignmentExpression(pos) {
    return {
      type: "AssignmentExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      operator: deserializeAssignmentOperator(pos + 8),
      left: deserializeAssignmentTarget(pos + 16),
      right: deserializeExpression(pos + 32)
    };
  }
  function deserializeArrayAssignmentTarget(pos) {
    const elements = deserializeVecOptionAssignmentTargetMaybeDefault(pos + 8);
    const rest = deserializeOptionAssignmentTargetRest(pos + 40);
    if (rest !== null)
      elements.push(rest);
    return {
      type: "ArrayPattern",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      elements
    };
  }
  function deserializeObjectAssignmentTarget(pos) {
    const properties = deserializeVecAssignmentTargetProperty(pos + 8);
    const rest = deserializeOptionAssignmentTargetRest(pos + 40);
    if (rest !== null)
      properties.push(rest);
    return {
      type: "ObjectPattern",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      properties
    };
  }
  function deserializeAssignmentTargetRest(pos) {
    return {
      type: "RestElement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      argument: deserializeAssignmentTarget(pos + 8)
    };
  }
  function deserializeAssignmentTargetWithDefault(pos) {
    return {
      type: "AssignmentPattern",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      left: deserializeAssignmentTarget(pos + 8),
      right: deserializeExpression(pos + 24)
    };
  }
  function deserializeAssignmentTargetPropertyIdentifier(pos) {
    const start = deserializeU32(pos), end = deserializeU32(pos + 4), key = deserializeIdentifierReference(pos + 8);
    const init = deserializeOptionExpression(pos + 40), keyCopy = { ...key }, value = init === null ? keyCopy : {
      type: "AssignmentPattern",
      start,
      end,
      left: keyCopy,
      right: init
    };
    return {
      type: "Property",
      start,
      end,
      method: false,
      shorthand: true,
      computed: false,
      key,
      value,
      kind: "init"
    };
  }
  function deserializeAssignmentTargetPropertyProperty(pos) {
    return {
      type: "Property",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      method: false,
      shorthand: false,
      computed: deserializeBool(pos + 40),
      key: deserializePropertyKey(pos + 8),
      value: deserializeAssignmentTargetMaybeDefault(pos + 24),
      kind: "init"
    };
  }
  function deserializeSequenceExpression(pos) {
    return {
      type: "SequenceExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expressions: deserializeVecExpression(pos + 8)
    };
  }
  function deserializeSuper(pos) {
    return {
      type: "Super",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeAwaitExpression(pos) {
    return {
      type: "AwaitExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      argument: deserializeExpression(pos + 8)
    };
  }
  function deserializeChainExpression(pos) {
    return {
      type: "ChainExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeChainElement(pos + 8)
    };
  }
  function deserializeParenthesizedExpression(pos) {
    return {
      type: "ParenthesizedExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8)
    };
  }
  function deserializeDirective(pos) {
    return {
      type: "ExpressionStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeStringLiteral(pos + 8),
      directive: deserializeStr(pos + 56)
    };
  }
  function deserializeHashbang(pos) {
    return {
      type: "Hashbang",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      value: deserializeStr(pos + 8)
    };
  }
  function deserializeBlockStatement(pos) {
    return {
      type: "BlockStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeVecStatement(pos + 8)
    };
  }
  function deserializeVariableDeclaration(pos) {
    return {
      type: "VariableDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      declarations: deserializeVecVariableDeclarator(pos + 16),
      kind: deserializeVariableDeclarationKind(pos + 8)
    };
  }
  function deserializeVariableDeclarator(pos) {
    return {
      type: "VariableDeclarator",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeBindingPattern(pos + 16),
      init: deserializeOptionExpression(pos + 48)
    };
  }
  function deserializeEmptyStatement(pos) {
    return {
      type: "EmptyStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeExpressionStatement(pos) {
    return {
      type: "ExpressionStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8)
    };
  }
  function deserializeIfStatement(pos) {
    return {
      type: "IfStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      test: deserializeExpression(pos + 8),
      consequent: deserializeStatement(pos + 24),
      alternate: deserializeOptionStatement(pos + 40)
    };
  }
  function deserializeDoWhileStatement(pos) {
    return {
      type: "DoWhileStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeStatement(pos + 8),
      test: deserializeExpression(pos + 24)
    };
  }
  function deserializeWhileStatement(pos) {
    return {
      type: "WhileStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      test: deserializeExpression(pos + 8),
      body: deserializeStatement(pos + 24)
    };
  }
  function deserializeForStatement(pos) {
    return {
      type: "ForStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      init: deserializeOptionForStatementInit(pos + 8),
      test: deserializeOptionExpression(pos + 24),
      update: deserializeOptionExpression(pos + 40),
      body: deserializeStatement(pos + 56)
    };
  }
  function deserializeForInStatement(pos) {
    return {
      type: "ForInStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      left: deserializeForStatementLeft(pos + 8),
      right: deserializeExpression(pos + 24),
      body: deserializeStatement(pos + 40)
    };
  }
  function deserializeForOfStatement(pos) {
    return {
      type: "ForOfStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      await: deserializeBool(pos + 8),
      left: deserializeForStatementLeft(pos + 16),
      right: deserializeExpression(pos + 32),
      body: deserializeStatement(pos + 48)
    };
  }
  function deserializeContinueStatement(pos) {
    return {
      type: "ContinueStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      label: deserializeOptionLabelIdentifier(pos + 8)
    };
  }
  function deserializeBreakStatement(pos) {
    return {
      type: "BreakStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      label: deserializeOptionLabelIdentifier(pos + 8)
    };
  }
  function deserializeReturnStatement(pos) {
    return {
      type: "ReturnStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      argument: deserializeOptionExpression(pos + 8)
    };
  }
  function deserializeWithStatement(pos) {
    return {
      type: "WithStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      object: deserializeExpression(pos + 8),
      body: deserializeStatement(pos + 24)
    };
  }
  function deserializeSwitchStatement(pos) {
    return {
      type: "SwitchStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      discriminant: deserializeExpression(pos + 8),
      cases: deserializeVecSwitchCase(pos + 24)
    };
  }
  function deserializeSwitchCase(pos) {
    return {
      type: "SwitchCase",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      consequent: deserializeVecStatement(pos + 24),
      test: deserializeOptionExpression(pos + 8)
    };
  }
  function deserializeLabeledStatement(pos) {
    return {
      type: "LabeledStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeStatement(pos + 32),
      label: deserializeLabelIdentifier(pos + 8)
    };
  }
  function deserializeThrowStatement(pos) {
    return {
      type: "ThrowStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      argument: deserializeExpression(pos + 8)
    };
  }
  function deserializeTryStatement(pos) {
    return {
      type: "TryStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      block: deserializeBoxBlockStatement(pos + 8),
      handler: deserializeOptionBoxCatchClause(pos + 16),
      finalizer: deserializeOptionBoxBlockStatement(pos + 24)
    };
  }
  function deserializeCatchClause(pos) {
    return {
      type: "CatchClause",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      param: deserializeOptionCatchParameter(pos + 8),
      body: deserializeBoxBlockStatement(pos + 48)
    };
  }
  function deserializeCatchParameter(pos) {
    return {
      ...deserializeBindingPatternKind(pos + 8)
    };
  }
  function deserializeDebuggerStatement(pos) {
    return {
      type: "DebuggerStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeBindingPattern(pos) {
    return {
      ...deserializeBindingPatternKind(pos)
    };
  }
  function deserializeAssignmentPattern(pos) {
    return {
      type: "AssignmentPattern",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      left: deserializeBindingPattern(pos + 8),
      right: deserializeExpression(pos + 40)
    };
  }
  function deserializeObjectPattern(pos) {
    const properties = deserializeVecBindingProperty(pos + 8);
    const rest = deserializeOptionBoxBindingRestElement(pos + 40);
    if (rest !== null)
      properties.push(rest);
    return {
      type: "ObjectPattern",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      properties
    };
  }
  function deserializeBindingProperty(pos) {
    return {
      type: "Property",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      method: false,
      shorthand: deserializeBool(pos + 56),
      computed: deserializeBool(pos + 57),
      key: deserializePropertyKey(pos + 8),
      value: deserializeBindingPattern(pos + 24),
      kind: "init"
    };
  }
  function deserializeArrayPattern(pos) {
    const elements = deserializeVecOptionBindingPattern(pos + 8);
    const rest = deserializeOptionBoxBindingRestElement(pos + 40);
    if (rest !== null)
      elements.push(rest);
    return {
      type: "ArrayPattern",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      elements
    };
  }
  function deserializeBindingRestElement(pos) {
    return {
      type: "RestElement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      argument: deserializeBindingPattern(pos + 8)
    };
  }
  function deserializeFunction(pos) {
    const params = deserializeBoxFormalParameters(pos + 72);
    return {
      type: deserializeFunctionType(pos + 8),
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeOptionBindingIdentifier(pos + 16),
      expression: false,
      generator: deserializeBool(pos + 48),
      async: deserializeBool(pos + 49),
      params,
      body: deserializeOptionBoxFunctionBody(pos + 88)
    };
  }
  function deserializeFormalParameters(pos) {
    const params = deserializeVecFormalParameter(pos + 16);
    if (uint32[pos + 48 >> 2] !== 0 && uint32[pos + 52 >> 2] !== 0) {
      pos = uint32[pos + 48 >> 2];
      params.push({
        type: "RestElement",
        start: deserializeU32(pos),
        end: deserializeU32(pos + 4),
        argument: deserializeBindingPatternKind(pos + 8)
      });
    }
    return params;
  }
  function deserializeFormalParameter(pos) {
    return deserializeBindingPatternKind(pos + 40);
  }
  function deserializeFunctionBody(pos) {
    const body = deserializeVecDirective(pos + 8);
    body.push(...deserializeVecStatement(pos + 40));
    return {
      type: "BlockStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body
    };
  }
  function deserializeArrowFunctionExpression(pos) {
    const expression = deserializeBool(pos + 8);
    let body = deserializeBoxFunctionBody(pos + 40);
    return {
      type: "ArrowFunctionExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: null,
      expression,
      generator: false,
      async: deserializeBool(pos + 9),
      params: deserializeBoxFormalParameters(pos + 24),
      body: expression ? body.body[0].expression : body
    };
  }
  function deserializeYieldExpression(pos) {
    return {
      type: "YieldExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      delegate: deserializeBool(pos + 8),
      argument: deserializeOptionExpression(pos + 16)
    };
  }
  function deserializeClass(pos) {
    return {
      type: deserializeClassType(pos + 8),
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeOptionBindingIdentifier(pos + 48),
      superClass: deserializeOptionExpression(pos + 88),
      body: deserializeBoxClassBody(pos + 144)
    };
  }
  function deserializeClassBody(pos) {
    return {
      type: "ClassBody",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeVecClassElement(pos + 8)
    };
  }
  function deserializeMethodDefinition(pos) {
    return {
      type: deserializeMethodDefinitionType(pos + 8),
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      static: deserializeBool(pos + 74),
      computed: deserializeBool(pos + 73),
      key: deserializePropertyKey(pos + 48),
      kind: deserializeMethodDefinitionKind(pos + 72),
      value: deserializeBoxFunction(pos + 64)
    };
  }
  function deserializePropertyDefinition(pos) {
    return {
      type: deserializePropertyDefinitionType(pos + 8),
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      static: deserializeBool(pos + 81),
      computed: deserializeBool(pos + 80),
      key: deserializePropertyKey(pos + 48),
      value: deserializeOptionExpression(pos + 64)
    };
  }
  function deserializePrivateIdentifier(pos) {
    return {
      type: "PrivateIdentifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeStr(pos + 8)
    };
  }
  function deserializeStaticBlock(pos) {
    return {
      type: "StaticBlock",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeVecStatement(pos + 8)
    };
  }
  function deserializeAccessorProperty(pos) {
    return {
      type: deserializeAccessorPropertyType(pos + 8),
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      key: deserializePropertyKey(pos + 48),
      value: deserializeOptionExpression(pos + 64),
      computed: deserializeBool(pos + 80),
      static: deserializeBool(pos + 81)
    };
  }
  function deserializeImportExpression(pos) {
    return {
      type: "ImportExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      source: deserializeExpression(pos + 8),
      options: deserializeOptionExpression(pos + 24)
    };
  }
  function deserializeImportDeclaration(pos) {
    let specifiers = deserializeOptionVecImportDeclarationSpecifier(pos + 8);
    if (specifiers === null)
      specifiers = [];
    const withClause = deserializeOptionBoxWithClause(pos + 96);
    return {
      type: "ImportDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      specifiers,
      source: deserializeStringLiteral(pos + 40),
      attributes: withClause === null ? [] : withClause.withEntries
    };
  }
  function deserializeImportSpecifier(pos) {
    return {
      type: "ImportSpecifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      imported: deserializeModuleExportName(pos + 8),
      local: deserializeBindingIdentifier(pos + 64)
    };
  }
  function deserializeImportDefaultSpecifier(pos) {
    return {
      type: "ImportDefaultSpecifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      local: deserializeBindingIdentifier(pos + 8)
    };
  }
  function deserializeImportNamespaceSpecifier(pos) {
    return {
      type: "ImportNamespaceSpecifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      local: deserializeBindingIdentifier(pos + 8)
    };
  }
  function deserializeWithClause(pos) {
    return {
      type: "WithClause",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      attributesKeyword: deserializeIdentifierName(pos + 8),
      withEntries: deserializeVecImportAttribute(pos + 32)
    };
  }
  function deserializeImportAttribute(pos) {
    return {
      type: "ImportAttribute",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      key: deserializeImportAttributeKey(pos + 8),
      value: deserializeStringLiteral(pos + 64)
    };
  }
  function deserializeExportNamedDeclaration(pos) {
    const withClause = deserializeOptionBoxWithClause(pos + 112);
    return {
      type: "ExportNamedDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      declaration: deserializeOptionDeclaration(pos + 8),
      specifiers: deserializeVecExportSpecifier(pos + 24),
      source: deserializeOptionStringLiteral(pos + 56),
      attributes: withClause === null ? [] : withClause.withEntries
    };
  }
  function deserializeExportDefaultDeclaration(pos) {
    return {
      type: "ExportDefaultDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      declaration: deserializeExportDefaultDeclarationKind(pos + 64)
    };
  }
  function deserializeExportAllDeclaration(pos) {
    const withClause = deserializeOptionBoxWithClause(pos + 112);
    return {
      type: "ExportAllDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      exported: deserializeOptionModuleExportName(pos + 8),
      source: deserializeStringLiteral(pos + 64),
      attributes: withClause === null ? [] : withClause.withEntries
    };
  }
  function deserializeExportSpecifier(pos) {
    return {
      type: "ExportSpecifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      local: deserializeModuleExportName(pos + 8),
      exported: deserializeModuleExportName(pos + 64)
    };
  }
  function deserializeV8IntrinsicExpression(pos) {
    return {
      type: "V8IntrinsicExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeIdentifierName(pos + 8),
      arguments: deserializeVecArgument(pos + 32)
    };
  }
  function deserializeBooleanLiteral(pos) {
    const start = deserializeU32(pos), end = deserializeU32(pos + 4), value = deserializeBool(pos + 8);
    return {
      type: "Literal",
      start,
      end,
      value,
      raw: start === 0 && end === 0 ? null : value + ""
    };
  }
  function deserializeNullLiteral(pos) {
    const start = deserializeU32(pos), end = deserializeU32(pos + 4);
    return {
      type: "Literal",
      start,
      end,
      value: null,
      raw: start === 0 && end === 0 ? null : "null"
    };
  }
  function deserializeNumericLiteral(pos) {
    return {
      type: "Literal",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      value: deserializeF64(pos + 8),
      raw: deserializeOptionStr(pos + 16)
    };
  }
  function deserializeStringLiteral(pos) {
    let value = deserializeStr(pos + 8);
    if (deserializeBool(pos + 40)) {
      value = value.replace(/\uFFFD(.{4})/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
    }
    return {
      type: "Literal",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      value,
      raw: deserializeOptionStr(pos + 24)
    };
  }
  function deserializeBigIntLiteral(pos) {
    const raw = deserializeStr(pos + 8), bigint = raw.slice(0, -1).replace(/_/g, "");
    return {
      type: "Literal",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      value: BigInt(bigint),
      raw,
      bigint
    };
  }
  function deserializeRegExpLiteral(pos) {
    const regex = deserializeRegExp(pos + 8);
    let value = null;
    try {
      value = new RegExp(regex.pattern, regex.flags);
    } catch (e) {}
    return {
      type: "Literal",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      value,
      raw: deserializeOptionStr(pos + 40),
      regex
    };
  }
  function deserializeRegExp(pos) {
    return {
      pattern: deserializeRegExpPattern(pos),
      flags: deserializeRegExpFlags(pos + 24)
    };
  }
  function deserializeRegExpFlags(pos) {
    const flagBits = deserializeU8(pos);
    let flags = "";
    if (flagBits & 64)
      flags += "d";
    if (flagBits & 1)
      flags += "g";
    if (flagBits & 2)
      flags += "i";
    if (flagBits & 4)
      flags += "m";
    if (flagBits & 8)
      flags += "s";
    if (flagBits & 16)
      flags += "u";
    if (flagBits & 128)
      flags += "v";
    if (flagBits & 32)
      flags += "y";
    return flags;
  }
  function deserializeJSXElement(pos) {
    const closingElement = deserializeOptionBoxJSXClosingElement(pos + 16);
    const openingElement = deserializeBoxJSXOpeningElement(pos + 8);
    if (closingElement === null)
      openingElement.selfClosing = true;
    return {
      type: "JSXElement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      openingElement,
      closingElement,
      children: deserializeVecJSXChild(pos + 24)
    };
  }
  function deserializeJSXOpeningElement(pos) {
    return {
      type: "JSXOpeningElement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      attributes: deserializeVecJSXAttributeItem(pos + 24),
      name: deserializeJSXElementName(pos + 8),
      selfClosing: false
    };
  }
  function deserializeJSXClosingElement(pos) {
    return {
      type: "JSXClosingElement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeJSXElementName(pos + 8)
    };
  }
  function deserializeJSXFragment(pos) {
    return {
      type: "JSXFragment",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      openingFragment: deserializeJSXOpeningFragment(pos + 8),
      closingFragment: deserializeJSXClosingFragment(pos + 16),
      children: deserializeVecJSXChild(pos + 24)
    };
  }
  function deserializeJSXOpeningFragment(pos) {
    const node = {
      type: "JSXOpeningFragment",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      attributes: [],
      selfClosing: false
    };
    return node;
  }
  function deserializeJSXClosingFragment(pos) {
    return {
      type: "JSXClosingFragment",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeJSXNamespacedName(pos) {
    return {
      type: "JSXNamespacedName",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      namespace: deserializeJSXIdentifier(pos + 8),
      name: deserializeJSXIdentifier(pos + 32)
    };
  }
  function deserializeJSXMemberExpression(pos) {
    return {
      type: "JSXMemberExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      object: deserializeJSXMemberExpressionObject(pos + 8),
      property: deserializeJSXIdentifier(pos + 24)
    };
  }
  function deserializeJSXExpressionContainer(pos) {
    return {
      type: "JSXExpressionContainer",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeJSXExpression(pos + 8)
    };
  }
  function deserializeJSXEmptyExpression(pos) {
    return {
      type: "JSXEmptyExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeJSXAttribute(pos) {
    return {
      type: "JSXAttribute",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeJSXAttributeName(pos + 8),
      value: deserializeOptionJSXAttributeValue(pos + 24)
    };
  }
  function deserializeJSXSpreadAttribute(pos) {
    return {
      type: "JSXSpreadAttribute",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      argument: deserializeExpression(pos + 8)
    };
  }
  function deserializeJSXIdentifier(pos) {
    return {
      type: "JSXIdentifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeStr(pos + 8)
    };
  }
  function deserializeJSXSpreadChild(pos) {
    return {
      type: "JSXSpreadChild",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8)
    };
  }
  function deserializeJSXText(pos) {
    return {
      type: "JSXText",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      value: deserializeStr(pos + 8),
      raw: deserializeOptionStr(pos + 24)
    };
  }
  function deserializeTSThisParameter(pos) {
    return {
      type: "Identifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: "this",
      typeAnnotation: deserializeOptionBoxTSTypeAnnotation(pos + 16),
      decorators: [],
      optional: false
    };
  }
  function deserializeTSEnumDeclaration(pos) {
    return {
      type: "TSEnumDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeBindingIdentifier(pos + 8),
      body: deserializeTSEnumBody(pos + 40),
      const: deserializeBool(pos + 80),
      declare: deserializeBool(pos + 81)
    };
  }
  function deserializeTSEnumBody(pos) {
    return {
      type: "TSEnumBody",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      members: deserializeVecTSEnumMember(pos + 8)
    };
  }
  function deserializeTSEnumMember(pos) {
    return {
      type: "TSEnumMember",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeTSEnumMemberName(pos + 8),
      computed: deserializeU8(pos + 8) > 1,
      initializer: deserializeOptionExpression(pos + 24)
    };
  }
  function deserializeTSTypeAnnotation(pos) {
    return {
      type: "TSTypeAnnotation",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeAnnotation: deserializeTSType(pos + 8)
    };
  }
  function deserializeTSLiteralType(pos) {
    return {
      type: "TSLiteralType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      literal: deserializeTSLiteral(pos + 8)
    };
  }
  function deserializeTSConditionalType(pos) {
    return {
      type: "TSConditionalType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      checkType: deserializeTSType(pos + 8),
      extendsType: deserializeTSType(pos + 24),
      trueType: deserializeTSType(pos + 40),
      falseType: deserializeTSType(pos + 56)
    };
  }
  function deserializeTSUnionType(pos) {
    return {
      type: "TSUnionType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      types: deserializeVecTSType(pos + 8)
    };
  }
  function deserializeTSIntersectionType(pos) {
    return {
      type: "TSIntersectionType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      types: deserializeVecTSType(pos + 8)
    };
  }
  function deserializeTSParenthesizedType(pos) {
    return {
      type: "TSParenthesizedType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeAnnotation: deserializeTSType(pos + 8)
    };
  }
  function deserializeTSTypeOperator(pos) {
    return {
      type: "TSTypeOperator",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      operator: deserializeTSTypeOperatorOperator(pos + 8),
      typeAnnotation: deserializeTSType(pos + 16)
    };
  }
  function deserializeTSArrayType(pos) {
    return {
      type: "TSArrayType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      elementType: deserializeTSType(pos + 8)
    };
  }
  function deserializeTSIndexedAccessType(pos) {
    return {
      type: "TSIndexedAccessType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      objectType: deserializeTSType(pos + 8),
      indexType: deserializeTSType(pos + 24)
    };
  }
  function deserializeTSTupleType(pos) {
    return {
      type: "TSTupleType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      elementTypes: deserializeVecTSTupleElement(pos + 8)
    };
  }
  function deserializeTSNamedTupleMember(pos) {
    return {
      type: "TSNamedTupleMember",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      elementType: deserializeTSTupleElement(pos + 8),
      label: deserializeIdentifierName(pos + 24),
      optional: deserializeBool(pos + 48)
    };
  }
  function deserializeTSOptionalType(pos) {
    return {
      type: "TSOptionalType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeAnnotation: deserializeTSType(pos + 8)
    };
  }
  function deserializeTSRestType(pos) {
    return {
      type: "TSRestType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeAnnotation: deserializeTSType(pos + 8)
    };
  }
  function deserializeTSAnyKeyword(pos) {
    return {
      type: "TSAnyKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSStringKeyword(pos) {
    return {
      type: "TSStringKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSBooleanKeyword(pos) {
    return {
      type: "TSBooleanKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSNumberKeyword(pos) {
    return {
      type: "TSNumberKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSNeverKeyword(pos) {
    return {
      type: "TSNeverKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSIntrinsicKeyword(pos) {
    return {
      type: "TSIntrinsicKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSUnknownKeyword(pos) {
    return {
      type: "TSUnknownKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSNullKeyword(pos) {
    return {
      type: "TSNullKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSUndefinedKeyword(pos) {
    return {
      type: "TSUndefinedKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSVoidKeyword(pos) {
    return {
      type: "TSVoidKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSSymbolKeyword(pos) {
    return {
      type: "TSSymbolKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSThisType(pos) {
    return {
      type: "TSThisType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSObjectKeyword(pos) {
    return {
      type: "TSObjectKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSBigIntKeyword(pos) {
    return {
      type: "TSBigIntKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSTypeReference(pos) {
    return {
      type: "TSTypeReference",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeName: deserializeTSTypeName(pos + 8),
      typeArguments: deserializeOptionBoxTSTypeParameterInstantiation(pos + 24)
    };
  }
  function deserializeTSQualifiedName(pos) {
    return {
      type: "TSQualifiedName",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      left: deserializeTSTypeName(pos + 8),
      right: deserializeIdentifierName(pos + 24)
    };
  }
  function deserializeTSTypeParameterInstantiation(pos) {
    return {
      type: "TSTypeParameterInstantiation",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      params: deserializeVecTSType(pos + 8)
    };
  }
  function deserializeTSTypeParameter(pos) {
    return {
      type: "TSTypeParameter",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeBindingIdentifier(pos + 8),
      constraint: deserializeOptionTSType(pos + 40),
      default: deserializeOptionTSType(pos + 56),
      in: deserializeBool(pos + 72),
      out: deserializeBool(pos + 73),
      const: deserializeBool(pos + 74)
    };
  }
  function deserializeTSTypeParameterDeclaration(pos) {
    return {
      type: "TSTypeParameterDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      params: deserializeVecTSTypeParameter(pos + 8)
    };
  }
  function deserializeTSTypeAliasDeclaration(pos) {
    return {
      type: "TSTypeAliasDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeBindingIdentifier(pos + 8),
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 40),
      typeAnnotation: deserializeTSType(pos + 48),
      declare: deserializeBool(pos + 64)
    };
  }
  function deserializeTSInterfaceDeclaration(pos) {
    return {
      type: "TSInterfaceDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeBindingIdentifier(pos + 8),
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 40),
      extends: deserializeVecTSInterfaceHeritage(pos + 48),
      body: deserializeBoxTSInterfaceBody(pos + 80),
      declare: deserializeBool(pos + 88)
    };
  }
  function deserializeTSInterfaceBody(pos) {
    return {
      type: "TSInterfaceBody",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeVecTSSignature(pos + 8)
    };
  }
  function deserializeTSPropertySignature(pos) {
    return {
      type: "TSPropertySignature",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      computed: deserializeBool(pos + 8),
      optional: deserializeBool(pos + 9),
      readonly: deserializeBool(pos + 10),
      key: deserializePropertyKey(pos + 16),
      typeAnnotation: deserializeOptionBoxTSTypeAnnotation(pos + 32),
      accessibility: null,
      static: false
    };
  }
  function deserializeTSIndexSignature(pos) {
    return {
      type: "TSIndexSignature",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      parameters: deserializeVecTSIndexSignatureName(pos + 8),
      typeAnnotation: deserializeBoxTSTypeAnnotation(pos + 40),
      readonly: deserializeBool(pos + 48),
      static: deserializeBool(pos + 49),
      accessibility: null
    };
  }
  function deserializeTSCallSignatureDeclaration(pos) {
    const params = deserializeBoxFormalParameters(pos + 24);
    const thisParam = deserializeOptionBoxTSThisParameter(pos + 16);
    if (thisParam !== null)
      params.unshift(thisParam);
    return {
      type: "TSCallSignatureDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 8),
      params,
      returnType: deserializeOptionBoxTSTypeAnnotation(pos + 32)
    };
  }
  function deserializeTSMethodSignature(pos) {
    const params = deserializeBoxFormalParameters(pos + 48);
    const thisParam = deserializeOptionBoxTSThisParameter(pos + 40);
    if (thisParam !== null)
      params.unshift(thisParam);
    return {
      type: "TSMethodSignature",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      key: deserializePropertyKey(pos + 8),
      computed: deserializeBool(pos + 24),
      optional: deserializeBool(pos + 25),
      kind: deserializeTSMethodSignatureKind(pos + 26),
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 32),
      params,
      returnType: deserializeOptionBoxTSTypeAnnotation(pos + 56),
      accessibility: null,
      readonly: false,
      static: false
    };
  }
  function deserializeTSConstructSignatureDeclaration(pos) {
    return {
      type: "TSConstructSignatureDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 8),
      params: deserializeBoxFormalParameters(pos + 16),
      returnType: deserializeOptionBoxTSTypeAnnotation(pos + 24)
    };
  }
  function deserializeTSIndexSignatureName(pos) {
    return {
      type: "Identifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeStr(pos + 8),
      typeAnnotation: deserializeBoxTSTypeAnnotation(pos + 24),
      decorators: [],
      optional: false
    };
  }
  function deserializeTSInterfaceHeritage(pos) {
    return {
      type: "TSInterfaceHeritage",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8),
      typeArguments: deserializeOptionBoxTSTypeParameterInstantiation(pos + 24)
    };
  }
  function deserializeTSTypePredicate(pos) {
    return {
      type: "TSTypePredicate",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      parameterName: deserializeTSTypePredicateName(pos + 8),
      asserts: deserializeBool(pos + 24),
      typeAnnotation: deserializeOptionBoxTSTypeAnnotation(pos + 32)
    };
  }
  function deserializeTSModuleDeclaration(pos) {
    const kind = deserializeTSModuleDeclarationKind(pos + 80), global = kind === "global", start = deserializeU32(pos), end = deserializeU32(pos + 4), declare = deserializeBool(pos + 81);
    let id = deserializeTSModuleDeclarationName(pos + 8), body = deserializeOptionTSModuleDeclarationBody(pos + 64);
    if (body !== null && body.type === "TSModuleDeclaration") {
      id = {
        type: "TSQualifiedName",
        start: body.id.start,
        end: id.end,
        left: body.id,
        right: id
      };
      body = Object.hasOwn(body, "body") ? body.body : null;
    }
    const node = body === null ? { type: "TSModuleDeclaration", start, end, id, kind, declare, global } : { type: "TSModuleDeclaration", start, end, id, body, kind, declare, global };
    return node;
  }
  function deserializeTSModuleBlock(pos) {
    const body = deserializeVecDirective(pos + 8);
    body.push(...deserializeVecStatement(pos + 40));
    return {
      type: "TSModuleBlock",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body
    };
  }
  function deserializeTSTypeLiteral(pos) {
    return {
      type: "TSTypeLiteral",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      members: deserializeVecTSSignature(pos + 8)
    };
  }
  function deserializeTSInferType(pos) {
    return {
      type: "TSInferType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeParameter: deserializeBoxTSTypeParameter(pos + 8)
    };
  }
  function deserializeTSTypeQuery(pos) {
    return {
      type: "TSTypeQuery",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      exprName: deserializeTSTypeQueryExprName(pos + 8),
      typeArguments: deserializeOptionBoxTSTypeParameterInstantiation(pos + 24)
    };
  }
  function deserializeTSImportType(pos) {
    let options = deserializeOptionBoxObjectExpression(pos + 24);
    if (options !== null && options.properties.length === 1) {
      const prop = options.properties[0];
      if (!prop.method && !prop.shorthand && !prop.computed && prop.key.type === "Identifier" && prop.key.name === "assert") {
        prop.key.name = "with";
      }
    }
    return {
      type: "TSImportType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      argument: deserializeTSType(pos + 8),
      options,
      qualifier: deserializeOptionTSTypeName(pos + 32),
      typeArguments: deserializeOptionBoxTSTypeParameterInstantiation(pos + 48)
    };
  }
  function deserializeTSFunctionType(pos) {
    const params = deserializeBoxFormalParameters(pos + 24);
    const thisParam = deserializeOptionBoxTSThisParameter(pos + 16);
    if (thisParam !== null)
      params.unshift(thisParam);
    return {
      type: "TSFunctionType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 8),
      params,
      returnType: deserializeBoxTSTypeAnnotation(pos + 32)
    };
  }
  function deserializeTSConstructorType(pos) {
    return {
      type: "TSConstructorType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      abstract: deserializeBool(pos + 8),
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 16),
      params: deserializeBoxFormalParameters(pos + 24),
      returnType: deserializeBoxTSTypeAnnotation(pos + 32)
    };
  }
  function deserializeTSMappedType(pos) {
    const typeParameter = deserializeBoxTSTypeParameter(pos + 8);
    return {
      type: "TSMappedType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      nameType: deserializeOptionTSType(pos + 16),
      typeAnnotation: deserializeOptionTSType(pos + 32),
      optional: deserializeOptionTSMappedTypeModifierOperator(pos + 48),
      readonly: deserializeOptionTSMappedTypeModifierOperator(pos + 49),
      key: typeParameter.name,
      constraint: typeParameter.constraint
    };
  }
  function deserializeTSTemplateLiteralType(pos) {
    return {
      type: "TSTemplateLiteralType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      quasis: deserializeVecTemplateElement(pos + 8),
      types: deserializeVecTSType(pos + 40)
    };
  }
  function deserializeTSAsExpression(pos) {
    return {
      type: "TSAsExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8),
      typeAnnotation: deserializeTSType(pos + 24)
    };
  }
  function deserializeTSSatisfiesExpression(pos) {
    return {
      type: "TSSatisfiesExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8),
      typeAnnotation: deserializeTSType(pos + 24)
    };
  }
  function deserializeTSTypeAssertion(pos) {
    return {
      type: "TSTypeAssertion",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8),
      typeAnnotation: deserializeTSType(pos + 24)
    };
  }
  function deserializeTSImportEqualsDeclaration(pos) {
    return {
      type: "TSImportEqualsDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeBindingIdentifier(pos + 8),
      moduleReference: deserializeTSModuleReference(pos + 40),
      importKind: deserializeImportOrExportKind(pos + 56)
    };
  }
  function deserializeTSExternalModuleReference(pos) {
    return {
      type: "TSExternalModuleReference",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeStringLiteral(pos + 8)
    };
  }
  function deserializeTSNonNullExpression(pos) {
    return {
      type: "TSNonNullExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8)
    };
  }
  function deserializeTSExportAssignment(pos) {
    return {
      type: "TSExportAssignment",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8)
    };
  }
  function deserializeTSNamespaceExportDeclaration(pos) {
    return {
      type: "TSNamespaceExportDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeIdentifierName(pos + 8)
    };
  }
  function deserializeTSInstantiationExpression(pos) {
    return {
      type: "TSInstantiationExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8),
      typeArguments: deserializeBoxTSTypeParameterInstantiation(pos + 24)
    };
  }
  function deserializeJSDocNullableType(pos) {
    return {
      type: "TSJSDocNullableType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeAnnotation: deserializeTSType(pos + 8),
      postfix: deserializeBool(pos + 24)
    };
  }
  function deserializeJSDocNonNullableType(pos) {
    return {
      type: "TSJSDocNonNullableType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeAnnotation: deserializeTSType(pos + 8),
      postfix: deserializeBool(pos + 24)
    };
  }
  function deserializeJSDocUnknownType(pos) {
    return {
      type: "TSJSDocUnknownType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeComment(pos) {
    const type = deserializeCommentKind(pos + 12), start = deserializeU32(pos), end = deserializeU32(pos + 4);
    const endCut = type === "Line" ? 0 : 2;
    return {
      type,
      value: sourceText.slice(start + 2, end - endCut),
      start,
      end
    };
  }
  function deserializeNameSpan(pos) {
    return {
      value: deserializeStr(pos),
      start: deserializeU32(pos + 16),
      end: deserializeU32(pos + 20)
    };
  }
  function deserializeImportEntry(pos) {
    return {
      importName: deserializeImportImportName(pos + 32),
      localName: deserializeNameSpan(pos + 64),
      isType: deserializeBool(pos + 88)
    };
  }
  function deserializeExportEntry(pos) {
    return {
      start: deserializeU32(pos + 8),
      end: deserializeU32(pos + 12),
      moduleRequest: deserializeOptionNameSpan(pos + 16),
      importName: deserializeExportImportName(pos + 40),
      exportName: deserializeExportExportName(pos + 72),
      localName: deserializeExportLocalName(pos + 104),
      isType: deserializeBool(pos + 136)
    };
  }
  function deserializeDynamicImport(pos) {
    return {
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      moduleRequest: deserializeSpan(pos + 8)
    };
  }
  function deserializeSpan(pos) {
    return {
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializePattern(pos) {
    return {
      type: "Pattern",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeDisjunction(pos + 8)
    };
  }
  function deserializeDisjunction(pos) {
    return {
      type: "Disjunction",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeVecAlternative(pos + 8)
    };
  }
  function deserializeAlternative(pos) {
    return {
      type: "Alternative",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeVecTerm(pos + 8)
    };
  }
  function deserializeBoundaryAssertion(pos) {
    return {
      type: "BoundaryAssertion",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      kind: deserializeBoundaryAssertionKind(pos + 8)
    };
  }
  function deserializeLookAroundAssertion(pos) {
    return {
      type: "LookAroundAssertion",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      kind: deserializeLookAroundAssertionKind(pos + 8),
      body: deserializeDisjunction(pos + 16)
    };
  }
  function deserializeQuantifier(pos) {
    return {
      type: "Quantifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      min: deserializeU64(pos + 8),
      max: deserializeOptionU64(pos + 16),
      greedy: deserializeBool(pos + 32),
      body: deserializeTerm(pos + 40)
    };
  }
  function deserializeCharacter(pos) {
    return {
      type: "Character",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      kind: deserializeCharacterKind(pos + 8),
      value: deserializeU32(pos + 12)
    };
  }
  function deserializeCharacterClassEscape(pos) {
    return {
      type: "CharacterClassEscape",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      kind: deserializeCharacterClassEscapeKind(pos + 8)
    };
  }
  function deserializeUnicodePropertyEscape(pos) {
    return {
      type: "UnicodePropertyEscape",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      negative: deserializeBool(pos + 8),
      strings: deserializeBool(pos + 9),
      name: deserializeStr(pos + 16),
      value: deserializeOptionStr(pos + 32)
    };
  }
  function deserializeDot(pos) {
    return {
      type: "Dot",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeCharacterClass(pos) {
    return {
      type: "CharacterClass",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      negative: deserializeBool(pos + 8),
      strings: deserializeBool(pos + 9),
      kind: deserializeCharacterClassContentsKind(pos + 10),
      body: deserializeVecCharacterClassContents(pos + 16)
    };
  }
  function deserializeCharacterClassRange(pos) {
    return {
      type: "CharacterClassRange",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      min: deserializeCharacter(pos + 8),
      max: deserializeCharacter(pos + 24)
    };
  }
  function deserializeClassStringDisjunction(pos) {
    return {
      type: "ClassStringDisjunction",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      strings: deserializeBool(pos + 8),
      body: deserializeVecClassString(pos + 16)
    };
  }
  function deserializeClassString(pos) {
    return {
      type: "ClassString",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      strings: deserializeBool(pos + 8),
      body: deserializeVecCharacter(pos + 16)
    };
  }
  function deserializeCapturingGroup(pos) {
    return {
      type: "CapturingGroup",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeOptionStr(pos + 8),
      body: deserializeDisjunction(pos + 24)
    };
  }
  function deserializeIgnoreGroup(pos) {
    return {
      type: "IgnoreGroup",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      modifiers: deserializeOptionModifiers(pos + 8),
      body: deserializeDisjunction(pos + 24)
    };
  }
  function deserializeModifiers(pos) {
    return {
      type: "Modifiers",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      enabling: deserializeOptionModifier(pos + 8),
      disabling: deserializeOptionModifier(pos + 11)
    };
  }
  function deserializeModifier(pos) {
    return {
      type: "Modifier",
      ignoreCase: deserializeBool(pos),
      multiline: deserializeBool(pos + 1),
      sticky: deserializeBool(pos + 2)
    };
  }
  function deserializeIndexedReference(pos) {
    return {
      type: "IndexedReference",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      index: deserializeU32(pos + 8)
    };
  }
  function deserializeNamedReference(pos) {
    return {
      type: "NamedReference",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeStr(pos + 8)
    };
  }
  function deserializeRawTransferData(pos) {
    return {
      program: deserializeProgram(pos),
      comments: deserializeVecComment(pos + 160),
      module: deserializeEcmaScriptModule(pos + 192),
      errors: deserializeVecError(pos + 328)
    };
  }
  function deserializeError(pos) {
    return {
      severity: deserializeErrorSeverity(pos),
      message: deserializeStr(pos + 8),
      labels: deserializeVecErrorLabel(pos + 24),
      helpMessage: deserializeOptionStr(pos + 56)
    };
  }
  function deserializeErrorLabel(pos) {
    return {
      message: deserializeOptionStr(pos),
      start: deserializeU32(pos + 16),
      end: deserializeU32(pos + 20)
    };
  }
  function deserializeEcmaScriptModule(pos) {
    return {
      hasModuleSyntax: deserializeBool(pos),
      staticImports: deserializeVecStaticImport(pos + 8),
      staticExports: deserializeVecStaticExport(pos + 40),
      dynamicImports: deserializeVecDynamicImport(pos + 72),
      importMetas: deserializeVecSpan(pos + 104)
    };
  }
  function deserializeStaticImport(pos) {
    return {
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      moduleRequest: deserializeNameSpan(pos + 8),
      entries: deserializeVecImportEntry(pos + 32)
    };
  }
  function deserializeStaticExport(pos) {
    return {
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      entries: deserializeVecExportEntry(pos + 8)
    };
  }
  function deserializeExpression(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBooleanLiteral(pos + 8);
      case 1:
        return deserializeBoxNullLiteral(pos + 8);
      case 2:
        return deserializeBoxNumericLiteral(pos + 8);
      case 3:
        return deserializeBoxBigIntLiteral(pos + 8);
      case 4:
        return deserializeBoxRegExpLiteral(pos + 8);
      case 5:
        return deserializeBoxStringLiteral(pos + 8);
      case 6:
        return deserializeBoxTemplateLiteral(pos + 8);
      case 7:
        return deserializeBoxIdentifierReference(pos + 8);
      case 8:
        return deserializeBoxMetaProperty(pos + 8);
      case 9:
        return deserializeBoxSuper(pos + 8);
      case 10:
        return deserializeBoxArrayExpression(pos + 8);
      case 11:
        return deserializeBoxArrowFunctionExpression(pos + 8);
      case 12:
        return deserializeBoxAssignmentExpression(pos + 8);
      case 13:
        return deserializeBoxAwaitExpression(pos + 8);
      case 14:
        return deserializeBoxBinaryExpression(pos + 8);
      case 15:
        return deserializeBoxCallExpression(pos + 8);
      case 16:
        return deserializeBoxChainExpression(pos + 8);
      case 17:
        return deserializeBoxClass(pos + 8);
      case 18:
        return deserializeBoxConditionalExpression(pos + 8);
      case 19:
        return deserializeBoxFunction(pos + 8);
      case 20:
        return deserializeBoxImportExpression(pos + 8);
      case 21:
        return deserializeBoxLogicalExpression(pos + 8);
      case 22:
        return deserializeBoxNewExpression(pos + 8);
      case 23:
        return deserializeBoxObjectExpression(pos + 8);
      case 24:
        return deserializeBoxParenthesizedExpression(pos + 8);
      case 25:
        return deserializeBoxSequenceExpression(pos + 8);
      case 26:
        return deserializeBoxTaggedTemplateExpression(pos + 8);
      case 27:
        return deserializeBoxThisExpression(pos + 8);
      case 28:
        return deserializeBoxUnaryExpression(pos + 8);
      case 29:
        return deserializeBoxUpdateExpression(pos + 8);
      case 30:
        return deserializeBoxYieldExpression(pos + 8);
      case 31:
        return deserializeBoxPrivateInExpression(pos + 8);
      case 32:
        return deserializeBoxJSXElement(pos + 8);
      case 33:
        return deserializeBoxJSXFragment(pos + 8);
      case 34:
        return deserializeBoxTSAsExpression(pos + 8);
      case 35:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 36:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 37:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 38:
        return deserializeBoxTSInstantiationExpression(pos + 8);
      case 39:
        return deserializeBoxV8IntrinsicExpression(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for Expression`);
    }
  }
  function deserializeArrayExpressionElement(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBooleanLiteral(pos + 8);
      case 1:
        return deserializeBoxNullLiteral(pos + 8);
      case 2:
        return deserializeBoxNumericLiteral(pos + 8);
      case 3:
        return deserializeBoxBigIntLiteral(pos + 8);
      case 4:
        return deserializeBoxRegExpLiteral(pos + 8);
      case 5:
        return deserializeBoxStringLiteral(pos + 8);
      case 6:
        return deserializeBoxTemplateLiteral(pos + 8);
      case 7:
        return deserializeBoxIdentifierReference(pos + 8);
      case 8:
        return deserializeBoxMetaProperty(pos + 8);
      case 9:
        return deserializeBoxSuper(pos + 8);
      case 10:
        return deserializeBoxArrayExpression(pos + 8);
      case 11:
        return deserializeBoxArrowFunctionExpression(pos + 8);
      case 12:
        return deserializeBoxAssignmentExpression(pos + 8);
      case 13:
        return deserializeBoxAwaitExpression(pos + 8);
      case 14:
        return deserializeBoxBinaryExpression(pos + 8);
      case 15:
        return deserializeBoxCallExpression(pos + 8);
      case 16:
        return deserializeBoxChainExpression(pos + 8);
      case 17:
        return deserializeBoxClass(pos + 8);
      case 18:
        return deserializeBoxConditionalExpression(pos + 8);
      case 19:
        return deserializeBoxFunction(pos + 8);
      case 20:
        return deserializeBoxImportExpression(pos + 8);
      case 21:
        return deserializeBoxLogicalExpression(pos + 8);
      case 22:
        return deserializeBoxNewExpression(pos + 8);
      case 23:
        return deserializeBoxObjectExpression(pos + 8);
      case 24:
        return deserializeBoxParenthesizedExpression(pos + 8);
      case 25:
        return deserializeBoxSequenceExpression(pos + 8);
      case 26:
        return deserializeBoxTaggedTemplateExpression(pos + 8);
      case 27:
        return deserializeBoxThisExpression(pos + 8);
      case 28:
        return deserializeBoxUnaryExpression(pos + 8);
      case 29:
        return deserializeBoxUpdateExpression(pos + 8);
      case 30:
        return deserializeBoxYieldExpression(pos + 8);
      case 31:
        return deserializeBoxPrivateInExpression(pos + 8);
      case 32:
        return deserializeBoxJSXElement(pos + 8);
      case 33:
        return deserializeBoxJSXFragment(pos + 8);
      case 34:
        return deserializeBoxTSAsExpression(pos + 8);
      case 35:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 36:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 37:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 38:
        return deserializeBoxTSInstantiationExpression(pos + 8);
      case 39:
        return deserializeBoxV8IntrinsicExpression(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      case 64:
        return deserializeBoxSpreadElement(pos + 8);
      case 65:
        return deserializeElision(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ArrayExpressionElement`);
    }
  }
  function deserializeObjectPropertyKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxObjectProperty(pos + 8);
      case 1:
        return deserializeBoxSpreadElement(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ObjectPropertyKind`);
    }
  }
  function deserializePropertyKey(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBooleanLiteral(pos + 8);
      case 1:
        return deserializeBoxNullLiteral(pos + 8);
      case 2:
        return deserializeBoxNumericLiteral(pos + 8);
      case 3:
        return deserializeBoxBigIntLiteral(pos + 8);
      case 4:
        return deserializeBoxRegExpLiteral(pos + 8);
      case 5:
        return deserializeBoxStringLiteral(pos + 8);
      case 6:
        return deserializeBoxTemplateLiteral(pos + 8);
      case 7:
        return deserializeBoxIdentifierReference(pos + 8);
      case 8:
        return deserializeBoxMetaProperty(pos + 8);
      case 9:
        return deserializeBoxSuper(pos + 8);
      case 10:
        return deserializeBoxArrayExpression(pos + 8);
      case 11:
        return deserializeBoxArrowFunctionExpression(pos + 8);
      case 12:
        return deserializeBoxAssignmentExpression(pos + 8);
      case 13:
        return deserializeBoxAwaitExpression(pos + 8);
      case 14:
        return deserializeBoxBinaryExpression(pos + 8);
      case 15:
        return deserializeBoxCallExpression(pos + 8);
      case 16:
        return deserializeBoxChainExpression(pos + 8);
      case 17:
        return deserializeBoxClass(pos + 8);
      case 18:
        return deserializeBoxConditionalExpression(pos + 8);
      case 19:
        return deserializeBoxFunction(pos + 8);
      case 20:
        return deserializeBoxImportExpression(pos + 8);
      case 21:
        return deserializeBoxLogicalExpression(pos + 8);
      case 22:
        return deserializeBoxNewExpression(pos + 8);
      case 23:
        return deserializeBoxObjectExpression(pos + 8);
      case 24:
        return deserializeBoxParenthesizedExpression(pos + 8);
      case 25:
        return deserializeBoxSequenceExpression(pos + 8);
      case 26:
        return deserializeBoxTaggedTemplateExpression(pos + 8);
      case 27:
        return deserializeBoxThisExpression(pos + 8);
      case 28:
        return deserializeBoxUnaryExpression(pos + 8);
      case 29:
        return deserializeBoxUpdateExpression(pos + 8);
      case 30:
        return deserializeBoxYieldExpression(pos + 8);
      case 31:
        return deserializeBoxPrivateInExpression(pos + 8);
      case 32:
        return deserializeBoxJSXElement(pos + 8);
      case 33:
        return deserializeBoxJSXFragment(pos + 8);
      case 34:
        return deserializeBoxTSAsExpression(pos + 8);
      case 35:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 36:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 37:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 38:
        return deserializeBoxTSInstantiationExpression(pos + 8);
      case 39:
        return deserializeBoxV8IntrinsicExpression(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      case 64:
        return deserializeBoxIdentifierName(pos + 8);
      case 65:
        return deserializeBoxPrivateIdentifier(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for PropertyKey`);
    }
  }
  function deserializePropertyKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "init";
      case 1:
        return "get";
      case 2:
        return "set";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for PropertyKind`);
    }
  }
  function deserializeArgument(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBooleanLiteral(pos + 8);
      case 1:
        return deserializeBoxNullLiteral(pos + 8);
      case 2:
        return deserializeBoxNumericLiteral(pos + 8);
      case 3:
        return deserializeBoxBigIntLiteral(pos + 8);
      case 4:
        return deserializeBoxRegExpLiteral(pos + 8);
      case 5:
        return deserializeBoxStringLiteral(pos + 8);
      case 6:
        return deserializeBoxTemplateLiteral(pos + 8);
      case 7:
        return deserializeBoxIdentifierReference(pos + 8);
      case 8:
        return deserializeBoxMetaProperty(pos + 8);
      case 9:
        return deserializeBoxSuper(pos + 8);
      case 10:
        return deserializeBoxArrayExpression(pos + 8);
      case 11:
        return deserializeBoxArrowFunctionExpression(pos + 8);
      case 12:
        return deserializeBoxAssignmentExpression(pos + 8);
      case 13:
        return deserializeBoxAwaitExpression(pos + 8);
      case 14:
        return deserializeBoxBinaryExpression(pos + 8);
      case 15:
        return deserializeBoxCallExpression(pos + 8);
      case 16:
        return deserializeBoxChainExpression(pos + 8);
      case 17:
        return deserializeBoxClass(pos + 8);
      case 18:
        return deserializeBoxConditionalExpression(pos + 8);
      case 19:
        return deserializeBoxFunction(pos + 8);
      case 20:
        return deserializeBoxImportExpression(pos + 8);
      case 21:
        return deserializeBoxLogicalExpression(pos + 8);
      case 22:
        return deserializeBoxNewExpression(pos + 8);
      case 23:
        return deserializeBoxObjectExpression(pos + 8);
      case 24:
        return deserializeBoxParenthesizedExpression(pos + 8);
      case 25:
        return deserializeBoxSequenceExpression(pos + 8);
      case 26:
        return deserializeBoxTaggedTemplateExpression(pos + 8);
      case 27:
        return deserializeBoxThisExpression(pos + 8);
      case 28:
        return deserializeBoxUnaryExpression(pos + 8);
      case 29:
        return deserializeBoxUpdateExpression(pos + 8);
      case 30:
        return deserializeBoxYieldExpression(pos + 8);
      case 31:
        return deserializeBoxPrivateInExpression(pos + 8);
      case 32:
        return deserializeBoxJSXElement(pos + 8);
      case 33:
        return deserializeBoxJSXFragment(pos + 8);
      case 34:
        return deserializeBoxTSAsExpression(pos + 8);
      case 35:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 36:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 37:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 38:
        return deserializeBoxTSInstantiationExpression(pos + 8);
      case 39:
        return deserializeBoxV8IntrinsicExpression(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      case 64:
        return deserializeBoxSpreadElement(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for Argument`);
    }
  }
  function deserializeAssignmentTarget(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxIdentifierReference(pos + 8);
      case 1:
        return deserializeBoxTSAsExpression(pos + 8);
      case 2:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 3:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 4:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 8:
        return deserializeBoxArrayAssignmentTarget(pos + 8);
      case 9:
        return deserializeBoxObjectAssignmentTarget(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for AssignmentTarget`);
    }
  }
  function deserializeSimpleAssignmentTarget(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxIdentifierReference(pos + 8);
      case 1:
        return deserializeBoxTSAsExpression(pos + 8);
      case 2:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 3:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 4:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for SimpleAssignmentTarget`);
    }
  }
  function deserializeAssignmentTargetMaybeDefault(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxIdentifierReference(pos + 8);
      case 1:
        return deserializeBoxTSAsExpression(pos + 8);
      case 2:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 3:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 4:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 8:
        return deserializeBoxArrayAssignmentTarget(pos + 8);
      case 9:
        return deserializeBoxObjectAssignmentTarget(pos + 8);
      case 16:
        return deserializeBoxAssignmentTargetWithDefault(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for AssignmentTargetMaybeDefault`);
    }
  }
  function deserializeAssignmentTargetProperty(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxAssignmentTargetPropertyIdentifier(pos + 8);
      case 1:
        return deserializeBoxAssignmentTargetPropertyProperty(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for AssignmentTargetProperty`);
    }
  }
  function deserializeChainElement(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxCallExpression(pos + 8);
      case 1:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ChainElement`);
    }
  }
  function deserializeStatement(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBlockStatement(pos + 8);
      case 1:
        return deserializeBoxBreakStatement(pos + 8);
      case 2:
        return deserializeBoxContinueStatement(pos + 8);
      case 3:
        return deserializeBoxDebuggerStatement(pos + 8);
      case 4:
        return deserializeBoxDoWhileStatement(pos + 8);
      case 5:
        return deserializeBoxEmptyStatement(pos + 8);
      case 6:
        return deserializeBoxExpressionStatement(pos + 8);
      case 7:
        return deserializeBoxForInStatement(pos + 8);
      case 8:
        return deserializeBoxForOfStatement(pos + 8);
      case 9:
        return deserializeBoxForStatement(pos + 8);
      case 10:
        return deserializeBoxIfStatement(pos + 8);
      case 11:
        return deserializeBoxLabeledStatement(pos + 8);
      case 12:
        return deserializeBoxReturnStatement(pos + 8);
      case 13:
        return deserializeBoxSwitchStatement(pos + 8);
      case 14:
        return deserializeBoxThrowStatement(pos + 8);
      case 15:
        return deserializeBoxTryStatement(pos + 8);
      case 16:
        return deserializeBoxWhileStatement(pos + 8);
      case 17:
        return deserializeBoxWithStatement(pos + 8);
      case 32:
        return deserializeBoxVariableDeclaration(pos + 8);
      case 33:
        return deserializeBoxFunction(pos + 8);
      case 34:
        return deserializeBoxClass(pos + 8);
      case 35:
        return deserializeBoxTSTypeAliasDeclaration(pos + 8);
      case 36:
        return deserializeBoxTSInterfaceDeclaration(pos + 8);
      case 37:
        return deserializeBoxTSEnumDeclaration(pos + 8);
      case 38:
        return deserializeBoxTSModuleDeclaration(pos + 8);
      case 39:
        return deserializeBoxTSImportEqualsDeclaration(pos + 8);
      case 64:
        return deserializeBoxImportDeclaration(pos + 8);
      case 65:
        return deserializeBoxExportAllDeclaration(pos + 8);
      case 66:
        return deserializeBoxExportDefaultDeclaration(pos + 8);
      case 67:
        return deserializeBoxExportNamedDeclaration(pos + 8);
      case 68:
        return deserializeBoxTSExportAssignment(pos + 8);
      case 69:
        return deserializeBoxTSNamespaceExportDeclaration(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for Statement`);
    }
  }
  function deserializeDeclaration(pos) {
    switch (uint8[pos]) {
      case 32:
        return deserializeBoxVariableDeclaration(pos + 8);
      case 33:
        return deserializeBoxFunction(pos + 8);
      case 34:
        return deserializeBoxClass(pos + 8);
      case 35:
        return deserializeBoxTSTypeAliasDeclaration(pos + 8);
      case 36:
        return deserializeBoxTSInterfaceDeclaration(pos + 8);
      case 37:
        return deserializeBoxTSEnumDeclaration(pos + 8);
      case 38:
        return deserializeBoxTSModuleDeclaration(pos + 8);
      case 39:
        return deserializeBoxTSImportEqualsDeclaration(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for Declaration`);
    }
  }
  function deserializeVariableDeclarationKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "var";
      case 1:
        return "let";
      case 2:
        return "const";
      case 3:
        return "using";
      case 4:
        return "await using";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for VariableDeclarationKind`);
    }
  }
  function deserializeForStatementInit(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBooleanLiteral(pos + 8);
      case 1:
        return deserializeBoxNullLiteral(pos + 8);
      case 2:
        return deserializeBoxNumericLiteral(pos + 8);
      case 3:
        return deserializeBoxBigIntLiteral(pos + 8);
      case 4:
        return deserializeBoxRegExpLiteral(pos + 8);
      case 5:
        return deserializeBoxStringLiteral(pos + 8);
      case 6:
        return deserializeBoxTemplateLiteral(pos + 8);
      case 7:
        return deserializeBoxIdentifierReference(pos + 8);
      case 8:
        return deserializeBoxMetaProperty(pos + 8);
      case 9:
        return deserializeBoxSuper(pos + 8);
      case 10:
        return deserializeBoxArrayExpression(pos + 8);
      case 11:
        return deserializeBoxArrowFunctionExpression(pos + 8);
      case 12:
        return deserializeBoxAssignmentExpression(pos + 8);
      case 13:
        return deserializeBoxAwaitExpression(pos + 8);
      case 14:
        return deserializeBoxBinaryExpression(pos + 8);
      case 15:
        return deserializeBoxCallExpression(pos + 8);
      case 16:
        return deserializeBoxChainExpression(pos + 8);
      case 17:
        return deserializeBoxClass(pos + 8);
      case 18:
        return deserializeBoxConditionalExpression(pos + 8);
      case 19:
        return deserializeBoxFunction(pos + 8);
      case 20:
        return deserializeBoxImportExpression(pos + 8);
      case 21:
        return deserializeBoxLogicalExpression(pos + 8);
      case 22:
        return deserializeBoxNewExpression(pos + 8);
      case 23:
        return deserializeBoxObjectExpression(pos + 8);
      case 24:
        return deserializeBoxParenthesizedExpression(pos + 8);
      case 25:
        return deserializeBoxSequenceExpression(pos + 8);
      case 26:
        return deserializeBoxTaggedTemplateExpression(pos + 8);
      case 27:
        return deserializeBoxThisExpression(pos + 8);
      case 28:
        return deserializeBoxUnaryExpression(pos + 8);
      case 29:
        return deserializeBoxUpdateExpression(pos + 8);
      case 30:
        return deserializeBoxYieldExpression(pos + 8);
      case 31:
        return deserializeBoxPrivateInExpression(pos + 8);
      case 32:
        return deserializeBoxJSXElement(pos + 8);
      case 33:
        return deserializeBoxJSXFragment(pos + 8);
      case 34:
        return deserializeBoxTSAsExpression(pos + 8);
      case 35:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 36:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 37:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 38:
        return deserializeBoxTSInstantiationExpression(pos + 8);
      case 39:
        return deserializeBoxV8IntrinsicExpression(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      case 64:
        return deserializeBoxVariableDeclaration(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ForStatementInit`);
    }
  }
  function deserializeForStatementLeft(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxIdentifierReference(pos + 8);
      case 1:
        return deserializeBoxTSAsExpression(pos + 8);
      case 2:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 3:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 4:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 8:
        return deserializeBoxArrayAssignmentTarget(pos + 8);
      case 9:
        return deserializeBoxObjectAssignmentTarget(pos + 8);
      case 16:
        return deserializeBoxVariableDeclaration(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ForStatementLeft`);
    }
  }
  function deserializeBindingPatternKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBindingIdentifier(pos + 8);
      case 1:
        return deserializeBoxObjectPattern(pos + 8);
      case 2:
        return deserializeBoxArrayPattern(pos + 8);
      case 3:
        return deserializeBoxAssignmentPattern(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for BindingPatternKind`);
    }
  }
  function deserializeFunctionType(pos) {
    switch (uint8[pos]) {
      case 0:
        return "FunctionDeclaration";
      case 1:
        return "FunctionExpression";
      case 2:
        return "TSDeclareFunction";
      case 3:
        return "TSEmptyBodyFunctionExpression";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for FunctionType`);
    }
  }
  function deserializeClassType(pos) {
    switch (uint8[pos]) {
      case 0:
        return "ClassDeclaration";
      case 1:
        return "ClassExpression";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ClassType`);
    }
  }
  function deserializeClassElement(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxStaticBlock(pos + 8);
      case 1:
        return deserializeBoxMethodDefinition(pos + 8);
      case 2:
        return deserializeBoxPropertyDefinition(pos + 8);
      case 3:
        return deserializeBoxAccessorProperty(pos + 8);
      case 4:
        return deserializeBoxTSIndexSignature(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ClassElement`);
    }
  }
  function deserializeMethodDefinitionType(pos) {
    switch (uint8[pos]) {
      case 0:
        return "MethodDefinition";
      case 1:
        return "TSAbstractMethodDefinition";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for MethodDefinitionType`);
    }
  }
  function deserializePropertyDefinitionType(pos) {
    switch (uint8[pos]) {
      case 0:
        return "PropertyDefinition";
      case 1:
        return "TSAbstractPropertyDefinition";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for PropertyDefinitionType`);
    }
  }
  function deserializeMethodDefinitionKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "constructor";
      case 1:
        return "method";
      case 2:
        return "get";
      case 3:
        return "set";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for MethodDefinitionKind`);
    }
  }
  function deserializeAccessorPropertyType(pos) {
    switch (uint8[pos]) {
      case 0:
        return "AccessorProperty";
      case 1:
        return "TSAbstractAccessorProperty";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for AccessorPropertyType`);
    }
  }
  function deserializeImportDeclarationSpecifier(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxImportSpecifier(pos + 8);
      case 1:
        return deserializeBoxImportDefaultSpecifier(pos + 8);
      case 2:
        return deserializeBoxImportNamespaceSpecifier(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ImportDeclarationSpecifier`);
    }
  }
  function deserializeImportAttributeKey(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeIdentifierName(pos + 8);
      case 1:
        return deserializeStringLiteral(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ImportAttributeKey`);
    }
  }
  function deserializeExportDefaultDeclarationKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBooleanLiteral(pos + 8);
      case 1:
        return deserializeBoxNullLiteral(pos + 8);
      case 2:
        return deserializeBoxNumericLiteral(pos + 8);
      case 3:
        return deserializeBoxBigIntLiteral(pos + 8);
      case 4:
        return deserializeBoxRegExpLiteral(pos + 8);
      case 5:
        return deserializeBoxStringLiteral(pos + 8);
      case 6:
        return deserializeBoxTemplateLiteral(pos + 8);
      case 7:
        return deserializeBoxIdentifierReference(pos + 8);
      case 8:
        return deserializeBoxMetaProperty(pos + 8);
      case 9:
        return deserializeBoxSuper(pos + 8);
      case 10:
        return deserializeBoxArrayExpression(pos + 8);
      case 11:
        return deserializeBoxArrowFunctionExpression(pos + 8);
      case 12:
        return deserializeBoxAssignmentExpression(pos + 8);
      case 13:
        return deserializeBoxAwaitExpression(pos + 8);
      case 14:
        return deserializeBoxBinaryExpression(pos + 8);
      case 15:
        return deserializeBoxCallExpression(pos + 8);
      case 16:
        return deserializeBoxChainExpression(pos + 8);
      case 17:
        return deserializeBoxClass(pos + 8);
      case 18:
        return deserializeBoxConditionalExpression(pos + 8);
      case 19:
        return deserializeBoxFunction(pos + 8);
      case 20:
        return deserializeBoxImportExpression(pos + 8);
      case 21:
        return deserializeBoxLogicalExpression(pos + 8);
      case 22:
        return deserializeBoxNewExpression(pos + 8);
      case 23:
        return deserializeBoxObjectExpression(pos + 8);
      case 24:
        return deserializeBoxParenthesizedExpression(pos + 8);
      case 25:
        return deserializeBoxSequenceExpression(pos + 8);
      case 26:
        return deserializeBoxTaggedTemplateExpression(pos + 8);
      case 27:
        return deserializeBoxThisExpression(pos + 8);
      case 28:
        return deserializeBoxUnaryExpression(pos + 8);
      case 29:
        return deserializeBoxUpdateExpression(pos + 8);
      case 30:
        return deserializeBoxYieldExpression(pos + 8);
      case 31:
        return deserializeBoxPrivateInExpression(pos + 8);
      case 32:
        return deserializeBoxJSXElement(pos + 8);
      case 33:
        return deserializeBoxJSXFragment(pos + 8);
      case 34:
        return deserializeBoxTSAsExpression(pos + 8);
      case 35:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 36:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 37:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 38:
        return deserializeBoxTSInstantiationExpression(pos + 8);
      case 39:
        return deserializeBoxV8IntrinsicExpression(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      case 64:
        return deserializeBoxFunction(pos + 8);
      case 65:
        return deserializeBoxClass(pos + 8);
      case 66:
        return deserializeBoxTSInterfaceDeclaration(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ExportDefaultDeclarationKind`);
    }
  }
  function deserializeModuleExportName(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeIdentifierName(pos + 8);
      case 1:
        return deserializeIdentifierReference(pos + 8);
      case 2:
        return deserializeStringLiteral(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ModuleExportName`);
    }
  }
  function deserializeRegExpPattern(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeStr(pos + 8);
      case 1:
        return deserializeStr(pos + 8);
      case 2:
        return deserializeBoxPattern(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for RegExpPattern`);
    }
  }
  function deserializeJSXElementName(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxJSXIdentifier(pos + 8);
      case 1:
        const ident = deserializeBoxIdentifierReference(pos + 8);
        return { type: "JSXIdentifier", start: ident.start, end: ident.end, name: ident.name };
      case 2:
        return deserializeBoxJSXNamespacedName(pos + 8);
      case 3:
        return deserializeBoxJSXMemberExpression(pos + 8);
      case 4:
        const thisExpr = deserializeBoxThisExpression(pos + 8);
        return { type: "JSXIdentifier", start: thisExpr.start, end: thisExpr.end, name: "this" };
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for JSXElementName`);
    }
  }
  function deserializeJSXMemberExpressionObject(pos) {
    switch (uint8[pos]) {
      case 0:
        const ident = deserializeBoxIdentifierReference(pos + 8);
        return { type: "JSXIdentifier", start: ident.start, end: ident.end, name: ident.name };
      case 1:
        return deserializeBoxJSXMemberExpression(pos + 8);
      case 2:
        const thisExpr = deserializeBoxThisExpression(pos + 8);
        return { type: "JSXIdentifier", start: thisExpr.start, end: thisExpr.end, name: "this" };
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for JSXMemberExpressionObject`);
    }
  }
  function deserializeJSXExpression(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBooleanLiteral(pos + 8);
      case 1:
        return deserializeBoxNullLiteral(pos + 8);
      case 2:
        return deserializeBoxNumericLiteral(pos + 8);
      case 3:
        return deserializeBoxBigIntLiteral(pos + 8);
      case 4:
        return deserializeBoxRegExpLiteral(pos + 8);
      case 5:
        return deserializeBoxStringLiteral(pos + 8);
      case 6:
        return deserializeBoxTemplateLiteral(pos + 8);
      case 7:
        return deserializeBoxIdentifierReference(pos + 8);
      case 8:
        return deserializeBoxMetaProperty(pos + 8);
      case 9:
        return deserializeBoxSuper(pos + 8);
      case 10:
        return deserializeBoxArrayExpression(pos + 8);
      case 11:
        return deserializeBoxArrowFunctionExpression(pos + 8);
      case 12:
        return deserializeBoxAssignmentExpression(pos + 8);
      case 13:
        return deserializeBoxAwaitExpression(pos + 8);
      case 14:
        return deserializeBoxBinaryExpression(pos + 8);
      case 15:
        return deserializeBoxCallExpression(pos + 8);
      case 16:
        return deserializeBoxChainExpression(pos + 8);
      case 17:
        return deserializeBoxClass(pos + 8);
      case 18:
        return deserializeBoxConditionalExpression(pos + 8);
      case 19:
        return deserializeBoxFunction(pos + 8);
      case 20:
        return deserializeBoxImportExpression(pos + 8);
      case 21:
        return deserializeBoxLogicalExpression(pos + 8);
      case 22:
        return deserializeBoxNewExpression(pos + 8);
      case 23:
        return deserializeBoxObjectExpression(pos + 8);
      case 24:
        return deserializeBoxParenthesizedExpression(pos + 8);
      case 25:
        return deserializeBoxSequenceExpression(pos + 8);
      case 26:
        return deserializeBoxTaggedTemplateExpression(pos + 8);
      case 27:
        return deserializeBoxThisExpression(pos + 8);
      case 28:
        return deserializeBoxUnaryExpression(pos + 8);
      case 29:
        return deserializeBoxUpdateExpression(pos + 8);
      case 30:
        return deserializeBoxYieldExpression(pos + 8);
      case 31:
        return deserializeBoxPrivateInExpression(pos + 8);
      case 32:
        return deserializeBoxJSXElement(pos + 8);
      case 33:
        return deserializeBoxJSXFragment(pos + 8);
      case 34:
        return deserializeBoxTSAsExpression(pos + 8);
      case 35:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 36:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 37:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 38:
        return deserializeBoxTSInstantiationExpression(pos + 8);
      case 39:
        return deserializeBoxV8IntrinsicExpression(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      case 64:
        return deserializeJSXEmptyExpression(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for JSXExpression`);
    }
  }
  function deserializeJSXAttributeItem(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxJSXAttribute(pos + 8);
      case 1:
        return deserializeBoxJSXSpreadAttribute(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for JSXAttributeItem`);
    }
  }
  function deserializeJSXAttributeName(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxJSXIdentifier(pos + 8);
      case 1:
        return deserializeBoxJSXNamespacedName(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for JSXAttributeName`);
    }
  }
  function deserializeJSXAttributeValue(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxStringLiteral(pos + 8);
      case 1:
        return deserializeBoxJSXExpressionContainer(pos + 8);
      case 2:
        return deserializeBoxJSXElement(pos + 8);
      case 3:
        return deserializeBoxJSXFragment(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for JSXAttributeValue`);
    }
  }
  function deserializeJSXChild(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxJSXText(pos + 8);
      case 1:
        return deserializeBoxJSXElement(pos + 8);
      case 2:
        return deserializeBoxJSXFragment(pos + 8);
      case 3:
        return deserializeBoxJSXExpressionContainer(pos + 8);
      case 4:
        return deserializeBoxJSXSpreadChild(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for JSXChild`);
    }
  }
  function deserializeTSEnumMemberName(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxIdentifierName(pos + 8);
      case 1:
        return deserializeBoxStringLiteral(pos + 8);
      case 2:
        return deserializeBoxStringLiteral(pos + 8);
      case 3:
        return deserializeBoxTemplateLiteral(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSEnumMemberName`);
    }
  }
  function deserializeTSLiteral(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBooleanLiteral(pos + 8);
      case 1:
        return deserializeBoxNumericLiteral(pos + 8);
      case 2:
        return deserializeBoxBigIntLiteral(pos + 8);
      case 3:
        return deserializeBoxStringLiteral(pos + 8);
      case 4:
        return deserializeBoxTemplateLiteral(pos + 8);
      case 5:
        return deserializeBoxUnaryExpression(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSLiteral`);
    }
  }
  function deserializeTSType(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxTSAnyKeyword(pos + 8);
      case 1:
        return deserializeBoxTSBigIntKeyword(pos + 8);
      case 2:
        return deserializeBoxTSBooleanKeyword(pos + 8);
      case 3:
        return deserializeBoxTSIntrinsicKeyword(pos + 8);
      case 4:
        return deserializeBoxTSNeverKeyword(pos + 8);
      case 5:
        return deserializeBoxTSNullKeyword(pos + 8);
      case 6:
        return deserializeBoxTSNumberKeyword(pos + 8);
      case 7:
        return deserializeBoxTSObjectKeyword(pos + 8);
      case 8:
        return deserializeBoxTSStringKeyword(pos + 8);
      case 9:
        return deserializeBoxTSSymbolKeyword(pos + 8);
      case 10:
        return deserializeBoxTSThisType(pos + 8);
      case 11:
        return deserializeBoxTSUndefinedKeyword(pos + 8);
      case 12:
        return deserializeBoxTSUnknownKeyword(pos + 8);
      case 13:
        return deserializeBoxTSVoidKeyword(pos + 8);
      case 14:
        return deserializeBoxTSArrayType(pos + 8);
      case 15:
        return deserializeBoxTSConditionalType(pos + 8);
      case 16:
        return deserializeBoxTSConstructorType(pos + 8);
      case 17:
        return deserializeBoxTSFunctionType(pos + 8);
      case 18:
        return deserializeBoxTSImportType(pos + 8);
      case 19:
        return deserializeBoxTSIndexedAccessType(pos + 8);
      case 20:
        return deserializeBoxTSInferType(pos + 8);
      case 21:
        return deserializeBoxTSIntersectionType(pos + 8);
      case 22:
        return deserializeBoxTSLiteralType(pos + 8);
      case 23:
        return deserializeBoxTSMappedType(pos + 8);
      case 24:
        return deserializeBoxTSNamedTupleMember(pos + 8);
      case 26:
        return deserializeBoxTSTemplateLiteralType(pos + 8);
      case 27:
        return deserializeBoxTSTupleType(pos + 8);
      case 28:
        return deserializeBoxTSTypeLiteral(pos + 8);
      case 29:
        return deserializeBoxTSTypeOperator(pos + 8);
      case 30:
        return deserializeBoxTSTypePredicate(pos + 8);
      case 31:
        return deserializeBoxTSTypeQuery(pos + 8);
      case 32:
        return deserializeBoxTSTypeReference(pos + 8);
      case 33:
        return deserializeBoxTSUnionType(pos + 8);
      case 34:
        return deserializeBoxTSParenthesizedType(pos + 8);
      case 35:
        return deserializeBoxJSDocNullableType(pos + 8);
      case 36:
        return deserializeBoxJSDocNonNullableType(pos + 8);
      case 37:
        return deserializeBoxJSDocUnknownType(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSType`);
    }
  }
  function deserializeTSTypeOperatorOperator(pos) {
    switch (uint8[pos]) {
      case 0:
        return "keyof";
      case 1:
        return "unique";
      case 2:
        return "readonly";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSTypeOperatorOperator`);
    }
  }
  function deserializeTSTupleElement(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxTSAnyKeyword(pos + 8);
      case 1:
        return deserializeBoxTSBigIntKeyword(pos + 8);
      case 2:
        return deserializeBoxTSBooleanKeyword(pos + 8);
      case 3:
        return deserializeBoxTSIntrinsicKeyword(pos + 8);
      case 4:
        return deserializeBoxTSNeverKeyword(pos + 8);
      case 5:
        return deserializeBoxTSNullKeyword(pos + 8);
      case 6:
        return deserializeBoxTSNumberKeyword(pos + 8);
      case 7:
        return deserializeBoxTSObjectKeyword(pos + 8);
      case 8:
        return deserializeBoxTSStringKeyword(pos + 8);
      case 9:
        return deserializeBoxTSSymbolKeyword(pos + 8);
      case 10:
        return deserializeBoxTSThisType(pos + 8);
      case 11:
        return deserializeBoxTSUndefinedKeyword(pos + 8);
      case 12:
        return deserializeBoxTSUnknownKeyword(pos + 8);
      case 13:
        return deserializeBoxTSVoidKeyword(pos + 8);
      case 14:
        return deserializeBoxTSArrayType(pos + 8);
      case 15:
        return deserializeBoxTSConditionalType(pos + 8);
      case 16:
        return deserializeBoxTSConstructorType(pos + 8);
      case 17:
        return deserializeBoxTSFunctionType(pos + 8);
      case 18:
        return deserializeBoxTSImportType(pos + 8);
      case 19:
        return deserializeBoxTSIndexedAccessType(pos + 8);
      case 20:
        return deserializeBoxTSInferType(pos + 8);
      case 21:
        return deserializeBoxTSIntersectionType(pos + 8);
      case 22:
        return deserializeBoxTSLiteralType(pos + 8);
      case 23:
        return deserializeBoxTSMappedType(pos + 8);
      case 24:
        return deserializeBoxTSNamedTupleMember(pos + 8);
      case 26:
        return deserializeBoxTSTemplateLiteralType(pos + 8);
      case 27:
        return deserializeBoxTSTupleType(pos + 8);
      case 28:
        return deserializeBoxTSTypeLiteral(pos + 8);
      case 29:
        return deserializeBoxTSTypeOperator(pos + 8);
      case 30:
        return deserializeBoxTSTypePredicate(pos + 8);
      case 31:
        return deserializeBoxTSTypeQuery(pos + 8);
      case 32:
        return deserializeBoxTSTypeReference(pos + 8);
      case 33:
        return deserializeBoxTSUnionType(pos + 8);
      case 34:
        return deserializeBoxTSParenthesizedType(pos + 8);
      case 35:
        return deserializeBoxJSDocNullableType(pos + 8);
      case 36:
        return deserializeBoxJSDocNonNullableType(pos + 8);
      case 37:
        return deserializeBoxJSDocUnknownType(pos + 8);
      case 64:
        return deserializeBoxTSOptionalType(pos + 8);
      case 65:
        return deserializeBoxTSRestType(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSTupleElement`);
    }
  }
  function deserializeTSTypeName(pos) {
    switch (uint8[pos]) {
      case 0:
        let id = deserializeBoxIdentifierReference(pos + 8);
        if (id.name === "this")
          id = { type: "ThisExpression", start: id.start, end: id.end };
        return id;
      case 1:
        return deserializeBoxTSQualifiedName(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSTypeName`);
    }
  }
  function deserializeTSSignature(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxTSIndexSignature(pos + 8);
      case 1:
        return deserializeBoxTSPropertySignature(pos + 8);
      case 2:
        return deserializeBoxTSCallSignatureDeclaration(pos + 8);
      case 3:
        return deserializeBoxTSConstructSignatureDeclaration(pos + 8);
      case 4:
        return deserializeBoxTSMethodSignature(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSSignature`);
    }
  }
  function deserializeTSMethodSignatureKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "method";
      case 1:
        return "get";
      case 2:
        return "set";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSMethodSignatureKind`);
    }
  }
  function deserializeTSTypePredicateName(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxIdentifierName(pos + 8);
      case 1:
        return deserializeTSThisType(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSTypePredicateName`);
    }
  }
  function deserializeTSModuleDeclarationKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "global";
      case 1:
        return "module";
      case 2:
        return "namespace";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSModuleDeclarationKind`);
    }
  }
  function deserializeTSModuleDeclarationName(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBindingIdentifier(pos + 8);
      case 1:
        return deserializeStringLiteral(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSModuleDeclarationName`);
    }
  }
  function deserializeTSModuleDeclarationBody(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxTSModuleDeclaration(pos + 8);
      case 1:
        return deserializeBoxTSModuleBlock(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSModuleDeclarationBody`);
    }
  }
  function deserializeTSTypeQueryExprName(pos) {
    switch (uint8[pos]) {
      case 0:
        let id = deserializeBoxIdentifierReference(pos + 8);
        if (id.name === "this")
          id = { type: "ThisExpression", start: id.start, end: id.end };
        return id;
      case 1:
        return deserializeBoxTSQualifiedName(pos + 8);
      case 2:
        return deserializeBoxTSImportType(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSTypeQueryExprName`);
    }
  }
  function deserializeTSMappedTypeModifierOperator(pos) {
    switch (uint8[pos]) {
      case 0:
        return true;
      case 1:
        return "+";
      case 2:
        return "-";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSMappedTypeModifierOperator`);
    }
  }
  function deserializeTSModuleReference(pos) {
    switch (uint8[pos]) {
      case 0:
        let id = deserializeBoxIdentifierReference(pos + 8);
        if (id.name === "this")
          id = { type: "ThisExpression", start: id.start, end: id.end };
        return id;
      case 1:
        return deserializeBoxTSQualifiedName(pos + 8);
      case 2:
        return deserializeBoxTSExternalModuleReference(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSModuleReference`);
    }
  }
  function deserializeImportOrExportKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "value";
      case 1:
        return "type";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ImportOrExportKind`);
    }
  }
  function deserializeCommentKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "Line";
      case 1:
        return "Block";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for CommentKind`);
    }
  }
  function deserializeImportImportName(pos) {
    switch (uint8[pos]) {
      case 0:
        var nameSpan = deserializeNameSpan(pos + 8);
        return { kind: "Name", name: nameSpan.value, start: nameSpan.start, end: nameSpan.end };
      case 1:
        return { kind: "NamespaceObject", name: null, start: null, end: null };
      case 2:
        var span = deserializeSpan(pos + 8);
        return { kind: "Default", name: null, start: span.start, end: span.end };
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ImportImportName`);
    }
  }
  function deserializeExportImportName(pos) {
    switch (uint8[pos]) {
      case 0:
        var nameSpan = deserializeNameSpan(pos + 8);
        return { kind: "Name", name: nameSpan.value, start: nameSpan.start, end: nameSpan.end };
      case 1:
        return { kind: "All", name: null, start: null, end: null };
      case 2:
        return { kind: "AllButDefault", name: null, start: null, end: null };
      case 3:
        return { kind: "None", name: null, start: null, end: null };
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ExportImportName`);
    }
  }
  function deserializeExportExportName(pos) {
    switch (uint8[pos]) {
      case 0:
        var nameSpan = deserializeNameSpan(pos + 8);
        return { kind: "Name", name: nameSpan.value, start: nameSpan.start, end: nameSpan.end };
      case 1:
        var span = deserializeSpan(pos + 8);
        return { kind: "Default", name: null, start: span.start, end: span.end };
      case 2:
        return { kind: "None", name: null, start: null, end: null };
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ExportExportName`);
    }
  }
  function deserializeExportLocalName(pos) {
    switch (uint8[pos]) {
      case 0:
        var nameSpan = deserializeNameSpan(pos + 8);
        return { kind: "Name", name: nameSpan.value, start: nameSpan.start, end: nameSpan.end };
      case 1:
        var nameSpan = deserializeNameSpan(pos + 8);
        return { kind: "Default", name: nameSpan.value, start: nameSpan.start, end: nameSpan.end };
      case 2:
        return { kind: "None", name: null, start: null, end: null };
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ExportLocalName`);
    }
  }
  function deserializeAssignmentOperator(pos) {
    switch (uint8[pos]) {
      case 0:
        return "=";
      case 1:
        return "+=";
      case 2:
        return "-=";
      case 3:
        return "*=";
      case 4:
        return "/=";
      case 5:
        return "%=";
      case 6:
        return "**=";
      case 7:
        return "<<=";
      case 8:
        return ">>=";
      case 9:
        return ">>>=";
      case 10:
        return "|=";
      case 11:
        return "^=";
      case 12:
        return "&=";
      case 13:
        return "||=";
      case 14:
        return "&&=";
      case 15:
        return "??=";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for AssignmentOperator`);
    }
  }
  function deserializeBinaryOperator(pos) {
    switch (uint8[pos]) {
      case 0:
        return "==";
      case 1:
        return "!=";
      case 2:
        return "===";
      case 3:
        return "!==";
      case 4:
        return "<";
      case 5:
        return "<=";
      case 6:
        return ">";
      case 7:
        return ">=";
      case 8:
        return "+";
      case 9:
        return "-";
      case 10:
        return "*";
      case 11:
        return "/";
      case 12:
        return "%";
      case 13:
        return "**";
      case 14:
        return "<<";
      case 15:
        return ">>";
      case 16:
        return ">>>";
      case 17:
        return "|";
      case 18:
        return "^";
      case 19:
        return "&";
      case 20:
        return "in";
      case 21:
        return "instanceof";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for BinaryOperator`);
    }
  }
  function deserializeLogicalOperator(pos) {
    switch (uint8[pos]) {
      case 0:
        return "||";
      case 1:
        return "&&";
      case 2:
        return "??";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for LogicalOperator`);
    }
  }
  function deserializeUnaryOperator(pos) {
    switch (uint8[pos]) {
      case 0:
        return "+";
      case 1:
        return "-";
      case 2:
        return "!";
      case 3:
        return "~";
      case 4:
        return "typeof";
      case 5:
        return "void";
      case 6:
        return "delete";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for UnaryOperator`);
    }
  }
  function deserializeUpdateOperator(pos) {
    switch (uint8[pos]) {
      case 0:
        return "++";
      case 1:
        return "--";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for UpdateOperator`);
    }
  }
  function deserializeModuleKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "script";
      case 1:
        return "module";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ModuleKind`);
    }
  }
  function deserializeTerm(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBoundaryAssertion(pos + 8);
      case 1:
        return deserializeBoxLookAroundAssertion(pos + 8);
      case 2:
        return deserializeBoxQuantifier(pos + 8);
      case 3:
        return deserializeBoxCharacter(pos + 8);
      case 4:
        return deserializeDot(pos + 8);
      case 5:
        return deserializeBoxCharacterClassEscape(pos + 8);
      case 6:
        return deserializeBoxUnicodePropertyEscape(pos + 8);
      case 7:
        return deserializeBoxCharacterClass(pos + 8);
      case 8:
        return deserializeBoxCapturingGroup(pos + 8);
      case 9:
        return deserializeBoxIgnoreGroup(pos + 8);
      case 10:
        return deserializeBoxIndexedReference(pos + 8);
      case 11:
        return deserializeBoxNamedReference(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for Term`);
    }
  }
  function deserializeBoundaryAssertionKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "start";
      case 1:
        return "end";
      case 2:
        return "boundary";
      case 3:
        return "negativeBoundary";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for BoundaryAssertionKind`);
    }
  }
  function deserializeLookAroundAssertionKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "lookahead";
      case 1:
        return "negativeLookahead";
      case 2:
        return "lookbehind";
      case 3:
        return "negativeLookbehind";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for LookAroundAssertionKind`);
    }
  }
  function deserializeCharacterKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "controlLetter";
      case 1:
        return "hexadecimalEscape";
      case 2:
        return "identifier";
      case 3:
        return "null";
      case 4:
        return "octal1";
      case 5:
        return "octal2";
      case 6:
        return "octal3";
      case 7:
        return "singleEscape";
      case 8:
        return "symbol";
      case 9:
        return "unicodeEscape";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for CharacterKind`);
    }
  }
  function deserializeCharacterClassEscapeKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "d";
      case 1:
        return "negativeD";
      case 2:
        return "s";
      case 3:
        return "negativeS";
      case 4:
        return "w";
      case 5:
        return "negativeW";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for CharacterClassEscapeKind`);
    }
  }
  function deserializeCharacterClassContentsKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "union";
      case 1:
        return "intersection";
      case 2:
        return "subtraction";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for CharacterClassContentsKind`);
    }
  }
  function deserializeCharacterClassContents(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxCharacterClassRange(pos + 8);
      case 1:
        return deserializeBoxCharacterClassEscape(pos + 8);
      case 2:
        return deserializeBoxUnicodePropertyEscape(pos + 8);
      case 3:
        return deserializeBoxCharacter(pos + 8);
      case 4:
        return deserializeBoxCharacterClass(pos + 8);
      case 5:
        return deserializeBoxClassStringDisjunction(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for CharacterClassContents`);
    }
  }
  function deserializeErrorSeverity(pos) {
    switch (uint8[pos]) {
      case 0:
        return "Error";
      case 1:
        return "Warning";
      case 2:
        return "Advice";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ErrorSeverity`);
    }
  }
  function deserializeStr(pos) {
    const pos32 = pos >> 2, len = uint32[pos32 + 2];
    if (len === 0)
      return "";
    pos = uint32[pos32];
    if (sourceIsAscii && pos < sourceLen)
      return sourceText.substr(pos, len);
    const end = pos + len;
    if (len > 50)
      return decodeStr(uint8.subarray(pos, end));
    let out = "", c;
    do {
      c = uint8[pos++];
      if (c < 128) {
        out += fromCodePoint(c);
      } else {
        out += decodeStr(uint8.subarray(pos - 1, end));
        break;
      }
    } while (pos < end);
    return out;
  }
  function deserializeVecComment(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeComment(pos));
      pos += 24;
    }
    return arr;
  }
  function deserializeOptionHashbang(pos) {
    if (uint32[pos + 8 >> 2] === 0 && uint32[pos + 12 >> 2] === 0)
      return null;
    return deserializeHashbang(pos);
  }
  function deserializeVecDirective(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeDirective(pos));
      pos += 72;
    }
    return arr;
  }
  function deserializeVecStatement(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeStatement(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxBooleanLiteral(pos) {
    return deserializeBooleanLiteral(uint32[pos >> 2]);
  }
  function deserializeBoxNullLiteral(pos) {
    return deserializeNullLiteral(uint32[pos >> 2]);
  }
  function deserializeBoxNumericLiteral(pos) {
    return deserializeNumericLiteral(uint32[pos >> 2]);
  }
  function deserializeBoxBigIntLiteral(pos) {
    return deserializeBigIntLiteral(uint32[pos >> 2]);
  }
  function deserializeBoxRegExpLiteral(pos) {
    return deserializeRegExpLiteral(uint32[pos >> 2]);
  }
  function deserializeBoxStringLiteral(pos) {
    return deserializeStringLiteral(uint32[pos >> 2]);
  }
  function deserializeBoxTemplateLiteral(pos) {
    return deserializeTemplateLiteral(uint32[pos >> 2]);
  }
  function deserializeBoxIdentifierReference(pos) {
    return deserializeIdentifierReference(uint32[pos >> 2]);
  }
  function deserializeBoxMetaProperty(pos) {
    return deserializeMetaProperty(uint32[pos >> 2]);
  }
  function deserializeBoxSuper(pos) {
    return deserializeSuper(uint32[pos >> 2]);
  }
  function deserializeBoxArrayExpression(pos) {
    return deserializeArrayExpression(uint32[pos >> 2]);
  }
  function deserializeBoxArrowFunctionExpression(pos) {
    return deserializeArrowFunctionExpression(uint32[pos >> 2]);
  }
  function deserializeBoxAssignmentExpression(pos) {
    return deserializeAssignmentExpression(uint32[pos >> 2]);
  }
  function deserializeBoxAwaitExpression(pos) {
    return deserializeAwaitExpression(uint32[pos >> 2]);
  }
  function deserializeBoxBinaryExpression(pos) {
    return deserializeBinaryExpression(uint32[pos >> 2]);
  }
  function deserializeBoxCallExpression(pos) {
    return deserializeCallExpression(uint32[pos >> 2]);
  }
  function deserializeBoxChainExpression(pos) {
    return deserializeChainExpression(uint32[pos >> 2]);
  }
  function deserializeBoxClass(pos) {
    return deserializeClass(uint32[pos >> 2]);
  }
  function deserializeBoxConditionalExpression(pos) {
    return deserializeConditionalExpression(uint32[pos >> 2]);
  }
  function deserializeBoxFunction(pos) {
    return deserializeFunction(uint32[pos >> 2]);
  }
  function deserializeBoxImportExpression(pos) {
    return deserializeImportExpression(uint32[pos >> 2]);
  }
  function deserializeBoxLogicalExpression(pos) {
    return deserializeLogicalExpression(uint32[pos >> 2]);
  }
  function deserializeBoxNewExpression(pos) {
    return deserializeNewExpression(uint32[pos >> 2]);
  }
  function deserializeBoxObjectExpression(pos) {
    return deserializeObjectExpression(uint32[pos >> 2]);
  }
  function deserializeBoxParenthesizedExpression(pos) {
    return deserializeParenthesizedExpression(uint32[pos >> 2]);
  }
  function deserializeBoxSequenceExpression(pos) {
    return deserializeSequenceExpression(uint32[pos >> 2]);
  }
  function deserializeBoxTaggedTemplateExpression(pos) {
    return deserializeTaggedTemplateExpression(uint32[pos >> 2]);
  }
  function deserializeBoxThisExpression(pos) {
    return deserializeThisExpression(uint32[pos >> 2]);
  }
  function deserializeBoxUnaryExpression(pos) {
    return deserializeUnaryExpression(uint32[pos >> 2]);
  }
  function deserializeBoxUpdateExpression(pos) {
    return deserializeUpdateExpression(uint32[pos >> 2]);
  }
  function deserializeBoxYieldExpression(pos) {
    return deserializeYieldExpression(uint32[pos >> 2]);
  }
  function deserializeBoxPrivateInExpression(pos) {
    return deserializePrivateInExpression(uint32[pos >> 2]);
  }
  function deserializeBoxJSXElement(pos) {
    return deserializeJSXElement(uint32[pos >> 2]);
  }
  function deserializeBoxJSXFragment(pos) {
    return deserializeJSXFragment(uint32[pos >> 2]);
  }
  function deserializeBoxTSAsExpression(pos) {
    return deserializeTSAsExpression(uint32[pos >> 2]);
  }
  function deserializeBoxTSSatisfiesExpression(pos) {
    return deserializeTSSatisfiesExpression(uint32[pos >> 2]);
  }
  function deserializeBoxTSTypeAssertion(pos) {
    return deserializeTSTypeAssertion(uint32[pos >> 2]);
  }
  function deserializeBoxTSNonNullExpression(pos) {
    return deserializeTSNonNullExpression(uint32[pos >> 2]);
  }
  function deserializeBoxTSInstantiationExpression(pos) {
    return deserializeTSInstantiationExpression(uint32[pos >> 2]);
  }
  function deserializeBoxV8IntrinsicExpression(pos) {
    return deserializeV8IntrinsicExpression(uint32[pos >> 2]);
  }
  function deserializeVecArrayExpressionElement(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeArrayExpressionElement(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxSpreadElement(pos) {
    return deserializeSpreadElement(uint32[pos >> 2]);
  }
  function deserializeVecObjectPropertyKind(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeObjectPropertyKind(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxObjectProperty(pos) {
    return deserializeObjectProperty(uint32[pos >> 2]);
  }
  function deserializeBool(pos) {
    return uint8[pos] === 1;
  }
  function deserializeBoxIdentifierName(pos) {
    return deserializeIdentifierName(uint32[pos >> 2]);
  }
  function deserializeBoxPrivateIdentifier(pos) {
    return deserializePrivateIdentifier(uint32[pos >> 2]);
  }
  function deserializeVecTemplateElement(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTemplateElement(pos));
      pos += 48;
    }
    return arr;
  }
  function deserializeVecExpression(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeExpression(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxTSTypeParameterInstantiation(pos) {
    return deserializeTSTypeParameterInstantiation(uint32[pos >> 2]);
  }
  function deserializeOptionBoxTSTypeParameterInstantiation(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxTSTypeParameterInstantiation(pos);
  }
  function deserializeOptionStr(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeStr(pos);
  }
  function deserializeBoxComputedMemberExpression(pos) {
    return deserializeComputedMemberExpression(uint32[pos >> 2]);
  }
  function deserializeBoxStaticMemberExpression(pos) {
    return deserializeStaticMemberExpression(uint32[pos >> 2]);
  }
  function deserializeBoxPrivateFieldExpression(pos) {
    return deserializePrivateFieldExpression(uint32[pos >> 2]);
  }
  function deserializeVecArgument(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeArgument(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxArrayAssignmentTarget(pos) {
    return deserializeArrayAssignmentTarget(uint32[pos >> 2]);
  }
  function deserializeBoxObjectAssignmentTarget(pos) {
    return deserializeObjectAssignmentTarget(uint32[pos >> 2]);
  }
  function deserializeOptionAssignmentTargetMaybeDefault(pos) {
    if (uint8[pos] === 51)
      return null;
    return deserializeAssignmentTargetMaybeDefault(pos);
  }
  function deserializeVecOptionAssignmentTargetMaybeDefault(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeOptionAssignmentTargetMaybeDefault(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeOptionAssignmentTargetRest(pos) {
    if (uint8[pos + 8] === 51)
      return null;
    return deserializeAssignmentTargetRest(pos);
  }
  function deserializeVecAssignmentTargetProperty(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeAssignmentTargetProperty(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxAssignmentTargetWithDefault(pos) {
    return deserializeAssignmentTargetWithDefault(uint32[pos >> 2]);
  }
  function deserializeBoxAssignmentTargetPropertyIdentifier(pos) {
    return deserializeAssignmentTargetPropertyIdentifier(uint32[pos >> 2]);
  }
  function deserializeBoxAssignmentTargetPropertyProperty(pos) {
    return deserializeAssignmentTargetPropertyProperty(uint32[pos >> 2]);
  }
  function deserializeOptionExpression(pos) {
    if (uint8[pos] === 51)
      return null;
    return deserializeExpression(pos);
  }
  function deserializeBoxBlockStatement(pos) {
    return deserializeBlockStatement(uint32[pos >> 2]);
  }
  function deserializeBoxBreakStatement(pos) {
    return deserializeBreakStatement(uint32[pos >> 2]);
  }
  function deserializeBoxContinueStatement(pos) {
    return deserializeContinueStatement(uint32[pos >> 2]);
  }
  function deserializeBoxDebuggerStatement(pos) {
    return deserializeDebuggerStatement(uint32[pos >> 2]);
  }
  function deserializeBoxDoWhileStatement(pos) {
    return deserializeDoWhileStatement(uint32[pos >> 2]);
  }
  function deserializeBoxEmptyStatement(pos) {
    return deserializeEmptyStatement(uint32[pos >> 2]);
  }
  function deserializeBoxExpressionStatement(pos) {
    return deserializeExpressionStatement(uint32[pos >> 2]);
  }
  function deserializeBoxForInStatement(pos) {
    return deserializeForInStatement(uint32[pos >> 2]);
  }
  function deserializeBoxForOfStatement(pos) {
    return deserializeForOfStatement(uint32[pos >> 2]);
  }
  function deserializeBoxForStatement(pos) {
    return deserializeForStatement(uint32[pos >> 2]);
  }
  function deserializeBoxIfStatement(pos) {
    return deserializeIfStatement(uint32[pos >> 2]);
  }
  function deserializeBoxLabeledStatement(pos) {
    return deserializeLabeledStatement(uint32[pos >> 2]);
  }
  function deserializeBoxReturnStatement(pos) {
    return deserializeReturnStatement(uint32[pos >> 2]);
  }
  function deserializeBoxSwitchStatement(pos) {
    return deserializeSwitchStatement(uint32[pos >> 2]);
  }
  function deserializeBoxThrowStatement(pos) {
    return deserializeThrowStatement(uint32[pos >> 2]);
  }
  function deserializeBoxTryStatement(pos) {
    return deserializeTryStatement(uint32[pos >> 2]);
  }
  function deserializeBoxWhileStatement(pos) {
    return deserializeWhileStatement(uint32[pos >> 2]);
  }
  function deserializeBoxWithStatement(pos) {
    return deserializeWithStatement(uint32[pos >> 2]);
  }
  function deserializeBoxVariableDeclaration(pos) {
    return deserializeVariableDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxTSTypeAliasDeclaration(pos) {
    return deserializeTSTypeAliasDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxTSInterfaceDeclaration(pos) {
    return deserializeTSInterfaceDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxTSEnumDeclaration(pos) {
    return deserializeTSEnumDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxTSModuleDeclaration(pos) {
    return deserializeTSModuleDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxTSImportEqualsDeclaration(pos) {
    return deserializeTSImportEqualsDeclaration(uint32[pos >> 2]);
  }
  function deserializeVecVariableDeclarator(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeVariableDeclarator(pos));
      pos += 72;
    }
    return arr;
  }
  function deserializeOptionStatement(pos) {
    if (uint8[pos] === 70)
      return null;
    return deserializeStatement(pos);
  }
  function deserializeOptionForStatementInit(pos) {
    if (uint8[pos] === 65)
      return null;
    return deserializeForStatementInit(pos);
  }
  function deserializeOptionLabelIdentifier(pos) {
    if (uint32[pos + 8 >> 2] === 0 && uint32[pos + 12 >> 2] === 0)
      return null;
    return deserializeLabelIdentifier(pos);
  }
  function deserializeVecSwitchCase(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeSwitchCase(pos));
      pos += 56;
    }
    return arr;
  }
  function deserializeBoxCatchClause(pos) {
    return deserializeCatchClause(uint32[pos >> 2]);
  }
  function deserializeOptionBoxCatchClause(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxCatchClause(pos);
  }
  function deserializeOptionBoxBlockStatement(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxBlockStatement(pos);
  }
  function deserializeOptionCatchParameter(pos) {
    if (uint8[pos + 32] === 2)
      return null;
    return deserializeCatchParameter(pos);
  }
  function deserializeBoxTSTypeAnnotation(pos) {
    return deserializeTSTypeAnnotation(uint32[pos >> 2]);
  }
  function deserializeOptionBoxTSTypeAnnotation(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxTSTypeAnnotation(pos);
  }
  function deserializeBoxBindingIdentifier(pos) {
    return deserializeBindingIdentifier(uint32[pos >> 2]);
  }
  function deserializeBoxObjectPattern(pos) {
    return deserializeObjectPattern(uint32[pos >> 2]);
  }
  function deserializeBoxArrayPattern(pos) {
    return deserializeArrayPattern(uint32[pos >> 2]);
  }
  function deserializeBoxAssignmentPattern(pos) {
    return deserializeAssignmentPattern(uint32[pos >> 2]);
  }
  function deserializeVecBindingProperty(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeBindingProperty(pos));
      pos += 64;
    }
    return arr;
  }
  function deserializeBoxBindingRestElement(pos) {
    return deserializeBindingRestElement(uint32[pos >> 2]);
  }
  function deserializeOptionBoxBindingRestElement(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxBindingRestElement(pos);
  }
  function deserializeOptionBindingPattern(pos) {
    if (uint8[pos + 24] === 2)
      return null;
    return deserializeBindingPattern(pos);
  }
  function deserializeVecOptionBindingPattern(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeOptionBindingPattern(pos));
      pos += 32;
    }
    return arr;
  }
  function deserializeOptionBindingIdentifier(pos) {
    if (uint32[pos + 8 >> 2] === 0 && uint32[pos + 12 >> 2] === 0)
      return null;
    return deserializeBindingIdentifier(pos);
  }
  function deserializeBoxTSTypeParameterDeclaration(pos) {
    return deserializeTSTypeParameterDeclaration(uint32[pos >> 2]);
  }
  function deserializeOptionBoxTSTypeParameterDeclaration(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxTSTypeParameterDeclaration(pos);
  }
  function deserializeBoxTSThisParameter(pos) {
    return deserializeTSThisParameter(uint32[pos >> 2]);
  }
  function deserializeOptionBoxTSThisParameter(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxTSThisParameter(pos);
  }
  function deserializeBoxFormalParameters(pos) {
    return deserializeFormalParameters(uint32[pos >> 2]);
  }
  function deserializeBoxFunctionBody(pos) {
    return deserializeFunctionBody(uint32[pos >> 2]);
  }
  function deserializeOptionBoxFunctionBody(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxFunctionBody(pos);
  }
  function deserializeVecFormalParameter(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeFormalParameter(pos));
      pos += 80;
    }
    return arr;
  }
  function deserializeBoxClassBody(pos) {
    return deserializeClassBody(uint32[pos >> 2]);
  }
  function deserializeVecClassElement(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeClassElement(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxStaticBlock(pos) {
    return deserializeStaticBlock(uint32[pos >> 2]);
  }
  function deserializeBoxMethodDefinition(pos) {
    return deserializeMethodDefinition(uint32[pos >> 2]);
  }
  function deserializeBoxPropertyDefinition(pos) {
    return deserializePropertyDefinition(uint32[pos >> 2]);
  }
  function deserializeBoxAccessorProperty(pos) {
    return deserializeAccessorProperty(uint32[pos >> 2]);
  }
  function deserializeBoxTSIndexSignature(pos) {
    return deserializeTSIndexSignature(uint32[pos >> 2]);
  }
  function deserializeBoxImportDeclaration(pos) {
    return deserializeImportDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxExportAllDeclaration(pos) {
    return deserializeExportAllDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxExportDefaultDeclaration(pos) {
    return deserializeExportDefaultDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxExportNamedDeclaration(pos) {
    return deserializeExportNamedDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxTSExportAssignment(pos) {
    return deserializeTSExportAssignment(uint32[pos >> 2]);
  }
  function deserializeBoxTSNamespaceExportDeclaration(pos) {
    return deserializeTSNamespaceExportDeclaration(uint32[pos >> 2]);
  }
  function deserializeVecImportDeclarationSpecifier(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeImportDeclarationSpecifier(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeOptionVecImportDeclarationSpecifier(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeVecImportDeclarationSpecifier(pos);
  }
  function deserializeBoxWithClause(pos) {
    return deserializeWithClause(uint32[pos >> 2]);
  }
  function deserializeOptionBoxWithClause(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxWithClause(pos);
  }
  function deserializeBoxImportSpecifier(pos) {
    return deserializeImportSpecifier(uint32[pos >> 2]);
  }
  function deserializeBoxImportDefaultSpecifier(pos) {
    return deserializeImportDefaultSpecifier(uint32[pos >> 2]);
  }
  function deserializeBoxImportNamespaceSpecifier(pos) {
    return deserializeImportNamespaceSpecifier(uint32[pos >> 2]);
  }
  function deserializeVecImportAttribute(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeImportAttribute(pos));
      pos += 112;
    }
    return arr;
  }
  function deserializeOptionDeclaration(pos) {
    if (uint8[pos] === 31)
      return null;
    return deserializeDeclaration(pos);
  }
  function deserializeVecExportSpecifier(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeExportSpecifier(pos));
      pos += 128;
    }
    return arr;
  }
  function deserializeOptionStringLiteral(pos) {
    if (uint8[pos + 40] === 2)
      return null;
    return deserializeStringLiteral(pos);
  }
  function deserializeOptionModuleExportName(pos) {
    if (uint8[pos] === 3)
      return null;
    return deserializeModuleExportName(pos);
  }
  function deserializeF64(pos) {
    return float64[pos >> 3];
  }
  function deserializeBoxPattern(pos) {
    return deserializePattern(uint32[pos >> 2]);
  }
  function deserializeU8(pos) {
    return uint8[pos];
  }
  function deserializeBoxJSXOpeningElement(pos) {
    return deserializeJSXOpeningElement(uint32[pos >> 2]);
  }
  function deserializeBoxJSXClosingElement(pos) {
    return deserializeJSXClosingElement(uint32[pos >> 2]);
  }
  function deserializeOptionBoxJSXClosingElement(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxJSXClosingElement(pos);
  }
  function deserializeVecJSXChild(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeJSXChild(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeVecJSXAttributeItem(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeJSXAttributeItem(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxJSXIdentifier(pos) {
    return deserializeJSXIdentifier(uint32[pos >> 2]);
  }
  function deserializeBoxJSXNamespacedName(pos) {
    return deserializeJSXNamespacedName(uint32[pos >> 2]);
  }
  function deserializeBoxJSXMemberExpression(pos) {
    return deserializeJSXMemberExpression(uint32[pos >> 2]);
  }
  function deserializeBoxJSXAttribute(pos) {
    return deserializeJSXAttribute(uint32[pos >> 2]);
  }
  function deserializeBoxJSXSpreadAttribute(pos) {
    return deserializeJSXSpreadAttribute(uint32[pos >> 2]);
  }
  function deserializeOptionJSXAttributeValue(pos) {
    if (uint8[pos] === 4)
      return null;
    return deserializeJSXAttributeValue(pos);
  }
  function deserializeBoxJSXExpressionContainer(pos) {
    return deserializeJSXExpressionContainer(uint32[pos >> 2]);
  }
  function deserializeBoxJSXText(pos) {
    return deserializeJSXText(uint32[pos >> 2]);
  }
  function deserializeBoxJSXSpreadChild(pos) {
    return deserializeJSXSpreadChild(uint32[pos >> 2]);
  }
  function deserializeVecTSEnumMember(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTSEnumMember(pos));
      pos += 40;
    }
    return arr;
  }
  function deserializeBoxTSAnyKeyword(pos) {
    return deserializeTSAnyKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSBigIntKeyword(pos) {
    return deserializeTSBigIntKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSBooleanKeyword(pos) {
    return deserializeTSBooleanKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSIntrinsicKeyword(pos) {
    return deserializeTSIntrinsicKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSNeverKeyword(pos) {
    return deserializeTSNeverKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSNullKeyword(pos) {
    return deserializeTSNullKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSNumberKeyword(pos) {
    return deserializeTSNumberKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSObjectKeyword(pos) {
    return deserializeTSObjectKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSStringKeyword(pos) {
    return deserializeTSStringKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSSymbolKeyword(pos) {
    return deserializeTSSymbolKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSUndefinedKeyword(pos) {
    return deserializeTSUndefinedKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSUnknownKeyword(pos) {
    return deserializeTSUnknownKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSVoidKeyword(pos) {
    return deserializeTSVoidKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSArrayType(pos) {
    return deserializeTSArrayType(uint32[pos >> 2]);
  }
  function deserializeBoxTSConditionalType(pos) {
    return deserializeTSConditionalType(uint32[pos >> 2]);
  }
  function deserializeBoxTSConstructorType(pos) {
    return deserializeTSConstructorType(uint32[pos >> 2]);
  }
  function deserializeBoxTSFunctionType(pos) {
    return deserializeTSFunctionType(uint32[pos >> 2]);
  }
  function deserializeBoxTSImportType(pos) {
    return deserializeTSImportType(uint32[pos >> 2]);
  }
  function deserializeBoxTSIndexedAccessType(pos) {
    return deserializeTSIndexedAccessType(uint32[pos >> 2]);
  }
  function deserializeBoxTSInferType(pos) {
    return deserializeTSInferType(uint32[pos >> 2]);
  }
  function deserializeBoxTSIntersectionType(pos) {
    return deserializeTSIntersectionType(uint32[pos >> 2]);
  }
  function deserializeBoxTSLiteralType(pos) {
    return deserializeTSLiteralType(uint32[pos >> 2]);
  }
  function deserializeBoxTSMappedType(pos) {
    return deserializeTSMappedType(uint32[pos >> 2]);
  }
  function deserializeBoxTSNamedTupleMember(pos) {
    return deserializeTSNamedTupleMember(uint32[pos >> 2]);
  }
  function deserializeBoxTSTemplateLiteralType(pos) {
    return deserializeTSTemplateLiteralType(uint32[pos >> 2]);
  }
  function deserializeBoxTSThisType(pos) {
    return deserializeTSThisType(uint32[pos >> 2]);
  }
  function deserializeBoxTSTupleType(pos) {
    return deserializeTSTupleType(uint32[pos >> 2]);
  }
  function deserializeBoxTSTypeLiteral(pos) {
    return deserializeTSTypeLiteral(uint32[pos >> 2]);
  }
  function deserializeBoxTSTypeOperator(pos) {
    return deserializeTSTypeOperator(uint32[pos >> 2]);
  }
  function deserializeBoxTSTypePredicate(pos) {
    return deserializeTSTypePredicate(uint32[pos >> 2]);
  }
  function deserializeBoxTSTypeQuery(pos) {
    return deserializeTSTypeQuery(uint32[pos >> 2]);
  }
  function deserializeBoxTSTypeReference(pos) {
    return deserializeTSTypeReference(uint32[pos >> 2]);
  }
  function deserializeBoxTSUnionType(pos) {
    return deserializeTSUnionType(uint32[pos >> 2]);
  }
  function deserializeBoxTSParenthesizedType(pos) {
    return deserializeTSParenthesizedType(uint32[pos >> 2]);
  }
  function deserializeBoxJSDocNullableType(pos) {
    return deserializeJSDocNullableType(uint32[pos >> 2]);
  }
  function deserializeBoxJSDocNonNullableType(pos) {
    return deserializeJSDocNonNullableType(uint32[pos >> 2]);
  }
  function deserializeBoxJSDocUnknownType(pos) {
    return deserializeJSDocUnknownType(uint32[pos >> 2]);
  }
  function deserializeVecTSType(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTSType(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeVecTSTupleElement(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTSTupleElement(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxTSOptionalType(pos) {
    return deserializeTSOptionalType(uint32[pos >> 2]);
  }
  function deserializeBoxTSRestType(pos) {
    return deserializeTSRestType(uint32[pos >> 2]);
  }
  function deserializeBoxTSQualifiedName(pos) {
    return deserializeTSQualifiedName(uint32[pos >> 2]);
  }
  function deserializeOptionTSType(pos) {
    if (uint8[pos] === 38)
      return null;
    return deserializeTSType(pos);
  }
  function deserializeVecTSTypeParameter(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTSTypeParameter(pos));
      pos += 80;
    }
    return arr;
  }
  function deserializeVecTSInterfaceHeritage(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTSInterfaceHeritage(pos));
      pos += 32;
    }
    return arr;
  }
  function deserializeBoxTSInterfaceBody(pos) {
    return deserializeTSInterfaceBody(uint32[pos >> 2]);
  }
  function deserializeVecTSSignature(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTSSignature(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxTSPropertySignature(pos) {
    return deserializeTSPropertySignature(uint32[pos >> 2]);
  }
  function deserializeBoxTSCallSignatureDeclaration(pos) {
    return deserializeTSCallSignatureDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxTSConstructSignatureDeclaration(pos) {
    return deserializeTSConstructSignatureDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxTSMethodSignature(pos) {
    return deserializeTSMethodSignature(uint32[pos >> 2]);
  }
  function deserializeVecTSIndexSignatureName(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTSIndexSignatureName(pos));
      pos += 32;
    }
    return arr;
  }
  function deserializeOptionTSModuleDeclarationBody(pos) {
    if (uint8[pos] === 2)
      return null;
    return deserializeTSModuleDeclarationBody(pos);
  }
  function deserializeBoxTSModuleBlock(pos) {
    return deserializeTSModuleBlock(uint32[pos >> 2]);
  }
  function deserializeBoxTSTypeParameter(pos) {
    return deserializeTSTypeParameter(uint32[pos >> 2]);
  }
  function deserializeOptionBoxObjectExpression(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxObjectExpression(pos);
  }
  function deserializeOptionTSTypeName(pos) {
    if (uint8[pos] === 2)
      return null;
    return deserializeTSTypeName(pos);
  }
  function deserializeOptionTSMappedTypeModifierOperator(pos) {
    if (uint8[pos] === 3)
      return null;
    return deserializeTSMappedTypeModifierOperator(pos);
  }
  function deserializeBoxTSExternalModuleReference(pos) {
    return deserializeTSExternalModuleReference(uint32[pos >> 2]);
  }
  function deserializeU32(pos) {
    return uint32[pos >> 2];
  }
  function deserializeOptionNameSpan(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeNameSpan(pos);
  }
  function deserializeVecAlternative(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeAlternative(pos));
      pos += 40;
    }
    return arr;
  }
  function deserializeVecTerm(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTerm(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxBoundaryAssertion(pos) {
    return deserializeBoundaryAssertion(uint32[pos >> 2]);
  }
  function deserializeBoxLookAroundAssertion(pos) {
    return deserializeLookAroundAssertion(uint32[pos >> 2]);
  }
  function deserializeBoxQuantifier(pos) {
    return deserializeQuantifier(uint32[pos >> 2]);
  }
  function deserializeBoxCharacter(pos) {
    return deserializeCharacter(uint32[pos >> 2]);
  }
  function deserializeBoxCharacterClassEscape(pos) {
    return deserializeCharacterClassEscape(uint32[pos >> 2]);
  }
  function deserializeBoxUnicodePropertyEscape(pos) {
    return deserializeUnicodePropertyEscape(uint32[pos >> 2]);
  }
  function deserializeBoxCharacterClass(pos) {
    return deserializeCharacterClass(uint32[pos >> 2]);
  }
  function deserializeBoxCapturingGroup(pos) {
    return deserializeCapturingGroup(uint32[pos >> 2]);
  }
  function deserializeBoxIgnoreGroup(pos) {
    return deserializeIgnoreGroup(uint32[pos >> 2]);
  }
  function deserializeBoxIndexedReference(pos) {
    return deserializeIndexedReference(uint32[pos >> 2]);
  }
  function deserializeBoxNamedReference(pos) {
    return deserializeNamedReference(uint32[pos >> 2]);
  }
  function deserializeU64(pos) {
    const pos32 = pos >> 2;
    return uint32[pos32] + uint32[pos32 + 1] * 4294967296;
  }
  function deserializeOptionU64(pos) {
    if (uint8[pos] === 0)
      return null;
    return deserializeU64(pos + 8);
  }
  function deserializeVecCharacterClassContents(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeCharacterClassContents(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxCharacterClassRange(pos) {
    return deserializeCharacterClassRange(uint32[pos >> 2]);
  }
  function deserializeBoxClassStringDisjunction(pos) {
    return deserializeClassStringDisjunction(uint32[pos >> 2]);
  }
  function deserializeVecClassString(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeClassString(pos));
      pos += 48;
    }
    return arr;
  }
  function deserializeVecCharacter(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeCharacter(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeOptionModifiers(pos) {
    if (uint8[pos + 8] === 3)
      return null;
    return deserializeModifiers(pos);
  }
  function deserializeOptionModifier(pos) {
    if (uint8[pos] === 2)
      return null;
    return deserializeModifier(pos);
  }
  function deserializeVecError(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeError(pos));
      pos += 72;
    }
    return arr;
  }
  function deserializeVecErrorLabel(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeErrorLabel(pos));
      pos += 24;
    }
    return arr;
  }
  function deserializeVecStaticImport(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeStaticImport(pos));
      pos += 64;
    }
    return arr;
  }
  function deserializeVecStaticExport(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeStaticExport(pos));
      pos += 40;
    }
    return arr;
  }
  function deserializeVecDynamicImport(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeDynamicImport(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeVecSpan(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeSpan(pos));
      pos += 8;
    }
    return arr;
  }
  function deserializeVecImportEntry(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeImportEntry(pos));
      pos += 96;
    }
    return arr;
  }
  function deserializeVecExportEntry(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeExportEntry(pos));
      pos += 144;
    }
    return arr;
  }
});

// node_modules/oxc-parser/generated/deserialize/ts.js
var require_ts = __commonJS((exports, module) => {
  module.exports = deserialize;
  var uint8;
  var uint32;
  var float64;
  var sourceText;
  var sourceIsAscii;
  var sourceLen;
  var textDecoder = new TextDecoder("utf-8", { ignoreBOM: true });
  var decodeStr = textDecoder.decode.bind(textDecoder);
  var { fromCodePoint } = String;
  function deserialize(buffer, sourceTextInput, sourceLenInput) {
    uint8 = buffer;
    uint32 = new Uint32Array(buffer.buffer, buffer.byteOffset);
    float64 = new Float64Array(buffer.buffer, buffer.byteOffset);
    sourceText = sourceTextInput;
    sourceLen = sourceLenInput;
    sourceIsAscii = sourceText.length === sourceLen;
    const metadataPos32 = 536870908;
    const data = deserializeRawTransferData(uint32[metadataPos32]);
    uint8 = uint32 = float64 = sourceText = undefined;
    return data;
  }
  function deserializeProgram(pos) {
    const body = deserializeVecDirective(pos + 88);
    body.push(...deserializeVecStatement(pos + 120));
    const end = deserializeU32(pos + 4);
    let start;
    if (body.length > 0) {
      const first = body[0];
      start = first.start;
      if (first.type === "ExportNamedDeclaration" || first.type === "ExportDefaultDeclaration") {
        const { declaration } = first;
        if (declaration !== null && declaration.type === "ClassDeclaration" && declaration.decorators.length > 0) {
          const decoratorStart = declaration.decorators[0].start;
          if (decoratorStart < start)
            start = decoratorStart;
        }
      }
    } else {
      start = end;
    }
    const program = {
      type: "Program",
      start,
      end,
      body,
      sourceType: deserializeModuleKind(pos + 9),
      hashbang: deserializeOptionHashbang(pos + 64)
    };
    return program;
  }
  function deserializeIdentifierName(pos) {
    return {
      type: "Identifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeStr(pos + 8),
      decorators: [],
      optional: false,
      typeAnnotation: null
    };
  }
  function deserializeIdentifierReference(pos) {
    return {
      type: "Identifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeStr(pos + 8),
      decorators: [],
      optional: false,
      typeAnnotation: null
    };
  }
  function deserializeBindingIdentifier(pos) {
    return {
      type: "Identifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeStr(pos + 8),
      decorators: [],
      optional: false,
      typeAnnotation: null
    };
  }
  function deserializeLabelIdentifier(pos) {
    return {
      type: "Identifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeStr(pos + 8),
      decorators: [],
      optional: false,
      typeAnnotation: null
    };
  }
  function deserializeThisExpression(pos) {
    return {
      type: "ThisExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeArrayExpression(pos) {
    return {
      type: "ArrayExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      elements: deserializeVecArrayExpressionElement(pos + 8)
    };
  }
  function deserializeElision(pos) {
    return null;
  }
  function deserializeObjectExpression(pos) {
    return {
      type: "ObjectExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      properties: deserializeVecObjectPropertyKind(pos + 8)
    };
  }
  function deserializeObjectProperty(pos) {
    return {
      type: "Property",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      method: deserializeBool(pos + 48),
      shorthand: deserializeBool(pos + 49),
      computed: deserializeBool(pos + 50),
      key: deserializePropertyKey(pos + 16),
      value: deserializeExpression(pos + 32),
      kind: deserializePropertyKind(pos + 8),
      optional: false
    };
  }
  function deserializeTemplateLiteral(pos) {
    return {
      type: "TemplateLiteral",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expressions: deserializeVecExpression(pos + 40),
      quasis: deserializeVecTemplateElement(pos + 8)
    };
  }
  function deserializeTaggedTemplateExpression(pos) {
    return {
      type: "TaggedTemplateExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      tag: deserializeExpression(pos + 8),
      quasi: deserializeTemplateLiteral(pos + 24),
      typeArguments: deserializeOptionBoxTSTypeParameterInstantiation(pos + 96)
    };
  }
  function deserializeTemplateElement(pos) {
    const tail = deserializeBool(pos + 40), start = deserializeU32(pos) - 1, end = deserializeU32(pos + 4) + 2 - tail, value = deserializeTemplateElementValue(pos + 8);
    if (value.cooked !== null && deserializeBool(pos + 41)) {
      value.cooked = value.cooked.replace(/\uFFFD(.{4})/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
    }
    return { type: "TemplateElement", start, end, value, tail };
  }
  function deserializeTemplateElementValue(pos) {
    return {
      raw: deserializeStr(pos),
      cooked: deserializeOptionStr(pos + 16)
    };
  }
  function deserializeComputedMemberExpression(pos) {
    return {
      type: "MemberExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      object: deserializeExpression(pos + 8),
      property: deserializeExpression(pos + 24),
      computed: true,
      optional: deserializeBool(pos + 40)
    };
  }
  function deserializeStaticMemberExpression(pos) {
    return {
      type: "MemberExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      object: deserializeExpression(pos + 8),
      property: deserializeIdentifierName(pos + 24),
      computed: false,
      optional: deserializeBool(pos + 48)
    };
  }
  function deserializePrivateFieldExpression(pos) {
    return {
      type: "MemberExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      object: deserializeExpression(pos + 8),
      property: deserializePrivateIdentifier(pos + 24),
      computed: false,
      optional: deserializeBool(pos + 48)
    };
  }
  function deserializeCallExpression(pos) {
    return {
      type: "CallExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      callee: deserializeExpression(pos + 8),
      arguments: deserializeVecArgument(pos + 32),
      optional: deserializeBool(pos + 64),
      typeArguments: deserializeOptionBoxTSTypeParameterInstantiation(pos + 24)
    };
  }
  function deserializeNewExpression(pos) {
    return {
      type: "NewExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      callee: deserializeExpression(pos + 8),
      arguments: deserializeVecArgument(pos + 24),
      typeArguments: deserializeOptionBoxTSTypeParameterInstantiation(pos + 56)
    };
  }
  function deserializeMetaProperty(pos) {
    return {
      type: "MetaProperty",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      meta: deserializeIdentifierName(pos + 8),
      property: deserializeIdentifierName(pos + 32)
    };
  }
  function deserializeSpreadElement(pos) {
    return {
      type: "SpreadElement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      argument: deserializeExpression(pos + 8)
    };
  }
  function deserializeUpdateExpression(pos) {
    return {
      type: "UpdateExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      operator: deserializeUpdateOperator(pos + 8),
      prefix: deserializeBool(pos + 9),
      argument: deserializeSimpleAssignmentTarget(pos + 16)
    };
  }
  function deserializeUnaryExpression(pos) {
    return {
      type: "UnaryExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      operator: deserializeUnaryOperator(pos + 8),
      prefix: true,
      argument: deserializeExpression(pos + 16)
    };
  }
  function deserializeBinaryExpression(pos) {
    return {
      type: "BinaryExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      left: deserializeExpression(pos + 8),
      operator: deserializeBinaryOperator(pos + 24),
      right: deserializeExpression(pos + 32)
    };
  }
  function deserializePrivateInExpression(pos) {
    return {
      type: "BinaryExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      left: deserializePrivateIdentifier(pos + 8),
      operator: "in",
      right: deserializeExpression(pos + 32)
    };
  }
  function deserializeLogicalExpression(pos) {
    return {
      type: "LogicalExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      left: deserializeExpression(pos + 8),
      operator: deserializeLogicalOperator(pos + 24),
      right: deserializeExpression(pos + 32)
    };
  }
  function deserializeConditionalExpression(pos) {
    return {
      type: "ConditionalExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      test: deserializeExpression(pos + 8),
      consequent: deserializeExpression(pos + 24),
      alternate: deserializeExpression(pos + 40)
    };
  }
  function deserializeAssignmentExpression(pos) {
    return {
      type: "AssignmentExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      operator: deserializeAssignmentOperator(pos + 8),
      left: deserializeAssignmentTarget(pos + 16),
      right: deserializeExpression(pos + 32)
    };
  }
  function deserializeArrayAssignmentTarget(pos) {
    const elements = deserializeVecOptionAssignmentTargetMaybeDefault(pos + 8);
    const rest = deserializeOptionAssignmentTargetRest(pos + 40);
    if (rest !== null)
      elements.push(rest);
    return {
      type: "ArrayPattern",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      elements,
      decorators: [],
      optional: false,
      typeAnnotation: null
    };
  }
  function deserializeObjectAssignmentTarget(pos) {
    const properties = deserializeVecAssignmentTargetProperty(pos + 8);
    const rest = deserializeOptionAssignmentTargetRest(pos + 40);
    if (rest !== null)
      properties.push(rest);
    return {
      type: "ObjectPattern",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      properties,
      decorators: [],
      optional: false,
      typeAnnotation: null
    };
  }
  function deserializeAssignmentTargetRest(pos) {
    return {
      type: "RestElement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      argument: deserializeAssignmentTarget(pos + 8),
      decorators: [],
      optional: false,
      typeAnnotation: null,
      value: null
    };
  }
  function deserializeAssignmentTargetWithDefault(pos) {
    return {
      type: "AssignmentPattern",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      left: deserializeAssignmentTarget(pos + 8),
      right: deserializeExpression(pos + 24),
      decorators: [],
      optional: false,
      typeAnnotation: null
    };
  }
  function deserializeAssignmentTargetPropertyIdentifier(pos) {
    const start = deserializeU32(pos), end = deserializeU32(pos + 4), key = deserializeIdentifierReference(pos + 8);
    const init = deserializeOptionExpression(pos + 40), keyCopy = { ...key }, value = init === null ? keyCopy : {
      type: "AssignmentPattern",
      start,
      end,
      left: keyCopy,
      right: init,
      typeAnnotation: null,
      optional: false,
      decorators: []
    };
    return {
      type: "Property",
      start,
      end,
      method: false,
      shorthand: true,
      computed: false,
      key,
      value,
      kind: "init",
      optional: false
    };
  }
  function deserializeAssignmentTargetPropertyProperty(pos) {
    return {
      type: "Property",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      method: false,
      shorthand: false,
      computed: deserializeBool(pos + 40),
      key: deserializePropertyKey(pos + 8),
      value: deserializeAssignmentTargetMaybeDefault(pos + 24),
      kind: "init",
      optional: false
    };
  }
  function deserializeSequenceExpression(pos) {
    return {
      type: "SequenceExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expressions: deserializeVecExpression(pos + 8)
    };
  }
  function deserializeSuper(pos) {
    return {
      type: "Super",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeAwaitExpression(pos) {
    return {
      type: "AwaitExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      argument: deserializeExpression(pos + 8)
    };
  }
  function deserializeChainExpression(pos) {
    return {
      type: "ChainExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeChainElement(pos + 8)
    };
  }
  function deserializeParenthesizedExpression(pos) {
    return {
      type: "ParenthesizedExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8)
    };
  }
  function deserializeDirective(pos) {
    return {
      type: "ExpressionStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeStringLiteral(pos + 8),
      directive: deserializeStr(pos + 56)
    };
  }
  function deserializeHashbang(pos) {
    return {
      type: "Hashbang",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      value: deserializeStr(pos + 8)
    };
  }
  function deserializeBlockStatement(pos) {
    return {
      type: "BlockStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeVecStatement(pos + 8)
    };
  }
  function deserializeVariableDeclaration(pos) {
    return {
      type: "VariableDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      declarations: deserializeVecVariableDeclarator(pos + 16),
      kind: deserializeVariableDeclarationKind(pos + 8),
      declare: deserializeBool(pos + 48)
    };
  }
  function deserializeVariableDeclarator(pos) {
    return {
      type: "VariableDeclarator",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeBindingPattern(pos + 16),
      init: deserializeOptionExpression(pos + 48),
      definite: deserializeBool(pos + 64)
    };
  }
  function deserializeEmptyStatement(pos) {
    return {
      type: "EmptyStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeExpressionStatement(pos) {
    return {
      type: "ExpressionStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8),
      directive: null
    };
  }
  function deserializeIfStatement(pos) {
    return {
      type: "IfStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      test: deserializeExpression(pos + 8),
      consequent: deserializeStatement(pos + 24),
      alternate: deserializeOptionStatement(pos + 40)
    };
  }
  function deserializeDoWhileStatement(pos) {
    return {
      type: "DoWhileStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeStatement(pos + 8),
      test: deserializeExpression(pos + 24)
    };
  }
  function deserializeWhileStatement(pos) {
    return {
      type: "WhileStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      test: deserializeExpression(pos + 8),
      body: deserializeStatement(pos + 24)
    };
  }
  function deserializeForStatement(pos) {
    return {
      type: "ForStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      init: deserializeOptionForStatementInit(pos + 8),
      test: deserializeOptionExpression(pos + 24),
      update: deserializeOptionExpression(pos + 40),
      body: deserializeStatement(pos + 56)
    };
  }
  function deserializeForInStatement(pos) {
    return {
      type: "ForInStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      left: deserializeForStatementLeft(pos + 8),
      right: deserializeExpression(pos + 24),
      body: deserializeStatement(pos + 40)
    };
  }
  function deserializeForOfStatement(pos) {
    return {
      type: "ForOfStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      await: deserializeBool(pos + 8),
      left: deserializeForStatementLeft(pos + 16),
      right: deserializeExpression(pos + 32),
      body: deserializeStatement(pos + 48)
    };
  }
  function deserializeContinueStatement(pos) {
    return {
      type: "ContinueStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      label: deserializeOptionLabelIdentifier(pos + 8)
    };
  }
  function deserializeBreakStatement(pos) {
    return {
      type: "BreakStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      label: deserializeOptionLabelIdentifier(pos + 8)
    };
  }
  function deserializeReturnStatement(pos) {
    return {
      type: "ReturnStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      argument: deserializeOptionExpression(pos + 8)
    };
  }
  function deserializeWithStatement(pos) {
    return {
      type: "WithStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      object: deserializeExpression(pos + 8),
      body: deserializeStatement(pos + 24)
    };
  }
  function deserializeSwitchStatement(pos) {
    return {
      type: "SwitchStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      discriminant: deserializeExpression(pos + 8),
      cases: deserializeVecSwitchCase(pos + 24)
    };
  }
  function deserializeSwitchCase(pos) {
    return {
      type: "SwitchCase",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      consequent: deserializeVecStatement(pos + 24),
      test: deserializeOptionExpression(pos + 8)
    };
  }
  function deserializeLabeledStatement(pos) {
    return {
      type: "LabeledStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeStatement(pos + 32),
      label: deserializeLabelIdentifier(pos + 8)
    };
  }
  function deserializeThrowStatement(pos) {
    return {
      type: "ThrowStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      argument: deserializeExpression(pos + 8)
    };
  }
  function deserializeTryStatement(pos) {
    return {
      type: "TryStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      block: deserializeBoxBlockStatement(pos + 8),
      handler: deserializeOptionBoxCatchClause(pos + 16),
      finalizer: deserializeOptionBoxBlockStatement(pos + 24)
    };
  }
  function deserializeCatchClause(pos) {
    return {
      type: "CatchClause",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      param: deserializeOptionCatchParameter(pos + 8),
      body: deserializeBoxBlockStatement(pos + 48)
    };
  }
  function deserializeCatchParameter(pos) {
    return {
      ...deserializeBindingPatternKind(pos + 8),
      typeAnnotation: deserializeOptionBoxTSTypeAnnotation(pos + 24),
      optional: deserializeBool(pos + 32)
    };
  }
  function deserializeDebuggerStatement(pos) {
    return {
      type: "DebuggerStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeBindingPattern(pos) {
    return {
      ...deserializeBindingPatternKind(pos),
      typeAnnotation: deserializeOptionBoxTSTypeAnnotation(pos + 16),
      optional: deserializeBool(pos + 24)
    };
  }
  function deserializeAssignmentPattern(pos) {
    return {
      type: "AssignmentPattern",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      left: deserializeBindingPattern(pos + 8),
      right: deserializeExpression(pos + 40),
      decorators: [],
      optional: false,
      typeAnnotation: null
    };
  }
  function deserializeObjectPattern(pos) {
    const properties = deserializeVecBindingProperty(pos + 8);
    const rest = deserializeOptionBoxBindingRestElement(pos + 40);
    if (rest !== null)
      properties.push(rest);
    return {
      type: "ObjectPattern",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      properties,
      decorators: [],
      optional: false,
      typeAnnotation: null
    };
  }
  function deserializeBindingProperty(pos) {
    return {
      type: "Property",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      method: false,
      shorthand: deserializeBool(pos + 56),
      computed: deserializeBool(pos + 57),
      key: deserializePropertyKey(pos + 8),
      value: deserializeBindingPattern(pos + 24),
      kind: "init",
      optional: false
    };
  }
  function deserializeArrayPattern(pos) {
    const elements = deserializeVecOptionBindingPattern(pos + 8);
    const rest = deserializeOptionBoxBindingRestElement(pos + 40);
    if (rest !== null)
      elements.push(rest);
    return {
      type: "ArrayPattern",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      elements,
      decorators: [],
      optional: false,
      typeAnnotation: null
    };
  }
  function deserializeBindingRestElement(pos) {
    return {
      type: "RestElement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      argument: deserializeBindingPattern(pos + 8),
      decorators: [],
      optional: false,
      typeAnnotation: null,
      value: null
    };
  }
  function deserializeFunction(pos) {
    const params = deserializeBoxFormalParameters(pos + 72);
    const thisParam = deserializeOptionBoxTSThisParameter(pos + 64);
    if (thisParam !== null)
      params.unshift(thisParam);
    return {
      type: deserializeFunctionType(pos + 8),
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeOptionBindingIdentifier(pos + 16),
      expression: false,
      generator: deserializeBool(pos + 48),
      async: deserializeBool(pos + 49),
      params,
      body: deserializeOptionBoxFunctionBody(pos + 88),
      declare: deserializeBool(pos + 50),
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 56),
      returnType: deserializeOptionBoxTSTypeAnnotation(pos + 80)
    };
  }
  function deserializeFormalParameters(pos) {
    const params = deserializeVecFormalParameter(pos + 16);
    if (uint32[pos + 48 >> 2] !== 0 && uint32[pos + 52 >> 2] !== 0) {
      pos = uint32[pos + 48 >> 2];
      params.push({
        type: "RestElement",
        start: deserializeU32(pos),
        end: deserializeU32(pos + 4),
        argument: deserializeBindingPatternKind(pos + 8),
        typeAnnotation: deserializeOptionBoxTSTypeAnnotation(pos + 24),
        optional: deserializeBool(pos + 32),
        decorators: [],
        value: null
      });
    }
    return params;
  }
  function deserializeFormalParameter(pos) {
    const accessibility = deserializeOptionTSAccessibility(pos + 72), readonly = deserializeBool(pos + 73), override = deserializeBool(pos + 74);
    let param;
    if (accessibility === null && !readonly && !override) {
      param = {
        ...deserializeBindingPatternKind(pos + 40),
        typeAnnotation: deserializeOptionBoxTSTypeAnnotation(pos + 56),
        optional: deserializeBool(pos + 64),
        decorators: deserializeVecDecorator(pos + 8)
      };
    } else {
      param = {
        type: "TSParameterProperty",
        start: deserializeU32(pos),
        end: deserializeU32(pos + 4),
        accessibility,
        decorators: deserializeVecDecorator(pos + 8),
        override,
        parameter: deserializeBindingPattern(pos + 40),
        readonly,
        static: false
      };
    }
    return param;
  }
  function deserializeFunctionBody(pos) {
    const body = deserializeVecDirective(pos + 8);
    body.push(...deserializeVecStatement(pos + 40));
    return {
      type: "BlockStatement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body
    };
  }
  function deserializeArrowFunctionExpression(pos) {
    const expression = deserializeBool(pos + 8);
    let body = deserializeBoxFunctionBody(pos + 40);
    return {
      type: "ArrowFunctionExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: null,
      expression,
      generator: false,
      async: deserializeBool(pos + 9),
      params: deserializeBoxFormalParameters(pos + 24),
      body: expression ? body.body[0].expression : body,
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 16),
      returnType: deserializeOptionBoxTSTypeAnnotation(pos + 32)
    };
  }
  function deserializeYieldExpression(pos) {
    return {
      type: "YieldExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      delegate: deserializeBool(pos + 8),
      argument: deserializeOptionExpression(pos + 16)
    };
  }
  function deserializeClass(pos) {
    return {
      type: deserializeClassType(pos + 8),
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeOptionBindingIdentifier(pos + 48),
      superClass: deserializeOptionExpression(pos + 88),
      body: deserializeBoxClassBody(pos + 144),
      decorators: deserializeVecDecorator(pos + 16),
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 80),
      superTypeArguments: deserializeOptionBoxTSTypeParameterInstantiation(pos + 104),
      implements: deserializeVecTSClassImplements(pos + 112),
      abstract: deserializeBool(pos + 152),
      declare: deserializeBool(pos + 153)
    };
  }
  function deserializeClassBody(pos) {
    return {
      type: "ClassBody",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeVecClassElement(pos + 8)
    };
  }
  function deserializeMethodDefinition(pos) {
    const kind = deserializeMethodDefinitionKind(pos + 72);
    let key = deserializePropertyKey(pos + 48);
    if (kind === "constructor") {
      key = {
        type: "Identifier",
        start: key.start,
        end: key.end,
        name: "constructor",
        decorators: [],
        optional: false,
        typeAnnotation: null
      };
    }
    return {
      type: deserializeMethodDefinitionType(pos + 8),
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      static: deserializeBool(pos + 74),
      computed: deserializeBool(pos + 73),
      key,
      kind,
      value: deserializeBoxFunction(pos + 64),
      decorators: deserializeVecDecorator(pos + 16),
      override: deserializeBool(pos + 75),
      optional: deserializeBool(pos + 76),
      accessibility: deserializeOptionTSAccessibility(pos + 77)
    };
  }
  function deserializePropertyDefinition(pos) {
    return {
      type: deserializePropertyDefinitionType(pos + 8),
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      static: deserializeBool(pos + 81),
      computed: deserializeBool(pos + 80),
      key: deserializePropertyKey(pos + 48),
      value: deserializeOptionExpression(pos + 64),
      decorators: deserializeVecDecorator(pos + 16),
      declare: deserializeBool(pos + 82),
      override: deserializeBool(pos + 83),
      optional: deserializeBool(pos + 84),
      definite: deserializeBool(pos + 85),
      readonly: deserializeBool(pos + 86),
      typeAnnotation: deserializeOptionBoxTSTypeAnnotation(pos + 88),
      accessibility: deserializeOptionTSAccessibility(pos + 96)
    };
  }
  function deserializePrivateIdentifier(pos) {
    return {
      type: "PrivateIdentifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeStr(pos + 8)
    };
  }
  function deserializeStaticBlock(pos) {
    return {
      type: "StaticBlock",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeVecStatement(pos + 8)
    };
  }
  function deserializeAccessorProperty(pos) {
    return {
      type: deserializeAccessorPropertyType(pos + 8),
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      key: deserializePropertyKey(pos + 48),
      value: deserializeOptionExpression(pos + 64),
      computed: deserializeBool(pos + 80),
      static: deserializeBool(pos + 81),
      decorators: deserializeVecDecorator(pos + 16),
      definite: deserializeBool(pos + 83),
      typeAnnotation: deserializeOptionBoxTSTypeAnnotation(pos + 88),
      accessibility: deserializeOptionTSAccessibility(pos + 96),
      optional: false,
      override: deserializeBool(pos + 82),
      readonly: false,
      declare: false
    };
  }
  function deserializeImportExpression(pos) {
    return {
      type: "ImportExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      source: deserializeExpression(pos + 8),
      options: deserializeOptionExpression(pos + 24)
    };
  }
  function deserializeImportDeclaration(pos) {
    let specifiers = deserializeOptionVecImportDeclarationSpecifier(pos + 8);
    if (specifiers === null)
      specifiers = [];
    const withClause = deserializeOptionBoxWithClause(pos + 96);
    return {
      type: "ImportDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      specifiers,
      source: deserializeStringLiteral(pos + 40),
      attributes: withClause === null ? [] : withClause.withEntries,
      importKind: deserializeImportOrExportKind(pos + 104)
    };
  }
  function deserializeImportSpecifier(pos) {
    return {
      type: "ImportSpecifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      imported: deserializeModuleExportName(pos + 8),
      local: deserializeBindingIdentifier(pos + 64),
      importKind: deserializeImportOrExportKind(pos + 96)
    };
  }
  function deserializeImportDefaultSpecifier(pos) {
    return {
      type: "ImportDefaultSpecifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      local: deserializeBindingIdentifier(pos + 8)
    };
  }
  function deserializeImportNamespaceSpecifier(pos) {
    return {
      type: "ImportNamespaceSpecifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      local: deserializeBindingIdentifier(pos + 8)
    };
  }
  function deserializeWithClause(pos) {
    return {
      type: "WithClause",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      attributesKeyword: deserializeIdentifierName(pos + 8),
      withEntries: deserializeVecImportAttribute(pos + 32)
    };
  }
  function deserializeImportAttribute(pos) {
    return {
      type: "ImportAttribute",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      key: deserializeImportAttributeKey(pos + 8),
      value: deserializeStringLiteral(pos + 64)
    };
  }
  function deserializeExportNamedDeclaration(pos) {
    const withClause = deserializeOptionBoxWithClause(pos + 112);
    return {
      type: "ExportNamedDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      declaration: deserializeOptionDeclaration(pos + 8),
      specifiers: deserializeVecExportSpecifier(pos + 24),
      source: deserializeOptionStringLiteral(pos + 56),
      attributes: withClause === null ? [] : withClause.withEntries,
      exportKind: deserializeImportOrExportKind(pos + 104)
    };
  }
  function deserializeExportDefaultDeclaration(pos) {
    return {
      type: "ExportDefaultDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      declaration: deserializeExportDefaultDeclarationKind(pos + 64),
      exportKind: "value"
    };
  }
  function deserializeExportAllDeclaration(pos) {
    const withClause = deserializeOptionBoxWithClause(pos + 112);
    return {
      type: "ExportAllDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      exported: deserializeOptionModuleExportName(pos + 8),
      source: deserializeStringLiteral(pos + 64),
      attributes: withClause === null ? [] : withClause.withEntries,
      exportKind: deserializeImportOrExportKind(pos + 120)
    };
  }
  function deserializeExportSpecifier(pos) {
    return {
      type: "ExportSpecifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      local: deserializeModuleExportName(pos + 8),
      exported: deserializeModuleExportName(pos + 64),
      exportKind: deserializeImportOrExportKind(pos + 120)
    };
  }
  function deserializeV8IntrinsicExpression(pos) {
    return {
      type: "V8IntrinsicExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeIdentifierName(pos + 8),
      arguments: deserializeVecArgument(pos + 32)
    };
  }
  function deserializeBooleanLiteral(pos) {
    const start = deserializeU32(pos), end = deserializeU32(pos + 4), value = deserializeBool(pos + 8);
    return {
      type: "Literal",
      start,
      end,
      value,
      raw: start === 0 && end === 0 ? null : value + ""
    };
  }
  function deserializeNullLiteral(pos) {
    const start = deserializeU32(pos), end = deserializeU32(pos + 4);
    return {
      type: "Literal",
      start,
      end,
      value: null,
      raw: start === 0 && end === 0 ? null : "null"
    };
  }
  function deserializeNumericLiteral(pos) {
    return {
      type: "Literal",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      value: deserializeF64(pos + 8),
      raw: deserializeOptionStr(pos + 16)
    };
  }
  function deserializeStringLiteral(pos) {
    let value = deserializeStr(pos + 8);
    if (deserializeBool(pos + 40)) {
      value = value.replace(/\uFFFD(.{4})/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
    }
    return {
      type: "Literal",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      value,
      raw: deserializeOptionStr(pos + 24)
    };
  }
  function deserializeBigIntLiteral(pos) {
    const raw = deserializeStr(pos + 8), bigint = raw.slice(0, -1).replace(/_/g, "");
    return {
      type: "Literal",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      value: BigInt(bigint),
      raw,
      bigint
    };
  }
  function deserializeRegExpLiteral(pos) {
    const regex = deserializeRegExp(pos + 8);
    let value = null;
    try {
      value = new RegExp(regex.pattern, regex.flags);
    } catch (e) {}
    return {
      type: "Literal",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      value,
      raw: deserializeOptionStr(pos + 40),
      regex
    };
  }
  function deserializeRegExp(pos) {
    return {
      pattern: deserializeRegExpPattern(pos),
      flags: deserializeRegExpFlags(pos + 24)
    };
  }
  function deserializeRegExpFlags(pos) {
    const flagBits = deserializeU8(pos);
    let flags = "";
    if (flagBits & 64)
      flags += "d";
    if (flagBits & 1)
      flags += "g";
    if (flagBits & 2)
      flags += "i";
    if (flagBits & 4)
      flags += "m";
    if (flagBits & 8)
      flags += "s";
    if (flagBits & 16)
      flags += "u";
    if (flagBits & 128)
      flags += "v";
    if (flagBits & 32)
      flags += "y";
    return flags;
  }
  function deserializeJSXElement(pos) {
    const closingElement = deserializeOptionBoxJSXClosingElement(pos + 16);
    const openingElement = deserializeBoxJSXOpeningElement(pos + 8);
    if (closingElement === null)
      openingElement.selfClosing = true;
    return {
      type: "JSXElement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      openingElement,
      closingElement,
      children: deserializeVecJSXChild(pos + 24)
    };
  }
  function deserializeJSXOpeningElement(pos) {
    return {
      type: "JSXOpeningElement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      attributes: deserializeVecJSXAttributeItem(pos + 24),
      name: deserializeJSXElementName(pos + 8),
      selfClosing: false,
      typeArguments: deserializeOptionBoxTSTypeParameterInstantiation(pos + 56)
    };
  }
  function deserializeJSXClosingElement(pos) {
    return {
      type: "JSXClosingElement",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeJSXElementName(pos + 8)
    };
  }
  function deserializeJSXFragment(pos) {
    return {
      type: "JSXFragment",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      openingFragment: deserializeJSXOpeningFragment(pos + 8),
      closingFragment: deserializeJSXClosingFragment(pos + 16),
      children: deserializeVecJSXChild(pos + 24)
    };
  }
  function deserializeJSXOpeningFragment(pos) {
    const node = {
      type: "JSXOpeningFragment",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
    return node;
  }
  function deserializeJSXClosingFragment(pos) {
    return {
      type: "JSXClosingFragment",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeJSXNamespacedName(pos) {
    return {
      type: "JSXNamespacedName",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      namespace: deserializeJSXIdentifier(pos + 8),
      name: deserializeJSXIdentifier(pos + 32)
    };
  }
  function deserializeJSXMemberExpression(pos) {
    return {
      type: "JSXMemberExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      object: deserializeJSXMemberExpressionObject(pos + 8),
      property: deserializeJSXIdentifier(pos + 24)
    };
  }
  function deserializeJSXExpressionContainer(pos) {
    return {
      type: "JSXExpressionContainer",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeJSXExpression(pos + 8)
    };
  }
  function deserializeJSXEmptyExpression(pos) {
    return {
      type: "JSXEmptyExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeJSXAttribute(pos) {
    return {
      type: "JSXAttribute",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeJSXAttributeName(pos + 8),
      value: deserializeOptionJSXAttributeValue(pos + 24)
    };
  }
  function deserializeJSXSpreadAttribute(pos) {
    return {
      type: "JSXSpreadAttribute",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      argument: deserializeExpression(pos + 8)
    };
  }
  function deserializeJSXIdentifier(pos) {
    return {
      type: "JSXIdentifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeStr(pos + 8)
    };
  }
  function deserializeJSXSpreadChild(pos) {
    return {
      type: "JSXSpreadChild",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8)
    };
  }
  function deserializeJSXText(pos) {
    return {
      type: "JSXText",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      value: deserializeStr(pos + 8),
      raw: deserializeOptionStr(pos + 24)
    };
  }
  function deserializeTSThisParameter(pos) {
    return {
      type: "Identifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: "this",
      typeAnnotation: deserializeOptionBoxTSTypeAnnotation(pos + 16),
      decorators: [],
      optional: false
    };
  }
  function deserializeTSEnumDeclaration(pos) {
    return {
      type: "TSEnumDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeBindingIdentifier(pos + 8),
      body: deserializeTSEnumBody(pos + 40),
      const: deserializeBool(pos + 80),
      declare: deserializeBool(pos + 81)
    };
  }
  function deserializeTSEnumBody(pos) {
    return {
      type: "TSEnumBody",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      members: deserializeVecTSEnumMember(pos + 8)
    };
  }
  function deserializeTSEnumMember(pos) {
    return {
      type: "TSEnumMember",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeTSEnumMemberName(pos + 8),
      computed: deserializeU8(pos + 8) > 1,
      initializer: deserializeOptionExpression(pos + 24)
    };
  }
  function deserializeTSTypeAnnotation(pos) {
    return {
      type: "TSTypeAnnotation",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeAnnotation: deserializeTSType(pos + 8)
    };
  }
  function deserializeTSLiteralType(pos) {
    return {
      type: "TSLiteralType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      literal: deserializeTSLiteral(pos + 8)
    };
  }
  function deserializeTSConditionalType(pos) {
    return {
      type: "TSConditionalType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      checkType: deserializeTSType(pos + 8),
      extendsType: deserializeTSType(pos + 24),
      trueType: deserializeTSType(pos + 40),
      falseType: deserializeTSType(pos + 56)
    };
  }
  function deserializeTSUnionType(pos) {
    return {
      type: "TSUnionType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      types: deserializeVecTSType(pos + 8)
    };
  }
  function deserializeTSIntersectionType(pos) {
    return {
      type: "TSIntersectionType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      types: deserializeVecTSType(pos + 8)
    };
  }
  function deserializeTSParenthesizedType(pos) {
    return {
      type: "TSParenthesizedType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeAnnotation: deserializeTSType(pos + 8)
    };
  }
  function deserializeTSTypeOperator(pos) {
    return {
      type: "TSTypeOperator",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      operator: deserializeTSTypeOperatorOperator(pos + 8),
      typeAnnotation: deserializeTSType(pos + 16)
    };
  }
  function deserializeTSArrayType(pos) {
    return {
      type: "TSArrayType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      elementType: deserializeTSType(pos + 8)
    };
  }
  function deserializeTSIndexedAccessType(pos) {
    return {
      type: "TSIndexedAccessType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      objectType: deserializeTSType(pos + 8),
      indexType: deserializeTSType(pos + 24)
    };
  }
  function deserializeTSTupleType(pos) {
    return {
      type: "TSTupleType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      elementTypes: deserializeVecTSTupleElement(pos + 8)
    };
  }
  function deserializeTSNamedTupleMember(pos) {
    return {
      type: "TSNamedTupleMember",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      elementType: deserializeTSTupleElement(pos + 8),
      label: deserializeIdentifierName(pos + 24),
      optional: deserializeBool(pos + 48)
    };
  }
  function deserializeTSOptionalType(pos) {
    return {
      type: "TSOptionalType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeAnnotation: deserializeTSType(pos + 8)
    };
  }
  function deserializeTSRestType(pos) {
    return {
      type: "TSRestType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeAnnotation: deserializeTSType(pos + 8)
    };
  }
  function deserializeTSAnyKeyword(pos) {
    return {
      type: "TSAnyKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSStringKeyword(pos) {
    return {
      type: "TSStringKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSBooleanKeyword(pos) {
    return {
      type: "TSBooleanKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSNumberKeyword(pos) {
    return {
      type: "TSNumberKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSNeverKeyword(pos) {
    return {
      type: "TSNeverKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSIntrinsicKeyword(pos) {
    return {
      type: "TSIntrinsicKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSUnknownKeyword(pos) {
    return {
      type: "TSUnknownKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSNullKeyword(pos) {
    return {
      type: "TSNullKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSUndefinedKeyword(pos) {
    return {
      type: "TSUndefinedKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSVoidKeyword(pos) {
    return {
      type: "TSVoidKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSSymbolKeyword(pos) {
    return {
      type: "TSSymbolKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSThisType(pos) {
    return {
      type: "TSThisType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSObjectKeyword(pos) {
    return {
      type: "TSObjectKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSBigIntKeyword(pos) {
    return {
      type: "TSBigIntKeyword",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeTSTypeReference(pos) {
    return {
      type: "TSTypeReference",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeName: deserializeTSTypeName(pos + 8),
      typeArguments: deserializeOptionBoxTSTypeParameterInstantiation(pos + 24)
    };
  }
  function deserializeTSQualifiedName(pos) {
    return {
      type: "TSQualifiedName",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      left: deserializeTSTypeName(pos + 8),
      right: deserializeIdentifierName(pos + 24)
    };
  }
  function deserializeTSTypeParameterInstantiation(pos) {
    return {
      type: "TSTypeParameterInstantiation",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      params: deserializeVecTSType(pos + 8)
    };
  }
  function deserializeTSTypeParameter(pos) {
    return {
      type: "TSTypeParameter",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeBindingIdentifier(pos + 8),
      constraint: deserializeOptionTSType(pos + 40),
      default: deserializeOptionTSType(pos + 56),
      in: deserializeBool(pos + 72),
      out: deserializeBool(pos + 73),
      const: deserializeBool(pos + 74)
    };
  }
  function deserializeTSTypeParameterDeclaration(pos) {
    return {
      type: "TSTypeParameterDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      params: deserializeVecTSTypeParameter(pos + 8)
    };
  }
  function deserializeTSTypeAliasDeclaration(pos) {
    return {
      type: "TSTypeAliasDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeBindingIdentifier(pos + 8),
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 40),
      typeAnnotation: deserializeTSType(pos + 48),
      declare: deserializeBool(pos + 64)
    };
  }
  function deserializeTSClassImplements(pos) {
    let expression = deserializeTSTypeName(pos + 8);
    if (expression.type === "TSQualifiedName") {
      let parent = expression = {
        type: "MemberExpression",
        start: expression.start,
        end: expression.end,
        object: expression.left,
        property: expression.right,
        computed: false,
        optional: false
      };
      while (parent.object.type === "TSQualifiedName") {
        const object = parent.object;
        parent = parent.object = {
          type: "MemberExpression",
          start: object.start,
          end: object.end,
          object: object.left,
          property: object.right,
          computed: false,
          optional: false
        };
      }
    }
    return {
      type: "TSClassImplements",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression,
      typeArguments: deserializeOptionBoxTSTypeParameterInstantiation(pos + 24)
    };
  }
  function deserializeTSInterfaceDeclaration(pos) {
    return {
      type: "TSInterfaceDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeBindingIdentifier(pos + 8),
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 40),
      extends: deserializeVecTSInterfaceHeritage(pos + 48),
      body: deserializeBoxTSInterfaceBody(pos + 80),
      declare: deserializeBool(pos + 88)
    };
  }
  function deserializeTSInterfaceBody(pos) {
    return {
      type: "TSInterfaceBody",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeVecTSSignature(pos + 8)
    };
  }
  function deserializeTSPropertySignature(pos) {
    return {
      type: "TSPropertySignature",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      computed: deserializeBool(pos + 8),
      optional: deserializeBool(pos + 9),
      readonly: deserializeBool(pos + 10),
      key: deserializePropertyKey(pos + 16),
      typeAnnotation: deserializeOptionBoxTSTypeAnnotation(pos + 32),
      accessibility: null,
      static: false
    };
  }
  function deserializeTSIndexSignature(pos) {
    return {
      type: "TSIndexSignature",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      parameters: deserializeVecTSIndexSignatureName(pos + 8),
      typeAnnotation: deserializeBoxTSTypeAnnotation(pos + 40),
      readonly: deserializeBool(pos + 48),
      static: deserializeBool(pos + 49),
      accessibility: null
    };
  }
  function deserializeTSCallSignatureDeclaration(pos) {
    const params = deserializeBoxFormalParameters(pos + 24);
    const thisParam = deserializeOptionBoxTSThisParameter(pos + 16);
    if (thisParam !== null)
      params.unshift(thisParam);
    return {
      type: "TSCallSignatureDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 8),
      params,
      returnType: deserializeOptionBoxTSTypeAnnotation(pos + 32)
    };
  }
  function deserializeTSMethodSignature(pos) {
    const params = deserializeBoxFormalParameters(pos + 48);
    const thisParam = deserializeOptionBoxTSThisParameter(pos + 40);
    if (thisParam !== null)
      params.unshift(thisParam);
    return {
      type: "TSMethodSignature",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      key: deserializePropertyKey(pos + 8),
      computed: deserializeBool(pos + 24),
      optional: deserializeBool(pos + 25),
      kind: deserializeTSMethodSignatureKind(pos + 26),
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 32),
      params,
      returnType: deserializeOptionBoxTSTypeAnnotation(pos + 56),
      accessibility: null,
      readonly: false,
      static: false
    };
  }
  function deserializeTSConstructSignatureDeclaration(pos) {
    return {
      type: "TSConstructSignatureDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 8),
      params: deserializeBoxFormalParameters(pos + 16),
      returnType: deserializeOptionBoxTSTypeAnnotation(pos + 24)
    };
  }
  function deserializeTSIndexSignatureName(pos) {
    return {
      type: "Identifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeStr(pos + 8),
      typeAnnotation: deserializeBoxTSTypeAnnotation(pos + 24),
      decorators: [],
      optional: false
    };
  }
  function deserializeTSInterfaceHeritage(pos) {
    return {
      type: "TSInterfaceHeritage",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8),
      typeArguments: deserializeOptionBoxTSTypeParameterInstantiation(pos + 24)
    };
  }
  function deserializeTSTypePredicate(pos) {
    return {
      type: "TSTypePredicate",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      parameterName: deserializeTSTypePredicateName(pos + 8),
      asserts: deserializeBool(pos + 24),
      typeAnnotation: deserializeOptionBoxTSTypeAnnotation(pos + 32)
    };
  }
  function deserializeTSModuleDeclaration(pos) {
    const kind = deserializeTSModuleDeclarationKind(pos + 80), global = kind === "global", start = deserializeU32(pos), end = deserializeU32(pos + 4), declare = deserializeBool(pos + 81);
    let id = deserializeTSModuleDeclarationName(pos + 8), body = deserializeOptionTSModuleDeclarationBody(pos + 64);
    if (body !== null && body.type === "TSModuleDeclaration") {
      id = {
        type: "TSQualifiedName",
        start: body.id.start,
        end: id.end,
        left: body.id,
        right: id
      };
      body = Object.hasOwn(body, "body") ? body.body : null;
    }
    const node = body === null ? { type: "TSModuleDeclaration", start, end, id, kind, declare, global } : { type: "TSModuleDeclaration", start, end, id, body, kind, declare, global };
    return node;
  }
  function deserializeTSModuleBlock(pos) {
    const body = deserializeVecDirective(pos + 8);
    body.push(...deserializeVecStatement(pos + 40));
    return {
      type: "TSModuleBlock",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body
    };
  }
  function deserializeTSTypeLiteral(pos) {
    return {
      type: "TSTypeLiteral",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      members: deserializeVecTSSignature(pos + 8)
    };
  }
  function deserializeTSInferType(pos) {
    return {
      type: "TSInferType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeParameter: deserializeBoxTSTypeParameter(pos + 8)
    };
  }
  function deserializeTSTypeQuery(pos) {
    return {
      type: "TSTypeQuery",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      exprName: deserializeTSTypeQueryExprName(pos + 8),
      typeArguments: deserializeOptionBoxTSTypeParameterInstantiation(pos + 24)
    };
  }
  function deserializeTSImportType(pos) {
    let options = deserializeOptionBoxObjectExpression(pos + 24);
    if (options !== null && options.properties.length === 1) {
      const prop = options.properties[0];
      if (!prop.method && !prop.shorthand && !prop.computed && prop.key.type === "Identifier" && prop.key.name === "assert") {
        prop.key.name = "with";
      }
    }
    return {
      type: "TSImportType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      argument: deserializeTSType(pos + 8),
      options,
      qualifier: deserializeOptionTSTypeName(pos + 32),
      typeArguments: deserializeOptionBoxTSTypeParameterInstantiation(pos + 48)
    };
  }
  function deserializeTSFunctionType(pos) {
    const params = deserializeBoxFormalParameters(pos + 24);
    const thisParam = deserializeOptionBoxTSThisParameter(pos + 16);
    if (thisParam !== null)
      params.unshift(thisParam);
    return {
      type: "TSFunctionType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 8),
      params,
      returnType: deserializeBoxTSTypeAnnotation(pos + 32)
    };
  }
  function deserializeTSConstructorType(pos) {
    return {
      type: "TSConstructorType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      abstract: deserializeBool(pos + 8),
      typeParameters: deserializeOptionBoxTSTypeParameterDeclaration(pos + 16),
      params: deserializeBoxFormalParameters(pos + 24),
      returnType: deserializeBoxTSTypeAnnotation(pos + 32)
    };
  }
  function deserializeTSMappedType(pos) {
    const typeParameter = deserializeBoxTSTypeParameter(pos + 8);
    return {
      type: "TSMappedType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      nameType: deserializeOptionTSType(pos + 16),
      typeAnnotation: deserializeOptionTSType(pos + 32),
      optional: deserializeOptionTSMappedTypeModifierOperator(pos + 48),
      readonly: deserializeOptionTSMappedTypeModifierOperator(pos + 49),
      key: typeParameter.name,
      constraint: typeParameter.constraint
    };
  }
  function deserializeTSTemplateLiteralType(pos) {
    return {
      type: "TSTemplateLiteralType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      quasis: deserializeVecTemplateElement(pos + 8),
      types: deserializeVecTSType(pos + 40)
    };
  }
  function deserializeTSAsExpression(pos) {
    return {
      type: "TSAsExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8),
      typeAnnotation: deserializeTSType(pos + 24)
    };
  }
  function deserializeTSSatisfiesExpression(pos) {
    return {
      type: "TSSatisfiesExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8),
      typeAnnotation: deserializeTSType(pos + 24)
    };
  }
  function deserializeTSTypeAssertion(pos) {
    return {
      type: "TSTypeAssertion",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8),
      typeAnnotation: deserializeTSType(pos + 24)
    };
  }
  function deserializeTSImportEqualsDeclaration(pos) {
    return {
      type: "TSImportEqualsDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeBindingIdentifier(pos + 8),
      moduleReference: deserializeTSModuleReference(pos + 40),
      importKind: deserializeImportOrExportKind(pos + 56)
    };
  }
  function deserializeTSExternalModuleReference(pos) {
    return {
      type: "TSExternalModuleReference",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeStringLiteral(pos + 8)
    };
  }
  function deserializeTSNonNullExpression(pos) {
    return {
      type: "TSNonNullExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8)
    };
  }
  function deserializeDecorator(pos) {
    return {
      type: "Decorator",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8)
    };
  }
  function deserializeTSExportAssignment(pos) {
    return {
      type: "TSExportAssignment",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8)
    };
  }
  function deserializeTSNamespaceExportDeclaration(pos) {
    return {
      type: "TSNamespaceExportDeclaration",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      id: deserializeIdentifierName(pos + 8)
    };
  }
  function deserializeTSInstantiationExpression(pos) {
    return {
      type: "TSInstantiationExpression",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      expression: deserializeExpression(pos + 8),
      typeArguments: deserializeBoxTSTypeParameterInstantiation(pos + 24)
    };
  }
  function deserializeJSDocNullableType(pos) {
    return {
      type: "TSJSDocNullableType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeAnnotation: deserializeTSType(pos + 8),
      postfix: deserializeBool(pos + 24)
    };
  }
  function deserializeJSDocNonNullableType(pos) {
    return {
      type: "TSJSDocNonNullableType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      typeAnnotation: deserializeTSType(pos + 8),
      postfix: deserializeBool(pos + 24)
    };
  }
  function deserializeJSDocUnknownType(pos) {
    return {
      type: "TSJSDocUnknownType",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeComment(pos) {
    const type = deserializeCommentKind(pos + 12), start = deserializeU32(pos), end = deserializeU32(pos + 4);
    const endCut = type === "Line" ? 0 : 2;
    return {
      type,
      value: sourceText.slice(start + 2, end - endCut),
      start,
      end
    };
  }
  function deserializeNameSpan(pos) {
    return {
      value: deserializeStr(pos),
      start: deserializeU32(pos + 16),
      end: deserializeU32(pos + 20)
    };
  }
  function deserializeImportEntry(pos) {
    return {
      importName: deserializeImportImportName(pos + 32),
      localName: deserializeNameSpan(pos + 64),
      isType: deserializeBool(pos + 88)
    };
  }
  function deserializeExportEntry(pos) {
    return {
      start: deserializeU32(pos + 8),
      end: deserializeU32(pos + 12),
      moduleRequest: deserializeOptionNameSpan(pos + 16),
      importName: deserializeExportImportName(pos + 40),
      exportName: deserializeExportExportName(pos + 72),
      localName: deserializeExportLocalName(pos + 104),
      isType: deserializeBool(pos + 136)
    };
  }
  function deserializeDynamicImport(pos) {
    return {
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      moduleRequest: deserializeSpan(pos + 8)
    };
  }
  function deserializeSpan(pos) {
    return {
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializePattern(pos) {
    return {
      type: "Pattern",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeDisjunction(pos + 8)
    };
  }
  function deserializeDisjunction(pos) {
    return {
      type: "Disjunction",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeVecAlternative(pos + 8)
    };
  }
  function deserializeAlternative(pos) {
    return {
      type: "Alternative",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      body: deserializeVecTerm(pos + 8)
    };
  }
  function deserializeBoundaryAssertion(pos) {
    return {
      type: "BoundaryAssertion",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      kind: deserializeBoundaryAssertionKind(pos + 8)
    };
  }
  function deserializeLookAroundAssertion(pos) {
    return {
      type: "LookAroundAssertion",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      kind: deserializeLookAroundAssertionKind(pos + 8),
      body: deserializeDisjunction(pos + 16)
    };
  }
  function deserializeQuantifier(pos) {
    return {
      type: "Quantifier",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      min: deserializeU64(pos + 8),
      max: deserializeOptionU64(pos + 16),
      greedy: deserializeBool(pos + 32),
      body: deserializeTerm(pos + 40)
    };
  }
  function deserializeCharacter(pos) {
    return {
      type: "Character",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      kind: deserializeCharacterKind(pos + 8),
      value: deserializeU32(pos + 12)
    };
  }
  function deserializeCharacterClassEscape(pos) {
    return {
      type: "CharacterClassEscape",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      kind: deserializeCharacterClassEscapeKind(pos + 8)
    };
  }
  function deserializeUnicodePropertyEscape(pos) {
    return {
      type: "UnicodePropertyEscape",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      negative: deserializeBool(pos + 8),
      strings: deserializeBool(pos + 9),
      name: deserializeStr(pos + 16),
      value: deserializeOptionStr(pos + 32)
    };
  }
  function deserializeDot(pos) {
    return {
      type: "Dot",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4)
    };
  }
  function deserializeCharacterClass(pos) {
    return {
      type: "CharacterClass",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      negative: deserializeBool(pos + 8),
      strings: deserializeBool(pos + 9),
      kind: deserializeCharacterClassContentsKind(pos + 10),
      body: deserializeVecCharacterClassContents(pos + 16)
    };
  }
  function deserializeCharacterClassRange(pos) {
    return {
      type: "CharacterClassRange",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      min: deserializeCharacter(pos + 8),
      max: deserializeCharacter(pos + 24)
    };
  }
  function deserializeClassStringDisjunction(pos) {
    return {
      type: "ClassStringDisjunction",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      strings: deserializeBool(pos + 8),
      body: deserializeVecClassString(pos + 16)
    };
  }
  function deserializeClassString(pos) {
    return {
      type: "ClassString",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      strings: deserializeBool(pos + 8),
      body: deserializeVecCharacter(pos + 16)
    };
  }
  function deserializeCapturingGroup(pos) {
    return {
      type: "CapturingGroup",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeOptionStr(pos + 8),
      body: deserializeDisjunction(pos + 24)
    };
  }
  function deserializeIgnoreGroup(pos) {
    return {
      type: "IgnoreGroup",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      modifiers: deserializeOptionModifiers(pos + 8),
      body: deserializeDisjunction(pos + 24)
    };
  }
  function deserializeModifiers(pos) {
    return {
      type: "Modifiers",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      enabling: deserializeOptionModifier(pos + 8),
      disabling: deserializeOptionModifier(pos + 11)
    };
  }
  function deserializeModifier(pos) {
    return {
      type: "Modifier",
      ignoreCase: deserializeBool(pos),
      multiline: deserializeBool(pos + 1),
      sticky: deserializeBool(pos + 2)
    };
  }
  function deserializeIndexedReference(pos) {
    return {
      type: "IndexedReference",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      index: deserializeU32(pos + 8)
    };
  }
  function deserializeNamedReference(pos) {
    return {
      type: "NamedReference",
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      name: deserializeStr(pos + 8)
    };
  }
  function deserializeRawTransferData(pos) {
    return {
      program: deserializeProgram(pos),
      comments: deserializeVecComment(pos + 160),
      module: deserializeEcmaScriptModule(pos + 192),
      errors: deserializeVecError(pos + 328)
    };
  }
  function deserializeError(pos) {
    return {
      severity: deserializeErrorSeverity(pos),
      message: deserializeStr(pos + 8),
      labels: deserializeVecErrorLabel(pos + 24),
      helpMessage: deserializeOptionStr(pos + 56)
    };
  }
  function deserializeErrorLabel(pos) {
    return {
      message: deserializeOptionStr(pos),
      start: deserializeU32(pos + 16),
      end: deserializeU32(pos + 20)
    };
  }
  function deserializeEcmaScriptModule(pos) {
    return {
      hasModuleSyntax: deserializeBool(pos),
      staticImports: deserializeVecStaticImport(pos + 8),
      staticExports: deserializeVecStaticExport(pos + 40),
      dynamicImports: deserializeVecDynamicImport(pos + 72),
      importMetas: deserializeVecSpan(pos + 104)
    };
  }
  function deserializeStaticImport(pos) {
    return {
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      moduleRequest: deserializeNameSpan(pos + 8),
      entries: deserializeVecImportEntry(pos + 32)
    };
  }
  function deserializeStaticExport(pos) {
    return {
      start: deserializeU32(pos),
      end: deserializeU32(pos + 4),
      entries: deserializeVecExportEntry(pos + 8)
    };
  }
  function deserializeExpression(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBooleanLiteral(pos + 8);
      case 1:
        return deserializeBoxNullLiteral(pos + 8);
      case 2:
        return deserializeBoxNumericLiteral(pos + 8);
      case 3:
        return deserializeBoxBigIntLiteral(pos + 8);
      case 4:
        return deserializeBoxRegExpLiteral(pos + 8);
      case 5:
        return deserializeBoxStringLiteral(pos + 8);
      case 6:
        return deserializeBoxTemplateLiteral(pos + 8);
      case 7:
        return deserializeBoxIdentifierReference(pos + 8);
      case 8:
        return deserializeBoxMetaProperty(pos + 8);
      case 9:
        return deserializeBoxSuper(pos + 8);
      case 10:
        return deserializeBoxArrayExpression(pos + 8);
      case 11:
        return deserializeBoxArrowFunctionExpression(pos + 8);
      case 12:
        return deserializeBoxAssignmentExpression(pos + 8);
      case 13:
        return deserializeBoxAwaitExpression(pos + 8);
      case 14:
        return deserializeBoxBinaryExpression(pos + 8);
      case 15:
        return deserializeBoxCallExpression(pos + 8);
      case 16:
        return deserializeBoxChainExpression(pos + 8);
      case 17:
        return deserializeBoxClass(pos + 8);
      case 18:
        return deserializeBoxConditionalExpression(pos + 8);
      case 19:
        return deserializeBoxFunction(pos + 8);
      case 20:
        return deserializeBoxImportExpression(pos + 8);
      case 21:
        return deserializeBoxLogicalExpression(pos + 8);
      case 22:
        return deserializeBoxNewExpression(pos + 8);
      case 23:
        return deserializeBoxObjectExpression(pos + 8);
      case 24:
        return deserializeBoxParenthesizedExpression(pos + 8);
      case 25:
        return deserializeBoxSequenceExpression(pos + 8);
      case 26:
        return deserializeBoxTaggedTemplateExpression(pos + 8);
      case 27:
        return deserializeBoxThisExpression(pos + 8);
      case 28:
        return deserializeBoxUnaryExpression(pos + 8);
      case 29:
        return deserializeBoxUpdateExpression(pos + 8);
      case 30:
        return deserializeBoxYieldExpression(pos + 8);
      case 31:
        return deserializeBoxPrivateInExpression(pos + 8);
      case 32:
        return deserializeBoxJSXElement(pos + 8);
      case 33:
        return deserializeBoxJSXFragment(pos + 8);
      case 34:
        return deserializeBoxTSAsExpression(pos + 8);
      case 35:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 36:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 37:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 38:
        return deserializeBoxTSInstantiationExpression(pos + 8);
      case 39:
        return deserializeBoxV8IntrinsicExpression(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for Expression`);
    }
  }
  function deserializeArrayExpressionElement(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBooleanLiteral(pos + 8);
      case 1:
        return deserializeBoxNullLiteral(pos + 8);
      case 2:
        return deserializeBoxNumericLiteral(pos + 8);
      case 3:
        return deserializeBoxBigIntLiteral(pos + 8);
      case 4:
        return deserializeBoxRegExpLiteral(pos + 8);
      case 5:
        return deserializeBoxStringLiteral(pos + 8);
      case 6:
        return deserializeBoxTemplateLiteral(pos + 8);
      case 7:
        return deserializeBoxIdentifierReference(pos + 8);
      case 8:
        return deserializeBoxMetaProperty(pos + 8);
      case 9:
        return deserializeBoxSuper(pos + 8);
      case 10:
        return deserializeBoxArrayExpression(pos + 8);
      case 11:
        return deserializeBoxArrowFunctionExpression(pos + 8);
      case 12:
        return deserializeBoxAssignmentExpression(pos + 8);
      case 13:
        return deserializeBoxAwaitExpression(pos + 8);
      case 14:
        return deserializeBoxBinaryExpression(pos + 8);
      case 15:
        return deserializeBoxCallExpression(pos + 8);
      case 16:
        return deserializeBoxChainExpression(pos + 8);
      case 17:
        return deserializeBoxClass(pos + 8);
      case 18:
        return deserializeBoxConditionalExpression(pos + 8);
      case 19:
        return deserializeBoxFunction(pos + 8);
      case 20:
        return deserializeBoxImportExpression(pos + 8);
      case 21:
        return deserializeBoxLogicalExpression(pos + 8);
      case 22:
        return deserializeBoxNewExpression(pos + 8);
      case 23:
        return deserializeBoxObjectExpression(pos + 8);
      case 24:
        return deserializeBoxParenthesizedExpression(pos + 8);
      case 25:
        return deserializeBoxSequenceExpression(pos + 8);
      case 26:
        return deserializeBoxTaggedTemplateExpression(pos + 8);
      case 27:
        return deserializeBoxThisExpression(pos + 8);
      case 28:
        return deserializeBoxUnaryExpression(pos + 8);
      case 29:
        return deserializeBoxUpdateExpression(pos + 8);
      case 30:
        return deserializeBoxYieldExpression(pos + 8);
      case 31:
        return deserializeBoxPrivateInExpression(pos + 8);
      case 32:
        return deserializeBoxJSXElement(pos + 8);
      case 33:
        return deserializeBoxJSXFragment(pos + 8);
      case 34:
        return deserializeBoxTSAsExpression(pos + 8);
      case 35:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 36:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 37:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 38:
        return deserializeBoxTSInstantiationExpression(pos + 8);
      case 39:
        return deserializeBoxV8IntrinsicExpression(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      case 64:
        return deserializeBoxSpreadElement(pos + 8);
      case 65:
        return deserializeElision(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ArrayExpressionElement`);
    }
  }
  function deserializeObjectPropertyKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxObjectProperty(pos + 8);
      case 1:
        return deserializeBoxSpreadElement(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ObjectPropertyKind`);
    }
  }
  function deserializePropertyKey(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBooleanLiteral(pos + 8);
      case 1:
        return deserializeBoxNullLiteral(pos + 8);
      case 2:
        return deserializeBoxNumericLiteral(pos + 8);
      case 3:
        return deserializeBoxBigIntLiteral(pos + 8);
      case 4:
        return deserializeBoxRegExpLiteral(pos + 8);
      case 5:
        return deserializeBoxStringLiteral(pos + 8);
      case 6:
        return deserializeBoxTemplateLiteral(pos + 8);
      case 7:
        return deserializeBoxIdentifierReference(pos + 8);
      case 8:
        return deserializeBoxMetaProperty(pos + 8);
      case 9:
        return deserializeBoxSuper(pos + 8);
      case 10:
        return deserializeBoxArrayExpression(pos + 8);
      case 11:
        return deserializeBoxArrowFunctionExpression(pos + 8);
      case 12:
        return deserializeBoxAssignmentExpression(pos + 8);
      case 13:
        return deserializeBoxAwaitExpression(pos + 8);
      case 14:
        return deserializeBoxBinaryExpression(pos + 8);
      case 15:
        return deserializeBoxCallExpression(pos + 8);
      case 16:
        return deserializeBoxChainExpression(pos + 8);
      case 17:
        return deserializeBoxClass(pos + 8);
      case 18:
        return deserializeBoxConditionalExpression(pos + 8);
      case 19:
        return deserializeBoxFunction(pos + 8);
      case 20:
        return deserializeBoxImportExpression(pos + 8);
      case 21:
        return deserializeBoxLogicalExpression(pos + 8);
      case 22:
        return deserializeBoxNewExpression(pos + 8);
      case 23:
        return deserializeBoxObjectExpression(pos + 8);
      case 24:
        return deserializeBoxParenthesizedExpression(pos + 8);
      case 25:
        return deserializeBoxSequenceExpression(pos + 8);
      case 26:
        return deserializeBoxTaggedTemplateExpression(pos + 8);
      case 27:
        return deserializeBoxThisExpression(pos + 8);
      case 28:
        return deserializeBoxUnaryExpression(pos + 8);
      case 29:
        return deserializeBoxUpdateExpression(pos + 8);
      case 30:
        return deserializeBoxYieldExpression(pos + 8);
      case 31:
        return deserializeBoxPrivateInExpression(pos + 8);
      case 32:
        return deserializeBoxJSXElement(pos + 8);
      case 33:
        return deserializeBoxJSXFragment(pos + 8);
      case 34:
        return deserializeBoxTSAsExpression(pos + 8);
      case 35:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 36:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 37:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 38:
        return deserializeBoxTSInstantiationExpression(pos + 8);
      case 39:
        return deserializeBoxV8IntrinsicExpression(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      case 64:
        return deserializeBoxIdentifierName(pos + 8);
      case 65:
        return deserializeBoxPrivateIdentifier(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for PropertyKey`);
    }
  }
  function deserializePropertyKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "init";
      case 1:
        return "get";
      case 2:
        return "set";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for PropertyKind`);
    }
  }
  function deserializeArgument(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBooleanLiteral(pos + 8);
      case 1:
        return deserializeBoxNullLiteral(pos + 8);
      case 2:
        return deserializeBoxNumericLiteral(pos + 8);
      case 3:
        return deserializeBoxBigIntLiteral(pos + 8);
      case 4:
        return deserializeBoxRegExpLiteral(pos + 8);
      case 5:
        return deserializeBoxStringLiteral(pos + 8);
      case 6:
        return deserializeBoxTemplateLiteral(pos + 8);
      case 7:
        return deserializeBoxIdentifierReference(pos + 8);
      case 8:
        return deserializeBoxMetaProperty(pos + 8);
      case 9:
        return deserializeBoxSuper(pos + 8);
      case 10:
        return deserializeBoxArrayExpression(pos + 8);
      case 11:
        return deserializeBoxArrowFunctionExpression(pos + 8);
      case 12:
        return deserializeBoxAssignmentExpression(pos + 8);
      case 13:
        return deserializeBoxAwaitExpression(pos + 8);
      case 14:
        return deserializeBoxBinaryExpression(pos + 8);
      case 15:
        return deserializeBoxCallExpression(pos + 8);
      case 16:
        return deserializeBoxChainExpression(pos + 8);
      case 17:
        return deserializeBoxClass(pos + 8);
      case 18:
        return deserializeBoxConditionalExpression(pos + 8);
      case 19:
        return deserializeBoxFunction(pos + 8);
      case 20:
        return deserializeBoxImportExpression(pos + 8);
      case 21:
        return deserializeBoxLogicalExpression(pos + 8);
      case 22:
        return deserializeBoxNewExpression(pos + 8);
      case 23:
        return deserializeBoxObjectExpression(pos + 8);
      case 24:
        return deserializeBoxParenthesizedExpression(pos + 8);
      case 25:
        return deserializeBoxSequenceExpression(pos + 8);
      case 26:
        return deserializeBoxTaggedTemplateExpression(pos + 8);
      case 27:
        return deserializeBoxThisExpression(pos + 8);
      case 28:
        return deserializeBoxUnaryExpression(pos + 8);
      case 29:
        return deserializeBoxUpdateExpression(pos + 8);
      case 30:
        return deserializeBoxYieldExpression(pos + 8);
      case 31:
        return deserializeBoxPrivateInExpression(pos + 8);
      case 32:
        return deserializeBoxJSXElement(pos + 8);
      case 33:
        return deserializeBoxJSXFragment(pos + 8);
      case 34:
        return deserializeBoxTSAsExpression(pos + 8);
      case 35:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 36:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 37:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 38:
        return deserializeBoxTSInstantiationExpression(pos + 8);
      case 39:
        return deserializeBoxV8IntrinsicExpression(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      case 64:
        return deserializeBoxSpreadElement(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for Argument`);
    }
  }
  function deserializeAssignmentTarget(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxIdentifierReference(pos + 8);
      case 1:
        return deserializeBoxTSAsExpression(pos + 8);
      case 2:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 3:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 4:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 8:
        return deserializeBoxArrayAssignmentTarget(pos + 8);
      case 9:
        return deserializeBoxObjectAssignmentTarget(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for AssignmentTarget`);
    }
  }
  function deserializeSimpleAssignmentTarget(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxIdentifierReference(pos + 8);
      case 1:
        return deserializeBoxTSAsExpression(pos + 8);
      case 2:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 3:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 4:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for SimpleAssignmentTarget`);
    }
  }
  function deserializeAssignmentTargetMaybeDefault(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxIdentifierReference(pos + 8);
      case 1:
        return deserializeBoxTSAsExpression(pos + 8);
      case 2:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 3:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 4:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 8:
        return deserializeBoxArrayAssignmentTarget(pos + 8);
      case 9:
        return deserializeBoxObjectAssignmentTarget(pos + 8);
      case 16:
        return deserializeBoxAssignmentTargetWithDefault(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for AssignmentTargetMaybeDefault`);
    }
  }
  function deserializeAssignmentTargetProperty(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxAssignmentTargetPropertyIdentifier(pos + 8);
      case 1:
        return deserializeBoxAssignmentTargetPropertyProperty(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for AssignmentTargetProperty`);
    }
  }
  function deserializeChainElement(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxCallExpression(pos + 8);
      case 1:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ChainElement`);
    }
  }
  function deserializeStatement(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBlockStatement(pos + 8);
      case 1:
        return deserializeBoxBreakStatement(pos + 8);
      case 2:
        return deserializeBoxContinueStatement(pos + 8);
      case 3:
        return deserializeBoxDebuggerStatement(pos + 8);
      case 4:
        return deserializeBoxDoWhileStatement(pos + 8);
      case 5:
        return deserializeBoxEmptyStatement(pos + 8);
      case 6:
        return deserializeBoxExpressionStatement(pos + 8);
      case 7:
        return deserializeBoxForInStatement(pos + 8);
      case 8:
        return deserializeBoxForOfStatement(pos + 8);
      case 9:
        return deserializeBoxForStatement(pos + 8);
      case 10:
        return deserializeBoxIfStatement(pos + 8);
      case 11:
        return deserializeBoxLabeledStatement(pos + 8);
      case 12:
        return deserializeBoxReturnStatement(pos + 8);
      case 13:
        return deserializeBoxSwitchStatement(pos + 8);
      case 14:
        return deserializeBoxThrowStatement(pos + 8);
      case 15:
        return deserializeBoxTryStatement(pos + 8);
      case 16:
        return deserializeBoxWhileStatement(pos + 8);
      case 17:
        return deserializeBoxWithStatement(pos + 8);
      case 32:
        return deserializeBoxVariableDeclaration(pos + 8);
      case 33:
        return deserializeBoxFunction(pos + 8);
      case 34:
        return deserializeBoxClass(pos + 8);
      case 35:
        return deserializeBoxTSTypeAliasDeclaration(pos + 8);
      case 36:
        return deserializeBoxTSInterfaceDeclaration(pos + 8);
      case 37:
        return deserializeBoxTSEnumDeclaration(pos + 8);
      case 38:
        return deserializeBoxTSModuleDeclaration(pos + 8);
      case 39:
        return deserializeBoxTSImportEqualsDeclaration(pos + 8);
      case 64:
        return deserializeBoxImportDeclaration(pos + 8);
      case 65:
        return deserializeBoxExportAllDeclaration(pos + 8);
      case 66:
        return deserializeBoxExportDefaultDeclaration(pos + 8);
      case 67:
        return deserializeBoxExportNamedDeclaration(pos + 8);
      case 68:
        return deserializeBoxTSExportAssignment(pos + 8);
      case 69:
        return deserializeBoxTSNamespaceExportDeclaration(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for Statement`);
    }
  }
  function deserializeDeclaration(pos) {
    switch (uint8[pos]) {
      case 32:
        return deserializeBoxVariableDeclaration(pos + 8);
      case 33:
        return deserializeBoxFunction(pos + 8);
      case 34:
        return deserializeBoxClass(pos + 8);
      case 35:
        return deserializeBoxTSTypeAliasDeclaration(pos + 8);
      case 36:
        return deserializeBoxTSInterfaceDeclaration(pos + 8);
      case 37:
        return deserializeBoxTSEnumDeclaration(pos + 8);
      case 38:
        return deserializeBoxTSModuleDeclaration(pos + 8);
      case 39:
        return deserializeBoxTSImportEqualsDeclaration(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for Declaration`);
    }
  }
  function deserializeVariableDeclarationKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "var";
      case 1:
        return "let";
      case 2:
        return "const";
      case 3:
        return "using";
      case 4:
        return "await using";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for VariableDeclarationKind`);
    }
  }
  function deserializeForStatementInit(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBooleanLiteral(pos + 8);
      case 1:
        return deserializeBoxNullLiteral(pos + 8);
      case 2:
        return deserializeBoxNumericLiteral(pos + 8);
      case 3:
        return deserializeBoxBigIntLiteral(pos + 8);
      case 4:
        return deserializeBoxRegExpLiteral(pos + 8);
      case 5:
        return deserializeBoxStringLiteral(pos + 8);
      case 6:
        return deserializeBoxTemplateLiteral(pos + 8);
      case 7:
        return deserializeBoxIdentifierReference(pos + 8);
      case 8:
        return deserializeBoxMetaProperty(pos + 8);
      case 9:
        return deserializeBoxSuper(pos + 8);
      case 10:
        return deserializeBoxArrayExpression(pos + 8);
      case 11:
        return deserializeBoxArrowFunctionExpression(pos + 8);
      case 12:
        return deserializeBoxAssignmentExpression(pos + 8);
      case 13:
        return deserializeBoxAwaitExpression(pos + 8);
      case 14:
        return deserializeBoxBinaryExpression(pos + 8);
      case 15:
        return deserializeBoxCallExpression(pos + 8);
      case 16:
        return deserializeBoxChainExpression(pos + 8);
      case 17:
        return deserializeBoxClass(pos + 8);
      case 18:
        return deserializeBoxConditionalExpression(pos + 8);
      case 19:
        return deserializeBoxFunction(pos + 8);
      case 20:
        return deserializeBoxImportExpression(pos + 8);
      case 21:
        return deserializeBoxLogicalExpression(pos + 8);
      case 22:
        return deserializeBoxNewExpression(pos + 8);
      case 23:
        return deserializeBoxObjectExpression(pos + 8);
      case 24:
        return deserializeBoxParenthesizedExpression(pos + 8);
      case 25:
        return deserializeBoxSequenceExpression(pos + 8);
      case 26:
        return deserializeBoxTaggedTemplateExpression(pos + 8);
      case 27:
        return deserializeBoxThisExpression(pos + 8);
      case 28:
        return deserializeBoxUnaryExpression(pos + 8);
      case 29:
        return deserializeBoxUpdateExpression(pos + 8);
      case 30:
        return deserializeBoxYieldExpression(pos + 8);
      case 31:
        return deserializeBoxPrivateInExpression(pos + 8);
      case 32:
        return deserializeBoxJSXElement(pos + 8);
      case 33:
        return deserializeBoxJSXFragment(pos + 8);
      case 34:
        return deserializeBoxTSAsExpression(pos + 8);
      case 35:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 36:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 37:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 38:
        return deserializeBoxTSInstantiationExpression(pos + 8);
      case 39:
        return deserializeBoxV8IntrinsicExpression(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      case 64:
        return deserializeBoxVariableDeclaration(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ForStatementInit`);
    }
  }
  function deserializeForStatementLeft(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxIdentifierReference(pos + 8);
      case 1:
        return deserializeBoxTSAsExpression(pos + 8);
      case 2:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 3:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 4:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 8:
        return deserializeBoxArrayAssignmentTarget(pos + 8);
      case 9:
        return deserializeBoxObjectAssignmentTarget(pos + 8);
      case 16:
        return deserializeBoxVariableDeclaration(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ForStatementLeft`);
    }
  }
  function deserializeBindingPatternKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBindingIdentifier(pos + 8);
      case 1:
        return deserializeBoxObjectPattern(pos + 8);
      case 2:
        return deserializeBoxArrayPattern(pos + 8);
      case 3:
        return deserializeBoxAssignmentPattern(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for BindingPatternKind`);
    }
  }
  function deserializeFunctionType(pos) {
    switch (uint8[pos]) {
      case 0:
        return "FunctionDeclaration";
      case 1:
        return "FunctionExpression";
      case 2:
        return "TSDeclareFunction";
      case 3:
        return "TSEmptyBodyFunctionExpression";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for FunctionType`);
    }
  }
  function deserializeClassType(pos) {
    switch (uint8[pos]) {
      case 0:
        return "ClassDeclaration";
      case 1:
        return "ClassExpression";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ClassType`);
    }
  }
  function deserializeClassElement(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxStaticBlock(pos + 8);
      case 1:
        return deserializeBoxMethodDefinition(pos + 8);
      case 2:
        return deserializeBoxPropertyDefinition(pos + 8);
      case 3:
        return deserializeBoxAccessorProperty(pos + 8);
      case 4:
        return deserializeBoxTSIndexSignature(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ClassElement`);
    }
  }
  function deserializeMethodDefinitionType(pos) {
    switch (uint8[pos]) {
      case 0:
        return "MethodDefinition";
      case 1:
        return "TSAbstractMethodDefinition";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for MethodDefinitionType`);
    }
  }
  function deserializePropertyDefinitionType(pos) {
    switch (uint8[pos]) {
      case 0:
        return "PropertyDefinition";
      case 1:
        return "TSAbstractPropertyDefinition";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for PropertyDefinitionType`);
    }
  }
  function deserializeMethodDefinitionKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "constructor";
      case 1:
        return "method";
      case 2:
        return "get";
      case 3:
        return "set";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for MethodDefinitionKind`);
    }
  }
  function deserializeAccessorPropertyType(pos) {
    switch (uint8[pos]) {
      case 0:
        return "AccessorProperty";
      case 1:
        return "TSAbstractAccessorProperty";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for AccessorPropertyType`);
    }
  }
  function deserializeImportDeclarationSpecifier(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxImportSpecifier(pos + 8);
      case 1:
        return deserializeBoxImportDefaultSpecifier(pos + 8);
      case 2:
        return deserializeBoxImportNamespaceSpecifier(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ImportDeclarationSpecifier`);
    }
  }
  function deserializeImportAttributeKey(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeIdentifierName(pos + 8);
      case 1:
        return deserializeStringLiteral(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ImportAttributeKey`);
    }
  }
  function deserializeExportDefaultDeclarationKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBooleanLiteral(pos + 8);
      case 1:
        return deserializeBoxNullLiteral(pos + 8);
      case 2:
        return deserializeBoxNumericLiteral(pos + 8);
      case 3:
        return deserializeBoxBigIntLiteral(pos + 8);
      case 4:
        return deserializeBoxRegExpLiteral(pos + 8);
      case 5:
        return deserializeBoxStringLiteral(pos + 8);
      case 6:
        return deserializeBoxTemplateLiteral(pos + 8);
      case 7:
        return deserializeBoxIdentifierReference(pos + 8);
      case 8:
        return deserializeBoxMetaProperty(pos + 8);
      case 9:
        return deserializeBoxSuper(pos + 8);
      case 10:
        return deserializeBoxArrayExpression(pos + 8);
      case 11:
        return deserializeBoxArrowFunctionExpression(pos + 8);
      case 12:
        return deserializeBoxAssignmentExpression(pos + 8);
      case 13:
        return deserializeBoxAwaitExpression(pos + 8);
      case 14:
        return deserializeBoxBinaryExpression(pos + 8);
      case 15:
        return deserializeBoxCallExpression(pos + 8);
      case 16:
        return deserializeBoxChainExpression(pos + 8);
      case 17:
        return deserializeBoxClass(pos + 8);
      case 18:
        return deserializeBoxConditionalExpression(pos + 8);
      case 19:
        return deserializeBoxFunction(pos + 8);
      case 20:
        return deserializeBoxImportExpression(pos + 8);
      case 21:
        return deserializeBoxLogicalExpression(pos + 8);
      case 22:
        return deserializeBoxNewExpression(pos + 8);
      case 23:
        return deserializeBoxObjectExpression(pos + 8);
      case 24:
        return deserializeBoxParenthesizedExpression(pos + 8);
      case 25:
        return deserializeBoxSequenceExpression(pos + 8);
      case 26:
        return deserializeBoxTaggedTemplateExpression(pos + 8);
      case 27:
        return deserializeBoxThisExpression(pos + 8);
      case 28:
        return deserializeBoxUnaryExpression(pos + 8);
      case 29:
        return deserializeBoxUpdateExpression(pos + 8);
      case 30:
        return deserializeBoxYieldExpression(pos + 8);
      case 31:
        return deserializeBoxPrivateInExpression(pos + 8);
      case 32:
        return deserializeBoxJSXElement(pos + 8);
      case 33:
        return deserializeBoxJSXFragment(pos + 8);
      case 34:
        return deserializeBoxTSAsExpression(pos + 8);
      case 35:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 36:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 37:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 38:
        return deserializeBoxTSInstantiationExpression(pos + 8);
      case 39:
        return deserializeBoxV8IntrinsicExpression(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      case 64:
        return deserializeBoxFunction(pos + 8);
      case 65:
        return deserializeBoxClass(pos + 8);
      case 66:
        return deserializeBoxTSInterfaceDeclaration(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ExportDefaultDeclarationKind`);
    }
  }
  function deserializeModuleExportName(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeIdentifierName(pos + 8);
      case 1:
        return deserializeIdentifierReference(pos + 8);
      case 2:
        return deserializeStringLiteral(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ModuleExportName`);
    }
  }
  function deserializeRegExpPattern(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeStr(pos + 8);
      case 1:
        return deserializeStr(pos + 8);
      case 2:
        return deserializeBoxPattern(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for RegExpPattern`);
    }
  }
  function deserializeJSXElementName(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxJSXIdentifier(pos + 8);
      case 1:
        const ident = deserializeBoxIdentifierReference(pos + 8);
        return { type: "JSXIdentifier", start: ident.start, end: ident.end, name: ident.name };
      case 2:
        return deserializeBoxJSXNamespacedName(pos + 8);
      case 3:
        return deserializeBoxJSXMemberExpression(pos + 8);
      case 4:
        const thisExpr = deserializeBoxThisExpression(pos + 8);
        return { type: "JSXIdentifier", start: thisExpr.start, end: thisExpr.end, name: "this" };
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for JSXElementName`);
    }
  }
  function deserializeJSXMemberExpressionObject(pos) {
    switch (uint8[pos]) {
      case 0:
        const ident = deserializeBoxIdentifierReference(pos + 8);
        return { type: "JSXIdentifier", start: ident.start, end: ident.end, name: ident.name };
      case 1:
        return deserializeBoxJSXMemberExpression(pos + 8);
      case 2:
        const thisExpr = deserializeBoxThisExpression(pos + 8);
        return { type: "JSXIdentifier", start: thisExpr.start, end: thisExpr.end, name: "this" };
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for JSXMemberExpressionObject`);
    }
  }
  function deserializeJSXExpression(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBooleanLiteral(pos + 8);
      case 1:
        return deserializeBoxNullLiteral(pos + 8);
      case 2:
        return deserializeBoxNumericLiteral(pos + 8);
      case 3:
        return deserializeBoxBigIntLiteral(pos + 8);
      case 4:
        return deserializeBoxRegExpLiteral(pos + 8);
      case 5:
        return deserializeBoxStringLiteral(pos + 8);
      case 6:
        return deserializeBoxTemplateLiteral(pos + 8);
      case 7:
        return deserializeBoxIdentifierReference(pos + 8);
      case 8:
        return deserializeBoxMetaProperty(pos + 8);
      case 9:
        return deserializeBoxSuper(pos + 8);
      case 10:
        return deserializeBoxArrayExpression(pos + 8);
      case 11:
        return deserializeBoxArrowFunctionExpression(pos + 8);
      case 12:
        return deserializeBoxAssignmentExpression(pos + 8);
      case 13:
        return deserializeBoxAwaitExpression(pos + 8);
      case 14:
        return deserializeBoxBinaryExpression(pos + 8);
      case 15:
        return deserializeBoxCallExpression(pos + 8);
      case 16:
        return deserializeBoxChainExpression(pos + 8);
      case 17:
        return deserializeBoxClass(pos + 8);
      case 18:
        return deserializeBoxConditionalExpression(pos + 8);
      case 19:
        return deserializeBoxFunction(pos + 8);
      case 20:
        return deserializeBoxImportExpression(pos + 8);
      case 21:
        return deserializeBoxLogicalExpression(pos + 8);
      case 22:
        return deserializeBoxNewExpression(pos + 8);
      case 23:
        return deserializeBoxObjectExpression(pos + 8);
      case 24:
        return deserializeBoxParenthesizedExpression(pos + 8);
      case 25:
        return deserializeBoxSequenceExpression(pos + 8);
      case 26:
        return deserializeBoxTaggedTemplateExpression(pos + 8);
      case 27:
        return deserializeBoxThisExpression(pos + 8);
      case 28:
        return deserializeBoxUnaryExpression(pos + 8);
      case 29:
        return deserializeBoxUpdateExpression(pos + 8);
      case 30:
        return deserializeBoxYieldExpression(pos + 8);
      case 31:
        return deserializeBoxPrivateInExpression(pos + 8);
      case 32:
        return deserializeBoxJSXElement(pos + 8);
      case 33:
        return deserializeBoxJSXFragment(pos + 8);
      case 34:
        return deserializeBoxTSAsExpression(pos + 8);
      case 35:
        return deserializeBoxTSSatisfiesExpression(pos + 8);
      case 36:
        return deserializeBoxTSTypeAssertion(pos + 8);
      case 37:
        return deserializeBoxTSNonNullExpression(pos + 8);
      case 38:
        return deserializeBoxTSInstantiationExpression(pos + 8);
      case 39:
        return deserializeBoxV8IntrinsicExpression(pos + 8);
      case 48:
        return deserializeBoxComputedMemberExpression(pos + 8);
      case 49:
        return deserializeBoxStaticMemberExpression(pos + 8);
      case 50:
        return deserializeBoxPrivateFieldExpression(pos + 8);
      case 64:
        return deserializeJSXEmptyExpression(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for JSXExpression`);
    }
  }
  function deserializeJSXAttributeItem(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxJSXAttribute(pos + 8);
      case 1:
        return deserializeBoxJSXSpreadAttribute(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for JSXAttributeItem`);
    }
  }
  function deserializeJSXAttributeName(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxJSXIdentifier(pos + 8);
      case 1:
        return deserializeBoxJSXNamespacedName(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for JSXAttributeName`);
    }
  }
  function deserializeJSXAttributeValue(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxStringLiteral(pos + 8);
      case 1:
        return deserializeBoxJSXExpressionContainer(pos + 8);
      case 2:
        return deserializeBoxJSXElement(pos + 8);
      case 3:
        return deserializeBoxJSXFragment(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for JSXAttributeValue`);
    }
  }
  function deserializeJSXChild(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxJSXText(pos + 8);
      case 1:
        return deserializeBoxJSXElement(pos + 8);
      case 2:
        return deserializeBoxJSXFragment(pos + 8);
      case 3:
        return deserializeBoxJSXExpressionContainer(pos + 8);
      case 4:
        return deserializeBoxJSXSpreadChild(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for JSXChild`);
    }
  }
  function deserializeTSEnumMemberName(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxIdentifierName(pos + 8);
      case 1:
        return deserializeBoxStringLiteral(pos + 8);
      case 2:
        return deserializeBoxStringLiteral(pos + 8);
      case 3:
        return deserializeBoxTemplateLiteral(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSEnumMemberName`);
    }
  }
  function deserializeTSLiteral(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBooleanLiteral(pos + 8);
      case 1:
        return deserializeBoxNumericLiteral(pos + 8);
      case 2:
        return deserializeBoxBigIntLiteral(pos + 8);
      case 3:
        return deserializeBoxStringLiteral(pos + 8);
      case 4:
        return deserializeBoxTemplateLiteral(pos + 8);
      case 5:
        return deserializeBoxUnaryExpression(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSLiteral`);
    }
  }
  function deserializeTSType(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxTSAnyKeyword(pos + 8);
      case 1:
        return deserializeBoxTSBigIntKeyword(pos + 8);
      case 2:
        return deserializeBoxTSBooleanKeyword(pos + 8);
      case 3:
        return deserializeBoxTSIntrinsicKeyword(pos + 8);
      case 4:
        return deserializeBoxTSNeverKeyword(pos + 8);
      case 5:
        return deserializeBoxTSNullKeyword(pos + 8);
      case 6:
        return deserializeBoxTSNumberKeyword(pos + 8);
      case 7:
        return deserializeBoxTSObjectKeyword(pos + 8);
      case 8:
        return deserializeBoxTSStringKeyword(pos + 8);
      case 9:
        return deserializeBoxTSSymbolKeyword(pos + 8);
      case 10:
        return deserializeBoxTSThisType(pos + 8);
      case 11:
        return deserializeBoxTSUndefinedKeyword(pos + 8);
      case 12:
        return deserializeBoxTSUnknownKeyword(pos + 8);
      case 13:
        return deserializeBoxTSVoidKeyword(pos + 8);
      case 14:
        return deserializeBoxTSArrayType(pos + 8);
      case 15:
        return deserializeBoxTSConditionalType(pos + 8);
      case 16:
        return deserializeBoxTSConstructorType(pos + 8);
      case 17:
        return deserializeBoxTSFunctionType(pos + 8);
      case 18:
        return deserializeBoxTSImportType(pos + 8);
      case 19:
        return deserializeBoxTSIndexedAccessType(pos + 8);
      case 20:
        return deserializeBoxTSInferType(pos + 8);
      case 21:
        return deserializeBoxTSIntersectionType(pos + 8);
      case 22:
        return deserializeBoxTSLiteralType(pos + 8);
      case 23:
        return deserializeBoxTSMappedType(pos + 8);
      case 24:
        return deserializeBoxTSNamedTupleMember(pos + 8);
      case 26:
        return deserializeBoxTSTemplateLiteralType(pos + 8);
      case 27:
        return deserializeBoxTSTupleType(pos + 8);
      case 28:
        return deserializeBoxTSTypeLiteral(pos + 8);
      case 29:
        return deserializeBoxTSTypeOperator(pos + 8);
      case 30:
        return deserializeBoxTSTypePredicate(pos + 8);
      case 31:
        return deserializeBoxTSTypeQuery(pos + 8);
      case 32:
        return deserializeBoxTSTypeReference(pos + 8);
      case 33:
        return deserializeBoxTSUnionType(pos + 8);
      case 34:
        return deserializeBoxTSParenthesizedType(pos + 8);
      case 35:
        return deserializeBoxJSDocNullableType(pos + 8);
      case 36:
        return deserializeBoxJSDocNonNullableType(pos + 8);
      case 37:
        return deserializeBoxJSDocUnknownType(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSType`);
    }
  }
  function deserializeTSTypeOperatorOperator(pos) {
    switch (uint8[pos]) {
      case 0:
        return "keyof";
      case 1:
        return "unique";
      case 2:
        return "readonly";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSTypeOperatorOperator`);
    }
  }
  function deserializeTSTupleElement(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxTSAnyKeyword(pos + 8);
      case 1:
        return deserializeBoxTSBigIntKeyword(pos + 8);
      case 2:
        return deserializeBoxTSBooleanKeyword(pos + 8);
      case 3:
        return deserializeBoxTSIntrinsicKeyword(pos + 8);
      case 4:
        return deserializeBoxTSNeverKeyword(pos + 8);
      case 5:
        return deserializeBoxTSNullKeyword(pos + 8);
      case 6:
        return deserializeBoxTSNumberKeyword(pos + 8);
      case 7:
        return deserializeBoxTSObjectKeyword(pos + 8);
      case 8:
        return deserializeBoxTSStringKeyword(pos + 8);
      case 9:
        return deserializeBoxTSSymbolKeyword(pos + 8);
      case 10:
        return deserializeBoxTSThisType(pos + 8);
      case 11:
        return deserializeBoxTSUndefinedKeyword(pos + 8);
      case 12:
        return deserializeBoxTSUnknownKeyword(pos + 8);
      case 13:
        return deserializeBoxTSVoidKeyword(pos + 8);
      case 14:
        return deserializeBoxTSArrayType(pos + 8);
      case 15:
        return deserializeBoxTSConditionalType(pos + 8);
      case 16:
        return deserializeBoxTSConstructorType(pos + 8);
      case 17:
        return deserializeBoxTSFunctionType(pos + 8);
      case 18:
        return deserializeBoxTSImportType(pos + 8);
      case 19:
        return deserializeBoxTSIndexedAccessType(pos + 8);
      case 20:
        return deserializeBoxTSInferType(pos + 8);
      case 21:
        return deserializeBoxTSIntersectionType(pos + 8);
      case 22:
        return deserializeBoxTSLiteralType(pos + 8);
      case 23:
        return deserializeBoxTSMappedType(pos + 8);
      case 24:
        return deserializeBoxTSNamedTupleMember(pos + 8);
      case 26:
        return deserializeBoxTSTemplateLiteralType(pos + 8);
      case 27:
        return deserializeBoxTSTupleType(pos + 8);
      case 28:
        return deserializeBoxTSTypeLiteral(pos + 8);
      case 29:
        return deserializeBoxTSTypeOperator(pos + 8);
      case 30:
        return deserializeBoxTSTypePredicate(pos + 8);
      case 31:
        return deserializeBoxTSTypeQuery(pos + 8);
      case 32:
        return deserializeBoxTSTypeReference(pos + 8);
      case 33:
        return deserializeBoxTSUnionType(pos + 8);
      case 34:
        return deserializeBoxTSParenthesizedType(pos + 8);
      case 35:
        return deserializeBoxJSDocNullableType(pos + 8);
      case 36:
        return deserializeBoxJSDocNonNullableType(pos + 8);
      case 37:
        return deserializeBoxJSDocUnknownType(pos + 8);
      case 64:
        return deserializeBoxTSOptionalType(pos + 8);
      case 65:
        return deserializeBoxTSRestType(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSTupleElement`);
    }
  }
  function deserializeTSTypeName(pos) {
    switch (uint8[pos]) {
      case 0:
        let id = deserializeBoxIdentifierReference(pos + 8);
        if (id.name === "this")
          id = { type: "ThisExpression", start: id.start, end: id.end };
        return id;
      case 1:
        return deserializeBoxTSQualifiedName(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSTypeName`);
    }
  }
  function deserializeTSAccessibility(pos) {
    switch (uint8[pos]) {
      case 0:
        return "private";
      case 1:
        return "protected";
      case 2:
        return "public";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSAccessibility`);
    }
  }
  function deserializeTSSignature(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxTSIndexSignature(pos + 8);
      case 1:
        return deserializeBoxTSPropertySignature(pos + 8);
      case 2:
        return deserializeBoxTSCallSignatureDeclaration(pos + 8);
      case 3:
        return deserializeBoxTSConstructSignatureDeclaration(pos + 8);
      case 4:
        return deserializeBoxTSMethodSignature(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSSignature`);
    }
  }
  function deserializeTSMethodSignatureKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "method";
      case 1:
        return "get";
      case 2:
        return "set";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSMethodSignatureKind`);
    }
  }
  function deserializeTSTypePredicateName(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxIdentifierName(pos + 8);
      case 1:
        return deserializeTSThisType(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSTypePredicateName`);
    }
  }
  function deserializeTSModuleDeclarationKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "global";
      case 1:
        return "module";
      case 2:
        return "namespace";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSModuleDeclarationKind`);
    }
  }
  function deserializeTSModuleDeclarationName(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBindingIdentifier(pos + 8);
      case 1:
        return deserializeStringLiteral(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSModuleDeclarationName`);
    }
  }
  function deserializeTSModuleDeclarationBody(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxTSModuleDeclaration(pos + 8);
      case 1:
        return deserializeBoxTSModuleBlock(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSModuleDeclarationBody`);
    }
  }
  function deserializeTSTypeQueryExprName(pos) {
    switch (uint8[pos]) {
      case 0:
        let id = deserializeBoxIdentifierReference(pos + 8);
        if (id.name === "this")
          id = { type: "ThisExpression", start: id.start, end: id.end };
        return id;
      case 1:
        return deserializeBoxTSQualifiedName(pos + 8);
      case 2:
        return deserializeBoxTSImportType(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSTypeQueryExprName`);
    }
  }
  function deserializeTSMappedTypeModifierOperator(pos) {
    switch (uint8[pos]) {
      case 0:
        return true;
      case 1:
        return "+";
      case 2:
        return "-";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSMappedTypeModifierOperator`);
    }
  }
  function deserializeTSModuleReference(pos) {
    switch (uint8[pos]) {
      case 0:
        let id = deserializeBoxIdentifierReference(pos + 8);
        if (id.name === "this")
          id = { type: "ThisExpression", start: id.start, end: id.end };
        return id;
      case 1:
        return deserializeBoxTSQualifiedName(pos + 8);
      case 2:
        return deserializeBoxTSExternalModuleReference(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for TSModuleReference`);
    }
  }
  function deserializeImportOrExportKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "value";
      case 1:
        return "type";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ImportOrExportKind`);
    }
  }
  function deserializeCommentKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "Line";
      case 1:
        return "Block";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for CommentKind`);
    }
  }
  function deserializeImportImportName(pos) {
    switch (uint8[pos]) {
      case 0:
        var nameSpan = deserializeNameSpan(pos + 8);
        return { kind: "Name", name: nameSpan.value, start: nameSpan.start, end: nameSpan.end };
      case 1:
        return { kind: "NamespaceObject", name: null, start: null, end: null };
      case 2:
        var span = deserializeSpan(pos + 8);
        return { kind: "Default", name: null, start: span.start, end: span.end };
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ImportImportName`);
    }
  }
  function deserializeExportImportName(pos) {
    switch (uint8[pos]) {
      case 0:
        var nameSpan = deserializeNameSpan(pos + 8);
        return { kind: "Name", name: nameSpan.value, start: nameSpan.start, end: nameSpan.end };
      case 1:
        return { kind: "All", name: null, start: null, end: null };
      case 2:
        return { kind: "AllButDefault", name: null, start: null, end: null };
      case 3:
        return { kind: "None", name: null, start: null, end: null };
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ExportImportName`);
    }
  }
  function deserializeExportExportName(pos) {
    switch (uint8[pos]) {
      case 0:
        var nameSpan = deserializeNameSpan(pos + 8);
        return { kind: "Name", name: nameSpan.value, start: nameSpan.start, end: nameSpan.end };
      case 1:
        var span = deserializeSpan(pos + 8);
        return { kind: "Default", name: null, start: span.start, end: span.end };
      case 2:
        return { kind: "None", name: null, start: null, end: null };
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ExportExportName`);
    }
  }
  function deserializeExportLocalName(pos) {
    switch (uint8[pos]) {
      case 0:
        var nameSpan = deserializeNameSpan(pos + 8);
        return { kind: "Name", name: nameSpan.value, start: nameSpan.start, end: nameSpan.end };
      case 1:
        var nameSpan = deserializeNameSpan(pos + 8);
        return { kind: "Default", name: nameSpan.value, start: nameSpan.start, end: nameSpan.end };
      case 2:
        return { kind: "None", name: null, start: null, end: null };
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ExportLocalName`);
    }
  }
  function deserializeAssignmentOperator(pos) {
    switch (uint8[pos]) {
      case 0:
        return "=";
      case 1:
        return "+=";
      case 2:
        return "-=";
      case 3:
        return "*=";
      case 4:
        return "/=";
      case 5:
        return "%=";
      case 6:
        return "**=";
      case 7:
        return "<<=";
      case 8:
        return ">>=";
      case 9:
        return ">>>=";
      case 10:
        return "|=";
      case 11:
        return "^=";
      case 12:
        return "&=";
      case 13:
        return "||=";
      case 14:
        return "&&=";
      case 15:
        return "??=";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for AssignmentOperator`);
    }
  }
  function deserializeBinaryOperator(pos) {
    switch (uint8[pos]) {
      case 0:
        return "==";
      case 1:
        return "!=";
      case 2:
        return "===";
      case 3:
        return "!==";
      case 4:
        return "<";
      case 5:
        return "<=";
      case 6:
        return ">";
      case 7:
        return ">=";
      case 8:
        return "+";
      case 9:
        return "-";
      case 10:
        return "*";
      case 11:
        return "/";
      case 12:
        return "%";
      case 13:
        return "**";
      case 14:
        return "<<";
      case 15:
        return ">>";
      case 16:
        return ">>>";
      case 17:
        return "|";
      case 18:
        return "^";
      case 19:
        return "&";
      case 20:
        return "in";
      case 21:
        return "instanceof";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for BinaryOperator`);
    }
  }
  function deserializeLogicalOperator(pos) {
    switch (uint8[pos]) {
      case 0:
        return "||";
      case 1:
        return "&&";
      case 2:
        return "??";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for LogicalOperator`);
    }
  }
  function deserializeUnaryOperator(pos) {
    switch (uint8[pos]) {
      case 0:
        return "+";
      case 1:
        return "-";
      case 2:
        return "!";
      case 3:
        return "~";
      case 4:
        return "typeof";
      case 5:
        return "void";
      case 6:
        return "delete";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for UnaryOperator`);
    }
  }
  function deserializeUpdateOperator(pos) {
    switch (uint8[pos]) {
      case 0:
        return "++";
      case 1:
        return "--";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for UpdateOperator`);
    }
  }
  function deserializeModuleKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "script";
      case 1:
        return "module";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ModuleKind`);
    }
  }
  function deserializeTerm(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxBoundaryAssertion(pos + 8);
      case 1:
        return deserializeBoxLookAroundAssertion(pos + 8);
      case 2:
        return deserializeBoxQuantifier(pos + 8);
      case 3:
        return deserializeBoxCharacter(pos + 8);
      case 4:
        return deserializeDot(pos + 8);
      case 5:
        return deserializeBoxCharacterClassEscape(pos + 8);
      case 6:
        return deserializeBoxUnicodePropertyEscape(pos + 8);
      case 7:
        return deserializeBoxCharacterClass(pos + 8);
      case 8:
        return deserializeBoxCapturingGroup(pos + 8);
      case 9:
        return deserializeBoxIgnoreGroup(pos + 8);
      case 10:
        return deserializeBoxIndexedReference(pos + 8);
      case 11:
        return deserializeBoxNamedReference(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for Term`);
    }
  }
  function deserializeBoundaryAssertionKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "start";
      case 1:
        return "end";
      case 2:
        return "boundary";
      case 3:
        return "negativeBoundary";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for BoundaryAssertionKind`);
    }
  }
  function deserializeLookAroundAssertionKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "lookahead";
      case 1:
        return "negativeLookahead";
      case 2:
        return "lookbehind";
      case 3:
        return "negativeLookbehind";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for LookAroundAssertionKind`);
    }
  }
  function deserializeCharacterKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "controlLetter";
      case 1:
        return "hexadecimalEscape";
      case 2:
        return "identifier";
      case 3:
        return "null";
      case 4:
        return "octal1";
      case 5:
        return "octal2";
      case 6:
        return "octal3";
      case 7:
        return "singleEscape";
      case 8:
        return "symbol";
      case 9:
        return "unicodeEscape";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for CharacterKind`);
    }
  }
  function deserializeCharacterClassEscapeKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "d";
      case 1:
        return "negativeD";
      case 2:
        return "s";
      case 3:
        return "negativeS";
      case 4:
        return "w";
      case 5:
        return "negativeW";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for CharacterClassEscapeKind`);
    }
  }
  function deserializeCharacterClassContentsKind(pos) {
    switch (uint8[pos]) {
      case 0:
        return "union";
      case 1:
        return "intersection";
      case 2:
        return "subtraction";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for CharacterClassContentsKind`);
    }
  }
  function deserializeCharacterClassContents(pos) {
    switch (uint8[pos]) {
      case 0:
        return deserializeBoxCharacterClassRange(pos + 8);
      case 1:
        return deserializeBoxCharacterClassEscape(pos + 8);
      case 2:
        return deserializeBoxUnicodePropertyEscape(pos + 8);
      case 3:
        return deserializeBoxCharacter(pos + 8);
      case 4:
        return deserializeBoxCharacterClass(pos + 8);
      case 5:
        return deserializeBoxClassStringDisjunction(pos + 8);
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for CharacterClassContents`);
    }
  }
  function deserializeErrorSeverity(pos) {
    switch (uint8[pos]) {
      case 0:
        return "Error";
      case 1:
        return "Warning";
      case 2:
        return "Advice";
      default:
        throw new Error(`Unexpected discriminant ${uint8[pos]} for ErrorSeverity`);
    }
  }
  function deserializeStr(pos) {
    const pos32 = pos >> 2, len = uint32[pos32 + 2];
    if (len === 0)
      return "";
    pos = uint32[pos32];
    if (sourceIsAscii && pos < sourceLen)
      return sourceText.substr(pos, len);
    const end = pos + len;
    if (len > 50)
      return decodeStr(uint8.subarray(pos, end));
    let out = "", c;
    do {
      c = uint8[pos++];
      if (c < 128) {
        out += fromCodePoint(c);
      } else {
        out += decodeStr(uint8.subarray(pos - 1, end));
        break;
      }
    } while (pos < end);
    return out;
  }
  function deserializeVecComment(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeComment(pos));
      pos += 24;
    }
    return arr;
  }
  function deserializeOptionHashbang(pos) {
    if (uint32[pos + 8 >> 2] === 0 && uint32[pos + 12 >> 2] === 0)
      return null;
    return deserializeHashbang(pos);
  }
  function deserializeVecDirective(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeDirective(pos));
      pos += 72;
    }
    return arr;
  }
  function deserializeVecStatement(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeStatement(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxBooleanLiteral(pos) {
    return deserializeBooleanLiteral(uint32[pos >> 2]);
  }
  function deserializeBoxNullLiteral(pos) {
    return deserializeNullLiteral(uint32[pos >> 2]);
  }
  function deserializeBoxNumericLiteral(pos) {
    return deserializeNumericLiteral(uint32[pos >> 2]);
  }
  function deserializeBoxBigIntLiteral(pos) {
    return deserializeBigIntLiteral(uint32[pos >> 2]);
  }
  function deserializeBoxRegExpLiteral(pos) {
    return deserializeRegExpLiteral(uint32[pos >> 2]);
  }
  function deserializeBoxStringLiteral(pos) {
    return deserializeStringLiteral(uint32[pos >> 2]);
  }
  function deserializeBoxTemplateLiteral(pos) {
    return deserializeTemplateLiteral(uint32[pos >> 2]);
  }
  function deserializeBoxIdentifierReference(pos) {
    return deserializeIdentifierReference(uint32[pos >> 2]);
  }
  function deserializeBoxMetaProperty(pos) {
    return deserializeMetaProperty(uint32[pos >> 2]);
  }
  function deserializeBoxSuper(pos) {
    return deserializeSuper(uint32[pos >> 2]);
  }
  function deserializeBoxArrayExpression(pos) {
    return deserializeArrayExpression(uint32[pos >> 2]);
  }
  function deserializeBoxArrowFunctionExpression(pos) {
    return deserializeArrowFunctionExpression(uint32[pos >> 2]);
  }
  function deserializeBoxAssignmentExpression(pos) {
    return deserializeAssignmentExpression(uint32[pos >> 2]);
  }
  function deserializeBoxAwaitExpression(pos) {
    return deserializeAwaitExpression(uint32[pos >> 2]);
  }
  function deserializeBoxBinaryExpression(pos) {
    return deserializeBinaryExpression(uint32[pos >> 2]);
  }
  function deserializeBoxCallExpression(pos) {
    return deserializeCallExpression(uint32[pos >> 2]);
  }
  function deserializeBoxChainExpression(pos) {
    return deserializeChainExpression(uint32[pos >> 2]);
  }
  function deserializeBoxClass(pos) {
    return deserializeClass(uint32[pos >> 2]);
  }
  function deserializeBoxConditionalExpression(pos) {
    return deserializeConditionalExpression(uint32[pos >> 2]);
  }
  function deserializeBoxFunction(pos) {
    return deserializeFunction(uint32[pos >> 2]);
  }
  function deserializeBoxImportExpression(pos) {
    return deserializeImportExpression(uint32[pos >> 2]);
  }
  function deserializeBoxLogicalExpression(pos) {
    return deserializeLogicalExpression(uint32[pos >> 2]);
  }
  function deserializeBoxNewExpression(pos) {
    return deserializeNewExpression(uint32[pos >> 2]);
  }
  function deserializeBoxObjectExpression(pos) {
    return deserializeObjectExpression(uint32[pos >> 2]);
  }
  function deserializeBoxParenthesizedExpression(pos) {
    return deserializeParenthesizedExpression(uint32[pos >> 2]);
  }
  function deserializeBoxSequenceExpression(pos) {
    return deserializeSequenceExpression(uint32[pos >> 2]);
  }
  function deserializeBoxTaggedTemplateExpression(pos) {
    return deserializeTaggedTemplateExpression(uint32[pos >> 2]);
  }
  function deserializeBoxThisExpression(pos) {
    return deserializeThisExpression(uint32[pos >> 2]);
  }
  function deserializeBoxUnaryExpression(pos) {
    return deserializeUnaryExpression(uint32[pos >> 2]);
  }
  function deserializeBoxUpdateExpression(pos) {
    return deserializeUpdateExpression(uint32[pos >> 2]);
  }
  function deserializeBoxYieldExpression(pos) {
    return deserializeYieldExpression(uint32[pos >> 2]);
  }
  function deserializeBoxPrivateInExpression(pos) {
    return deserializePrivateInExpression(uint32[pos >> 2]);
  }
  function deserializeBoxJSXElement(pos) {
    return deserializeJSXElement(uint32[pos >> 2]);
  }
  function deserializeBoxJSXFragment(pos) {
    return deserializeJSXFragment(uint32[pos >> 2]);
  }
  function deserializeBoxTSAsExpression(pos) {
    return deserializeTSAsExpression(uint32[pos >> 2]);
  }
  function deserializeBoxTSSatisfiesExpression(pos) {
    return deserializeTSSatisfiesExpression(uint32[pos >> 2]);
  }
  function deserializeBoxTSTypeAssertion(pos) {
    return deserializeTSTypeAssertion(uint32[pos >> 2]);
  }
  function deserializeBoxTSNonNullExpression(pos) {
    return deserializeTSNonNullExpression(uint32[pos >> 2]);
  }
  function deserializeBoxTSInstantiationExpression(pos) {
    return deserializeTSInstantiationExpression(uint32[pos >> 2]);
  }
  function deserializeBoxV8IntrinsicExpression(pos) {
    return deserializeV8IntrinsicExpression(uint32[pos >> 2]);
  }
  function deserializeVecArrayExpressionElement(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeArrayExpressionElement(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxSpreadElement(pos) {
    return deserializeSpreadElement(uint32[pos >> 2]);
  }
  function deserializeVecObjectPropertyKind(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeObjectPropertyKind(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxObjectProperty(pos) {
    return deserializeObjectProperty(uint32[pos >> 2]);
  }
  function deserializeBool(pos) {
    return uint8[pos] === 1;
  }
  function deserializeBoxIdentifierName(pos) {
    return deserializeIdentifierName(uint32[pos >> 2]);
  }
  function deserializeBoxPrivateIdentifier(pos) {
    return deserializePrivateIdentifier(uint32[pos >> 2]);
  }
  function deserializeVecTemplateElement(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTemplateElement(pos));
      pos += 48;
    }
    return arr;
  }
  function deserializeVecExpression(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeExpression(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxTSTypeParameterInstantiation(pos) {
    return deserializeTSTypeParameterInstantiation(uint32[pos >> 2]);
  }
  function deserializeOptionBoxTSTypeParameterInstantiation(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxTSTypeParameterInstantiation(pos);
  }
  function deserializeOptionStr(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeStr(pos);
  }
  function deserializeBoxComputedMemberExpression(pos) {
    return deserializeComputedMemberExpression(uint32[pos >> 2]);
  }
  function deserializeBoxStaticMemberExpression(pos) {
    return deserializeStaticMemberExpression(uint32[pos >> 2]);
  }
  function deserializeBoxPrivateFieldExpression(pos) {
    return deserializePrivateFieldExpression(uint32[pos >> 2]);
  }
  function deserializeVecArgument(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeArgument(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxArrayAssignmentTarget(pos) {
    return deserializeArrayAssignmentTarget(uint32[pos >> 2]);
  }
  function deserializeBoxObjectAssignmentTarget(pos) {
    return deserializeObjectAssignmentTarget(uint32[pos >> 2]);
  }
  function deserializeOptionAssignmentTargetMaybeDefault(pos) {
    if (uint8[pos] === 51)
      return null;
    return deserializeAssignmentTargetMaybeDefault(pos);
  }
  function deserializeVecOptionAssignmentTargetMaybeDefault(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeOptionAssignmentTargetMaybeDefault(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeOptionAssignmentTargetRest(pos) {
    if (uint8[pos + 8] === 51)
      return null;
    return deserializeAssignmentTargetRest(pos);
  }
  function deserializeVecAssignmentTargetProperty(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeAssignmentTargetProperty(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxAssignmentTargetWithDefault(pos) {
    return deserializeAssignmentTargetWithDefault(uint32[pos >> 2]);
  }
  function deserializeBoxAssignmentTargetPropertyIdentifier(pos) {
    return deserializeAssignmentTargetPropertyIdentifier(uint32[pos >> 2]);
  }
  function deserializeBoxAssignmentTargetPropertyProperty(pos) {
    return deserializeAssignmentTargetPropertyProperty(uint32[pos >> 2]);
  }
  function deserializeOptionExpression(pos) {
    if (uint8[pos] === 51)
      return null;
    return deserializeExpression(pos);
  }
  function deserializeBoxBlockStatement(pos) {
    return deserializeBlockStatement(uint32[pos >> 2]);
  }
  function deserializeBoxBreakStatement(pos) {
    return deserializeBreakStatement(uint32[pos >> 2]);
  }
  function deserializeBoxContinueStatement(pos) {
    return deserializeContinueStatement(uint32[pos >> 2]);
  }
  function deserializeBoxDebuggerStatement(pos) {
    return deserializeDebuggerStatement(uint32[pos >> 2]);
  }
  function deserializeBoxDoWhileStatement(pos) {
    return deserializeDoWhileStatement(uint32[pos >> 2]);
  }
  function deserializeBoxEmptyStatement(pos) {
    return deserializeEmptyStatement(uint32[pos >> 2]);
  }
  function deserializeBoxExpressionStatement(pos) {
    return deserializeExpressionStatement(uint32[pos >> 2]);
  }
  function deserializeBoxForInStatement(pos) {
    return deserializeForInStatement(uint32[pos >> 2]);
  }
  function deserializeBoxForOfStatement(pos) {
    return deserializeForOfStatement(uint32[pos >> 2]);
  }
  function deserializeBoxForStatement(pos) {
    return deserializeForStatement(uint32[pos >> 2]);
  }
  function deserializeBoxIfStatement(pos) {
    return deserializeIfStatement(uint32[pos >> 2]);
  }
  function deserializeBoxLabeledStatement(pos) {
    return deserializeLabeledStatement(uint32[pos >> 2]);
  }
  function deserializeBoxReturnStatement(pos) {
    return deserializeReturnStatement(uint32[pos >> 2]);
  }
  function deserializeBoxSwitchStatement(pos) {
    return deserializeSwitchStatement(uint32[pos >> 2]);
  }
  function deserializeBoxThrowStatement(pos) {
    return deserializeThrowStatement(uint32[pos >> 2]);
  }
  function deserializeBoxTryStatement(pos) {
    return deserializeTryStatement(uint32[pos >> 2]);
  }
  function deserializeBoxWhileStatement(pos) {
    return deserializeWhileStatement(uint32[pos >> 2]);
  }
  function deserializeBoxWithStatement(pos) {
    return deserializeWithStatement(uint32[pos >> 2]);
  }
  function deserializeBoxVariableDeclaration(pos) {
    return deserializeVariableDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxTSTypeAliasDeclaration(pos) {
    return deserializeTSTypeAliasDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxTSInterfaceDeclaration(pos) {
    return deserializeTSInterfaceDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxTSEnumDeclaration(pos) {
    return deserializeTSEnumDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxTSModuleDeclaration(pos) {
    return deserializeTSModuleDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxTSImportEqualsDeclaration(pos) {
    return deserializeTSImportEqualsDeclaration(uint32[pos >> 2]);
  }
  function deserializeVecVariableDeclarator(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeVariableDeclarator(pos));
      pos += 72;
    }
    return arr;
  }
  function deserializeOptionStatement(pos) {
    if (uint8[pos] === 70)
      return null;
    return deserializeStatement(pos);
  }
  function deserializeOptionForStatementInit(pos) {
    if (uint8[pos] === 65)
      return null;
    return deserializeForStatementInit(pos);
  }
  function deserializeOptionLabelIdentifier(pos) {
    if (uint32[pos + 8 >> 2] === 0 && uint32[pos + 12 >> 2] === 0)
      return null;
    return deserializeLabelIdentifier(pos);
  }
  function deserializeVecSwitchCase(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeSwitchCase(pos));
      pos += 56;
    }
    return arr;
  }
  function deserializeBoxCatchClause(pos) {
    return deserializeCatchClause(uint32[pos >> 2]);
  }
  function deserializeOptionBoxCatchClause(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxCatchClause(pos);
  }
  function deserializeOptionBoxBlockStatement(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxBlockStatement(pos);
  }
  function deserializeOptionCatchParameter(pos) {
    if (uint8[pos + 32] === 2)
      return null;
    return deserializeCatchParameter(pos);
  }
  function deserializeBoxTSTypeAnnotation(pos) {
    return deserializeTSTypeAnnotation(uint32[pos >> 2]);
  }
  function deserializeOptionBoxTSTypeAnnotation(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxTSTypeAnnotation(pos);
  }
  function deserializeBoxBindingIdentifier(pos) {
    return deserializeBindingIdentifier(uint32[pos >> 2]);
  }
  function deserializeBoxObjectPattern(pos) {
    return deserializeObjectPattern(uint32[pos >> 2]);
  }
  function deserializeBoxArrayPattern(pos) {
    return deserializeArrayPattern(uint32[pos >> 2]);
  }
  function deserializeBoxAssignmentPattern(pos) {
    return deserializeAssignmentPattern(uint32[pos >> 2]);
  }
  function deserializeVecBindingProperty(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeBindingProperty(pos));
      pos += 64;
    }
    return arr;
  }
  function deserializeBoxBindingRestElement(pos) {
    return deserializeBindingRestElement(uint32[pos >> 2]);
  }
  function deserializeOptionBoxBindingRestElement(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxBindingRestElement(pos);
  }
  function deserializeOptionBindingPattern(pos) {
    if (uint8[pos + 24] === 2)
      return null;
    return deserializeBindingPattern(pos);
  }
  function deserializeVecOptionBindingPattern(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeOptionBindingPattern(pos));
      pos += 32;
    }
    return arr;
  }
  function deserializeOptionBindingIdentifier(pos) {
    if (uint32[pos + 8 >> 2] === 0 && uint32[pos + 12 >> 2] === 0)
      return null;
    return deserializeBindingIdentifier(pos);
  }
  function deserializeBoxTSTypeParameterDeclaration(pos) {
    return deserializeTSTypeParameterDeclaration(uint32[pos >> 2]);
  }
  function deserializeOptionBoxTSTypeParameterDeclaration(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxTSTypeParameterDeclaration(pos);
  }
  function deserializeBoxTSThisParameter(pos) {
    return deserializeTSThisParameter(uint32[pos >> 2]);
  }
  function deserializeOptionBoxTSThisParameter(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxTSThisParameter(pos);
  }
  function deserializeBoxFormalParameters(pos) {
    return deserializeFormalParameters(uint32[pos >> 2]);
  }
  function deserializeBoxFunctionBody(pos) {
    return deserializeFunctionBody(uint32[pos >> 2]);
  }
  function deserializeOptionBoxFunctionBody(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxFunctionBody(pos);
  }
  function deserializeVecFormalParameter(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeFormalParameter(pos));
      pos += 80;
    }
    return arr;
  }
  function deserializeVecDecorator(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeDecorator(pos));
      pos += 24;
    }
    return arr;
  }
  function deserializeOptionTSAccessibility(pos) {
    if (uint8[pos] === 3)
      return null;
    return deserializeTSAccessibility(pos);
  }
  function deserializeVecTSClassImplements(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTSClassImplements(pos));
      pos += 32;
    }
    return arr;
  }
  function deserializeBoxClassBody(pos) {
    return deserializeClassBody(uint32[pos >> 2]);
  }
  function deserializeVecClassElement(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeClassElement(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxStaticBlock(pos) {
    return deserializeStaticBlock(uint32[pos >> 2]);
  }
  function deserializeBoxMethodDefinition(pos) {
    return deserializeMethodDefinition(uint32[pos >> 2]);
  }
  function deserializeBoxPropertyDefinition(pos) {
    return deserializePropertyDefinition(uint32[pos >> 2]);
  }
  function deserializeBoxAccessorProperty(pos) {
    return deserializeAccessorProperty(uint32[pos >> 2]);
  }
  function deserializeBoxTSIndexSignature(pos) {
    return deserializeTSIndexSignature(uint32[pos >> 2]);
  }
  function deserializeBoxImportDeclaration(pos) {
    return deserializeImportDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxExportAllDeclaration(pos) {
    return deserializeExportAllDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxExportDefaultDeclaration(pos) {
    return deserializeExportDefaultDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxExportNamedDeclaration(pos) {
    return deserializeExportNamedDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxTSExportAssignment(pos) {
    return deserializeTSExportAssignment(uint32[pos >> 2]);
  }
  function deserializeBoxTSNamespaceExportDeclaration(pos) {
    return deserializeTSNamespaceExportDeclaration(uint32[pos >> 2]);
  }
  function deserializeVecImportDeclarationSpecifier(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeImportDeclarationSpecifier(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeOptionVecImportDeclarationSpecifier(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeVecImportDeclarationSpecifier(pos);
  }
  function deserializeBoxWithClause(pos) {
    return deserializeWithClause(uint32[pos >> 2]);
  }
  function deserializeOptionBoxWithClause(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxWithClause(pos);
  }
  function deserializeBoxImportSpecifier(pos) {
    return deserializeImportSpecifier(uint32[pos >> 2]);
  }
  function deserializeBoxImportDefaultSpecifier(pos) {
    return deserializeImportDefaultSpecifier(uint32[pos >> 2]);
  }
  function deserializeBoxImportNamespaceSpecifier(pos) {
    return deserializeImportNamespaceSpecifier(uint32[pos >> 2]);
  }
  function deserializeVecImportAttribute(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeImportAttribute(pos));
      pos += 112;
    }
    return arr;
  }
  function deserializeOptionDeclaration(pos) {
    if (uint8[pos] === 31)
      return null;
    return deserializeDeclaration(pos);
  }
  function deserializeVecExportSpecifier(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeExportSpecifier(pos));
      pos += 128;
    }
    return arr;
  }
  function deserializeOptionStringLiteral(pos) {
    if (uint8[pos + 40] === 2)
      return null;
    return deserializeStringLiteral(pos);
  }
  function deserializeOptionModuleExportName(pos) {
    if (uint8[pos] === 3)
      return null;
    return deserializeModuleExportName(pos);
  }
  function deserializeF64(pos) {
    return float64[pos >> 3];
  }
  function deserializeBoxPattern(pos) {
    return deserializePattern(uint32[pos >> 2]);
  }
  function deserializeU8(pos) {
    return uint8[pos];
  }
  function deserializeBoxJSXOpeningElement(pos) {
    return deserializeJSXOpeningElement(uint32[pos >> 2]);
  }
  function deserializeBoxJSXClosingElement(pos) {
    return deserializeJSXClosingElement(uint32[pos >> 2]);
  }
  function deserializeOptionBoxJSXClosingElement(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxJSXClosingElement(pos);
  }
  function deserializeVecJSXChild(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeJSXChild(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeVecJSXAttributeItem(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeJSXAttributeItem(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxJSXIdentifier(pos) {
    return deserializeJSXIdentifier(uint32[pos >> 2]);
  }
  function deserializeBoxJSXNamespacedName(pos) {
    return deserializeJSXNamespacedName(uint32[pos >> 2]);
  }
  function deserializeBoxJSXMemberExpression(pos) {
    return deserializeJSXMemberExpression(uint32[pos >> 2]);
  }
  function deserializeBoxJSXAttribute(pos) {
    return deserializeJSXAttribute(uint32[pos >> 2]);
  }
  function deserializeBoxJSXSpreadAttribute(pos) {
    return deserializeJSXSpreadAttribute(uint32[pos >> 2]);
  }
  function deserializeOptionJSXAttributeValue(pos) {
    if (uint8[pos] === 4)
      return null;
    return deserializeJSXAttributeValue(pos);
  }
  function deserializeBoxJSXExpressionContainer(pos) {
    return deserializeJSXExpressionContainer(uint32[pos >> 2]);
  }
  function deserializeBoxJSXText(pos) {
    return deserializeJSXText(uint32[pos >> 2]);
  }
  function deserializeBoxJSXSpreadChild(pos) {
    return deserializeJSXSpreadChild(uint32[pos >> 2]);
  }
  function deserializeVecTSEnumMember(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTSEnumMember(pos));
      pos += 40;
    }
    return arr;
  }
  function deserializeBoxTSAnyKeyword(pos) {
    return deserializeTSAnyKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSBigIntKeyword(pos) {
    return deserializeTSBigIntKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSBooleanKeyword(pos) {
    return deserializeTSBooleanKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSIntrinsicKeyword(pos) {
    return deserializeTSIntrinsicKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSNeverKeyword(pos) {
    return deserializeTSNeverKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSNullKeyword(pos) {
    return deserializeTSNullKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSNumberKeyword(pos) {
    return deserializeTSNumberKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSObjectKeyword(pos) {
    return deserializeTSObjectKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSStringKeyword(pos) {
    return deserializeTSStringKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSSymbolKeyword(pos) {
    return deserializeTSSymbolKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSUndefinedKeyword(pos) {
    return deserializeTSUndefinedKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSUnknownKeyword(pos) {
    return deserializeTSUnknownKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSVoidKeyword(pos) {
    return deserializeTSVoidKeyword(uint32[pos >> 2]);
  }
  function deserializeBoxTSArrayType(pos) {
    return deserializeTSArrayType(uint32[pos >> 2]);
  }
  function deserializeBoxTSConditionalType(pos) {
    return deserializeTSConditionalType(uint32[pos >> 2]);
  }
  function deserializeBoxTSConstructorType(pos) {
    return deserializeTSConstructorType(uint32[pos >> 2]);
  }
  function deserializeBoxTSFunctionType(pos) {
    return deserializeTSFunctionType(uint32[pos >> 2]);
  }
  function deserializeBoxTSImportType(pos) {
    return deserializeTSImportType(uint32[pos >> 2]);
  }
  function deserializeBoxTSIndexedAccessType(pos) {
    return deserializeTSIndexedAccessType(uint32[pos >> 2]);
  }
  function deserializeBoxTSInferType(pos) {
    return deserializeTSInferType(uint32[pos >> 2]);
  }
  function deserializeBoxTSIntersectionType(pos) {
    return deserializeTSIntersectionType(uint32[pos >> 2]);
  }
  function deserializeBoxTSLiteralType(pos) {
    return deserializeTSLiteralType(uint32[pos >> 2]);
  }
  function deserializeBoxTSMappedType(pos) {
    return deserializeTSMappedType(uint32[pos >> 2]);
  }
  function deserializeBoxTSNamedTupleMember(pos) {
    return deserializeTSNamedTupleMember(uint32[pos >> 2]);
  }
  function deserializeBoxTSTemplateLiteralType(pos) {
    return deserializeTSTemplateLiteralType(uint32[pos >> 2]);
  }
  function deserializeBoxTSThisType(pos) {
    return deserializeTSThisType(uint32[pos >> 2]);
  }
  function deserializeBoxTSTupleType(pos) {
    return deserializeTSTupleType(uint32[pos >> 2]);
  }
  function deserializeBoxTSTypeLiteral(pos) {
    return deserializeTSTypeLiteral(uint32[pos >> 2]);
  }
  function deserializeBoxTSTypeOperator(pos) {
    return deserializeTSTypeOperator(uint32[pos >> 2]);
  }
  function deserializeBoxTSTypePredicate(pos) {
    return deserializeTSTypePredicate(uint32[pos >> 2]);
  }
  function deserializeBoxTSTypeQuery(pos) {
    return deserializeTSTypeQuery(uint32[pos >> 2]);
  }
  function deserializeBoxTSTypeReference(pos) {
    return deserializeTSTypeReference(uint32[pos >> 2]);
  }
  function deserializeBoxTSUnionType(pos) {
    return deserializeTSUnionType(uint32[pos >> 2]);
  }
  function deserializeBoxTSParenthesizedType(pos) {
    return deserializeTSParenthesizedType(uint32[pos >> 2]);
  }
  function deserializeBoxJSDocNullableType(pos) {
    return deserializeJSDocNullableType(uint32[pos >> 2]);
  }
  function deserializeBoxJSDocNonNullableType(pos) {
    return deserializeJSDocNonNullableType(uint32[pos >> 2]);
  }
  function deserializeBoxJSDocUnknownType(pos) {
    return deserializeJSDocUnknownType(uint32[pos >> 2]);
  }
  function deserializeVecTSType(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTSType(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeVecTSTupleElement(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTSTupleElement(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxTSOptionalType(pos) {
    return deserializeTSOptionalType(uint32[pos >> 2]);
  }
  function deserializeBoxTSRestType(pos) {
    return deserializeTSRestType(uint32[pos >> 2]);
  }
  function deserializeBoxTSQualifiedName(pos) {
    return deserializeTSQualifiedName(uint32[pos >> 2]);
  }
  function deserializeOptionTSType(pos) {
    if (uint8[pos] === 38)
      return null;
    return deserializeTSType(pos);
  }
  function deserializeVecTSTypeParameter(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTSTypeParameter(pos));
      pos += 80;
    }
    return arr;
  }
  function deserializeVecTSInterfaceHeritage(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTSInterfaceHeritage(pos));
      pos += 32;
    }
    return arr;
  }
  function deserializeBoxTSInterfaceBody(pos) {
    return deserializeTSInterfaceBody(uint32[pos >> 2]);
  }
  function deserializeVecTSSignature(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTSSignature(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxTSPropertySignature(pos) {
    return deserializeTSPropertySignature(uint32[pos >> 2]);
  }
  function deserializeBoxTSCallSignatureDeclaration(pos) {
    return deserializeTSCallSignatureDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxTSConstructSignatureDeclaration(pos) {
    return deserializeTSConstructSignatureDeclaration(uint32[pos >> 2]);
  }
  function deserializeBoxTSMethodSignature(pos) {
    return deserializeTSMethodSignature(uint32[pos >> 2]);
  }
  function deserializeVecTSIndexSignatureName(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTSIndexSignatureName(pos));
      pos += 32;
    }
    return arr;
  }
  function deserializeOptionTSModuleDeclarationBody(pos) {
    if (uint8[pos] === 2)
      return null;
    return deserializeTSModuleDeclarationBody(pos);
  }
  function deserializeBoxTSModuleBlock(pos) {
    return deserializeTSModuleBlock(uint32[pos >> 2]);
  }
  function deserializeBoxTSTypeParameter(pos) {
    return deserializeTSTypeParameter(uint32[pos >> 2]);
  }
  function deserializeOptionBoxObjectExpression(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeBoxObjectExpression(pos);
  }
  function deserializeOptionTSTypeName(pos) {
    if (uint8[pos] === 2)
      return null;
    return deserializeTSTypeName(pos);
  }
  function deserializeOptionTSMappedTypeModifierOperator(pos) {
    if (uint8[pos] === 3)
      return null;
    return deserializeTSMappedTypeModifierOperator(pos);
  }
  function deserializeBoxTSExternalModuleReference(pos) {
    return deserializeTSExternalModuleReference(uint32[pos >> 2]);
  }
  function deserializeU32(pos) {
    return uint32[pos >> 2];
  }
  function deserializeOptionNameSpan(pos) {
    if (uint32[pos >> 2] === 0 && uint32[pos + 4 >> 2] === 0)
      return null;
    return deserializeNameSpan(pos);
  }
  function deserializeVecAlternative(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeAlternative(pos));
      pos += 40;
    }
    return arr;
  }
  function deserializeVecTerm(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeTerm(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxBoundaryAssertion(pos) {
    return deserializeBoundaryAssertion(uint32[pos >> 2]);
  }
  function deserializeBoxLookAroundAssertion(pos) {
    return deserializeLookAroundAssertion(uint32[pos >> 2]);
  }
  function deserializeBoxQuantifier(pos) {
    return deserializeQuantifier(uint32[pos >> 2]);
  }
  function deserializeBoxCharacter(pos) {
    return deserializeCharacter(uint32[pos >> 2]);
  }
  function deserializeBoxCharacterClassEscape(pos) {
    return deserializeCharacterClassEscape(uint32[pos >> 2]);
  }
  function deserializeBoxUnicodePropertyEscape(pos) {
    return deserializeUnicodePropertyEscape(uint32[pos >> 2]);
  }
  function deserializeBoxCharacterClass(pos) {
    return deserializeCharacterClass(uint32[pos >> 2]);
  }
  function deserializeBoxCapturingGroup(pos) {
    return deserializeCapturingGroup(uint32[pos >> 2]);
  }
  function deserializeBoxIgnoreGroup(pos) {
    return deserializeIgnoreGroup(uint32[pos >> 2]);
  }
  function deserializeBoxIndexedReference(pos) {
    return deserializeIndexedReference(uint32[pos >> 2]);
  }
  function deserializeBoxNamedReference(pos) {
    return deserializeNamedReference(uint32[pos >> 2]);
  }
  function deserializeU64(pos) {
    const pos32 = pos >> 2;
    return uint32[pos32] + uint32[pos32 + 1] * 4294967296;
  }
  function deserializeOptionU64(pos) {
    if (uint8[pos] === 0)
      return null;
    return deserializeU64(pos + 8);
  }
  function deserializeVecCharacterClassContents(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeCharacterClassContents(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeBoxCharacterClassRange(pos) {
    return deserializeCharacterClassRange(uint32[pos >> 2]);
  }
  function deserializeBoxClassStringDisjunction(pos) {
    return deserializeClassStringDisjunction(uint32[pos >> 2]);
  }
  function deserializeVecClassString(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeClassString(pos));
      pos += 48;
    }
    return arr;
  }
  function deserializeVecCharacter(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeCharacter(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeOptionModifiers(pos) {
    if (uint8[pos + 8] === 3)
      return null;
    return deserializeModifiers(pos);
  }
  function deserializeOptionModifier(pos) {
    if (uint8[pos] === 2)
      return null;
    return deserializeModifier(pos);
  }
  function deserializeVecError(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeError(pos));
      pos += 72;
    }
    return arr;
  }
  function deserializeVecErrorLabel(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeErrorLabel(pos));
      pos += 24;
    }
    return arr;
  }
  function deserializeVecStaticImport(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeStaticImport(pos));
      pos += 64;
    }
    return arr;
  }
  function deserializeVecStaticExport(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeStaticExport(pos));
      pos += 40;
    }
    return arr;
  }
  function deserializeVecDynamicImport(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeDynamicImport(pos));
      pos += 16;
    }
    return arr;
  }
  function deserializeVecSpan(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeSpan(pos));
      pos += 8;
    }
    return arr;
  }
  function deserializeVecImportEntry(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeImportEntry(pos));
      pos += 96;
    }
    return arr;
  }
  function deserializeVecExportEntry(pos) {
    const arr = [], pos32 = pos >> 2, len = uint32[pos32 + 6];
    pos = uint32[pos32];
    for (let i = 0;i < len; i++) {
      arr.push(deserializeExportEntry(pos));
      pos += 144;
    }
    return arr;
  }
});

// node_modules/oxc-parser/index.js
var bindings = require_bindings();
var { wrap } = require_wrap();
var $ParseResult = bindings.ParseResult;
var $ExportExportNameKind = bindings.ExportExportNameKind;
var $ExportImportNameKind = bindings.ExportImportNameKind;
var $ExportLocalNameKind = bindings.ExportLocalNameKind;
var $ImportNameKind = bindings.ImportNameKind;
var $parseWithoutReturn = bindings.parseWithoutReturn;
var $Severity = bindings.Severity;
var $parseSync = function parseSync(filename, sourceText, options) {
  if (options?.experimentalRawTransfer) {
    return parseSyncRaw(filename, sourceText, options);
  }
  return wrap(bindings.parseSync(filename, sourceText, options));
};
var buffer;
var encoder;
var deserializeJS;
var deserializeTS;
function parseSyncRaw(filename, sourceText, options) {
  if (!rawTransferSupported()) {
    throw new Error("`experimentalRawTransfer` option is not supported on 32-bit or big-endian systems, " + "versions of NodeJS prior to v22.0.0, versions of Deno prior to v2.0.0, and other runtimes");
  }
  let experimentalRawTransfer;
  ({ experimentalRawTransfer, ...options } = options);
  if (!buffer) {
    buffer = createBuffer();
    encoder = new TextEncoder;
  }
  const sourceBuffer = new Uint8Array(buffer.buffer, buffer.byteOffset, ONE_GIB);
  const { read, written: sourceByteLen } = encoder.encodeInto(sourceText, sourceBuffer);
  if (read !== sourceText.length) {
    throw new Error("Failed to write source text into buffer");
  }
  bindings.parseSyncRaw(filename, buffer, sourceByteLen, options);
  const astTypeFlagPos = 2147483636;
  let isJsAst = buffer[astTypeFlagPos] === 0;
  let data;
  if (isJsAst) {
    if (!deserializeJS)
      deserializeJS = require_js();
    data = deserializeJS(buffer, sourceText, sourceByteLen);
    const { hashbang } = data.program;
    if (hashbang !== null) {
      data.comments.unshift({ type: "Line", value: hashbang.value, start: hashbang.start, end: hashbang.end });
    }
  } else {
    if (!deserializeTS)
      deserializeTS = require_ts();
    data = deserializeTS(buffer, sourceText, sourceByteLen);
  }
  return {
    get program() {
      return data.program;
    },
    get module() {
      return data.module;
    },
    get comments() {
      return data.comments;
    },
    get errors() {
      return data.errors;
    }
  };
}
var ONE_GIB = 1 << 30;
var TWO_GIB = ONE_GIB * 2;
var SIX_GIB = ONE_GIB * 6;
function createBuffer() {
  const arrayBuffer = new ArrayBuffer(SIX_GIB);
  const offset = bindings.getBufferOffset(new Uint8Array(arrayBuffer));
  return new Uint8Array(arrayBuffer, offset, TWO_GIB);
}
var rawTransferIsSupported = null;
function rawTransferSupported() {
  if (rawTransferIsSupported === null) {
    rawTransferIsSupported = rawTransferRuntimeSupported() && bindings.rawTransferSupported();
  }
  return rawTransferIsSupported;
}
function rawTransferRuntimeSupported() {
  let global;
  try {
    global = globalThis;
  } catch (e) {
    return false;
  }
  const isBun = !!global.Bun || !!global.process?.versions?.bun;
  if (isBun)
    return false;
  const isDeno = !!global.Deno;
  if (isDeno) {
    const match2 = Deno.version?.deno?.match(/^(\d+)\./);
    return !!match2 && match2[1] * 1 >= 2;
  }
  const isNode = global.process?.release?.name === "node";
  if (!isNode)
    return false;
  const match = process.version?.match(/^v(\d+)\./);
  return !!match && match[1] * 1 >= 22;
}

// node_modules/estree-toolkit/dist-es/helpers.mjs
var assertNever = (x) => x;
var SPLIT_LOWER_UPPER_RE = /([\p{Ll}\d])(\p{Lu})/gu;
var SPLIT_UPPER_UPPER_RE = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu;
var SPLIT_REPLACE_VALUE = "$1\x00$2";
var DEFAULT_STRIP_REGEXP = /[^\p{L}\d]+/giu;
var split = (input) => {
  let output = input.trim();
  output = output.replace(SPLIT_LOWER_UPPER_RE, SPLIT_REPLACE_VALUE).replace(SPLIT_UPPER_UPPER_RE, SPLIT_REPLACE_VALUE);
  output = output.replace(DEFAULT_STRIP_REGEXP, "\x00");
  let start = 0;
  let end = output.length;
  while (output.charAt(start) === "\x00")
    start++;
  if (start === end)
    return [];
  while (output.charAt(end - 1) === "\x00")
    end--;
  return output.slice(start, end).split(/\0/g);
};
var toCamelCase = (input) => {
  const transform = (word, index) => {
    const char0 = word[0];
    const initial = index > 0 && char0 >= "0" && char0 <= "9" ? "_" + char0 : char0.toLocaleUpperCase();
    return initial + word.slice(1).toLocaleLowerCase();
  };
  const words = split(input);
  const output = words.map((word, index) => index === 0 ? word.toLocaleLowerCase() : transform(word, index)).join("");
  return output;
};
var cleanObj = (obj) => Object.assign(Object.create(null), obj);

// node_modules/estree-toolkit/dist-es/aliases.mjs
var clean = cleanObj;
var aliases = clean({
  Function: clean({
    FunctionDeclaration: 0,
    FunctionExpression: 0,
    ArrowFunctionExpression: 0
  }),
  Statement: clean({
    FunctionDeclaration: 0,
    ExpressionStatement: 0,
    BlockStatement: 0,
    EmptyStatement: 0,
    DebuggerStatement: 0,
    WithStatement: 0,
    ReturnStatement: 0,
    LabeledStatement: 0,
    BreakStatement: 0,
    ContinueStatement: 0,
    IfStatement: 0,
    SwitchStatement: 0,
    ThrowStatement: 0,
    TryStatement: 0,
    WhileStatement: 0,
    DoWhileStatement: 0,
    ForStatement: 0,
    ForInStatement: 0,
    ForOfStatement: 0,
    VariableDeclaration: 0,
    ClassDeclaration: 0,
    StaticBlock: 0
  }),
  Declaration: clean({
    FunctionDeclaration: 0,
    VariableDeclaration: 0,
    ClassDeclaration: 0
  }),
  Expression: clean({
    FunctionExpression: 0,
    ArrowFunctionExpression: 0,
    ClassExpression: 0,
    CallExpression: 0,
    ConditionalExpression: 0,
    ChainExpression: 0,
    Identifier: 0,
    Literal: 0,
    ThisExpression: 0,
    ArrayExpression: 0,
    ObjectExpression: 0,
    YieldExpression: 0,
    UnaryExpression: 0,
    UpdateExpression: 0,
    BinaryExpression: 0,
    AssignmentExpression: 0,
    LogicalExpression: 0,
    MemberExpression: 0,
    NewExpression: 0,
    SequenceExpression: 0,
    TemplateLiteral: 0,
    TaggedTemplateExpression: 0,
    MetaProperty: 0,
    AwaitExpression: 0,
    ImportExpression: 0,
    JSXElement: 0,
    JSXFragment: 0
  }),
  Pattern: clean({
    Identifier: 0,
    MemberExpression: 0,
    ObjectPattern: 0,
    ArrayPattern: 0,
    RestElement: 0,
    AssignmentPattern: 0
  }),
  Class: clean({
    ClassDeclaration: 0,
    ClassExpression: 0
  }),
  ExportDeclaration: clean({
    ExportNamedDeclaration: 0,
    ExportDefaultDeclaration: 0,
    ExportAllDeclaration: 0
  }),
  Loop: clean({
    ForStatement: 0,
    ForInStatement: 0,
    ForOfStatement: 0,
    WhileStatement: 0,
    DoWhileStatement: 0
  }),
  ModuleDeclaration: clean({
    ExportAllDeclaration: 0,
    ExportDefaultDeclaration: 0,
    ExportNamedDeclaration: 0,
    ImportDeclaration: 0
  })
});

// node_modules/estree-toolkit/dist-es/assert.mjs
var runValidation = (validateFn, value) => {
  const errorMsg = validateFn(value);
  if (errorMsg != null) {
    throw new Error(errorMsg);
  }
};
var chain = (...validateFns) => validateFns.reduce((prevFn, fn) => (val) => prevFn(val) || fn(val));
var OR = (...validateFns) => (value) => {
  const errorMsgs = [];
  for (let i = 0;i < validateFns.length; i++) {
    const errorMsg = validateFns[i](value);
    if (errorMsg != null) {
      errorMsgs.push(errorMsg);
    } else {
      break;
    }
  }
  if (errorMsgs.length === validateFns.length) {
    return `The value is not compatible with the required type.

Messages:
${errorMsgs.join(`
`)}`;
  }
  return null;
};
var meaningfulType = (value) => {
  if (value === null) {
    return "null";
  } else if (Array.isArray(value)) {
    return "array";
  } else {
    return typeof value;
  }
};
var value = (...types) => {
  if (types.length === 1) {
    const type = types[0];
    return function validate(value2) {
      if (typeof value2 !== type) {
        return `Expected the value to be a \`${type}\` but got a \`${meaningfulType(value2)}\`. The value is ${JSON.stringify(value2)}.`;
      }
      return null;
    };
  } else {
    return function validate(value2) {
      for (let i = 0;i < types.length; i++) {
        const type = types[i];
        if (typeof value2 === type || type === "null" && value2 === null) {
          return null;
        }
      }
      return `Expected the value to be one of \`${JSON.stringify(types)}\` but got a \`${meaningfulType(value2)}\`. The value is ${JSON.stringify(value2)}.`;
    };
  }
};
var reservedKeywords = new Set(`
do if in for let new try var case else enum
eval false null NaN this true void
with break catch class const super throw while
yield delete export import public return static
switch typeof default extends finally package
private continue debugger function arguments
interface protected implements instanceof
`.trim().split(/[ \n]/).map((s) => s.trim()));
var isReserved = (name2) => reservedKeywords.has(name2);
var validIdentifier = (jsx) => (name2) => {
  if ((jsx ? /[\s]/ : /[-\s]/).test(name2) || /^\d/.test(name2) || name2.length === 0) {
    return `${JSON.stringify(name2)} is not a valid identifier.`;
  }
  return null;
};
var nonNull = (value2) => {
  if (value2 == null) {
    return "Expected the value to be non-null but got null or undefined value.";
  }
  return null;
};
var node = (...types) => {
  if (types.length === 1) {
    const type = types[0];
    return (value2) => {
      if (value2 == null || value2.type !== type) {
        return `Expected a "${type}" node but got a \`${meaningfulType(value2)}\`. The value is ${JSON.stringify(value2)}.`;
      }
      return null;
    };
  } else {
    return (value2) => {
      if (types.indexOf(value2.type) === -1) {
        return `Expected one of (${types.join()}) node but got a \`${meaningfulType(value2)}\`. The value is ${JSON.stringify(value2)}.`;
      }
      return null;
    };
  }
};
var nodeAlias = (alias) => (value2) => {
  if (value2 == null || !(value2.type in aliases[alias])) {
    return `Expected one of (${Object.keys(aliases[alias]).join()}) node but got a \`${meaningfulType(value2)}\`. The value is ${JSON.stringify(value2)}.`;
  }
  return null;
};
var any = () => null;
var arrayOf = (validateFn) => (value2) => {
  if (Array.isArray(value2)) {
    let errorMsg;
    for (let i = 0;i < value2.length; i++) {
      errorMsg = validateFn(value2[i]);
      if (errorMsg != null)
        return `Got unexpected value at index ${i}:
  ${errorMsg}`;
    }
    return null;
  } else {
    return `Expected the value to be an array but got a \`${meaningfulType(value2)}\`. The value is ${JSON.stringify(value2)}.`;
  }
};
var oneOf = (items) => (value2) => {
  if (!items.includes(value2)) {
    return `Expected the value to be one of ${JSON.stringify(items)}, but got ${JSON.stringify(value2)}`;
  }
  return null;
};
var nullable = (validateFn) => (value2) => {
  if (value2 === null) {
    return null;
  }
  return validateFn(value2);
};

// node_modules/estree-toolkit/dist-es/definitions.mjs
var anyValidate = {
  validate: any
};
var definitions = cleanObj({
  Identifier: {
    indices: {
      name: [0, false]
    },
    fields: {
      name: {
        validate: chain(value("string"), validIdentifier(false))
      }
    },
    insertionValidate(node2, key, listKey, parent) {
      if (parent.type === "MemberExpression" && !parent.computed && key === "property" || (parent.type === "Property" || parent.type === "MethodDefinition") && !parent.computed && key === "key" || parent.type === "ExportSpecifier" && key === "exported" || parent.type === "ImportSpecifier" && key === "imported" || parent.type === "MetaProperty" && (key === "meta" && node2.name === "import" || key === "property" && node2.name === "meta")) {
        return null;
      }
      if (isReserved(node2.name)) {
        return `${JSON.stringify(node2.name)} is not a valid identifier.`;
      }
      return null;
    }
  },
  Literal: {
    indices: {
      value: [0, false],
      raw: false
    },
    fields: {
      value: {
        validate: value("string", "number", "bigint", "boolean", "null")
      },
      raw: anyValidate
    }
  },
  Program: {
    indices: {
      body: 0,
      sourceType: [1, false],
      comments: [2, false]
    },
    fields: {
      body: {
        validate: arrayOf(OR(nodeAlias("Statement"), nodeAlias("ModuleDeclaration")))
      },
      sourceType: {
        default: "module",
        validate: value("string")
      },
      comments: { default: [], ...anyValidate }
    }
  },
  FunctionDeclaration: {
    indices: {
      id: 0,
      params: 1,
      body: 2,
      generator: [3, false],
      async: [4, false]
    },
    fields: {
      id: {
        validate: nullable(node("Identifier"))
      },
      params: {
        validate: arrayOf(nodeAlias("Pattern"))
      },
      body: {
        validate: node("BlockStatement")
      },
      generator: {
        default: false,
        validate: value("boolean")
      },
      async: {
        default: false,
        validate: value("boolean")
      }
    }
  },
  FunctionExpression: {
    indices: {
      id: 0,
      params: 1,
      body: 2,
      generator: [3, false],
      async: [4, false]
    },
    fields: {
      id: {
        validate: nullable(node("Identifier"))
      },
      params: {
        validate: arrayOf(nodeAlias("Pattern"))
      },
      body: {
        validate: node("BlockStatement")
      },
      generator: {
        default: false,
        validate: value("boolean")
      },
      async: {
        default: false,
        validate: value("boolean")
      }
    }
  },
  ArrowFunctionExpression: {
    indices: {
      params: 0,
      body: 1,
      expression: [2, false],
      async: [3, false],
      generator: false
    },
    fields: {
      params: {
        validate: arrayOf(nodeAlias("Pattern"))
      },
      body: {
        validate: OR(node("BlockStatement"), nodeAlias("Expression"))
      },
      expression: {
        default: false,
        validate: value("boolean")
      },
      async: {
        default: false,
        validate: value("boolean")
      },
      generator: anyValidate
    }
  },
  SwitchCase: {
    indices: {
      test: 0,
      consequent: 1
    },
    fields: {
      test: {
        validate: nullable(nodeAlias("Expression"))
      },
      consequent: {
        validate: arrayOf(nodeAlias("Statement"))
      }
    }
  },
  CatchClause: {
    indices: {
      param: 0,
      body: 1
    },
    fields: {
      param: {
        validate: nullable(nodeAlias("Pattern"))
      },
      body: {
        validate: node("BlockStatement")
      }
    }
  },
  VariableDeclarator: {
    indices: {
      id: 0,
      init: 1
    },
    fields: {
      id: {
        validate: nodeAlias("Pattern")
      },
      init: {
        default: null,
        validate: nullable(nodeAlias("Expression"))
      }
    }
  },
  ExpressionStatement: {
    indices: {
      expression: 0
    },
    fields: {
      expression: {
        validate: nodeAlias("Expression")
      }
    }
  },
  BlockStatement: {
    indices: {
      body: 0,
      innerComments: false
    },
    fields: {
      body: {
        validate: arrayOf(nodeAlias("Statement"))
      },
      innerComments: anyValidate
    }
  },
  EmptyStatement: {
    indices: {},
    fields: {}
  },
  DebuggerStatement: {
    indices: {},
    fields: {}
  },
  WithStatement: {
    indices: {
      object: 0,
      body: 1
    },
    fields: {
      object: {
        validate: nodeAlias("Expression")
      },
      body: {
        validate: nodeAlias("Statement")
      }
    }
  },
  ReturnStatement: {
    indices: {
      argument: 0
    },
    fields: {
      argument: {
        default: null,
        validate: nullable(nodeAlias("Expression"))
      }
    }
  },
  LabeledStatement: {
    indices: {
      label: 0,
      body: 1
    },
    fields: {
      label: {
        validate: node("Identifier")
      },
      body: {
        validate: nodeAlias("Statement")
      }
    }
  },
  BreakStatement: {
    indices: {
      label: 0
    },
    fields: {
      label: {
        default: null,
        validate: nullable(node("Identifier"))
      }
    }
  },
  ContinueStatement: {
    indices: {
      label: 0
    },
    fields: {
      label: {
        default: null,
        validate: nullable(node("Identifier"))
      }
    }
  },
  IfStatement: {
    indices: {
      test: 0,
      consequent: 1,
      alternate: 2
    },
    fields: {
      test: {
        validate: nodeAlias("Expression")
      },
      consequent: {
        validate: nodeAlias("Statement")
      },
      alternate: {
        default: null,
        validate: nullable(nodeAlias("Statement"))
      }
    }
  },
  SwitchStatement: {
    indices: {
      discriminant: 0,
      cases: 1
    },
    fields: {
      discriminant: {
        validate: nodeAlias("Expression")
      },
      cases: {
        validate: arrayOf(node("SwitchCase"))
      }
    }
  },
  ThrowStatement: {
    indices: {
      argument: 0
    },
    fields: {
      argument: {
        validate: nodeAlias("Expression")
      }
    }
  },
  TryStatement: {
    indices: {
      block: 0,
      handler: 1,
      finalizer: 2
    },
    fields: {
      block: {
        validate: node("BlockStatement")
      },
      handler: {
        validate: nullable(node("CatchClause"))
      },
      finalizer: {
        default: null,
        validate: nullable(node("BlockStatement"))
      }
    },
    finalValidate(node2) {
      if (node2.handler == null && node2.finalizer == null) {
        return "If `handler` is null then `finalizer` must be not null";
      }
      return null;
    }
  },
  WhileStatement: {
    indices: {
      test: 0,
      body: 1
    },
    fields: {
      test: {
        validate: nodeAlias("Expression")
      },
      body: {
        validate: nodeAlias("Statement")
      }
    }
  },
  DoWhileStatement: {
    indices: {
      test: 0,
      body: 1
    },
    fields: {
      test: {
        validate: nodeAlias("Expression")
      },
      body: {
        validate: nodeAlias("Statement")
      }
    }
  },
  ForStatement: {
    indices: {
      init: 0,
      test: 1,
      update: 2,
      body: 3
    },
    fields: {
      init: {
        validate: nullable(OR(node("VariableDeclaration"), nodeAlias("Expression")))
      },
      test: {
        validate: nullable(nodeAlias("Expression"))
      },
      update: {
        validate: nullable(nodeAlias("Expression"))
      },
      body: {
        validate: nodeAlias("Statement")
      }
    }
  },
  ForInStatement: {
    indices: {
      left: 0,
      right: 1,
      body: 2
    },
    fields: {
      left: {
        validate: OR(node("VariableDeclaration"), nodeAlias("Pattern"))
      },
      right: {
        validate: nodeAlias("Expression")
      },
      body: {
        validate: nodeAlias("Statement")
      }
    }
  },
  ForOfStatement: {
    indices: {
      left: 0,
      right: 1,
      body: 2,
      await: [3, false]
    },
    fields: {
      left: {
        validate: OR(node("VariableDeclaration"), nodeAlias("Pattern"))
      },
      right: {
        validate: nodeAlias("Expression")
      },
      body: {
        validate: nodeAlias("Statement")
      },
      await: {
        validate: value("boolean")
      }
    }
  },
  VariableDeclaration: {
    indices: {
      kind: [0, false],
      declarations: 1
    },
    fields: {
      kind: {
        validate: oneOf(["var", "let", "const"])
      },
      declarations: {
        validate: arrayOf(node("VariableDeclarator"))
      }
    }
  },
  ClassDeclaration: {
    indices: {
      id: 0,
      body: 2,
      superClass: [3, 1]
    },
    fields: {
      id: {
        validate: nullable(node("Identifier"))
      },
      body: {
        validate: node("ClassBody")
      },
      superClass: {
        default: null,
        validate: nullable(nodeAlias("Expression"))
      }
    }
  },
  ThisExpression: {
    indices: {},
    fields: {}
  },
  ArrayExpression: {
    indices: {
      elements: 0
    },
    fields: {
      elements: {
        validate: arrayOf(nullable(OR(nodeAlias("Expression"), node("SpreadElement"))))
      }
    }
  },
  ObjectExpression: {
    indices: {
      properties: 0
    },
    fields: {
      properties: {
        validate: arrayOf(node("Property", "SpreadElement"))
      }
    }
  },
  YieldExpression: {
    indices: {
      argument: 0,
      delegate: [1, false]
    },
    fields: {
      argument: {
        validate: nullable(nodeAlias("Expression"))
      },
      delegate: {
        default: false,
        validate: value("boolean")
      }
    }
  },
  UnaryExpression: {
    indices: {
      operator: [0, false],
      argument: 1,
      prefix: [2, false]
    },
    fields: {
      operator: {
        validate: oneOf(["-", "+", "!", "~", "typeof", "void", "delete"])
      },
      argument: {
        validate: nodeAlias("Expression")
      },
      prefix: {
        default: true,
        validate: value("boolean")
      }
    }
  },
  UpdateExpression: {
    indices: {
      operator: [0, false],
      argument: 1,
      prefix: [2, false]
    },
    fields: {
      operator: {
        validate: oneOf(["++", "--"])
      },
      argument: {
        validate: nodeAlias("Expression")
      },
      prefix: {
        validate: value("boolean")
      }
    }
  },
  BinaryExpression: {
    indices: {
      operator: [0, false],
      left: 1,
      right: 2
    },
    fields: {
      operator: {
        validate: oneOf([
          "==",
          "!=",
          "===",
          "!==",
          "<",
          "<=",
          ">",
          ">=",
          "<<",
          ">>",
          ">>>",
          "+",
          "-",
          "*",
          "/",
          "%",
          "**",
          "|",
          "^",
          "&",
          "in",
          "instanceof"
        ])
      },
      left: {
        validate: OR(nodeAlias("Expression"), node("PrivateIdentifier"))
      },
      right: {
        validate: nodeAlias("Expression")
      }
    }
  },
  AssignmentExpression: {
    indices: {
      operator: [0, false],
      left: 1,
      right: 2
    },
    fields: {
      operator: {
        validate: oneOf([
          "=",
          "+=",
          "-=",
          "*=",
          "/=",
          "%=",
          "**=",
          "<<=",
          ">>=",
          ">>>=",
          "|=",
          "^=",
          "&=",
          "||=",
          "&&=",
          "??="
        ])
      },
      left: {
        validate: nodeAlias("Pattern")
      },
      right: {
        validate: nodeAlias("Expression")
      }
    }
  },
  LogicalExpression: {
    indices: {
      operator: [0, false],
      left: 1,
      right: 2
    },
    fields: {
      operator: {
        validate: oneOf(["||", "&&", "??"])
      },
      left: {
        validate: nodeAlias("Expression")
      },
      right: {
        validate: nodeAlias("Expression")
      }
    }
  },
  MemberExpression: {
    indices: {
      object: 0,
      property: 1,
      computed: [2, false],
      optional: [3, false]
    },
    fields: {
      object: {
        validate: OR(nodeAlias("Expression"), node("Super"))
      },
      property: {
        validate: OR(nodeAlias("Expression"), node("PrivateIdentifier"))
      },
      computed: {
        default: false,
        validate: value("boolean")
      },
      optional: {
        default: false,
        validate: value("boolean")
      }
    }
  },
  ConditionalExpression: {
    indices: {
      test: 0,
      consequent: 1,
      alternate: 2
    },
    fields: {
      test: {
        validate: nodeAlias("Expression")
      },
      consequent: {
        validate: nodeAlias("Expression")
      },
      alternate: {
        validate: nodeAlias("Expression")
      }
    }
  },
  CallExpression: {
    indices: {
      callee: 0,
      arguments: 1,
      optional: [2, false]
    },
    fields: {
      callee: {
        validate: OR(nodeAlias("Expression"), node("Super"))
      },
      arguments: {
        validate: arrayOf(OR(nodeAlias("Expression"), node("SpreadElement")))
      },
      optional: {
        type: "boolean",
        default: false,
        validate: value("boolean")
      }
    }
  },
  NewExpression: {
    indices: {
      callee: 0,
      arguments: 1
    },
    fields: {
      callee: {
        validate: OR(nodeAlias("Expression"), node("Super"))
      },
      arguments: {
        validate: arrayOf(OR(nodeAlias("Expression"), node("SpreadElement")))
      }
    }
  },
  SequenceExpression: {
    indices: {
      expressions: 0
    },
    fields: {
      expressions: {
        validate: arrayOf(nodeAlias("Expression"))
      }
    }
  },
  TemplateLiteral: {
    indices: {
      quasis: 0,
      expressions: 1
    },
    fields: {
      quasis: {
        validate: arrayOf(node("TemplateElement"))
      },
      expressions: {
        validate: arrayOf(nodeAlias("Expression"))
      }
    }
  },
  TaggedTemplateExpression: {
    indices: {
      tag: 0,
      quasi: 1
    },
    fields: {
      tag: {
        validate: nodeAlias("Expression")
      },
      quasi: {
        validate: node("TemplateLiteral")
      }
    }
  },
  ClassExpression: {
    indices: {
      id: 0,
      body: 2,
      superClass: [3, 1]
    },
    fields: {
      id: {
        validate: nullable(node("Identifier"))
      },
      body: {
        validate: node("ClassBody")
      },
      superClass: {
        default: null,
        validate: nullable(nodeAlias("Expression"))
      }
    }
  },
  MetaProperty: {
    indices: {
      meta: 0,
      property: 1
    },
    fields: {
      meta: {
        validate: node("Identifier")
      },
      property: {
        validate: node("Identifier")
      }
    }
  },
  AwaitExpression: {
    indices: {
      argument: 0
    },
    fields: {
      argument: {
        validate: nodeAlias("Expression")
      }
    }
  },
  ImportExpression: {
    indices: {
      source: 0,
      options: 1
    },
    fields: {
      source: {
        validate: nodeAlias("Expression")
      },
      options: {
        validate: nullable(nodeAlias("Expression")),
        default: null
      }
    }
  },
  ChainExpression: {
    indices: {
      expression: 0
    },
    fields: {
      expression: {
        validate: node("CallExpression", "MemberExpression")
      }
    }
  },
  Property: {
    indices: {
      kind: [0, false],
      key: 1,
      value: 2,
      computed: [3, false],
      shorthand: [4, false],
      method: false
    },
    fields: {
      kind: {
        validate: oneOf(["init", "get", "set"])
      },
      key: {
        validate: OR(nodeAlias("Expression"), node("PrivateIdentifier"))
      },
      value: {
        validate: OR(nodeAlias("Expression"), nodeAlias("Pattern"), node("Property"))
      },
      computed: {
        default: false,
        validate: value("boolean")
      },
      shorthand: {
        default: false,
        validate: value("boolean")
      },
      method: {
        validate: value("boolean")
      }
    }
  },
  Super: {
    indices: {},
    fields: {}
  },
  TemplateElement: {
    indices: {
      value: [0, false],
      tail: [1, false]
    },
    fields: {
      value: {
        validate: nonNull
      },
      tail: {
        validate: value("boolean")
      }
    }
  },
  SpreadElement: {
    indices: {
      argument: 0
    },
    fields: {
      argument: {
        validate: nodeAlias("Expression")
      }
    }
  },
  ObjectPattern: {
    indices: {
      properties: 0
    },
    fields: {
      properties: {
        validate: arrayOf(node("Property", "RestElement"))
      }
    }
  },
  ArrayPattern: {
    indices: {
      elements: 0
    },
    fields: {
      elements: {
        validate: arrayOf(nullable(nodeAlias("Pattern")))
      }
    }
  },
  RestElement: {
    indices: {
      argument: 0
    },
    fields: {
      argument: {
        validate: nodeAlias("Pattern")
      }
    },
    insertionValidate(node2, key, listKey, parent) {
      if (parent[listKey].length > key) {
        return `RestElement should be the last children of "${listKey}"`;
      }
      return null;
    }
  },
  AssignmentPattern: {
    indices: {
      left: 0,
      right: 1
    },
    fields: {
      left: {
        validate: nodeAlias("Pattern")
      },
      right: {
        validate: nodeAlias("Expression")
      }
    }
  },
  ClassBody: {
    indices: {
      body: 0
    },
    fields: {
      body: {
        validate: arrayOf(node("StaticBlock", "PropertyDefinition", "MethodDefinition"))
      }
    }
  },
  MethodDefinition: {
    indices: {
      kind: [0, false],
      key: 1,
      value: 2,
      computed: [3, false],
      static: [4, false]
    },
    fields: {
      kind: {
        validate: oneOf(["method", "get", "set", "constructor"])
      },
      key: {
        validate: OR(nodeAlias("Expression"), node("PrivateIdentifier"))
      },
      value: {
        validate: node("FunctionExpression")
      },
      computed: {
        default: false,
        validate: value("boolean")
      },
      static: {
        default: false,
        validate: value("boolean")
      }
    }
  },
  ImportDeclaration: {
    indices: {
      specifiers: 0,
      source: 1,
      attributes: 2
    },
    fields: {
      specifiers: {
        validate: arrayOf(node("ImportSpecifier", "ImportDefaultSpecifier", "ImportNamespaceSpecifier"))
      },
      source: {
        validate: node("Literal")
      },
      attributes: {
        default: () => [],
        validate: arrayOf(node("ImportAttribute"))
      }
    }
  },
  ExportNamedDeclaration: {
    indices: {
      declaration: 0,
      specifiers: 1,
      source: 2,
      attributes: 3
    },
    fields: {
      declaration: {
        validate: nullable(nodeAlias("Declaration"))
      },
      specifiers: {
        default: [],
        validate: arrayOf(node("ExportSpecifier"))
      },
      source: {
        default: null,
        validate: nullable(node("Literal"))
      },
      attributes: {
        default: () => [],
        validate: arrayOf(node("ImportAttribute"))
      }
    }
  },
  ExportDefaultDeclaration: {
    indices: {
      declaration: 0
    },
    fields: {
      declaration: {
        validate: OR(nodeAlias("Declaration"), nodeAlias("Expression"))
      }
    }
  },
  ExportAllDeclaration: {
    indices: {
      source: 0,
      exported: 1,
      attributes: 2
    },
    fields: {
      source: {
        validate: node("Literal")
      },
      exported: {
        default: null,
        validate: nullable(OR(node("Identifier"), node("Literal")))
      },
      attributes: {
        default: () => [],
        validate: arrayOf(node("ImportAttribute"))
      }
    }
  },
  ImportSpecifier: {
    indices: {
      imported: 0,
      local: 1
    },
    fields: {
      imported: {
        validate: OR(node("Identifier"), node("Literal"))
      },
      local: {
        default: (node2) => {
          if (node2.imported.type === "Identifier") {
            return { type: "Identifier", name: node2.imported.name };
          }
          throw new Error("Provide `local` value when `imported` is not an `Identifier`");
        },
        validate: node("Identifier")
      }
    }
  },
  ImportDefaultSpecifier: {
    indices: {
      local: 0
    },
    fields: {
      local: {
        validate: node("Identifier")
      }
    }
  },
  ImportNamespaceSpecifier: {
    indices: {
      local: 0
    },
    fields: {
      local: {
        validate: node("Identifier")
      }
    }
  },
  ExportSpecifier: {
    indices: {
      local: 0,
      exported: 1
    },
    fields: {
      local: {
        validate: OR(node("Identifier"), node("Literal"))
      },
      exported: {
        default: ({ local }) => structuredClone(local),
        validate: OR(node("Identifier"), node("Literal"))
      }
    }
  },
  PrivateIdentifier: {
    indices: {
      name: [1, false]
    },
    fields: {
      name: {
        validate: chain(value("string"), validIdentifier(false))
      }
    }
  },
  PropertyDefinition: {
    indices: {
      key: 0,
      value: 1,
      computed: [2, false],
      static: [3, false]
    },
    fields: {
      key: {
        validate: OR(nodeAlias("Expression"), node("PrivateIdentifier"))
      },
      value: {
        validate: nullable(nodeAlias("Expression"))
      },
      computed: {
        default: false,
        validate: value("boolean")
      },
      static: {
        default: false,
        validate: value("boolean")
      }
    }
  },
  StaticBlock: {
    indices: {
      body: 0,
      innerComments: false
    },
    fields: {
      body: {
        validate: arrayOf(nodeAlias("Statement"))
      },
      innerComments: anyValidate
    }
  },
  ImportAttribute: {
    indices: {
      key: 0,
      value: 1
    },
    fields: {
      key: {
        validate: node("Identifier", "Literal")
      },
      value: {
        validate: node("Literal")
      }
    }
  },
  JSXIdentifier: {
    indices: {
      name: [0, false]
    },
    fields: {
      name: {
        validate: chain(value("string"), validIdentifier(true))
      }
    }
  },
  JSXNamespacedName: {
    indices: {
      namespace: 0,
      name: 1
    },
    fields: {
      namespace: {
        validate: node("JSXIdentifier")
      },
      name: {
        validate: node("JSXIdentifier")
      }
    }
  },
  JSXMemberExpression: {
    indices: {
      object: 0,
      property: 0
    },
    fields: {
      object: {
        validate: node("JSXIdentifier", "JSXMemberExpression")
      },
      property: {
        validate: node("JSXIdentifier")
      }
    }
  },
  JSXEmptyExpression: {
    indices: {},
    fields: {}
  },
  JSXExpressionContainer: {
    indices: {
      expression: 0
    },
    fields: {
      expression: {
        validate: OR(nodeAlias("Expression"), node("JSXEmptyExpression"))
      }
    }
  },
  JSXSpreadAttribute: {
    indices: {
      argument: 0
    },
    fields: {
      argument: {
        validate: nodeAlias("Expression")
      }
    }
  },
  JSXAttribute: {
    indices: {
      name: 0,
      value: 1
    },
    fields: {
      name: {
        validate: node("JSXIdentifier", "JSXNamespacedName")
      },
      value: {
        validate: nullable(node("Literal", "JSXExpressionContainer", "JSXElement", "JSXFragment"))
      }
    }
  },
  JSXClosingElement: {
    indices: {
      name: 0
    },
    fields: {
      name: {
        validate: node("JSXIdentifier", "JSXNamespacedName", "JSXMemberExpression")
      }
    }
  },
  JSXClosingFragment: {
    indices: {},
    fields: {}
  },
  JSXElement: {
    indices: {
      openingElement: 0,
      children: [2, 1],
      closingElement: [1, 2]
    },
    fields: {
      openingElement: {
        validate: node("JSXOpeningElement")
      },
      children: {
        validate: arrayOf(node("JSXExpressionContainer", "JSXElement", "JSXFragment", "JSXText", "JSXSpreadChild")),
        default: []
      },
      closingElement: {
        validate: nullable(node("JSXClosingElement"))
      }
    }
  },
  JSXFragment: {
    indices: {
      openingFragment: 0,
      children: [2, 1],
      closingFragment: [1, 2]
    },
    fields: {
      openingFragment: {
        validate: node("JSXOpeningFragment")
      },
      children: {
        validate: arrayOf(node("JSXExpressionContainer", "JSXElement", "JSXFragment", "JSXText", "JSXSpreadChild")),
        default: []
      },
      closingFragment: {
        validate: node("JSXClosingFragment")
      }
    }
  },
  JSXOpeningElement: {
    indices: {
      name: 0,
      attributes: 1,
      selfClosing: [2, false]
    },
    fields: {
      name: {
        validate: node("JSXIdentifier", "JSXNamespacedName", "JSXMemberExpression")
      },
      attributes: {
        validate: arrayOf(node("JSXSpreadAttribute", "JSXAttribute")),
        default: []
      },
      selfClosing: {
        validate: value("boolean"),
        default: false
      }
    }
  },
  JSXOpeningFragment: {
    indices: {},
    fields: {}
  },
  JSXSpreadChild: {
    indices: {
      expression: 0
    },
    fields: {
      expression: {
        validate: nodeAlias("Expression")
      }
    }
  },
  JSXText: {
    indices: {
      value: [0, false],
      raw: false
    },
    fields: {
      value: {
        validate: value("string")
      },
      raw: anyValidate
    }
  }
});
var getFieldsOf = ({ indices }, type) => {
  const fields = [];
  Object.keys(indices).forEach((fieldName) => {
    const indexValue = indices[fieldName];
    if (indexValue === false)
      return;
    switch (typeof indexValue) {
      case "number":
        return fields.push({ name: fieldName, index: indexValue });
      case "object": {
        const index = indexValue[type === "builder" ? 0 : 1];
        if (index === false)
          return;
        return fields.push({ name: fieldName, index });
      }
    }
  });
  return fields.sort((a, b) => a.index - b.index).map(({ name: name2 }) => name2);
};
var visitorKeys = (() => {
  const record = Object.create(null);
  for (const nodeType in definitions) {
    record[nodeType] = getFieldsOf(definitions[nodeType], "visitor");
  }
  return record;
})();

// node_modules/estree-toolkit/dist-es/builders.mjs
var shouldValidateNodes = true;
var setNodeValidationEnabled = (state) => {
  shouldValidateNodes = state;
};
var getNodeValidationEnabled = () => shouldValidateNodes;
var builders = {};
for (const key in definitions) {
  const nodeType = key;
  const definition = definitions[nodeType];
  const { fields } = definition;
  const fieldNames = getFieldsOf(definition, "builder");
  builders[toCamelCase(nodeType)] = (...args) => {
    const node2 = { type: nodeType };
    fieldNames.forEach((fieldName, index) => {
      const field = fields[fieldName];
      node2[fieldName] = args[index] !== undefined ? args[index] : ("default" in field) ? typeof field.default == "function" ? field.default(node2) : field.default : args[index];
      if (shouldValidateNodes && field.validate != null) {
        runValidation(field.validate, node2[fieldName]);
      }
    });
    if (shouldValidateNodes && definition.finalValidate != null) {
      runValidation(definition.finalValidate, node2);
    }
    return node2;
  };
}
// node_modules/estree-toolkit/dist-es/is.mjs
var matches = (object, toMatch) => {
  for (const key in toMatch) {
    const value2 = toMatch[key];
    if (typeof value2 == "function") {
      if (!value2(object[key], object))
        return false;
    } else if (value2 !== object[key]) {
      return false;
    }
  }
  return true;
};
var is = {};
for (const nodeType in definitions) {
  is[toCamelCase(nodeType)] = (nodeOrNodePath, toMatch) => {
    if (nodeOrNodePath == null)
      return false;
    const node2 = nodeOrNodePath.ctx != null ? nodeOrNodePath.node : nodeOrNodePath;
    return node2 != null && node2.type === nodeType && (toMatch != null ? matches(node2, toMatch) : true);
  };
}
for (const aliasName in aliases) {
  is[toCamelCase(aliasName)] = (nodeOrNodePath, toMatch) => {
    if (nodeOrNodePath == null)
      return false;
    const node2 = nodeOrNodePath.ctx != null ? nodeOrNodePath.node : nodeOrNodePath;
    return node2 != null && node2.type in aliases[aliasName] && (toMatch != null ? matches(node2, toMatch) : true);
  };
}
// node_modules/estree-toolkit/dist-es/binding.mjs
class BaseBinding {
  constructor() {
    this.references = [];
    this.constantViolations = [];
  }
  addReference(path) {
    this.references.push(path);
  }
  removeReference(path) {
    const idx = this.references.findIndex((x) => x === path);
    if (idx > -1)
      this.references.splice(idx, 1);
  }
  addConstantViolation(path) {
    this.constantViolations.push(path);
  }
  removeConstantViolation(path) {
    const idx = this.constantViolations.findIndex((x) => x === path);
    if (idx > -1)
      this.constantViolations.splice(idx, 1);
  }
}

class Binding extends BaseBinding {
  constructor(data) {
    super();
    this.kind = data.kind;
    this.name = data.name;
    this.scope = data.scope;
    this.identifierPath = data.identifierPath;
    this.path = data.path;
  }
  get constant() {
    return this.constantViolations.length === 0;
  }
}

class GlobalBinding extends BaseBinding {
  constructor(data) {
    super();
    this.kind = "global";
    this.constant = false;
    this.name = data.name;
  }
}

// node_modules/estree-toolkit/dist-es/scope.mjs
var scopedNodeTypes = [
  "ArrowFunctionExpression",
  "BlockStatement",
  "CatchClause",
  "ClassDeclaration",
  "ClassExpression",
  "DoWhileStatement",
  "ForInStatement",
  "ForOfStatement",
  "ForStatement",
  "FunctionDeclaration",
  "FunctionExpression",
  "Program",
  "SwitchStatement",
  "WhileStatement"
];
var scopedNodesTypesSet = new Set(scopedNodeTypes);
var shouldBlockStatementMakeScope = (parent) => {
  if (parent != null && parent.type !== "BlockStatement" && parent.type !== "Program" && scopedNodesTypesSet.has(parent.type)) {
    return false;
  }
  return true;
};
var shouldMakeScope = (path) => {
  if (path.node == null)
    return false;
  if (path.node.type === "BlockStatement" && !shouldBlockStatementMakeScope(path.parent)) {
    return false;
  }
  return scopedNodesTypesSet.has(path.node.type);
};
var isIdentifierJSX = (name2) => !/^[a-z]/.test(name2);
var identifierCrawlers = {
  ArrowFunctionExpression(key, path, state) {
    switch (key) {
      case "body":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  AssignmentExpression(key, path, state) {
    switch (key) {
      case "left":
        throw new Error("This should be handled by `crawlerVisitor.AssignmentExpression`");
      case "right":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  AssignmentPattern(key, path, state) {
    switch (key) {
      case "left":
        throw new Error("`identifierCrawlers.AssignmentPattern` is not implemented");
      case "right":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  AwaitExpression(key, path, state) {
    switch (key) {
      case "argument":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  FunctionDeclaration(key) {
    switch (key) {
      case "id":
        break;
      default:
        assertNever(key);
    }
  },
  FunctionExpression(key) {
    switch (key) {
      case "id":
        throw new Error("This should be handled by `scopePathCrawlers.FunctionExpression`");
      default:
        assertNever(key);
    }
  },
  SwitchCase(key, path, state) {
    switch (key) {
      case "test":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  CatchClause(key) {
    switch (key) {
      case "param":
        throw new Error("This should be handled by `scopePathCrawlers.CatchClause`");
      default:
        assertNever(key);
    }
  },
  VariableDeclarator(key, path, state) {
    switch (key) {
      case "id":
        throw new Error("This should be handled by `scopePathCrawlers.VariableDeclarator`");
      case "init":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  ExpressionStatement(key, path, state) {
    switch (key) {
      case "expression":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  WithStatement(key, path, state) {
    switch (key) {
      case "object":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  ReturnStatement(key, path, state) {
    switch (key) {
      case "argument":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  LabeledStatement() {},
  BreakStatement(key, path, state) {
    switch (key) {
      case "label":
        state.labelReferences.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  ContinueStatement(key, path, state) {
    switch (key) {
      case "label":
        state.labelReferences.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  IfStatement(key, path, state) {
    switch (key) {
      case "test":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  SwitchStatement(key, path, state) {
    switch (key) {
      case "discriminant":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  ThrowStatement(key, path, state) {
    switch (key) {
      case "argument":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  WhileStatement(key, path, state) {
    switch (key) {
      case "test":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  DoWhileStatement(key, path, state) {
    switch (key) {
      case "test":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  ForStatement(key, path, state) {
    switch (key) {
      case "init":
      case "test":
      case "update":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  ForInStatement(key, path, state) {
    switch (key) {
      case "left":
        throw new Error("This should be handled by `scopePathCrawlers.ForInStatement`");
      case "right":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  ForOfStatement(key, path, state) {
    switch (key) {
      case "left":
        throw new Error("This should be handled by `scopePathCrawlers.ForOfStatement`");
      case "right":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  ClassDeclaration(key, path, state) {
    switch (key) {
      case "id":
        break;
      case "superClass":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  YieldExpression(key, path, state) {
    switch (key) {
      case "argument":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  UnaryExpression(key, path, state) {
    switch (key) {
      case "argument":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  UpdateExpression(key, path, state) {
    switch (key) {
      case "argument":
        state.constantViolations.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  BinaryExpression(key, path, state) {
    switch (key) {
      case "left":
      case "right":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  LogicalExpression(key, path, state) {
    switch (key) {
      case "left":
      case "right":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  MemberExpression(key, path, state) {
    switch (key) {
      case "object":
        state.references.push(path);
        break;
      case "property":
        if (path.parent.computed) {
          state.references.push(path);
        }
        break;
      default:
        assertNever(key);
    }
  },
  ConditionalExpression(key, path, state) {
    switch (key) {
      case "test":
      case "consequent":
      case "alternate":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  CallExpression(key, path, state) {
    switch (key) {
      case "callee":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  NewExpression(key, path, state) {
    switch (key) {
      case "callee":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  TaggedTemplateExpression(key, path, state) {
    switch (key) {
      case "tag":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  ClassExpression(key, path, state) {
    switch (key) {
      case "id":
        throw new Error("This should be handled by `scopePathCrawlers.ClassExpression`");
      case "superClass":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  MetaProperty(key) {
    switch (key) {
      case "meta":
      case "property":
        break;
      default:
        assertNever(key);
    }
  },
  ImportExpression(key, path, state) {
    switch (key) {
      case "source":
        state.references.push(path);
        break;
      case "options":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  Property(key, path, state) {
    switch (key) {
      case "key":
        if (path.parent.computed) {
          state.references.push(path);
        }
        break;
      case "value":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  SpreadElement(key, path, state) {
    switch (key) {
      case "argument":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  RestElement(key) {
    switch (key) {
      case "argument":
        throw new Error("This should be handled by `findVisiblePathsInPattern`");
      default:
        assertNever(key);
    }
  },
  MethodDefinition(key, path, state) {
    switch (key) {
      case "key":
        if (path.parent.computed) {
          state.references.push(path);
        }
        break;
      default:
        assertNever(key);
    }
  },
  ExportDefaultDeclaration(key, path, state) {
    switch (key) {
      case "declaration":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  ImportSpecifier(key, path, state) {
    switch (key) {
      case "imported":
        if (path.parent.local == null) {
          state.scope.registerBinding("module", path, path.parentPath);
        }
        if (path.parent.local === path.parent.imported) {
          const ctx = path.ctx;
          let parentPath = path.parentPath;
          const parentNode = parentPath.node;
          ctx.newQueue();
          parentPath = parentPath.replaceWith(Object.assign({}, parentNode, {
            local: Object.assign({}, parentNode.local),
            imported: Object.assign({}, parentNode.imported)
          }));
          ctx.popQueue();
          state.scope.registerBinding("module", parentPath.get("local"), parentPath);
        }
        break;
      case "local":
        state.scope.registerBinding("module", path, path.parentPath);
        break;
      default:
        assertNever(key);
    }
  },
  ImportDefaultSpecifier(key, path, state) {
    switch (key) {
      case "local":
        state.scope.registerBinding("module", path, path.parentPath);
        break;
      default:
        assertNever(key);
    }
  },
  ImportNamespaceSpecifier(key, path, state) {
    switch (key) {
      case "local":
        state.scope.registerBinding("module", path, path.parentPath);
        break;
      default:
        assertNever(key);
    }
  },
  ExportSpecifier(key, path, state) {
    switch (key) {
      case "local":
        if (path.parent.local === path.parent.exported) {
          const ctx = path.ctx;
          let parentPath = path.parentPath;
          const parentNode = parentPath.node;
          ctx.newQueue();
          parentPath = parentPath.replaceWith(Object.assign({}, parentNode, {
            local: Object.assign({}, parentNode.local),
            exported: Object.assign({}, parentNode.exported)
          }));
          ctx.popQueue();
          state.references.push(parentPath.get("local"));
        } else {
          state.references.push(path);
        }
        break;
      case "exported":
        break;
      default:
        assertNever(key);
    }
  },
  ExportAllDeclaration(key) {
    switch (key) {
      case "exported":
        break;
      default:
        assertNever(key);
    }
  },
  PropertyDefinition(key, path, state) {
    switch (key) {
      case "key":
        if (path.parent.computed) {
          state.references.push(path);
        }
        break;
      case "value":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  ImportAttribute(key) {
    switch (key) {
      case "key":
        break;
      default:
        assertNever(key);
    }
  },
  JSXExpressionContainer(key, path, state) {
    switch (key) {
      case "expression":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  JSXSpreadAttribute(key, path, state) {
    switch (key) {
      case "argument":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  },
  JSXSpreadChild(key, path, state) {
    switch (key) {
      case "expression":
        state.references.push(path);
        break;
      default:
        assertNever(key);
    }
  }
};
var jsxIdentifierCrawlers = {
  JSXNamespacedName(key, path, state) {
    switch (key) {
      case "namespace":
        if (isIdentifierJSX(path.node.name)) {
          state.references.push(path);
        }
        break;
      case "name":
        break;
      default:
        assertNever(key);
    }
  },
  JSXAttribute(key) {
    switch (key) {
      case "name":
        break;
      default:
        assertNever(key);
    }
  },
  JSXClosingElement(key, path, state) {
    switch (key) {
      case "name":
        if (isIdentifierJSX(path.node.name)) {
          state.references.push(path);
        }
        break;
      default:
        assertNever(key);
    }
  },
  JSXMemberExpression(key, path, state) {
    switch (key) {
      case "object":
        state.references.push(path);
        break;
      case "property":
        break;
      default:
        assertNever(key);
    }
  },
  JSXOpeningElement(key, path, state) {
    switch (key) {
      case "name":
        if (isIdentifierJSX(path.node.name)) {
          state.references.push(path);
        }
        break;
      default:
        assertNever(key);
    }
  }
};
var inListIdentifierCrawlers = {
  ArrayExpression(listKey, path, state) {
    switch (listKey) {
      case "elements":
        state.references.push(path);
        break;
      default:
        assertNever(listKey);
    }
  },
  CallExpression(listKey, path, state) {
    switch (listKey) {
      case "arguments":
        state.references.push(path);
        break;
      default:
        assertNever(listKey);
    }
  },
  NewExpression(listKey, path, state) {
    switch (listKey) {
      case "arguments":
        state.references.push(path);
        break;
      default:
        assertNever(listKey);
    }
  },
  SequenceExpression(listKey, path, state) {
    switch (listKey) {
      case "expressions":
        state.references.push(path);
        break;
      default:
        assertNever(listKey);
    }
  },
  TemplateLiteral(listKey, path, state) {
    switch (listKey) {
      case "expressions":
        state.references.push(path);
        break;
      default:
        assertNever(listKey);
    }
  },
  ArrayPattern(listKey) {
    switch (listKey) {
      case "elements":
        throw new Error("`inListIdentifierCrawler.ArrayPattern` is not implemented");
      default:
        assertNever(listKey);
    }
  },
  FunctionDeclaration(listKey) {
    switch (listKey) {
      case "params":
        throw new Error("This should be handled by `scopePathCrawlers.FunctionDeclaration`");
      default:
        assertNever(listKey);
    }
  },
  FunctionExpression(listKey) {
    switch (listKey) {
      case "params":
        throw new Error("This should be handled by `scopePathCrawlers.FunctionExpression`");
      default:
        assertNever(listKey);
    }
  },
  ArrowFunctionExpression(listKey) {
    switch (listKey) {
      case "params":
        throw new Error("This should be handled by `scopePathCrawlers.ArrowFunctionExpression`");
      default:
        assertNever(listKey);
    }
  }
};
var inListJSXIdentifierCrawlers = {};
var findVisiblePathsInPattern = (path, result) => {
  switch (path.node.type) {
    case "Identifier":
      result.push(path);
      path.skip();
      break;
    case "ObjectPattern": {
      const properties = path.get("properties");
      for (let i = 0;i < properties.length; i++) {
        const property = properties[i];
        const propertyNode = property.node;
        switch (propertyNode.type) {
          case "RestElement":
            findVisiblePathsInPattern(property, result);
            break;
          case "Property":
            if (propertyNode.value != null) {
              let propertyPath = property;
              if (propertyNode.value === propertyNode.key) {
                const ctx = path.ctx;
                ctx.newQueue();
                propertyPath = propertyPath.replaceWith(Object.assign({}, propertyNode, {
                  key: Object.assign({}, propertyNode.key),
                  value: Object.assign({}, propertyNode.value)
                }));
                ctx.popQueue();
              }
              findVisiblePathsInPattern(propertyPath.get("value"), result);
            } else if (!propertyNode.computed && propertyNode.key.type === "Identifier") {
              const keyPath = property.get("key");
              result.push(keyPath);
              keyPath.skip();
            }
            break;
        }
      }
      break;
    }
    case "ArrayPattern": {
      const aPath = path;
      const elementPaths = aPath.get("elements");
      const elements = aPath.node.elements;
      for (let i = 0;i < elementPaths.length; i++) {
        if (elements[i] == null)
          continue;
        findVisiblePathsInPattern(elementPaths[i], result);
      }
      break;
    }
    case "RestElement":
      findVisiblePathsInPattern(path.get("argument"), result);
      break;
    case "AssignmentPattern":
      findVisiblePathsInPattern(path.get("left"), result);
      break;
    case "MemberExpression":
      break;
    default:
      assertNever(path.node);
  }
};
var registerBindingFromPattern = (path, scope, kind, bindingPath) => {
  const identifierPaths = [];
  findVisiblePathsInPattern(path, identifierPaths);
  for (let i = 0;i < identifierPaths.length; i++) {
    scope.registerBinding(kind, identifierPaths[i], bindingPath);
  }
};
var registerConstantViolationFromPattern = (path, state) => {
  const identifierPaths = [];
  findVisiblePathsInPattern(path, identifierPaths);
  for (let i = 0;i < identifierPaths.length; i++) {
    state.constantViolations.push(identifierPaths[i]);
  }
};
var registerVariableDeclaration = (path, scope) => {
  const kind = path.node.kind;
  const declarators = path.get("declarations");
  for (let i = 0;i < declarators.length; i++) {
    const declarator = declarators[i];
    registerBindingFromPattern(declarator.get("id"), scope, kind, declarator);
  }
};
var crawlerVisitor = {
  Identifier: {
    enter(path, state) {
      var _a;
      const parentType = (_a = path.parentPath.node) === null || _a === undefined ? undefined : _a.type;
      if (path.listKey != null) {
        const crawler = inListIdentifierCrawlers[parentType];
        if (crawler != null) {
          crawler(path.listKey, path, state);
        }
      } else {
        const crawler = identifierCrawlers[parentType];
        if (crawler != null) {
          crawler(path.key, path, state);
        }
      }
    }
  },
  JSXIdentifier: {
    enter(path, state) {
      var _a;
      const parentType = (_a = path.parentPath.node) === null || _a === undefined ? undefined : _a.type;
      if (path.listKey != null) {
        const crawler = inListJSXIdentifierCrawlers[parentType];
        if (crawler != null) {
          crawler(path.listKey, path, state);
        }
      } else {
        const crawler = jsxIdentifierCrawlers[parentType];
        if (crawler != null) {
          crawler(path.key, path, state);
        }
      }
    }
  },
  AssignmentExpression: {
    enter(path, state) {
      registerConstantViolationFromPattern(path.get("left"), state);
    }
  },
  VariableDeclaration: {
    enter(path, state) {
      registerVariableDeclaration(path, state.scope);
    }
  }
};
{
  const cVisitors = crawlerVisitor;
  const skipToChildNodeVisitor = {
    enter(path, state) {
      state.childScopedPaths.push(path);
      path.skip();
    }
  };
  for (let i = 0;i < scopedNodeTypes.length; i++) {
    cVisitors[scopedNodeTypes[i]] = skipToChildNodeVisitor;
  }
  cVisitors.FunctionDeclaration = cVisitors.ClassDeclaration = {
    enter(path, state) {
      if (path.node.id != null) {
        const id = path.get("id");
        state.scope.registerBinding("hoisted", id, path);
        id.skip();
      }
      skipToChildNodeVisitor.enter.call({}, path, state);
    }
  };
  cVisitors.BlockStatement = {
    enter(path, state) {
      if (shouldBlockStatementMakeScope(path.parent)) {
        skipToChildNodeVisitor.enter.call({}, path, state);
      }
    }
  };
}
var registerFunctionParams = (paths, scope) => {
  for (let i = 0;i < paths.length; i++) {
    const path = paths[i];
    registerBindingFromPattern(path, scope, "param", path);
  }
};
var scopePathCrawlers = {
  Program: null,
  FunctionDeclaration(path, { scope }) {
    registerFunctionParams(path.get("params"), scope);
  },
  ClassDeclaration: null,
  FunctionExpression(path, { scope }) {
    if (path.node.id != null) {
      const id = path.get("id");
      scope.registerBinding("local", id, path);
      id.skip();
    }
    registerFunctionParams(path.get("params"), scope);
  },
  ClassExpression(path, { scope }) {
    if (path.node.id != null) {
      const id = path.get("id");
      scope.registerBinding("local", id, path);
      id.skip();
    }
  },
  ArrowFunctionExpression(path, { scope }) {
    registerFunctionParams(path.get("params"), scope);
  },
  CatchClause(path, { scope }) {
    if (path.has("param")) {
      registerBindingFromPattern(path.get("param"), scope, "let", path);
    }
  },
  BlockStatement(path, { scope }) {
    if (path.parent != null && path.parent.type === "LabeledStatement") {
      scope.registerLabel(path.parentPath.get("label"));
    }
  },
  SwitchStatement: null,
  WhileStatement: null,
  DoWhileStatement: null,
  ForStatement(path, state) {
    if (path.parent != null && path.parent.type === "LabeledStatement") {
      state.scope.registerLabel(path.parentPath.get("label"));
    }
    if (path.node.init != null && path.node.init.type === "VariableDeclaration") {
      registerVariableDeclaration(path.get("init"), state.scope);
    }
  },
  ForXStatement(path, state) {
    if (path.parent != null && path.parent.type === "LabeledStatement") {
      state.scope.registerLabel(path.parentPath.get("label"));
    }
    if (path.node.left.type === "VariableDeclaration") {
      registerVariableDeclaration(path.get("left"), state.scope);
    } else if (is.pattern(path.node.left)) {
      registerConstantViolationFromPattern(path.get("left"), state);
    }
  },
  ForInStatement(path, state) {
    scopePathCrawlers.ForXStatement(path, state);
  },
  ForOfStatement(path, state) {
    scopePathCrawlers.ForXStatement(path, state);
  }
};

class Scope {
  constructor(path, parentScope) {
    this.children = [];
    this.initialized = false;
    this.bindings = Object.create(null);
    this.globalBindings = Object.create(null);
    this.labels = Object.create(null);
    this.priv = {
      prevState: null,
      memoizedBindings: Object.create(null),
      memoizedLabels: Object.create(null),
      idMap: Object.create(null),
      declaration: null
    };
    this.path = path;
    this.parent = parentScope;
    if (this.parent != null)
      this.parent.children.push(this);
  }
  static for(path, parentScope) {
    if (shouldMakeScope(path)) {
      if (path.ctx.scopeCache.has(path)) {
        return path.ctx.scopeCache.get(path);
      }
      const scope = new Scope(path, parentScope);
      path.ctx.scopeCache.set(path, scope);
      return scope;
    }
    return parentScope;
  }
  init() {
    if (this.initialized)
      return;
    if (this.path.type !== "Program") {
      this.priv.idMap = this.getProgramScope().priv.idMap;
    }
    this.crawl();
  }
  getMemoBinding(bindingName) {
    const { memoizedBindings } = this.priv;
    return bindingName in memoizedBindings ? memoizedBindings[bindingName] : memoizedBindings[bindingName] = this.getBinding(bindingName);
  }
  getMemoLabel(labelName) {
    const { memoizedLabels } = this.priv;
    return labelName in memoizedLabels ? memoizedLabels[labelName] : memoizedLabels[labelName] = this.getLabel(labelName);
  }
  clearMemo() {
    this.priv.memoizedBindings = Object.create(null);
    this.priv.memoizedLabels = Object.create(null);
  }
  getProgramScope() {
    if (this.path.type === "Program") {
      return this;
    } else {
      return this.path.findParent((p) => p.type === "Program").scope;
    }
  }
  crawl() {
    var _a, _b;
    if (this.path.node == null)
      return;
    if (this.path.removed) {
      throw Error("This scope is no longer part of the AST, the containing path has been removed");
    }
    Scope.rollbackState(this);
    this.bindings = Object.create(null);
    this.globalBindings = this.path.type === "Program" ? Object.create(null) : this.getProgramScope().globalBindings;
    this.labels = Object.create(null);
    const state = {
      references: [],
      constantViolations: [],
      labelReferences: [],
      scope: this,
      childScopedPaths: []
    };
    this.path.ctx.makeScope = false;
    this.path.ctx.newSkipPathStack();
    {
      const scopePathCrawler = scopePathCrawlers[this.path.node.type];
      if (scopePathCrawler != null) {
        scopePathCrawler(this.path, state);
      }
    }
    Traverser.traverseNode({
      node: this.path.node,
      parentPath: this.path.parentPath,
      ctx: this.path.ctx,
      state,
      visitors: crawlerVisitor,
      expand: false,
      visitOnlyChildren: true
    });
    this.path.ctx.makeScope = true;
    this.path.ctx.restorePrevSkipPathStack();
    this.clearMemo();
    {
      for (let i = 0;i < state.references.length; i++) {
        const path = state.references[i];
        const bindingName = path.node.name;
        const binding = this.getMemoBinding(bindingName);
        if (binding != null) {
          binding.addReference(path);
        } else {
          ((_a = this.globalBindings)[bindingName] || (_a[bindingName] = new GlobalBinding({ name: bindingName }))).addReference(path);
        }
      }
      for (let i = 0;i < state.constantViolations.length; i++) {
        const path = state.constantViolations[i];
        const bindingName = path.node.name;
        const binding = this.getMemoBinding(bindingName);
        if (binding != null) {
          binding.addConstantViolation(path);
        } else {
          ((_b = this.globalBindings)[bindingName] || (_b[bindingName] = new GlobalBinding({ name: bindingName }))).addConstantViolation(path);
        }
      }
      for (let i = 0;i < state.labelReferences.length; i++) {
        const path = state.labelReferences[i];
        const labelName = path.node.name;
        const label = this.getMemoLabel(labelName);
        if (label != null) {
          label.references.push(path);
        }
      }
    }
    this.initialized = true;
    this.priv.prevState = {
      references: state.references,
      constantViolations: state.constantViolations,
      labelReferences: state.labelReferences
    };
    this.clearMemo();
    for (let i = 0;i < state.childScopedPaths.length; i++) {
      state.childScopedPaths[i].init(this);
    }
  }
  static rollbackState(scope) {
    const { prevState: state } = scope.priv;
    if (state == null)
      return;
    scope.clearMemo();
    for (let i = 0;i < state.references.length; i++) {
      const path = state.references[i];
      const bindingName = path.node.name;
      const binding = scope.getMemoBinding(bindingName);
      if (binding != null) {
        binding.removeReference(path);
      } else {
        const globalBinding = scope.globalBindings[bindingName];
        if (globalBinding != null) {
          globalBinding.removeReference(path);
        }
      }
    }
    for (let i = 0;i < state.constantViolations.length; i++) {
      const path = state.constantViolations[i];
      const bindingName = path.node.name;
      const binding = scope.getMemoBinding(bindingName);
      if (binding != null) {
        binding.removeConstantViolation(path);
      } else {
        const globalBinding = scope.globalBindings[bindingName];
        if (globalBinding != null) {
          globalBinding.removeConstantViolation(path);
        }
      }
    }
    for (let i = 0;i < state.labelReferences.length; i++) {
      const path = state.labelReferences[i];
      const labelName = path.node.name;
      const label = scope.getMemoLabel(labelName);
      if (label != null) {
        const idx = label.references.findIndex((x) => x === path);
        if (idx > -1)
          label.references.splice(idx, 1);
      }
    }
    const globalNames = Object.keys(scope.globalBindings);
    for (let i = 0;i < globalNames.length; i++) {
      const name2 = globalNames[i];
      const global = scope.globalBindings[name2];
      if (global.references.length === 0 && global.constantViolations.length === 0) {
        scope.globalBindings[name2] = undefined;
        delete scope.globalBindings[name2];
      }
    }
  }
  static recursiveRollback(scope) {
    for (let i = 0;i < scope.children.length; i++) {
      Scope.recursiveRollback(scope.children[i]);
    }
    Scope.rollbackState(scope);
  }
  static handleRemoval(scope, path) {
    if (path === scope.path) {
      Scope.recursiveRollback(scope);
      if (scope.parent != null) {
        const { children } = scope.parent;
        const idx = children.indexOf(scope);
        if (idx > -1)
          children.splice(idx, 1);
      }
    } else {
      for (let i = 0;i < scope.children.length; i++) {
        const child = scope.children[i];
        if (child.path.isDescendantOf(path)) {
          Scope.recursiveRollback(child);
          const idx = scope.children.indexOf(child);
          if (idx > -1)
            scope.children.splice(idx, 1);
        }
      }
    }
  }
  registerBinding(kind, identifierPath, bindingPath) {
    const bindingName = identifierPath.node.name;
    const binding = this.getOwnBinding(bindingName);
    if (binding != null) {
      binding.addConstantViolation(identifierPath);
      return;
    }
    this.bindings[bindingName] = new Binding({
      kind,
      name: bindingName,
      scope: this,
      identifierPath,
      path: bindingPath
    });
  }
  hasOwnBinding(name2) {
    return name2 in this.bindings;
  }
  getOwnBinding(name2) {
    return this.bindings[name2];
  }
  hasBinding(name2) {
    return this.getBinding(name2) != null;
  }
  getBinding(name2) {
    let scope = this;
    while (scope != null) {
      if (scope.hasOwnBinding(name2)) {
        return scope.getOwnBinding(name2);
      }
      scope = scope.parent;
    }
  }
  getAllBindings(...kind) {
    const result = Object.create(null);
    const kindLength = kind.length;
    const kindSet = new Set(kind);
    let scope = this;
    while (scope != null) {
      for (const name2 in scope.bindings) {
        if (!(name2 in result)) {
          if (kindLength === 0 || kindLength && kindSet.has(scope.bindings[name2].kind)) {
            result[name2] = scope.bindings[name2];
          }
        }
      }
      scope = scope.parent;
    }
    return result;
  }
  hasGlobalBinding(name2) {
    return this.getGlobalBinding(name2) != null;
  }
  getGlobalBinding(name2) {
    return this.getProgramScope().globalBindings[name2];
  }
  registerLabel(path) {
    const labelName = path.node.name;
    if (this.hasLabel(labelName)) {
      return;
    }
    this.labels[labelName] = {
      path,
      references: []
    };
  }
  hasLabel(name2) {
    return this.getLabel(name2) != null;
  }
  getLabel(name2) {
    let scope = this;
    while (scope != null) {
      if (scope.labels[name2] != null) {
        return scope.labels[name2];
      }
      scope = scope.parent;
    }
  }
  generateUid(name2 = "_tmp") {
    var _a;
    const allIDs = Object.keys(this.getAllBindings()).concat(Object.keys(this.globalBindings)).concat(Object.keys(this.priv.idMap));
    (_a = this.priv.idMap)[name2] || (_a[name2] = 1);
    let fName = name2 = name2.replace(/[^a-zA-Z_]+/g, "");
    while (allIDs.includes(fName)) {
      fName = name2 + ++this.priv.idMap[name2];
    }
    return fName;
  }
  generateUidIdentifier(name2) {
    return builders.identifier(this.generateUid(name2));
  }
  generateDeclaredUidIdentifier(name2) {
    let declaratorPath;
    const { ctx } = this.path;
    ctx.newSkipPathStack();
    ctx.newQueue();
    if (this.priv.declaration == null) {
      let block = null;
      switch (this.path.type) {
        case "ArrowFunctionExpression":
          {
            const path = this.path;
            const body = path.get("body");
            if (body.type === "BlockStatement") {
              block = body;
            } else {
              const bodyNode = Object.assign({}, body.node);
              block = body.replaceWith(builders.blockStatement([builders.returnStatement(bodyNode)]));
            }
          }
          break;
        case "Program":
        case "BlockStatement":
          block = this.path;
          break;
        case "SwitchStatement":
        case "ClassDeclaration":
        case "ClassExpression":
          ctx.restorePrevSkipPathStack();
          ctx.popQueue();
          return this.parent.generateDeclaredUidIdentifier(name2);
        case "DoWhileStatement":
        case "ForInStatement":
        case "ForOfStatement":
        case "ForStatement":
        case "WhileStatement":
          {
            const path = this.path;
            const body = path.get("body");
            if (body.type === "BlockStatement") {
              block = body;
            } else {
              const bodyNode = Object.assign({}, body.node);
              block = body.replaceWith(builders.blockStatement([bodyNode]));
            }
          }
          break;
        case "CatchClause":
        case "FunctionDeclaration":
        case "FunctionExpression":
          block = this.path.get("body");
          break;
        case null:
          break;
        default:
          assertNever(this.path.type);
      }
      const declarationNode = builders.variableDeclaration("var", [builders.variableDeclarator(this.generateUidIdentifier(name2))]);
      const [declarationPath] = block.unshiftContainer("body", [declarationNode]);
      this.priv.declaration = declarationPath;
      declaratorPath = declarationPath.get("declarations")[0];
    } else {
      [declaratorPath] = this.priv.declaration.pushContainer("declarations", [builders.variableDeclarator(this.generateUidIdentifier(name2))]);
    }
    const identifier = declaratorPath.get("id");
    this.registerBinding("var", identifier, declaratorPath);
    ctx.restorePrevSkipPathStack();
    ctx.popQueue();
    return Object.assign({}, identifier.node);
  }
  renameConsideringParent(path, newName) {
    var _a, _b;
    const parent = path.parent;
    if (parent.type === "Property" && ((_b = (_a = path.parentPath) === null || _a === undefined ? undefined : _a.parent) === null || _b === undefined ? undefined : _b.type) === "ObjectPattern") {
      parent.value.name = newName;
      parent.shorthand = parent.value.name === parent.key.name;
    } else {
      path.node.name = newName;
    }
  }
  renameBinding(oldName, newName) {
    var _a;
    if (this.bindings[oldName] != null) {
      const binding = this.bindings[oldName];
      this.renameConsideringParent(binding.identifierPath, newName);
      for (let i = 0;i < binding.references.length; i++) {
        binding.references[i].node.name = newName;
      }
      for (let i = 0;i < binding.constantViolations.length; i++) {
        this.renameConsideringParent(binding.constantViolations[i], newName);
      }
      this.bindings[oldName] = undefined;
      delete this.bindings[oldName];
      this.bindings[newName] = binding;
    } else {
      (_a = this.parent) === null || _a === undefined || _a.renameBinding(oldName, newName);
    }
  }
}

// node_modules/estree-toolkit/dist-es/nodepath.mjs
var mapSet = (map, key, value2) => {
  map.set(key, value2);
  return value2;
};

class Context {
  constructor(options) {
    this.pathCache = new Map;
    this.scopeCache = new Map;
    this.makeScope = false;
    this.shouldValidateNodes = getNodeValidationEnabled();
    this.cloneFunction = (node2) => structuredClone(node2);
    this.currentSkipPaths = new Set;
    this.skipPathSetStack = [this.currentSkipPaths];
    this.queueStack = [];
    this.makeScope = (options === null || options === undefined ? undefined : options.scope) === true;
    if ((options === null || options === undefined ? undefined : options.validateNodes) != null) {
      this.shouldValidateNodes = options.validateNodes;
    }
    if (typeof (options === null || options === undefined ? undefined : options.cloneFunction) === "function") {
      this.cloneFunction = options.cloneFunction;
    }
  }
  setSkipped(path) {
    this.currentSkipPaths.add(path);
  }
  setNotSkipped(path) {
    this.currentSkipPaths.delete(path);
  }
  shouldSkip(path) {
    return this.currentSkipPaths.has(path);
  }
  updateCurrentSkipPaths() {
    this.currentSkipPaths = this.skipPathSetStack[this.skipPathSetStack.length - 1];
  }
  newSkipPathStack() {
    this.skipPathSetStack.push(new Set);
    this.updateCurrentSkipPaths();
  }
  restorePrevSkipPathStack() {
    this.skipPathSetStack.pop();
    this.updateCurrentSkipPaths();
  }
  pushToQueue(paths, stackName) {
    const last = this.queueStack[this.queueStack.length - 1];
    if (last != null)
      last[stackName].push(...paths);
  }
  newQueue() {
    this.queueStack.push({
      new: [],
      unSkipped: []
    });
  }
  popQueue() {
    return this.queueStack.pop();
  }
}
var runInsertionValidation = (node2, key, listKey, parent) => {
  if (!getNodeValidationEnabled())
    return;
  const definition = definitions[node2.type];
  if (definition != null && definition.insertionValidate != null) {
    const errorMsg = definition.insertionValidate(node2, key, listKey, parent);
    if (errorMsg != null) {
      throw new Error(errorMsg);
    }
  }
};

class NodePath {
  constructor(data) {
    this.node = data.node;
    this.type = this.node && this.node.type;
    this.key = data.key;
    this.listKey = data.listKey;
    this.parentPath = data.parentPath;
    this.parent = this.parentPath && this.parentPath.node;
    this.container = this.listKey ? this.parent[this.listKey] : this.parent;
    this.removed = false;
    this.ctx = data.ctx;
    this.scope = undefined;
  }
  static for(data) {
    if (data.node == null) {
      return new this(data);
    }
    const { ctx: { pathCache }, parentPath } = data;
    const children = pathCache.get(parentPath) || mapSet(pathCache, parentPath, new Map);
    return children.get(data.node) || mapSet(children, data.node, new NodePath(data));
  }
  init(parentScope) {
    var _a;
    if (this.ctx.makeScope) {
      this.scope = Scope.for(this, parentScope || ((_a = this.parentPath) === null || _a === undefined ? undefined : _a.scope) || null);
      if (this.scope != null)
        this.scope.init();
    }
    return this;
  }
  throwNoParent(methodName) {
    throw new Error(`Can not use \`${methodName}\` on a NodePath which does not have a parent`);
  }
  assertNotRemoved() {
    if (this.removed) {
      throw new Error("Path is removed and it is now read-only");
    }
  }
  assertNotNull(methodName) {
    if (this.node == null) {
      throw new Error(`Can not use method \`${methodName}\` on a null NodePath`);
    }
  }
  get parentKey() {
    return this.listKey != null ? this.listKey : this.key;
  }
  cloneNode() {
    return this.ctx.cloneFunction(this.node);
  }
  skip() {
    this.ctx.setSkipped(this);
  }
  skipChildren() {
    this.assertNotNull("skipChildren");
    const node2 = this.node;
    const keys = visitorKeys[this.type] || Object.keys(node2);
    for (let i = 0;i < keys.length; i++) {
      const key = keys[i];
      const value2 = node2[key];
      if (value2 == null)
        continue;
      if (Array.isArray(value2)) {
        this.get(key).forEach((p) => p.skip());
      } else if (typeof value2.type === "string") {
        this.get(key).skip();
      }
    }
  }
  unSkip() {
    this.assertNotRemoved();
    this.ctx.setNotSkipped(this);
    this.ctx.pushToQueue([this], "unSkipped");
  }
  unskip() {
    this.unSkip();
  }
  unSkipChildren() {
    var _a;
    this.assertNotRemoved();
    this.assertNotNull("unSkipChildren");
    (_a = this.ctx.pathCache.get(this)) === null || _a === undefined || _a.forEach((p) => p.unSkip());
  }
  unskipChildren() {
    this.unSkipChildren();
  }
  traverse(visitors, state) {
    this.assertNotNull("traverse");
    Traverser.traverseNode({
      node: this.node,
      parentPath: this.parentPath,
      visitors,
      state,
      ctx: this.ctx,
      expand: true
    });
  }
  findParent(predicate) {
    let parent = this.parentPath;
    while (parent != null) {
      if (predicate(parent))
        return parent;
      parent = parent.parentPath;
    }
    return null;
  }
  find(predicate) {
    let nodePath = this;
    while (nodePath != null) {
      if (predicate(nodePath))
        return nodePath;
      nodePath = nodePath.parentPath;
    }
    return null;
  }
  getFunctionParent() {
    return this.findParent((p) => is.function(p));
  }
  getAncestry() {
    const ancestors = [];
    let ancestor = this;
    while (ancestor != null) {
      ancestors.push(ancestor);
      ancestor = ancestor.parentPath;
    }
    return ancestors;
  }
  isAncestorOf(path) {
    return path.isDescendantOf(this);
  }
  isDescendantOf(path) {
    return this.findParent((p) => p === path) != null;
  }
  updateSiblingIndex(fromIndex, incrementBy) {
    var _a;
    if (this.container.length === 0)
      return;
    (_a = this.ctx.pathCache.get(this.parentPath)) === null || _a === undefined || _a.forEach((path) => {
      if (path.key >= fromIndex) {
        path.key += incrementBy;
      }
    });
  }
  insertBefore(nodes) {
    this.assertNotRemoved();
    if (!Array.isArray(this.container)) {
      throw new Error("Can not insert before a node where `container` is not an Array");
    }
    const key = this.key;
    for (let i = 0;i < nodes.length; i++) {
      runInsertionValidation(nodes[i], key + i, this.listKey, this.parent);
    }
    this.container.splice(key, 0, ...nodes);
    this.updateSiblingIndex(key, nodes.length);
    const newPaths = nodes.map((node2, idx) => NodePath.for({
      node: node2,
      key: key + idx,
      listKey: this.listKey,
      parentPath: this.parentPath,
      ctx: this.ctx
    }).init());
    this.ctx.pushToQueue(newPaths, "new");
    return newPaths;
  }
  insertAfter(nodes) {
    this.assertNotRemoved();
    if (!Array.isArray(this.container)) {
      throw new Error("Can not insert after a node where `container` is not an Array");
    }
    const key = this.key;
    for (let i = 0;i < nodes.length; i++) {
      runInsertionValidation(nodes[i], key + i + 1, this.listKey, this.parent);
    }
    this.container.splice(key + 1, 0, ...nodes);
    this.updateSiblingIndex(key + 1, nodes.length);
    const newPaths = nodes.map((node2, idx) => NodePath.for({
      node: node2,
      key: key + idx + 1,
      listKey: this.listKey,
      parentPath: this.parentPath,
      ctx: this.ctx
    }).init());
    this.ctx.pushToQueue(newPaths, "new");
    return newPaths;
  }
  unshiftContainer(listKey, nodes) {
    this.assertNotRemoved();
    const firstNode = this.node[listKey][0];
    const lastNodePath = NodePath.for({
      node: firstNode,
      key: 0,
      listKey,
      parentPath: this,
      ctx: this.ctx
    });
    const newPaths = lastNodePath.insertBefore(nodes);
    return newPaths;
  }
  pushContainer(listKey, nodes) {
    this.assertNotRemoved();
    const container = this.node[listKey];
    const lastNode = container[container.length - 1];
    const lastNodePath = NodePath.for({
      node: lastNode,
      key: container.length - 1,
      listKey,
      parentPath: this,
      ctx: this.ctx
    });
    const newPaths = lastNodePath.insertAfter(nodes);
    return newPaths;
  }
  get(key) {
    if (this.node == null) {
      throw new Error("Can not use method `get` on a null NodePath");
    }
    const value2 = this.node[key];
    if (Array.isArray(value2)) {
      return value2.map((node2, index) => NodePath.for({
        node: node2,
        key: index,
        listKey: key,
        parentPath: this,
        ctx: this.ctx
      }).init());
    } else if (value2 != null && typeof value2.type == "string") {
      return NodePath.for({
        node: value2,
        key,
        listKey: null,
        parentPath: this,
        ctx: this.ctx
      }).init();
    }
    return NodePath.for({
      node: null,
      key,
      listKey: null,
      parentPath: this,
      ctx: this.ctx
    }).init();
  }
  getSibling(key) {
    if (this.parentPath == null) {
      this.throwNoParent("getSibling");
    }
    if (typeof key === "string") {
      return this.parentPath.get(key);
    } else if (this.listKey != null) {
      return this.parentPath.get(this.listKey)[key];
    }
  }
  getOpposite() {
    switch (this.key) {
      case "left":
        return this.getSibling("right");
      case "right":
        return this.getSibling("left");
    }
  }
  getPrevSibling() {
    return this.getSibling(this.key - 1);
  }
  getNextSibling() {
    return this.getSibling(this.key + 1);
  }
  getAllPrevSiblings() {
    if (this.parentPath == null) {
      this.throwNoParent("getAllPrevSiblings");
    }
    return this.parentPath.get(this.listKey).slice(0, this.key).reverse();
  }
  getAllNextSiblings() {
    if (this.parentPath == null) {
      this.throwNoParent("getAllNextSiblings");
    }
    return this.parentPath.get(this.listKey).slice(this.key + 1);
  }
  has(key) {
    var _a;
    const value2 = (_a = this.node) === null || _a === undefined ? undefined : _a[key];
    if (value2 != null && Array.isArray(value2) && value2.length === 0) {
      return false;
    }
    return !!value2;
  }
  is(key) {
    var _a;
    return !!((_a = this.node) === null || _a === undefined ? undefined : _a[key]);
  }
  onRemove() {
    const { parent, key, listKey } = this;
    const parentT = parent.type;
    const parentPath = this.parentPath;
    this.ctx.newSkipPathStack();
    switch (true) {
      case (parentT === "ExpressionStatement" && key === "expression"):
      case (is.exportDeclaration(parent) && key === "declaration"):
      case ((parentT === "WhileStatement" || parentT === "SwitchCase") && key === "test"):
      case (parentT === "LabeledStatement" && key === "body"):
      case (parentT === "VariableDeclaration" && listKey === "declarations" && parent.declarations.length === 1):
        parentPath.remove();
        return true;
      case parentT === "BinaryExpression":
        parentPath.replaceWith(parent[key === "right" ? "left" : "right"]);
        return true;
      case (parentT === "IfStatement" && key === "consequent"):
      case ((parentT === "ArrowFunctionExpression" || is.loop(parent)) && key === "body"):
        if (parentT === "ArrowFunctionExpression") {
          parent.expression = false;
        }
        this.replaceWith({
          type: "BlockStatement",
          body: []
        });
        return true;
    }
    this.ctx.restorePrevSkipPathStack();
    if (this.scope != null)
      Scope.handleRemoval(this.scope, this);
    return false;
  }
  markRemoved() {
    var _a;
    (_a = this.ctx.pathCache.get(this.parentPath)) === null || _a === undefined || _a.delete(this.node);
    this.removed = true;
  }
  remove() {
    if (this.removed) {
      throw new Error("Node is already removed");
    }
    if (this.container == null) {
      this.throwNoParent("remove");
    }
    if (this.onRemove()) {
      return this.markRemoved();
    }
    if (this.listKey != null) {
      const key = this.key;
      const container = this.container;
      container.splice(key, 1);
      this.markRemoved();
      this.updateSiblingIndex(key + 1, -1);
    } else if (this.key != null) {
      this.container[this.key] = null;
      this.markRemoved();
    }
  }
  replaceWith(node2) {
    if (this.container == null) {
      this.throwNoParent("replaceWith");
    }
    if (this.removed) {
      throw new Error("Node is already removed");
    }
    runInsertionValidation(node2, this.key, this.listKey, this.parent);
    this.container[this.key] = node2;
    this.markRemoved();
    const newPath = NodePath.for({
      node: node2,
      key: this.key,
      listKey: this.listKey,
      parentPath: this.parentPath,
      ctx: this.ctx
    }).init();
    this.ctx.pushToQueue([newPath], "new");
    return newPath;
  }
  replaceWithMultiple(nodes) {
    if (this.container == null) {
      this.throwNoParent("replaceWith");
    }
    if (this.removed) {
      throw new Error("Node is already removed");
    }
    const newPath = this.replaceWith(nodes[0]);
    return [newPath].concat(newPath.insertAfter(nodes.slice(1)));
  }
}

// node_modules/estree-toolkit/dist-es/traverse.mjs
class Traverser {
  constructor(visitors) {
    this.visitors = visitors;
  }
  visitPath(visitorCtx, path, state, visitedPaths, visitOnlyChildren = false) {
    const { node: node2, ctx } = path;
    if (visitedPaths.has(path) || path.removed || node2 == null) {
      return;
    }
    const nodeType = node2.type;
    const visitor = this.visitors[nodeType] || {};
    ctx.newQueue();
    const cleanup = () => ctx.popQueue();
    if (!visitOnlyChildren) {
      path.init();
      if (ctx.shouldSkip(path))
        return cleanup();
      if (visitor.enter != null) {
        visitor.enter.call(visitorCtx, path, state);
        if (ctx.shouldSkip(path) || visitorCtx.stopped)
          return cleanup();
      }
    }
    const keys = visitorKeys[nodeType] || Object.keys(node2);
    for (let i = 0;i < keys.length; i++) {
      const key = keys[i];
      const value2 = node2[key];
      if (value2 == null)
        continue;
      if (Array.isArray(value2)) {
        const childNodePaths = value2.map((childNode, index) => NodePath.for({
          node: childNode,
          key: index,
          listKey: key,
          parentPath: path,
          ctx
        }).init());
        for (let i2 = 0;i2 < childNodePaths.length; i2++) {
          this.visitPath(visitorCtx, childNodePaths[i2], state, visitedPaths);
          if (visitorCtx.stopped)
            return cleanup();
        }
      } else if (typeof value2.type === "string") {
        this.visitPath(visitorCtx, NodePath.for({
          node: value2,
          key,
          listKey: null,
          parentPath: path,
          ctx
        }).init(), state, visitedPaths);
        if (visitorCtx.stopped)
          return cleanup();
      }
    }
    if (!visitOnlyChildren && visitor.leave != null) {
      visitor.leave.call(visitorCtx, path, state);
      if (visitorCtx.stopped)
        return cleanup();
    }
    visitedPaths.add(path);
    const { new: newPaths, unSkipped: unSkippedPaths } = cleanup();
    for (let i = 0;i < newPaths.length; i++) {
      if (visitorCtx.stopped)
        break;
      this.visitPath(visitorCtx, newPaths[i], state, visitedPaths);
    }
    for (let i = 0;i < unSkippedPaths.length; i++) {
      if (visitorCtx.stopped)
        break;
      this.visitPath(visitorCtx, unSkippedPaths[i], state, visitedPaths);
    }
  }
  static expandVisitors(visitors) {
    const expandedVisitors = Object.create(null);
    const expand = (obj) => {
      Object.keys(obj).forEach((keyName) => {
        const keys = [].concat(...keyName.split("|").map((key) => (key in aliases) ? Object.keys(aliases[key]) : [key]));
        const visitor = obj[keyName];
        if (typeof visitor == "function") {
          keys.forEach((key) => {
            expandedVisitors[key] = { enter: visitor };
          });
        } else if (typeof visitor == "object") {
          keys.forEach((key) => {
            expandedVisitors[key] = {
              enter: visitor.enter,
              leave: visitor.leave
            };
          });
        }
      });
    };
    if (visitors.comp != null)
      expand(visitors.comp);
    expand(visitors);
    return expandedVisitors;
  }
  static traverseNode(data) {
    const visitorCtx = {
      stopped: false,
      stop() {
        this.stopped = true;
      }
    };
    const prevNodeValidationEnabled = getNodeValidationEnabled();
    setNodeValidationEnabled(data.ctx.shouldValidateNodes);
    new Traverser(data.expand ? this.expandVisitors(data.visitors) : data.visitors).visitPath(visitorCtx, NodePath.for({
      node: data.node,
      key: null,
      listKey: null,
      parentPath: data.parentPath,
      ctx: data.ctx
    }), data.state, new WeakSet, data.visitOnlyChildren);
    setNodeValidationEnabled(prevNodeValidationEnabled);
  }
}
var traverse = (node2, visitors, state) => {
  const ctx = new Context(visitors.$);
  if (node2.type !== "Program") {
    ctx.makeScope = false;
  }
  Traverser.traverseNode({
    node: node2,
    parentPath: null,
    visitors,
    state,
    ctx,
    expand: true
  });
};
// node_modules/estree-toolkit/dist-es/utils/hasBinding.mjs
var hasBinding = (() => {
  const findInPattern = (node2, bindingName) => {
    switch (node2.type) {
      case "Identifier":
        return node2.name === bindingName;
      case "ObjectPattern": {
        const { properties } = node2;
        for (let i = 0;i < properties.length; i++) {
          const property = properties[i];
          if (property.type === "RestElement") {
            if (findInPattern(property.argument, bindingName))
              return true;
          } else {
            if (property.value != null) {
              if (findInPattern(property.value, bindingName))
                return true;
            } else {
              if (!property.computed && property.key.type === "Identifier" && property.key.name === bindingName) {
                return true;
              }
            }
          }
        }
        break;
      }
      case "ArrayPattern": {
        const { elements } = node2;
        for (let i = 0;i < elements.length; i++) {
          const element = elements[i];
          if (element == null)
            continue;
          if (findInPattern(element, bindingName))
            return true;
        }
        break;
      }
      case "RestElement":
        return findInPattern(node2.argument, bindingName);
      case "AssignmentPattern":
        return findInPattern(node2.left, bindingName);
    }
    return false;
  };
  const findInVariableDeclaration = (node2, bindingName) => {
    const { declarations } = node2;
    for (let i = 0;i < declarations.length; i++) {
      if (findInPattern(declarations[i].id, bindingName))
        return true;
    }
    return false;
  };
  const findInImportDeclaration = (node2, bindingName) => {
    for (let i = 0;i < node2.specifiers.length; i++) {
      const specifier = node2.specifiers[i];
      switch (specifier.type) {
        case "ImportDefaultSpecifier":
        case "ImportNamespaceSpecifier":
          if (specifier.local.name === bindingName)
            return true;
          break;
        case "ImportSpecifier":
          if (specifier.local != null) {
            if (specifier.local.name === bindingName)
              return true;
          } else {
            if (specifier.imported.type === "Identifier" && specifier.imported.name === bindingName)
              return true;
          }
          break;
      }
    }
    return false;
  };
  const findInStatements = (statements, bindingName) => {
    var _a;
    for (let i = 0;i < statements.length; i++) {
      const statement = statements[i];
      switch (statement.type) {
        case "ImportDeclaration": {
          if (findInImportDeclaration(statement, bindingName)) {
            return true;
          }
          break;
        }
        case "VariableDeclaration": {
          if (findInVariableDeclaration(statement, bindingName)) {
            return true;
          }
          break;
        }
        case "FunctionDeclaration":
        case "ClassDeclaration": {
          if (((_a = statement.id) === null || _a === undefined ? undefined : _a.name) === bindingName)
            return true;
          break;
        }
      }
    }
    return false;
  };
  const parentTypes = [
    "BlockStatement",
    "CatchClause",
    "ForStatement",
    "ForInStatement",
    "ForOfStatement",
    "FunctionDeclaration",
    "FunctionExpression",
    "ArrowFunctionExpression",
    "ClassDeclaration",
    "ClassExpression",
    "Program"
  ];
  const findInParent = (path, bindingName) => {
    var _a, _b;
    const parent = path.findParent((p) => parentTypes.includes(p.type));
    if (parent != null && parent.node != null) {
      const { node: node2 } = parent;
      switch (node2.type) {
        case "BlockStatement": {
          if (findInStatements(node2.body, bindingName)) {
            return true;
          }
          break;
        }
        case "CatchClause": {
          if (node2.param != null && findInPattern(node2.param, bindingName)) {
            return true;
          }
          break;
        }
        case "ForStatement": {
          if (node2.init != null && node2.init.type === "VariableDeclaration") {
            if (findInVariableDeclaration(node2.init, bindingName)) {
              return true;
            }
          }
          break;
        }
        case "ForInStatement":
        case "ForOfStatement": {
          if (node2.left.type === "VariableDeclaration") {
            if (findInVariableDeclaration(node2.left, bindingName)) {
              return true;
            }
          }
          break;
        }
        case "FunctionDeclaration":
        case "FunctionExpression":
        case "ArrowFunctionExpression": {
          if (node2.type !== "ArrowFunctionExpression" && ((_a = node2.id) === null || _a === undefined ? undefined : _a.name) === bindingName)
            return true;
          for (let i = 0;i < node2.params.length; i++) {
            if (findInPattern(node2.params[i], bindingName)) {
              return true;
            }
          }
          break;
        }
        case "ClassExpression":
        case "ClassDeclaration": {
          if (((_b = node2.id) === null || _b === undefined ? undefined : _b.name) === bindingName)
            return true;
          break;
        }
        case "Program": {
          if (findInStatements(node2.body, bindingName)) {
            return true;
          }
          break;
        }
      }
      return findInParent(parent, bindingName);
    }
    return false;
  };
  return (path, bindingName) => {
    return findInParent(path, bindingName);
  };
})();
// pkg/optimizer/optimizer.ts
function createInlinerContext() {
  return { constants: new Map };
}
function resolveToString(node2, ctx) {
  if (!node2)
    return null;
  if (node2.type === "StringLiteral" || node2.type === "Literal") {
    return node2.value ?? node2.raw;
  }
  if (node2.type === "Identifier") {
    return ctx.constants.get(node2.name) ?? null;
  }
  if (node2.type === "BinaryExpression" && node2.operator === "+") {
    const left = resolveToString(node2.left, ctx);
    const right = resolveToString(node2.right, ctx);
    if (left !== null && right !== null) {
      return left + right;
    }
  }
  if (node2.type === "TemplateLiteral") {
    if (node2.expressions && node2.expressions.length > 0) {
      let result = "";
      for (let i = 0;i < node2.quasis.length; i++) {
        const quasi = node2.quasis[i];
        result += quasi.value.cooked ?? quasi.value.raw ?? "";
        if (i < node2.expressions.length) {
          const exprValue = resolveToString(node2.expressions[i], ctx);
          if (exprValue === null)
            return null;
          result += exprValue;
        }
      }
      return result;
    } else {
      return node2.quasis[0]?.value?.cooked ?? node2.quasis[0]?.value?.raw ?? null;
    }
  }
  return null;
}
function trackDeclaration(node2, ctx) {
  if (node2.type === "VariableDeclaration" || node2.type === "VariableDeclarator") {
    for (const decl of node2.declarations || [node2]) {
      if (decl.id?.type === "Identifier" && decl.init) {
        const value2 = resolveToString(decl.init, ctx);
        if (value2 !== null) {
          ctx.constants.set(decl.id.name, value2);
        }
      }
    }
  }
}
function tryParseJSON(node2, ctx) {
  if (node2.type === "CallExpression" && node2.callee?.type === "MemberExpression" && node2.callee.object?.type === "Identifier" && node2.callee.object.name === "JSON" && node2.callee.property?.type === "Identifier" && node2.callee.property.name === "parse") {
    if (node2.arguments?.[0]) {
      const jsonStr = resolveToString(node2.arguments[0], ctx);
      if (jsonStr !== null) {
        try {
          return JSON.parse(jsonStr);
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}
var ALL_TRANSFORMERS = ["json_parse", "variable_inliner", "string_concat"];
function optimizeCode(source, transformers = new Set(ALL_TRANSFORMERS)) {
  const ctx = createInlinerContext();
  let changes = 0;
  const wantInliner = transformers.has("variable_inliner");
  const wantConcat = transformers.has("string_concat");
  const wantJSON = transformers.has("json_parse");
  let parsed;
  try {
    parsed = $parseSync("", source, { sourceType: "module", astType: "ts", lang: "tsx" });
  } catch {
    try {
      parsed = $parseSync("", source, { sourceType: "script", astType: "ts", lang: "tsx" });
    } catch (e) {
      return { content: source, changes: 0 };
    }
  }
  const lines = source.split(`
`);
  const offset = (n) => typeof n?.start === "number" && typeof n?.end === "number" ? { start: n.start, end: n.end } : null;
  if (wantInliner || wantConcat) {
    traverse(parsed.program, {
      VariableDeclaration(path) {
        trackDeclaration(path.node, ctx);
      }
    });
  }
  const mutations = [];
  traverse(parsed.program, {
    Identifier(path) {
      const node2 = path.node;
      const parent = path.parentPath?.node;
      if (parent?.type === "VariableDeclarator" && parent.id === node2)
        return;
      if (parent?.type === "FunctionDeclaration" && parent.id === node2)
        return;
      if (parent?.type === "FunctionExpression" && parent.id === node2)
        return;
      if (parent?.type === "ArrowFunctionExpression" && parent.id === node2)
        return;
      if (parent?.type === "MemberExpression" && parent.property === node2 && !parent.computed)
        return;
      if ((parent?.type === "Property" || parent?.type === "PropertyDefinition") && parent.key === node2 && !parent.computed)
        return;
      if (!wantInliner)
        return;
      const value2 = ctx.constants.get(node2.name);
      const range = offset(node2);
      if (value2 != null && range) {
        mutations.push({
          start: range.start,
          end: range.end,
          replacement: JSON.stringify(value2)
        });
        changes++;
      }
    },
    BinaryExpression(path) {
      if (!wantConcat)
        return;
      const node2 = path.node;
      const range = offset(node2);
      if (node2.operator === "+" && range) {
        const value2 = resolveToString(node2, ctx);
        if (value2 !== null) {
          mutations.push({
            start: range.start,
            end: range.end,
            replacement: JSON.stringify(value2)
          });
          changes++;
        }
      }
    },
    CallExpression(path) {
      if (!wantJSON)
        return;
      const node2 = path.node;
      const range = offset(node2);
      if (tryParseJSON(node2, ctx) !== null && range) {
        const jsonResult = tryParseJSON(node2, ctx);
        if (jsonResult !== null) {
          mutations.push({
            start: range.start,
            end: range.end,
            replacement: JSON.stringify(jsonResult)
          });
          changes++;
        }
      }
    }
  });
  mutations.sort((a, b) => a.start - b.start || b.end - a.end);
  const applicable = [];
  let lastEnd = -1;
  for (const mut of mutations) {
    if (mut.start >= lastEnd) {
      applicable.push(mut);
      lastEnd = mut.end;
    }
  }
  applicable.sort((a, b) => b.start - a.start);
  let optimized = source;
  for (const mut of applicable) {
    optimized = optimized.slice(0, mut.start) + mut.replacement + optimized.slice(mut.end);
  }
  return { content: optimized, changes };
}
function main2() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: optimizer.ts <filepath> [transformers_csv] [iterations]");
    process.exit(1);
  }
  const filePath = args[0];
  const transformersArg = args[1] || process.env.OPTIMIZER_TRANSFORMERS || ALL_TRANSFORMERS.join(",");
  const transformers = new Set(transformersArg.split(",").map((t) => t.trim()).filter((t) => t.length > 0));
  const iterations = Math.max(1, parseInt(args[2] || process.env.OPTIMIZER_ITERATIONS || "1", 10) || 1);
  const fs = __require("fs");
  let source = fs.readFileSync(filePath, "utf-8");
  let totalChanges = 0;
  for (let i = 0;i < iterations; i++) {
    const result = optimizeCode(source, transformers);
    totalChanges += result.changes;
    if (result.changes === 0)
      break;
    source = result.content;
  }
  console.log(JSON.stringify({
    optimized_content: source,
    changes: totalChanges
  }));
}
if (import.meta.url === `file://${process.argv[1]}`) {
  main2();
}
export {
  optimizeCode
};
