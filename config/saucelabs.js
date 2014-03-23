module.exports = function(){
  
  this.username = 'keen-js';
  this.urls = ['http://127.0.0.1:9999/index.html'];
  
  if (typeof process.env.SAUCE_ACCESS_KEY !== "undefined") {
    this.key = process.env.SAUCE_ACCESS_KEY;
  }
	  
  this.browsers = [
  
    /* FIREFOX */
    /*{
      browserName: "firefox",
      platform: "OS X 10.9"
    },*/
    {
      browserName: "firefox",
      platform: "OS X 10.6"
    },
    {
      browserName: "firefox",
      platform: "Linux"
    },
    {
      browserName: 'firefox',
      platform: 'Windows 8.1',
      version: '27'
    },
    {
      browserName: 'firefox',
      platform: 'Windows 8',
      version: '27'
    },
    {
      browserName: "firefox",
      platform: "Windows 7",
      version: '27'
    },
    {
      browserName: "firefox",
      platform: "Windows XP",
      version: '27'
    }, 
    
    
    
    /* CHROME */
    /*{
      browserName: "chrome",
      platform: "OS X 10.9"
    },*/
    {
      browserName: "chrome",
      platform: "OS X 10.8"
    },
    {
      browserName: "chrome",
      platform: "OS X 10.6"
    },
    {
      browserName: 'chrome',
      platform: 'Windows 8.1'
    },
    {
      browserName: 'chrome',
      platform: 'Windows 8'
    },
    {
      browserName: "chrome",
      platform: "Windows 7"
    }, 
    {
      browserName: "chrome",
      platform: "XP"
    }, 
    {
      browserName: "chrome",
      platform: "linux"
    }, 
    
    
    /* SAFARI */
    /*{
      browserName: "safari",
      platform: "OS X 10.9",
      version: "7"
    },*/
    {
      browserName: "safari",
      platform: "OS X 10.8",
      version: "6"
    },
    {
      browserName: "safari",
      platform: "OS X 10.6",
      version: "5"
    },
    
    
    
    /* Internet Explorer */
    
    {
      browserName: "internet explorer",
      platform: "Windows 8.1",
      version: "11"
    }, 
    {
      browserName: "internet explorer",
      platform: "Windows 8",
      version: "10"
    }, 
    
    
    {
      browserName: "internet explorer",
      platform: "WINDOWS 7",
      version: "11"
    },
    {
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '10'
    },
    {
      browserName: "internet explorer",
      platform: "WINDOWS 7",
      version: "9"
    },
    /*
    {
      browserName: "internet explorer",
      platform: "WINDOWS 7",
      version: "8"
    },*/
    
    {
      browserName: "internet explorer",
      platform: "VISTA",
      version: "10"
    }
    
    
    /*
    Errors
    
    // IE on XP
    
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
    
    */
  ];
  
  return this;
};