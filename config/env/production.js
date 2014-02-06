module.exports = {
    db: "mongodb://localhost/ACE",
    app: {
        name: "Autodesk - ACE ComOn Production"
    },
    oauth: {
        requestTokenURL: 'http://accounts-dev.autodesk.com/OAuth/RequestToken',
        accessTokenURL: 'http://accounts-dev.autodesk.com/OAuth/AccessToken',
        userAuthorizationURL: 'http://accounts-dev.autodesk.com/OAuth/Authorize',
        consumerKey: '5f7de223-2148-479b-9ae1-e835f590c117',
        consumerSecret: 'fb3d2f26-d89e-4ab5-9da4-d9c0664c3c9d',
        callbackURL: 'http://ace-online.autodesk.com:3000/auth/oauth/callback'
    }
}