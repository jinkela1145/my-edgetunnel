const fs = require('fs');
let c = fs.readFileSync('_worker.js', 'utf8');

c = c.replace(
`							// 🚨 [自定义优选] 从后台配置读取自定义优选IP列表并注入 🚨
							if (config_JSON.优选订阅生成.自定义优选 && config_JSON.优选订阅生成.自定义优选.length > 0) {
								完整优选IP = 完整优选IP.concat(config_JSON.优选订阅生成.自定义优选);
							}`,
`							// 🚨 [核心功能] 拦截: 从后台 "自定义优选IP" 页面读取并注入 (彻底脱离对外部面板config结构的依赖) 🚨
							const customIPsText = await env.KV.get('ADD.txt');
							if (customIPsText) {
								const customIPsArray = await 整理成数组(customIPsText);
								if (customIPsArray && customIPsArray.length > 0) {
									完整优选IP = 完整优选IP.concat(customIPsArray);
								}
							}
							
							// 兜底层: 如果真的完全没有优选IP，兜底注入一组高质量节点防止订阅报错空跑
							if (完整优选IP.length === 0) {
								const 默认兜底优选 = ["104.28.14.162:443#JP优选", "172.67.240.231:443#JP优选", "jp.cdn.baipiao.eu.org:443#JP优选", "104.16.223.49:443#HK优选", "104.18.150.37:443#HK优选", "hk.cdn.baipiao.eu.org:443#HK优选", "104.18.2.161:443#SG优选", "104.28.16.29:443#SG优选", "sg.cdn.baipiao.eu.org:443#SG优选", "162.159.43.36:443#US优选", "104.16.115.34:443#US优选", "us.cdn.baipiao.eu.org:443#US优选"];
								完整优选IP = 完整优选IP.concat(默认兜底优选);
							}`
);

fs.writeFileSync('_worker.js', c);
console.log('Patch 1 applied');
