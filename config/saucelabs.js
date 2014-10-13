module.exports = function(){

  this.username = 'keenlabs-js';

  this.key = process.env.SAUCE_ACCESS_KEY;
  this.buildID = process.env.TRAVIS_JOB_ID;

  this.urls = ['http://127.0.0.1:9999/index.html'];
  this.concurrency = 2;
  this.maxRetries = 2;
  this.maxDuration = 120;

  this.additionalConfig = {
    'record-video': false,
    'video-upload-on-pass': false,
    'record-screenshots': false
  };

  this.browsers = [

    /* FIREFOX */
    {
      browserName: "firefox",
      platform: "OS X 10.9",
      version: "beta"
    },
    {
      browserName: 'firefox',
      platform: 'Windows 8.1',
      version: "beta"
    },
    {
      browserName: 'firefox',
      platform: 'Windows 8',
      version: "beta"
    },

    {
      browserName: "firefox",
      platform: "OS X 10.9"
    },
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
      platform: 'Windows 8.1'
    },
    {
      browserName: 'firefox',
      platform: 'Windows 8'
    },
    {
      browserName: "firefox",
      platform: "Windows 7"
    },
    {
      browserName: "firefox",
      platform: "Windows XP"
    },



    /* CHROME */

    {
      browserName: "chrome",
      platform: "OS X 10.8",
      version: "beta"
    },
    {
      browserName: "chrome",
      platform: "Windows 8.1",
      version: "beta"
    },
    {
      browserName: "chrome",
      platform: "Windows 8",
      version: "beta"
    },


    {
      browserName: "chrome",
      platform: "OS X 10.9"
    },
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
      platform: "Windows XP"
    },
    {
      browserName: "chrome",
      platform: "Linux"
    },


    /* SAFARI */
    {
      browserName: "safari",
      platform: "OS X 10.9",
      version: "7"
    },
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

    // Testing framework not supported :\

    // {
    //   browserName: "internet explorer",
    //   platform: "WINDOWS 7",
    //   version: "8"
    // }

    // {
    //   browserName: "internet explorer",
    //   platform: "Windows XP",
    //   version: "8"
    // },
    // {
    //   browserName: "internet explorer",
    //   platform: "Windows XP",
    //   version: "7"
    // },
    // {
    //   browserName: "internet explorer",
    //   platform: "Windows XP",
    //   version: "6"
    // }

    /* iOS */

    {
      browserName: "iphone",
      platform: "OS X 10.9",
      version: "7.1",
      deviceName: "iPhone"
    },
    {
      browserName: "iphone",
      platform: "OS X 10.9",
      version: "7.0",
      deviceName: "iPhone"
    },
    {
      browserName: "iphone",
      platform: "OS X 10.8",
      version: "6.1",
      deviceName: "iPhone"
    },
    {
      browserName: "iphone",
      platform: "OS X 10.8",
      version: "6.0",
      deviceName: "iPhone"
    },


    /* Android */

    {
      browserName: "android",
      platform: "Linux",
      version: "4.4"
    },
    // {
    //   browserName: "android",
    //   platform: "Linux",
    //   version: "4.4",
    //   deviceName: "Google Nexus 7 HD Emulator"
    // },
    // {
    //   browserName: "android",
    //   platform: "Linux",
    //   version: "4.4",
    //   deviceName: "LG Nexus 4 Emulator"
    // },

    {
      browserName: "android",
      platform: "Linux",
      version: "4.3"
    },

    // {
    //   browserName: "android",
    //   platform: "Linux",
    //   version: "4.2"
    // },
    // {
    //   browserName: "android",
    //   platform: "Linux",
    //   version: "4.2",
    //   deviceName: "Samsung Galaxy Tab 3 Emulator"
    // },

    {
      browserName: "android",
      platform: "Linux",
      version: "4.1"
    },
    // {
    //   browserName: "android",
    //   platform: "Linux",
    //   version: "4.1",
    //   deviceName: "Samsung Galaxy Note Emulator"
    // },
    //
    // {
    //   browserName: "android",
    //   platform: "Linux",
    //   version: "4.0",
    //   deviceName: "Motorola Droid 4 Emulator"
    // },
    // {
    //   browserName: "android",
    //   platform: "Linux",
    //   version: "4.0",
    //   deviceName: "Samsung Galaxy Nexus Emulator"
    // },
    // {
    //   browserName: "android",
    //   platform: "Linux",
    //   version: "4.0",
    //   deviceName: "Samsung Galaxy Note Emulator"
    // }


  ];

  return this;
};
