var phantom = require('phantom');
var async = require('async');
var fs = require('fs');

var outObj;
var resultsObj;
var sitepage = null;
var phInstance = null;
var ssCount = 0;
var jsonObj = {
    "url" : null,
    "device" : null,
    "status" : null,
    "duration" : null,
    "number" : null,
    "slowest_duration" : null,
    "slowest" : null,
    "largest" : null,
    "largest_size" : null,
    "size" : null,
    "error" : [],
    "blocked" : false
    // "totalDuration" : null
};   

function runPhantom(candidate, callback){    

    var start = null;

    phantom.create()

    .then(instance => {
      phInstance = instance;
      outObj = phInstance.createOutObject();
      resultsObj = phInstance.createOutObject();
      resultsObj.results;
      outObj.urls = [];

        // reset jsonObj
        jsonObj.url = null
        jsonObj.device = null
        jsonObj.status = null
        jsonObj.duration = null
        jsonObj.number = null
        jsonObj.slowest = null
        jsonObj.slowest_duration = null
        jsonObj.largest = null
        jsonObj.size = null
        jsonObj.error = [];
        jsonObj.blocked = false;
        // jsonObj.totalDuration = null

        return instance.createPage();
    })

    .then(page => {

        var resources = [];
      

        // On load started
        page.on('onLoadStarted', function(){
        
            if(!start){
                start = new Date().getTime();
            }

            console.log("---Load Started---");
        });


        // On resource requested
        page.on('onResourceRequested', function(requestData, networkRequest, out) {
            
            var now = new Date().getTime();

            out.urls.push(requestData.url);

            resources[requestData.id] = {
                id: requestData.id,
                url: requestData.url,
                request: requestData,
                responses: {},
                duration: '-',
                times: {
                  request: now
                },
                statusCode: '   ',
                error : '',
                timedout : false
            }

            if(!start || now < start){
                start = now;
            }

        }, outObj);


        // On resource received
        page.on('onResourceReceived', function(response){

            var now = new Date().getTime(),
                resource = resources[response.id];

            if(resource.statusCode == '   '){
                resource.statusCode = response.status;
            }

            resource.responses[response.stage] = response;

            if(!resource.times[response.stage]){
                  resource.times[response.stage] = now;
                  resource.duration = now - resource.times.request;
            }    

            if (response.bodySize) {
                    resource.size = response.bodySize;
                } else if (!resource.size) {
                    response.headers.forEach(function (header) {
                        
                        if (header.name.toLowerCase()=='content-length') {
                            resource.size = parseInt(header.value);
                        }
                });
            }
        });


        // On resource error
        page.on('onResourceError', function(resourceError){

            var resource = resources[resourceError.id];

            resource.error =  {
                'url' : resourceError.url, 
                'error_type' : resourceError.errorString, 
                'error_code' : resourceError.errorCode
            }

            if(resource.statusCode !== 408){
                resource.statusCode = 'err';
            }

            // If the first resource has error then the url is blocked
            if(resourceError.id == 1){
                jsonObj.blocked = true;
            }
        });


        // On Resource timeout
        page.on('onResourceTimeout', function(request){

            var resource = resources[request.id];

            resource.timedout = true;
            resource.statusCode = request.errorCode;

            // If the first resource timedout then the url is blocked
            if(request.id == 1){
              jsonObj.blocked = true;
            }
        });


        // On load finished
        page.on('onLoadFinished', function(status, out){

            console.log('---load finished---');


            var screenshot = candidate + '.png';
            console.log(screenshot);
            page.render('./screenshot/abc.png');
            ssCount++;

            var finish =  new Date().getTime(),
                slowest, fastest, totalDuration = 0,
                largest, smallest, totalSize = 0,
                missingSize = false,
                elapsed = finish - start;

            resources.forEach(function (resource) {
                if (!resource.times.start) {
                    resource.times.start = resource.times.end;
                }
                if (!slowest || resource.duration > slowest.duration) {
                    slowest = resource;
                }
                if (!fastest || resource.duration < fastest.duration) {
                    fastest = resource;
                }
                if(resource.duration != '-'){
                    totalDuration += resource.duration;
                }
                if (resource.size) {
                    if (!largest || resource.size > largest.size) {
                        largest = resource;
                    }
                    if (!smallest || resource.size < smallest.size) {
                        smallest = resource;
                    }
                    totalSize += resource.size;
                } else {
                    resource.size = '-';
                    missingSize = true;
                }
            })

            
            jsonObj.status = status;
            jsonObj.url = candidate;
            jsonObj.duration = elapsed;// in ms
            jsonObj.number = resources.length - 1;
            jsonObj.slowest_duration = slowest.duration;// in ms
            jsonObj.slowest = slowest.url;
            if(largest != null){
                jsonObj.largest_size = largest.size;// in bytes
                jsonObj.largest = largest.url
            }
            jsonObj.size = totalSize; 
            // jsonObj.totalDuration = totalDuration + 'ms';


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

   
            resources.forEach(function (resource) {
               if(resource.error !== ''){ 
                    jsonObj.error.push(resource.error);
                }
              
                console.log(
                    pad(resource.id, 3) + '. ' +
                    pad('Status ' + resource.statusCode, 3) +
                    pad(resource.duration, 6) + 'ms; ' +
                    pad(resource.size, 7) + 'b; ' +
                    truncate(resource.url, 84)
                );  
            });

            out.results = jsonObj;

        }, resultsObj);
        // End of load finished
        


        sitepage = page;

        // set resource timeout to 8 seconds
        page.setting('resourceTimeout', 8000);
        // set device to "iphone"
        page.setting('userAgent', "iphone");

        jsonObj.device = "iphone";

        console.log('');
        console.log('==================================================')
        console.log('loading page: ' + candidate);

        return page.open(candidate);
    })


    .then(function(status) {

        console.log('');
        console.log('---------------------------------')
        console.log(JSON.stringify(jsonObj, null, 2));
        console.log('---------------------------------')

        return sitepage.property('content');
    })


    .then(content => {
        callback();
        sitepage.close();
        phInstance.exit();
    })


    .catch(error => {
        console.log('Error: ' + error);
        phInstance.exit();
    });
}




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


