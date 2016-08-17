var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

var Schema = mongoose.Schema;

var LinkResultSchema =  new Schema(

	{
		url : String,
		date : Date,
	    device : String,
	    status : String,
	    duration : Number ,
	    number : Number,
	    slowest : String,
	    slowest_duration : Number,
	    largest : String,
	    largest_size : Number,
	    size : Number,
	    error : [
	    	{
	          url : String,
	          error_type: String,
	          error_code: Number
	        }
	     ],
	    blocked : String
	}

);


var LinkResult = mongoose.model('LinkResult', LinkResultSchema);
	






