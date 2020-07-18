const LOG =(error) => {
  const fs = require('fs');

  var dir = './LogFiles';

  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }

  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1;
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();

  var fileName = year + "/" + month + "/" + day;

  var content=dateObj.toString().replace(/T/, ':').replace(/\.\w*/, '')+'\t'+error.toString()+'\n\n'

  fs.appendFile('dir/'+fileName,content,function (err) {if (err) throw err;})

};

module.exports = { LOG: LOG };
