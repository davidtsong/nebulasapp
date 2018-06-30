'use strict';

var OddEven = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.balance = new BigNumber(o.balance);
    this.expiryHeight = new BigNumber(o.expiryHeight);
  } else {
    this.balance = new BigNumber(0);
    this.expiryHeight = new BigNumber(0);
  }
};

OddEven.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var VaultContract = function () {
  LocalContractStorage.defineMapProperty(this, "bankVault", {
    parse: function (text) {
      return new OddEven(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

// save value to contract, only after height of block, users can withdraw
VaultContract.prototype = {
  init: function () {

    var deposit = new OddEven();
    deposit.balance = 0;
    deposit.expiryHeight = 0;
    this.bankVault.put("n1TwbMdTSjcNRda1DjLCQ9J9wFzzqXQ1A28", deposit);
  },
  bet: function(guess){
    var address = Blockchain.transaction.from;
    var amount = Blockchain.transaction.value;
    var from = "n1TwbMdTSjcNRda1DjLCQ9J9wFzzqXQ1A28";
    var bk_height = new BigNumber(Blockchain.block.height);
    var i = new BigNumber(parseInt(Math.random()*10));
    var orig_deposit = this.bankVault.get(from);
    var deposit = this.bankVault.get(from);

    Event.Trigger("guess", guess);
    if((i % 2 == 0 && guess == "Even") || (i % 2 == 1 && guess == "Odd"))
    {
        if (!deposit) {
          throw new Error("No deposit before.");
        }
        //
        // if (bk_height.lt(deposit.expiryHeight)) {
        //   throw new Error("Can not takeout before expiryHeight.");
        // }
        var reward = new BigNumber(amount * 2);

        if (reward.gt(deposit.balance)) {
          throw new Error("Insufficient balance.");
        }

        // var result = Blockchain.transfer(from, amount);
        // if (!result) {
        //   throw new Error("transfer failed.");
        // }


        deposit.balance = orig_deposit.balance.sub(reward);
        this.bankVault.put("n1TwbMdTSjcNRda1DjLCQ9J9wFzzqXQ1A28", deposit);

        // Event.Trigger("BankVault", {
        //   Transfer: {
        //     from: Blockchain.transaction.to,
        //     to: address,
        //     value: reward.toString()
        //   }
        // });
        Blockchain.transfer(address, reward.toString());
        Event.Trigger("message", "Cool good guess new bal: " + deposit.balance + " lost : " + reward + " " + guess) ;

    }
    else
    {
      amount = amount.plus(orig_deposit.balance);
      deposit.balance = amount;
      this.bankVault.put("n1TwbMdTSjcNRda1DjLCQ9J9wFzzqXQ1A28", deposit);
      Event.Trigger("message", "Sorry wrong guess, new bal: " + deposit.balance + " gained : " + amount + " " + guess);
    }
  },
  save: function (height) {
    var from = Blockchain.transaction.from;
    var value = Blockchain.transaction.value;
    var bk_height = new BigNumber(Blockchain.block.height);

    var orig_deposit = this.bankVault.get("n1TwbMdTSjcNRda1DjLCQ9J9wFzzqXQ1A28");
    if (orig_deposit) {
      value = value.plus(orig_deposit.balance);
    }

    var deposit = new OddEven();
    deposit.balance = value;
    deposit.expiryHeight = bk_height.plus(height);
    Event.Trigger("message", "new balance is " + deposit.balance + " added " + value);
    this.bankVault.put("n1TwbMdTSjcNRda1DjLCQ9J9wFzzqXQ1A28", deposit);
  },

  takeout: function () {
    var from = Blockchain.transaction.from;

    var deposit = this.bankVault.get("n1TwbMdTSjcNRda1DjLCQ9J9wFzzqXQ1A28");

    var result = Blockchain.transfer("n1TwbMdTSjcNRda1DjLCQ9J9wFzzqXQ1A28", deposit.balance);
    if (!result) {
      throw new Error("transfer failed.");
    }
    Event.Trigger("bankVault", {
      Transfer: {
        from: Blockchain.transaction.to,
        to: "n1TwbMdTSjcNRda1DjLCQ9J9wFzzqXQ1A28",
        value: deposit.balance
      }
    });
    deposit.balance = deposit.balance.sub(deposit.balance);
    this.bankVault.put(from, deposit);
  },
  balanceOf: function () {
    var from = Blockchain.transaction.from;
    return this.bankVault.get(from);
  },
  verifyAddress: function (address) {
    // 1-valid, 0-invalid
    var result = Blockchain.verifyAddress(address);
    return {
      valid: result == 0 ? false : true
    };
  }
};
module.exports = VaultContract;
