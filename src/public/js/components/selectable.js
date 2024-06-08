const Selectable = function (element, options = {}) {
  const defaultOptions = {
    onSelect: () => {},
    onUnselect: () => {},
  };
  this.options = { ...defaultOptions, ...options };
  this.element = element;

  this.reset();

  const self = this;
  element.addEventListener(
    "DOMNodeInserted",
    function () {
      if (self.timeout) clearTimeout(self.timeout);
      self.timeout = setTimeout(() => {
        self.reset();
      }, 100);
    },
    false
  );
};

Selectable.prototype.reset = function () {
  if (this.items !== undefined) {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      item.removeEventListener("click", this.select);
    }
  }
  this.items = this.element.querySelectorAll(this.element.dataset.selectable);
  if (this.items.length === 0) return;
  for (let i = 0; i < this.items.length; i++) {
    const item = this.items[i];
    item.addEventListener("click", this.select.bind(this, item));
    item.classList.add("selected");
    if (this.options.onSelect) this.options.onSelect(item);
  }
};

Selectable.prototype.select = function (item) {
  if (item.classList.contains("selected")) {
    item.classList.remove("selected");
    item.classList.add("not-selected");
    if (this.options.onUnselect) this.options.onUnselect(item);
  } else {
    item.classList.add("selected");
    item.classList.remove("not-selected");
    if (this.options.onSelect) this.options.onSelect(item);
  }
};

Selectable.prototype.getResults = function () {
  var results = {};
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    results[item.dataset.id] = item.classList.contains("selected");
  }
  return results;
};
