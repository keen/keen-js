module.exports = function(){

  if (typeof process.env.AWS_KEY !== "undefined") {
    this.key = process.env.AWS_KEY;
  }

  if (typeof process.env.AWS_SECRET !== "undefined") {
    this.secret = process.env.AWS_SECRET;
  }

  this.bucket = 'keen-js';

  return this;
};
