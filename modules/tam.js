const checkOutput = async (key) => {

    const sourceOutput=getFile(key).txt;
    const actualOutput="SAMPLE.txt";

    var fs=require('fs');
    var sourceContents=fs.readFileSync(sourceOutput,'utf-8').split();
    var actualContents=fs.readFileSync(actualOutput,'utf-8').split();

    for (let i = 0; i < sourceContents.length; i++) {
      for(let j=0; j < sourceContents[i].length; j++){
        if(sourceContents[i][j]!=actualContents[i][j]){
          return {
            status: 'Wrong',
            givenOutput: sourceContents[i],
            actualOutput: actualContents[i],
            line: i+1
          };
        }
      }
        
    }

    return {
      status: 'Correct',
      givenOutput: 'NA',
      actualOutput: 'NA',
      line: 0
    };

};
module.exports = { checkOutput: checkOutput };
