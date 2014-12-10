var nock = require('nock'),
    keenHelper = require("./test-config");

var baseUrl = "https://api.keen.io/3.0",
    resHeader = { "Content-Type": "application/json" };

module.exports = {
  "post": mockPostRequest,
  "get": mockGetRequest,
  "del": mockDelRequest
};

function mockPostRequest(path, responseCode, responseBody){
  nock(baseUrl)
    .post("/3.0/projects/" + keenHelper.projectId + path)
    .reply(responseCode, responseBody, resHeader);
}

function mockGetRequest(path, responseCode, responseBody){
  nock(baseUrl)
    .get("/3.0/projects/" + keenHelper.projectId + path)
    .reply(responseCode, responseBody, resHeader);
}

function mockDelRequest(path, responseCode, responseBody) {
  nock(baseUrl)
    .delete("/3.0/projects/" + keenHelper.projectId + path)
    .reply(responseCode, responseBody, resHeader);
}
