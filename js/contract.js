class OddEven{
  constructor(){
    LocalContractStorage.defineProperties(this, {
      guess: null
    });
  }
  init(guess)
  {
    this.guess = guess;
    var address = Blockchain.transaction.from;
    var value = Blockchain.transaction.value;
    //maybe even store a game?


    //generate random number
    var i = parseInt(Math.random()*10);
    //if even, give funds back * 1.9 to original address
    if((i % 2 == 0 && guess = "Even") || i % 2 == 1 && guess = "Odd")
    {
        //send funds back
        Blockchain.transfer(address, parseInt(value) + .05)
    }
    else
    {
      //return back you messed up
      Event.Trigger("message", "Sorry wrong guess");
    }
  }
  testMessage()
  {
    Event.Trigger("message", "Sorry wrong guess");
  }
  testSend()
  {
    Blockchain.transfer("n1EnqPRkPNdxuPmepNmPqPxU4T1prod9EK9", .0001);
  }
  info() {
    Event.Trigger("message", this.guess + " " + Blockchain.transaction.value + " " + Blockchain.transaction.from);
  }
}

module.exports = OddEven;
