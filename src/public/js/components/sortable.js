const Sortable = function (element, options = {}) {
  const defaultOptions = {
    draggable: true,
  };
  this.options = { ...defaultOptions, ...options };
  this.scrollable = window.document.body;
  this.element = element;
  this.element.style.position = "relative";
  this.element.style.webkitTouchCallout = "none";
  this.element.style.webkitUserSelect = "none";
  this.reset();
  const self = this;

  element.addEventListener(
    "DOMNodeInserted",
    function () {
      self.reset();
    },
    false
  );
  element.addEventListener(
    "DOMNodeRemoved",
    function () {
      self.reset();
    },
    false
  );

  window.addEventListener("resize", function () {
    self.reset();
  });

  interact(this.element.dataset.sortable, {
    context: this.element,
  })
    .draggable({
      inertia: false,
      manualStart: false,
      autoScroll: {
        container: this.scrollable === window.document.body ? null : this.scrollable,
        margin: 50,
        speed: 600,
      },
      onmove: function (event) {
        if (self.options.draggable) {
          self.move(event);
        }
      },
    })
    .off("dragstart")
    .off("dragend")
    .off("hold")
    .on("dragstart", function (e) {
      if (self.options.draggable) {
        var r = e.target.getBoundingClientRect();
        e.target.classList.add("dragging");
        e.target.style.transitionDuration = "0s";
        self.startPosition = e.target.dataset.position;
        self.offset = {
          x: e.clientX - r.left,
          y: e.clientY - r.top,
        };
        self.scrollTopStart = self.scrollable.scrollTop;
      }
    })
    .on("dragend", function (e) {
      if (self.options.draggable) {
        e.target.classList.remove("dragging");
        e.target.style.transitionDuration = null;
        self.moveItem(e.target, e.target.dataset.position);
      }
    })
    .on("hold", function (e) {
      if (self.options.draggable) {
        if (!e.interaction.interacting()) {
          e.interaction.start(
            {
              name: "drag",
            },
            e.interactable,
            e.currentTarget
          );
        }
      }
    });
};

Sortable.prototype.reset = function () {
  this.items = this.element.querySelectorAll(this.element.dataset.sortable);
  if (this.items.length === 0) return;
  for (let i = 0; i < this.items.length; i++) {
    const item = this.items[i];
    item.style.position = "absolute";
    item.style.top = "0px";
    item.style.left = "0px";
    item.style.transitionDuration = "0s";
  }
  let rect = this.items[0].getBoundingClientRect();
  this.item_width = Math.floor(rect.width);
  for (let i = 0; i < this.items.length; i++) {
    this.items[i].style.minHeight = `${this.item_width * 1.5}px`;
  }
  rect = this.items[0].getBoundingClientRect();
  this.item_height = Math.floor(rect.height);
  this.cols = Math.floor(this.element.offsetWidth / this.item_width);
  for (let i = 0; i < this.items.length; i++) {
    const item = this.items[i];
    this.moveItem(item, item.dataset.position);
  }
  this.element.style.height = `${Math.ceil(this.items.length / this.cols) * this.item_height}px`;
  const self = this;

  window.setTimeout(function () {
    for (var i = 0; i < self.items.length; i++) {
      var item = self.items[i];
      item.style.transitionDuration = null;
    }
  }, 100);
};

Sortable.prototype.getXY = function (position) {
  let x = this.item_width * (position % this.cols);
  let y = this.item_height * Math.floor(position / this.cols);
  return { x: x, y: y };
};

Sortable.prototype.move = function (e) {
  var p = this.getXY(this.startPosition);
  var x = p.x + e.clientX - e.clientX0;
  var y = p.y + e.clientY - e.clientY0 + this.scrollable.scrollTop - this.scrollTopStart;
  e.target.style.transform = "translate3D(" + x + "px, " + y + "px, 0)";
  var oldPosition = parseInt(e.target.dataset.position, 10);
  var newPosition = this.guessPosition(x + this.offset.x, y + this.offset.y);
  if (oldPosition !== newPosition) {
    this.swap(oldPosition, newPosition);
    e.target.dataset.position = newPosition;
  }
  this.guessPosition(x, y);
};

Sortable.prototype.guessPosition = function (x, y) {
  var col = Math.floor(x / this.item_width);
  if (col >= this.cols) {
    col = this.cols - 1;
  }
  if (col <= 0) {
    col = 0;
  }
  var row = Math.floor(y / this.item_height);
  if (row < 0) {
    row = 0;
  }
  var position = col + row * this.cols;
  if (position >= this.items.length) {
    return this.items.length - 1;
  }
  return position;
};

Sortable.prototype.swap = function (start, end) {
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    if (!item.classList.contains("is-dragged")) {
      var position = parseInt(item.dataset.position, 10);
      if (position >= end && position < start && end < start) {
        this.moveItem(item, position + 1);
      } else if (position <= end && position > start && end > start) {
        this.moveItem(item, position - 1);
      }
    }
  }
};

Sortable.prototype.moveItem = function (item, position) {
  let p = this.getXY(position);
  item.dataset.position = position;
  item.style.transform = `translate(${p.x}px, ${p.y}px)`;
};

Sortable.prototype.getResults = function (mapping = (value) => value) {
  var results = {};
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    results[item.dataset.position] = mapping(item.dataset.id);
  }
  return results;
};
