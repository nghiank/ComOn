module.exports = {
    base_url: 'http://comon.herokuapp.com',
    db: "mongodb://root:Iceman123@lennon.mongohq.com:10025/app23651433",
    app: {
        name: "Autodesk - ACE ComOn Production"
    },
    oauth: {
        requestTokenURL: 'https://accounts-dev.autodesk.com/OAuth/RequestToken',
        accessTokenURL: 'https://accounts-dev.autodesk.com/OAuth/AccessToken',
        userAuthorizationURL: 'http://accounts-dev.autodesk.com/OAuth/Authorize',
        consumerKey: '5f7de223-2148-479b-9ae1-e835f590c117',
        consumerSecret: 'fb3d2f26-d89e-4ab5-9da4-d9c0664c3c9d',
        callbackURL: 'http://comon.herokuapp.com/auth/oauth/callback',
        apiURL: 'https://accounts-dev.autodesk.com'
    }
}