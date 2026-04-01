const fs = require('fs');
let c = fs.readFileSync('_worker.js', 'utf8');

// Remove orphaned Clash hot-patch body (line 1453 ") {" through line 1668 "}")
// And orphaned Singbox hot-patch body (line 1670 ") {" through line 1855 "}")
// These are between the comment "功能性函数" and "async function 请求日志记录"

const startMarker = '//////////////////////////////////////////////////功能性函数///////////////////////////////////////////////\r\n) {';
const endMarker = '\r\n\r\n\r\n\r\nasync function 请求日志记录';

const startIdx = c.indexOf(startMarker);
const endIdx = c.indexOf('async function 请求日志记录');

if (startIdx > 0 && endIdx > startIdx) {
    // Keep the comment line but remove everything from ") {" until "async function 请求日志记录"
    const commentEnd = c.indexOf('\r\n', startIdx) + 2; // end of the comment line
    c = c.substring(0, commentEnd) + '\n' + c.substring(endIdx);
    console.log('✅ Removed orphaned Clash + Singbox hot-patch bodies (' + (endIdx - commentEnd) + ' bytes)');
} else {
    console.log('startIdx:', startIdx, 'endIdx:', endIdx);
    console.log('⚠️ Could not find orphan boundaries');
}

fs.writeFileSync('_worker.js', c, 'utf8');
