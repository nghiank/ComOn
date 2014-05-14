'use strict';

var http = require('http');
var box_sdk = require('box-sdk');
var	fs = require('graceful-fs');
var file_dir = __dirname + '/filesToBeUploaded',
	index_read = 0,
	index_sent = 0;
var mapping = [];
var total_files = 0;
var errored = [];
var folder_id = 0;
var box_account = 'xingjia.zhang@autodesk.com';

var logLevel = 'debug'; //default log level on construction is info

var box = box_sdk.Box({
  client_id: 'nlofq3d3oki3frczappna9xco9homcsf',
  client_secret: 'sz89t8uDnsViQU3MWUVriFKlbC7mUyZa',
  port: 9999,
  host: 'localhost' //default localhost
}, logLevel);

var connection = box.getConnection(box_account);

//Navigate user to the auth URL
console.log('Please authenticate the uploader to access the Box account:');
console.log(connection.getAuthURL());

connection.ready(function () {
	if(!connection.isAuthenticated())
	{
		console.log('Uploader not authenticated to acces Box account.');
	}
	//Root Folder id is 0;
  	connection.createFolder('Icons', 0, function(err,body){
  		if(err)
  		{
  			console.log(err);
  			return;
  		}
		console.log('Icons folder created');
  		if(!fs.existsSync(file_dir))
		{
			console.log('Directory '+ path+ ' doesn\'t exist');
			return process.exit();
		}
		var write = fs.openSync('mapping.json', 'w+');
		fs.writeSync(write, '');
		fs.closeSync(write);
		//files will be taken from inside the filesToBeUploaded folder and uploaded to "app/" folder directly.
		walk(file_dir, '/',  startProcess);
		folder_id = body.id;

  	});
});

function walk(start, absOl, callback) {
    // Use lstat to resolve symlink if we are passed a symlink
    fs.lstat(start, function(err, stat) {
        if(err) {
            return callback(err);
        }
        var found = [],
            total = 0,
            processed = 0;
        function isDir(abspath, absOl) {
            fs.stat(abspath, function(err, stat) {
                if(stat.isDirectory()) {
                    // If we found a directory, recurse!
                    walk(abspath, absOl, function(err, data) {
                        found = found.concat(data);
                        if(++processed == total) {
                            callback(null, found);
                        }
                    });
                } else {
                    found.push({'file': abspath, 'url': absOl});
                    if(++processed == total) {
                        callback(null, found);
                    }
                }
            });
        }
        // Read through all the files in this directory
        if(stat.isDirectory()) {
            fs.readdir(start, function (err, files) {
                total = files.length;
                if(total == 0)
                {
                    callback(null, found);
                }
                else
                {
                    for(var x=0, l=files.length; x<l; x++) {
                        isDir(start + '/' + files[x], absOl + '/' + files[x]);
                    }
                }
            });
        } else {
            return callback(new Error("Path: " + start + " is not a directory"));
        }
    });
};

var startProcess = function(error, found) {
	if(error) {
		console.log(error);
		return process.exit();
	}
	total_files = found.length;
	process_files(found.slice(0,100), found, 100);
};

var process_files = function(tempFiles, files, slice) {
	var i = tempFiles.length;
	var index_ignored = 0;
	tempFiles.forEach(function(file) {
    	if(!(/\/\./.test(file.file)))
		{
        	console.log('Reading file... ' + ++index_read );
        	fs.readFile(file.file, function(err, data) {
        		if(err)
        		{
        			console.log(err);
        			return process.exit();
        		}
        		console.log('Finished Reading. Sending...');
        		file.file = file.file.substr(file.file.indexOf('/filesToBeUploaded')+1);
                    console.log('Uploading file ',file.file);
                    connection.uploadFile(file.file, folder_id, null, function(err,body){
                        if(err)
                        {
                            console.log(err + ' Error encountered while uploading file at path ' + file.file);
                            errored.push(file);
                            index_sent++;
                            i--;
                            if(i === 0)
                            {
                                console.log(index_sent + '/' + total_files + ' done.');
                                if(slice < files.length) {
                                    process_files(files.slice(slice, slice+100), files, slice+100);
                                }
                                else if(index_sent === total_files)
                                {
                                    if(errored.length != 0)
                                    {
                                        sendErroredFiles();
                                    }
                                    else
                                    {
                                        var write = fs.openSync('mapping.json', 'a+');
                                        fs.writeSync(write, JSON.stringify(mapping));
                                        console.log('End of uploading.');
                                        return process.exit();
                                    }
                                }
                            }
                            return;
                        }

                        
                        var uploadedFile = body;
                        console.log('package uploaded', uploadedFile);

                        connection.updateFile(body.entries[0].id,{'shared_link':{'access':'open'}}, function(error, body) {
                            if(!error) {
                                var url = body.shared_link.download_url;
                                mapping.push({name: file.url, dl_url: url});
                            }
                            else
                            {
                                console.log(error);
                                errored.push(file);
                            }

                            index_sent++;
                            i--; 

                            if(i === 0)
                            {
                                console.log(index_sent + '/' + total_files + ' done.');
                                if(slice < files.length) {
                                    process_files(files.slice(slice, slice+100), files, slice+100);
                                }
                                else if(index_sent === total_files)
                                {
                                    if(errored.length != 0)
                                    {
                                        sendErroredFiles();
                                    }
                                    else
                                    {
                                        var write = fs.openSync('mapping.json', 'a+');
                                        fs.writeSync(write, JSON.stringify(mapping));
                                        console.log('End of uploading.');
                                        return process.exit();
                                    }
                                }
                            }
                        });
                    
                    });

            });
        	}
        	else {
        		total_files-- ;
        		index_ignored++;
        		i--;
        	}
    });
};

var sendErroredFiles = function()
{
    console.log('Sending errored files....');
    total_files = errored.length;
    index_sent = 0;
    index_read = 0;
    var copy = errored;
    errored = [];
    process_files(copy.splice(0,100), copy, 100);
}

