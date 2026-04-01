const fs = require('fs');
let c = fs.readFileSync('_worker.js', 'utf8');
let modified = false;

// 1. Remove 订阅转换配置 from default config (around line 2228)
const confMatch = /,\s*订阅转换配置:\s*\{\s*SUBAPI:\s*"[^"]*",\s*SUBCONFIG:\s*"[^"]*",\s*SUBEMOJI:\s*false,?\s*\}/;
if (confMatch.test(c)) {
    c = c.replace(confMatch, '');
    console.log('✅ Removed 订阅转换配置 default object');
    modified = true;
}

// 2. Simplify the branch from line 375.
// Original:
// } else { // 订阅转换
//     const 订阅转换URL = ...
//     try { fetch... } catch(...)
// }
// if (!ua.includes('subconverter')...)
// if (订阅类型 === 'mixed' ...) 订阅内容 = btoa(订阅内容);
// if (订阅类型 === 'singbox') {... } else if (订阅类型 === 'clash') {...}
// return new Response(订阅内容...)

// We want to replace everything after `} else if (订阅类型 === 'singbox') { 订阅内容 = 生成原生SingboxJSON(...)`
// up to `return new Response...` with a simple default case:
// } else { // 默认返回 Base64 的 mixed 订阅
//     订阅内容 = btoa(订阅内容);
// }
// return new Response(订阅内容, { status: 200, headers: responseHeaders });

const replaceBranchRegex = /\} else \{ \/\/ 订阅转换\s*const 订阅转换URL[\s\S]*?(?=return new Response\(订阅内容, \{ status: 200, headers: responseHeaders \}\);)/;
if (replaceBranchRegex.test(c)) {
    c = c.replace(replaceBranchRegex, `} else { // 其他类型统一默认返回 Base64 (mixed)
\t\t\t\t\t\t\t订阅内容 = btoa(订阅内容);
\t\t\t\t\t\t}
\t\t\t\t\t\t`);
    console.log('✅ Replaced Subconverter branch with base64 default');
    modified = true;
}

// 3. Remove Hot Patch functions
function removeFunc(namePattern) {
    const idx = c.indexOf(namePattern);
    if (idx !== -1) {
        let openBraces = 0;
        let started = false;
        let endIdx = -1;
        for (let i = idx; i < c.length; i++) {
            if (c[i] === '{') {
                openBraces++;
                started = true;
            } else if (c[i] === '}') {
                openBraces--;
                if (started && openBraces === 0) {
                    endIdx = i;
                    break;
                }
            }
        }
        if (endIdx !== -1) {
            c = c.substring(0, idx) + c.substring(endIdx + 1);
            console.log('✅ Removed function matching pattern: ' + namePattern);
            modified = true;
        }
    }
}

removeFunc('function Surge订阅配置文件热补丁');
removeFunc('function Clash订阅配置文件热补丁');
removeFunc('async function Singbox订阅配置文件热补丁');

if (modified) {
    fs.writeFileSync('_worker.js', c, 'utf8');
} else {
    console.log('⚠️ No modifications applied.');
}
