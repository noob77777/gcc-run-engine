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

  const fileName = year + "-" + month + "-" + day + ".txt";
  //console.log(fileName);

  const content=dateObj.toString().replace(/T/, ':').replace(/\.\w*/, '')+"\t"+error.toString()+"\n\n";
  //console.log(content);


  //fs.open(dir+"/"+fileName, "w", (err) => {if (err) console.log(err);});
  fs.appendFile(dir+"/"+fileName,content,(err) => {});
  //console.log("write complete");

};

module.exports = { LOG: LOG };
