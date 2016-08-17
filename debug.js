/*
console.log('');
console.log('              url: ' + candidate)
console.log('');
console.log('Elapsed load time: ' + pad(elapsed, 6) + 'ms');
console.log('   # of resources: ' + pad(resources.length-1, 8));
console.log('');
console.log(' Fastest resource: ' + pad(fastest.duration, 6) + 'ms; ' + truncate(fastest.url));
console.log(' Slowest resource: ' + pad(slowest.duration, 6) + 'ms; ' + truncate(slowest.url));
console.log('  Total resources: ' + pad(totalDuration, 6) + 'ms');
console.log('');
if(smallest != null){
    console.log('Smallest resource: ' + pad(smallest.size, 7) + 'b; ' + truncate(smallest.url));
}
if(largest != null){
    console.log(' Largest resource: ' + pad(largest.size, 7) + 'b; ' + truncate(largest.url));
}
console.log('  Total resources: ' + pad(totalSize, 7) + 'b' + (missingSize ? '; (at least)' : ''));
*/




// ===============================================
/*var content = fs.readFileSync('./url.js', 'utf8');

var lines = content.split('\n');

lines = lines.slice(0, 100);

var urls = lines.filter(function(line) {
    return (line.indexOf("url") > -1);
});

var cleanUrls = urls.map(function(url) {
    return url.substring(12, url.length-2);
})*/

/*cleanUrls = [

    "http://baidu.com",
    "http://google.com",
    // "http://twitter.com",
    // "http://youtube.com",
    // "http://kawo.com"
]*/