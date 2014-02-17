# Dropbox Uploader

These scripts are used to upload to an app folder in dropbox and to generate a listing of all the files uploaded and their download links.

## Prerequisites
* Node.js - Download and Install [Node.js](http://www.nodejs.org/download/). You can also follow [this gist](https://gist.github.com/isaacs/579814) for a quick and easy way to install Node.js and npm

## Quick Install

  Install dependencies:

    $ npm install

  Then run using

  	$node Uploader.js
  	$node Mapper.js

## Instructions - Uploader.js

	To use the uploader, first setup using npm install, then put all the files you want to be uploaded into a folder called /filesToBeUploaded. You can change this if you want. 
	Also, if you want to use your own dropbox account and api key, you can do so by obtaining an app key and secretfrom dropbox and replacing the credentials in Uploader.js. 
	Currently, the default directory it will upload the files to is "/App/Account Name/all your files". This can also be changed according to your wishes.
	If the script completes successfully, it will generate the mapping in a file called mapping.json

## Instructions - Mapper.js

	To use the mapper, first setup using npm install, then run mapper.js. 
	Also, if you want to use your own dropbox account and api key, you can do so by obtaining an app key and secretfrom dropbox and replacing the credentials in Mapper.js. 
	Currently, the default directory it will map the files from is "/App/Account Name/all your files". This can also be changed according to your wishes.
	If the script completes successfully, it will generate the mapping in a file called mapping_ind.json