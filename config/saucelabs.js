module.exports = function(){
  
  this.username = 'larimer';
  this.urls = ['http://127.0.0.1:9999/index.html'];
  
  if (typeof process.env.SAUCE_ACCESS_KEY !== "undefined") {
	  this.key = process.env.SAUCE_ACCESS_KEY;
	}
	  
  this.browsers = [
    {
      browserName: "firefox",
      platform: "XP"
    }, 
    
    {
      browserName: "chrome",
      platform: "XP"
    }, 
    
    {
      browserName: "chrome",
      platform: "linux"
    }, 
    
    {
      browserName: 'internet explorer',
      platform: 'Windows 2012',
      version: '10'
    },
    
    {
      browserName: "internet explorer",
      platform: "WIN8",
      version: "10"
    }, 
    
    {
      browserName: 'internet explorer',
      platform: 'WIN7',
      version: '10'
    },
    
    {
      browserName: "internet explorer",
      platform: "VISTA",
      version: "10"
    },
    
    {
      browserName: "internet explorer",
      platform: "WINDOWS XP",
      version: "10"
    }
  ];
  
  return this;
};