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

  },
  bet: function(guess){
    var address = Blockchain.transaction.from;
    var amount = Blockchain.transaction.value;
    var from = Blockchain.transaction.from;
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

        if (amount.gt(deposit.balance)) {
          throw new Error("Insufficient balance.");
        }

        // var result = Blockchain.transfer(from, amount);
        // if (!result) {
        //   throw new Error("transfer failed.");
        // }
        var reward = new BigNumber(amount * .05);
        deposit.balance = deposit.balance.sub(amount + reward);
        this.bankVault.put(from, deposit);
        Event.Trigger("message", "Cool good guess new bal: " + deposit.balance + " lost : " + reward + " " + guess) ;

        Event.Trigger("BankVault", {
          Transfer: {
            from: Blockchain.transaction.to,
            to: address,
            value: reward
          }
        });
    }
    else
    {
      amount = amount.plus(orig_deposit.balance);
      deposit.balance = amount;
      this.bankVault.put(from, deposit);
      Event.Trigger("message", "Sorry wrong guess, new bal: " + deposit.balance + " gained : " + amount + " " + guess);
    }
  },
  save: function (height) {
    var from = Blockchain.transaction.from;
    var value = Blockchain.transaction.value;
    var bk_height = new BigNumber(Blockchain.block.height);

    var orig_deposit = this.bankVault.get(from);
    if (orig_deposit) {
      value = value.plus(orig_deposit.balance);
    }

    var deposit = new OddEven();
    deposit.balance = value;
    deposit.expiryHeight = bk_height.plus(height);
    Event.Trigger("message", "new balance is " + deposit.balance + " added " + value);
    this.bankVault.put(from, deposit);
  },

  takeout: function (value) {
    var from = Blockchain.transaction.from;
    var bk_height = new BigNumber(Blockchain.block.height);
    var amount = new BigNumber(value);

    var deposit = this.bankVault.get(from);
    if (!deposit) {
      throw new Error("No deposit before.");
    }

    if (bk_height.lt(deposit.expiryHeight)) {
      throw new Error("Can not takeout before expiryHeight.");
    }

    if (amount.gt(deposit.balance)) {
      throw new Error("Insufficient balance.");
    }

    var result = Blockchain.transfer(from, amount);
    if (!result) {
      throw new Error("transfer failed.");
    }
    Event.Trigger("BankVault", {
      Transfer: {
        from: Blockchain.transaction.to,
        to: n1EnqPRkPNdxuPmepNmPqPxU4T1prod9EK9,
        value: amount.toString()
      }
    });

    deposit.balance = deposit.balance.sub(amount);
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
