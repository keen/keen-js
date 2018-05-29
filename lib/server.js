import { Dataviz, Dataset } from 'keen-dataviz';
import KeenLibrary from './index';

const env = typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {};

const extendKeenGlobalObject = function(env) {
  env.Keen = Keen;
};

if (
     (typeof KEEN_GLOBAL_OBJECT !== 'undefined'
      && KEEN_GLOBAL_OBJECT)
     || typeof KEEN_EXPOSE_AS_GLOBAL_OBJECT !== 'undefined'
   ) {
  extendKeenGlobalObject(env);
}

const Keen = KeenLibrary;
Keen.Dataviz = Dataviz;
Keen.Dataset = Dataset;

module.exports = {
  default: Keen,
  Keen,
  Dataviz,
  Dataset,
};
