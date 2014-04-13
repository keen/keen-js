module.exports = function(){
  
  this.username = 'keen-js';
  this.urls = [
    'http://127.0.0.1:9999/ie-legacy/',
    'http://127.0.0.1:9999/ie-legacy/'
  ];
  
  if (typeof process.env.SAUCE_ACCESS_KEY !== "undefined") {
    this.key = process.env.SAUCE_ACCESS_KEY;
  }
	  
  this.browsers = [
    {
      browserName: "internet explorer",
      platform: "WINDOWS 7",
      version: "8"
    },
    {
      browserName: "internet explorer",
      platform: "WINDOWS XP",
      version: "8"
    },
    {
      browserName: "internet explorer",
      platform: "WINDOWS XP",
      version: "7"
    },
    {
      browserName: "internet explorer",
      platform: "WINDOWS XP",
      version: "6"
    }
  ];
  
  return this;
};