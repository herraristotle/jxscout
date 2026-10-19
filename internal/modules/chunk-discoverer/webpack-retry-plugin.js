// webpack-retry-plugin.js - Generate webpack plugin for chunk load retry logic
// This is injected into the browser to intercept chunk loading failures

function generateWebpackRetryPlugin(config) {
    const maxRetries = config.maxRetries || 3;
    const retryDelay = config.retryDelay || 1000;
    const fallbackUrls = config.fallbackUrls || [];

    return `
(function() {
    // Webpack chunk load retry plugin
    var __webpack_chunk_load_original__ = __webpack_require__.e;
    var __chunk_retry_counts__ = {};
    
    __webpack_require__.e = function(chunkId) {
        var retryCount = __chunk_retry_counts__[chunkId] || 0;
        
        return __webpack_chunk_load_original__(chunkId).catch(function(error) {
            console.warn('[JXScout] Chunk load failed:', chunkId, 'retry', retryCount + 1, '/', ${maxRetries});
            
            if (retryCount < ${maxRetries}) {
                __chunk_retry_counts__[chunkId] = retryCount + 1;
                
                // Wait before retry with exponential backoff
                var delay = ${retryDelay} * Math.pow(2, retryCount);
                
                return new Promise(function(resolve) {
                    setTimeout(resolve, delay);
                }).then(function() {
                    return __webpack_require__.e(chunkId);
                });
            }
            
            // Try fallback URLs if configured
            ${fallbackUrls.length > 0 ? `
            if (retryCount === ${maxRetries}) {
                console.warn('[JXScout] Trying fallback URLs for chunk:', chunkId);
                var fallbacks = ${JSON.stringify(fallbackUrls)};
                var originalPublicPath = __webpack_require__.p;
                
                function tryFallback(index) {
                    if (index >= fallbacks.length) {
                        console.error('[JXScout] All fallbacks exhausted for chunk:', chunkId);
                        throw error;
                    }
                    
                    __webpack_require__.p = fallbacks[index];
                    return __webpack_chunk_load_original__(chunkId).catch(function(fallbackError) {
                        __webpack_require__.p = originalPublicPath;
                        return tryFallback(index + 1);
                    });
                }
                
                return tryFallback(0);
            }
            ` : ''}
            
            console.error('[JXScout] Chunk load failed after', ${maxRetries}, 'retries:', chunkId);
            throw error;
        });
    };
    
    console.log('[JXScout] Webpack chunk retry plugin loaded (max retries: ${maxRetries})');
})();
`.trim();
}

function generateViteRetryPlugin(config) {
    const maxRetries = config.maxRetries || 3;
    const retryDelay = config.retryDelay || 1000;

    return `
(function() {
    // Vite dynamic import retry plugin
    var __vite_retry_counts__ = {};
    var __original_import__ = window.__vitePreload || (function(fn) { return fn(); });
    
    window.__vitePreload = function(fn, deps) {
        var moduleId = deps ? deps[0] : 'unknown';
        var retryCount = __vite_retry_counts__[moduleId] || 0;
        
        var attempt = function() {
            return __original_import__(fn, deps);
        };
        
        return attempt().catch(function(error) {
            console.warn('[JXScout] Vite chunk load failed:', moduleId, 'retry', retryCount + 1, '/', ${maxRetries});
            
            if (retryCount < ${maxRetries}) {
                __vite_retry_counts__[moduleId] = retryCount + 1;
                
                var delay = ${retryDelay} * Math.pow(2, retryCount);
                
                return new Promise(function(resolve) {
                    setTimeout(resolve, delay);
                }).then(attempt);
            }
            
            console.error('[JXScout] Vite chunk load failed after', ${maxRetries}, 'retries:', moduleId);
            throw error;
        });
    };
    
    console.log('[JXScout] Vite chunk retry plugin loaded (max retries: ${maxRetries})');
})();
`.trim();
}

function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Usage: webpack-retry-plugin.js <type> [config-json]");
        console.error("Types: webpack, vite");
        process.exit(1);
    }

    const type = args[0];
    const config = args[1] ? JSON.parse(args[1]) : {};

    let plugin;
    switch (type) {
        case 'webpack':
            plugin = generateWebpackRetryPlugin(config);
            break;
        case 'vite':
            plugin = generateViteRetryPlugin(config);
            break;
        default:
            console.error("Unknown type:", type);
            process.exit(1);
    }

    console.log(plugin);
}

if (require.main === module) {
    main();
}

module.exports = { generateWebpackRetryPlugin, generateViteRetryPlugin };
