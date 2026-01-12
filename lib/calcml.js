function cz(zodiacPoint) {
    let diamondsNeeded = 0;
  
    if (zodiacPoint < 50) {
      diamondsNeeded = Math.ceil(2000 / (1 - zodiacPoint / 100));
    } else {
      diamondsNeeded = Math.ceil(2000 * (1 - zodiacPoint / 100));
    }
  
    return diamondsNeeded;
  }
  
  
  //menghitung winrate
  function cwr(tMatch, tWr, wrReq) {
    let tLose = tMatch * (100 - tWr) / 100;
    let seratusPersen = tLose * (100 / (100 - wrReq));
    let final = seratusPersen - tMatch;
    return Math.round(final);
  }

  module.exports = {
    cwr,
    cz
  }