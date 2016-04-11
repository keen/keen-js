// -------------------------
// Common modules
// -------------------------
require("./modules/core/client-spec");
require("./modules/core/events-spec");
require("./modules/core/query-spec");
require("./modules/dataset/dataset-spec");

// -------------------------
// Browser-specific modules
// -------------------------
require("./modules/core/tracker/browser-spec");
require("./modules/core/request/browser-spec");
require("./modules/dataviz/dataviz-spec");
require("./modules/dataviz/parseRawData-spec");

require("./modules/dataviz/adapters/get-setup-template-test");
