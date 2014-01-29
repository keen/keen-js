var Keen = Keen || {
    configure:function (config) {
        this._cf = config;
    },
    addEvent:function (eventCollection, event, success, error) {
        this._eq = this._eq || [];
        this._eq.push([eventCollection, event, success, error]);
    },
    setGlobalProperties:function (newGlobalProperties) {
        this._gp = newGlobalProperties;
    },
    onChartsReady:function (handler) {
        this._ocrq = this._ocrq || [];
        this._ocrq.push(handler);
    }
};

(function () {
    var keen = document.createElement('script');
    keen.type = 'text/javascript';
    keen.async = true;
    keen.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'cloudfront.keen.io/code/keen-2.1.1-min.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(keen, s);
})();

Keen.configure({
    projectId: "your_project_id",
    writeKey: "your_write_key",
    readKey: "your_read_key"
});