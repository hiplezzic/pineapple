//-------------------------------------
// /index.js
//-------------------------------------

var server = require("./server");
var Router = require("./router/router");
var router = new Router;

server.start(router);

