var fs = require("fs");
var xml = require('xml-mapping');

var Request = require('request');
var Mustache = require("mustache");
var Deferred = require('Deferred');


exports._getFile = function(filename) {
    var dfd = new Deferred();
    fs.readFile(
        filename, 
        "utf8",
        function (err, data) {
            dfd.resolve(data);
        });
    
    return dfd.promise();
}


exports._getLoginPostData = function(){

    var dfd = new Deferred();
    this._getFile('./requests/login.xml')
        .done(
            function(requestData){
                dfd.resolve(requestData);
            });
    
    return dfd.promise();
};


exports._getSearchPostData = function(token, lang, query){

    var dfd = new Deferred();
    this._getFile('./requests/search.xml')
        .done(
            function(requestData){
                
                var postData = Mustache.render(requestData, { token: token, query: query, lang: lang });
                dfd.resolve(postData);
            });
    
    return dfd.promise();
};

exports._getSearchFilePostData = function(token, lang, moviehash, moviebytesize){

    var dfd = new Deferred();
    this._getFile('./requests/searchFile.xml')
        .done(
            function(requestData){
                
                var postData = Mustache.render(requestData, { token: token, lang: lang, moviehash: moviehash, moviebytesize: moviebytesize });
                dfd.resolve(postData);
            });
    
    return dfd.promise();
};


exports._getLogoutPostData = function(token){

    var dfd = new Deferred();
    this._getFile('./requests/logout.xml')
        .done(
            function(requestData){
                
                var postData = Mustache.render(requestData, { token: token });
                dfd.resolve(postData);
            });
    
    return dfd.promise();
};


exports.request = function(url, postData){

    var dfd = new Deferred();
    Request.post(
        { 
            url:url, 
            body: postData
        },
        function (error, response, body) {
            dfd.resolve(body);
        });
    
    return dfd.promise();
};


exports.parseXmlLoginResult = function(xmlResult){
    var loginJson = xml.load(xmlResult);
    var loginRequestArray = loginJson["methodResponse"]["params"]["param"]["value"]["struct"]["member"];
    
    var token = loginRequestArray[0]["value"]["string"]["$t"];  
    
    return token;
};


exports.parseXmlSearchResult = function(xmlResult){
  
    var loginJson = xml.load(xmlResult),
    resultsXml = loginJson["methodResponse"]["params"]["param"]["value"]["struct"]["member"][1]["value"]["array"]["data"]["value"],
    results = [];

    resultsXml.forEach(
        function(elem){
           var resultXmlInfo = elem["struct"]["member"],
               result = {};
            
            resultXmlInfo.forEach(
                function(dict){
                    try { result[dict["name"]["$t"]] = dict["value"]["string"]["$t"]; } catch(e) {};
                });
            
           results.push(result);
        }
    );

    return results;
    
};