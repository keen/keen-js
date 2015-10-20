var nock = require('nock'),
    keenHelper = require("./test-config");

var baseUrl = "https://api.keen.io/3.0",
    resHeader = { "Content-Type": "application/json" };

module.exports = {
  "post": mockPostRequest,
  "get": mockGetRequest,
  "put": mockPutRequest,
  "del": mockDelRequest
};

function mockPostRequest(path, responseCode, responseBody, delay){
  nock(baseUrl)
    .post("/3.0/projects/" + keenHelper.projectId + path)
    .delay(delay || 0)
    .reply(responseCode, responseBody, resHeader);
}

function mockGetRequest(path, responseCode, responseBody, delay){
  nock(baseUrl)
    .get("/3.0/projects/" + keenHelper.projectId + path)
    .delay(delay || 0)
    .reply(responseCode, responseBody, resHeader);
}

function mockPutRequest(path, responseCode, responseBody, delay) {
  nock(baseUrl)
    .put("/3.0/projects/" + keenHelper.projectId + path)
    .delay(delay || 0)
    .reply(responseCode, responseBody, resHeader);
}

function mockDelRequest(path, responseCode, responseBody, delay) {
  nock(baseUrl)
    .delete("/3.0/projects/" + keenHelper.projectId + path)
    .delay(delay || 0)
    .reply(responseCode, responseBody, resHeader);
}
