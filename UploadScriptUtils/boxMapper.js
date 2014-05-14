'use strict';

var request = require('request');
var http = require('http');
var box_sdk = require('box-sdk');
var fs = require('graceful-fs');
var account;
var total;
var folder_name = 'Icons';

//Directory inside the application folder where you uploaded the files - e.g. - "app / abcd / "standard(jic) / all the files
var directory;

var mapping = [];


var box_account = 'xingjia.zhang@autodesk.com';

var logLevel = 'debug'; //default log level on construction is info
var folderProcessed = 0,
    fileProcessed = 0;
var total = 0;
var base_folder_id = 0;
var base_folder_level = 0;

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
        console.log('Mapper not authenticated to acces Box account.');
        return;
    }
    console.log('Authentication Succeeded. Mapping files now....');
    var write = fs.openSync('mapping_ind.json', 'w+');
    fs.writeSync(write, '');
    fs.closeSync(write);

    //setting base directory - currently, "app" - all the files stored inside will be mapped
    directory = '';
    connection.search('Icons',{'fields':'name','limit':1},function(err,body){
        if(err || body.total_count < 1)
        {
            console.log('Error Occured when opening folder Icon.');
            return;
        }

        base_folder_id = body.entries[0].id;
        connection.getFolderInfo(base_folder_id, function(err,body){
            if(err)
            {
                console.log(err);
                return;
            }
            total++;
            base_folder_level = body.path_collection.total_count;
            walk(body.id);
        });
    });
});


var walk = function(start_id){
        connection.getFolderItems(start_id, null,function(err,body){
            if(err)
            {
                console.log('Error Occured when finding items in folder Icon.');
                return;
            }
            total += body.total_count;

            body.entries.forEach(function(entry){
                if(entry.type==='folder')
                {
                    walk(entry.id);
                }
                else
                {
                    connection.updateFile(entry.id,{'shared_link':{'access':'open'}},function(err,body){
                        if(err)
                        {
                            console.log('Error encountered when generating sharing link for file ',entry.name,'.');
                            return;
                        }
                        var link = body.shared_link.download_url;
                        var file_path = body.path_collection;
                        if(file_path.total_count - base_folder_level < 2)
                        {
                            file_path = '//'+body.name;
                        }
                        else
                        {
                            var temp_path = '//';
                            for(var parent in file_path.entries)
                            {
                                if(file_path.entries[parent].id !== base_folder_id && file_path.entries[parent].name !== 'All Files')
                                    temp_path+=file_path.entries[parent].name+'/';
                            }
                            temp_path+=body.name;
                            file_path = temp_path;
                        }
                        console.log('--------------');
                        console.log(file_path,link);
                        mapping.push({'name':file_path,'link':link});
                        fileProcessed++;
                        if(folderProcessed+fileProcessed === total)
                        {
                            writeMapping(mapping);
                        }
                    });
                }
            });
            folderProcessed++;
            if(folderProcessed+fileProcessed === total)
            {
                writeMapping(mapping);
            }
        });
};

var writeMapping = function(mapping) {
    var write = fs.openSync('mapping_ind.json', 'a+');
    fs.writeSync(write, JSON.stringify(mapping));
    console.log('End of mapping. Total Number of Files Mapped: ',mapping.length);
    return process.exit();  
};

