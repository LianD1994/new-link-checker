// run  http://localhost:9000/
var express = require('express');
var app = express();
var phantom = require('phantom');
var checker = require('./link-checker');
var bodyParser = require('body-parser');

app.use(bodyParser.json());



/*
request format:

{
	"url" : [
		"http://www.google.com",
		"http://www.baidu.com"
 	]	
}
*/

app.get('/links/:linkId', function(req, res) {

	var linkId = req.params.linkId

	LinkResult.find({_id: linkId}.function(err, results) {

		res.status(200).json
	})

})



app.post('/links', function (req, res) {

	var url = req.body.url;

	checker.linkChecker(url, function(err, result){

		if (err) {
			return res.status(400).json({
			message: err.message || 'Error processing request'
			})
   		 }

   		 for(i=0;i<result.result.length;i++){

   		 	LinkResult.save({result.result[i]}, function(err, results) {

	   		 	if(err){
	   		 		
	   		 		return res.status(400);
   		 		}
   		 	})
   		 }
   		
    	res.status(200).json({
			result
    	})
	}) 
});

	app.listen(9000, function () {
    console.log('---listening on port 9000---');
});