exports.linkChecker = function(url, cb){

    var resultsArr = [];

    console.log('checking ' + url.length + ' urls');

    async.eachSeries(url, function(url, next) {

        runPhantom(url, function(urls){

            var copyResult = Object.assign(resultsObj.results, {});

            var saveResult = {
                url : copyResult.url,
                device : copyResult.device,
                status : copyResult.status,
                size : copyResult.size,
                duration: copyResult.duration,
                number : copyResult.number,
                slowest : copyResult.slowest,
                slowest_duration: copyResult.slowest_duration,
                largest : copyResult.largest,
                largest_size : copyResult.largest_size,
                error : copyResult.error,
                blocked : copyResult.blocked,
                // totalDuration : copyResult.totalDuration,
            };

            resultsArr.push(saveResult);
            next();
        });

    }, function(err) {

        console.log('-----------resultsArr-------------');
        console.log(JSON.stringify(resultsArr, null, 2));

        console.log('')

        // console.log('outObj.results = ' + JSON.stringify(outObj.results));

        console.log('---finshed checking---')

        console.log('');

        return cb(null, resultsArr);
    });
}


// ==================================================
var truncate = function (str, length) {
        length = length || 80;
        if (str.length <= length) {
            return str;
        }
        var half = length / 2;
        return str.substr(0, half-2) + '...' + str.substr(str.length-half+1);
    },

    pad = function (str, length) {
        var padded = str.toString();
        if (padded.length > length) {
            return pad(padded, length * 2);
        }
        return repeat(' ', length - padded.length) + padded;
    },

    repeat =  function (chr, length) {
        for (var str = '', l = 0; l < length; l++) {
            str += chr;
        }
        return str;
    };


//TODO 
 var CheckUrl = function(url){

    // check the format of the url 
 }   

