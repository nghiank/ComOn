'use strict';

module.exports = {
    base_url: 'http://localhost:3000',
    db: "mongodb://localhost/ACE-dev",
    app: {
        name: "Autodesk - ACE ComOn Dev"
    },
    oauth: {
        requestTokenURL: 'http://accounts-dev.autodesk.com/OAuth/RequestToken',
        accessTokenURL: 'http://accounts-dev.autodesk.com/OAuth/AccessToken',
        userAuthorizationURL: 'http://accounts-dev.autodesk.com/OAuth/Authorize',
        consumerKey: '5f7de223-2148-479b-9ae1-e835f590c117',
        consumerSecret: 'fb3d2f26-d89e-4ab5-9da4-d9c0664c3c9d',
        callbackURL: 'http://localhost:3000/auth/oauth/callback',
        apiURL: 'http://accounts-dev.autodesk.com'
    }
}