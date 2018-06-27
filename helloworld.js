class HelloWorld{
  constructor(){
    LocalContractStorage.defineProperties(this, {
      visitor: null
    });
  }
  init(visitor)
  {
    this.visitor = visitor;
  }
  greetings(city)
  {
    Event.Trigger("greetings", "Here is " + city + ". Hello World! By " + this.visitor + ".")
  }
  who() {
    return this.visitor;
  }
}

module.exports = HelloWorld;
