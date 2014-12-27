module.exports = function(){
  return "undefined" == typeof window ? "server" : "browser";
};
