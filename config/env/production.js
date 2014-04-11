'use strict';

module.exports = {
    base_url: 'http://ecs-237d5f21.ecs.ads.autodesk.com/',
    db: "mongodb://ecs-237d5f21.ecs.ads.autodesk.com/ACE-prod",
    app: {
        name: "Autodesk - ACE ComOn Production"
    },
	oauth: {
        requestTokenURL: 'http://accounts-dev.autodesk.com/OAuth/RequestToken',
        accessTokenURL: 'http://accounts-dev.autodesk.com/OAuth/AccessToken',
        userAuthorizationURL: 'http://accounts-dev.autodesk.com/OAuth/Authorize',
        consumerKey: '5f7de223-2148-479b-9ae1-e835f590c117',
        consumerSecret: 'fb3d2f26-d89e-4ab5-9da4-d9c0664c3c9d',
        callbackURL: 'http://ecs-237d5f21.ecs.ads.autodesk.com/auth/oauth/callback',
        apiURL: 'http://accounts-dev.autodesk.com'
    },
	port: '80'
};
/*
 deployed to http://ecs-237d5f21.ecs.ads.autodesk.com/#!/
 remote desktop to centOS = http://ajmatson.net/wordpress/2014/01/install-xrdp-remote-desktop-to-centos-6-5/
 deploying to centos = http://www.dacius.com/?p=636
 mongodb to centos = http://docs.mongodb.org/manual/tutorial/install-mongodb-on-red-hat-centos-or-fedora-linux/
 user forever to deploy.

 */