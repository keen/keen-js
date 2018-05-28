import KeenLibrary from './index.js';
import { Dataviz, Dataset } from 'keen-dataviz';

const env = typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

export const extendKeenGlobalObject = function(env) {
  env.Keen = KeenLibrary;
  env.Keen.Dataset = Dataset;
  env.Keen.Dataviz = Dataviz;
};

if (
     (typeof KEEN_GLOBAL_OBJECT !== 'undefined'
      && KEEN_GLOBAL_OBJECT)
     || typeof KEEN_EXPOSE_AS_GLOBAL_OBJECT !== 'undefined'
   ) {
  extendKeenGlobalObject(env);
}

module.exports = {
  default: KeenLibrary,
  Keen: KeenLibrary,
  Dataviz,
  Dataset,
};
