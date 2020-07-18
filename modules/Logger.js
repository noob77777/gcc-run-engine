const LOG =(error) => {
  const fs = require('fs');

  const dir = './LogFiles';

  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }

  const dateObj = new Date();
  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate();
  const year = dateObj.getUTCFullYear();

  const fileName = year + "/" + month + "/" + day;

  const content=dateObj.toString().replace(/T/, ':').replace(/\.\w*/, '')+'\t'+error.toString()+'\n\n'

  fs.appendFile('dir/'+fileName,content,function (err) {})

};

module.exports = { LOG: LOG };
