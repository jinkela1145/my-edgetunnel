const fs = require('fs');
let c = fs.readFileSync('_worker.js', 'utf8');

const targetStr = `	if (!config_JSON.gRPCUserAgent) config_JSON.gRPCUserAgent = UA;`;
const replaceStr = `	// 清理废弃字段，防止被存回 KV
	delete config_JSON.订阅转换配置;
	if (!config_JSON.gRPCUserAgent) config_JSON.gRPCUserAgent = UA;`;

if (c.includes(targetStr)) {
    c = c.replace(targetStr, replaceStr);
    fs.writeFileSync('_worker.js', c);
    console.log('Patch 2 applied');
} else {
    console.log('Target string 2 not found');
}
