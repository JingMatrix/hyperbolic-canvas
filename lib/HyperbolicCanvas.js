;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }
  window.HyperbolicCanvas.canvases = [];

  window.HyperbolicCanvas.ready = function () {
    Array.prototype.forEach.call(document.getElementsByClassName("hyperbolic-canvas"), function (el) {
      new Canvas(el);
    });
    //
    //
    HyperbolicCanvas.test();
    //
    //
  };

  // Math convenience variables
  // TODO standardize
  var PI = Math.PI;
  var TAU = Math.TAU = 2 * PI;

  var Point = window.HyperbolicCanvas.Point;

  var Line = window.HyperbolicCanvas.Line;

  var Circle = window.HyperbolicCanvas.Circle;

  var Polygon = window.HyperbolicCanvas.Polygon;

  var Canvas = window.HyperbolicCanvas.Canvas = function (el) {
    this.el = el;
    this.appendChildren();
    this.resize();

    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = '#DD4814';
    this.ctx.strokeStyle = '#DD4814';

    // if (this.hasClass('hyperbolic-canvas-autoresize')) {
    //   this.sensor = new ResizeSensor(this.el, this.resize.bind(this));
    // }

    HyperbolicCanvas.canvases.push(this);
  };

  Canvas.prototype.appendChildren = function () {
    this.viewport = document.createElement('div');
    this.canvas = document.createElement('canvas');

    this.viewport.className = 'viewport';
    this.viewport.style.height = this.viewport.style.width = '100%';
    this.canvas.style.display = 'block';
    this.canvas.width = this.canvas.height = 0;

    this.el.appendChild(this.viewport);
    this.viewport.appendChild(this.canvas);
  };

  Canvas.prototype.hasClass = function (className) {
    if (this.el.classList) {
      return this.el.classList.contains(className);
    } else {
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(this.el.className);
    }
  };

  Canvas.prototype.resize = function () {
    this.viewport.style["max-width"] = this.viewport.style["max-height"] = null;

    var w = this.viewport.clientWidth;
    var h = this.viewport.clientHeight;
    this.diameter = w > h ? h : w;
    this.radius =  this.diameter / 2;

    this.canvas.width = this.canvas.height = this.diameter;
    this.viewport.style["max-width"] = this.viewport.style["max-height"] = "" + (this.diameter) + "px";
    this.canvas.style["border-radius"] = "" + Math.floor(this.radius) + "px";
  };

  Canvas.prototype.setFillStyle = function (style) {
    this.ctx.fillStyle = style;
  };

  Canvas.prototype.setStrokeStyle = function (style) {
    this.ctx.strokeStyle = style;
  };

  Canvas.prototype.at = function (loc) {
    if (loc.__proto__ === Point.prototype) {
      // scale up
      var x = (loc.x + 1) * this.radius;
      var y = (loc.y + 1) * this.radius;
      return [x, this.diameter - y];
    } else if (loc.__proto__ === Array.prototype) {
      // scale down
      return new Point({ x: loc[0] / this.radius - 1, y: (this.diameter - loc[1]) / this.radius - 1 });
    }
    // TODO maybe accept (number, number, boolean)
  };

  Canvas.prototype.polarAt = function () {

  };

  Canvas.prototype.drawLineThroughIdealPoints = function (t1, t2) {

  };

  Canvas.prototype.drawLine = function (l, infinite) {
    var c = l.arcCircle();

    if (!c) {
      var p0 = this.at(l.p0);
      var p1 = this.at(l.p1);
      this.ctx.beginPath();
      this.ctx.moveTo(p0[0], p0[1]);
      this.ctx.lineTo(p1[0], p1[1]);
      this.ctx.stroke();
      this.ctx.closePath();
      return;
    }
    var centerScaled = this.at(c.center);
    var a0, a1;

    if (infinite) {
      a0 = 0;
      a1 = TAU;
    } else {
      a0 = (-1 * (c.angleAt(l.p0)) + TAU) % TAU;
      a1 = (-1 * (c.angleAt(l.p1)) + TAU) % TAU;
    }
    this.ctx.beginPath();
    this.ctx.arc(centerScaled[0], centerScaled[1], c.radius * this.radius, a0 < a1 ? a0 : a1, a0 < a1 ? a1 : a0, Math.abs(a0 - a1) > PI);
    this.ctx.stroke();
    this.ctx.closePath();
  };

  Canvas.prototype.drawNGon = function (n, center, radius, rotation) {
    if (n < 3){
      return false;
    }
    var direction = rotation || 0;
    var increment = TAU / n;
    var vertices = [];
    for (var i = 0; i < n; i++) {
      vertices.push(center.distantPoint(radius, direction));
      direction += increment;
    }
    return this.drawPolygon(vertices);
  };

  Canvas.prototype.drawPolygon = function (vertices) {
    var n = vertices.length;
    if (n < 3){
      return false;
    }
    for (var i = 0; i < n; i++) {
      this.drawLine(Line.pointPoint(vertices[i], vertices[(i + 1) % n]));
    }
    return true;
  };

  Canvas.prototype.fillPolygon = function (vertices) {
    var n = vertices.length;
    if (n < 3){
      return false;
    }
    this.ctx.beginPath();
    var start = this.at(vertices[0])
    this.ctx.moveTo(start[0], start[1]);

    for (var i = 0; i < n; i++) {
      var l = Line.pointPoint(vertices[i], vertices[(i + 1) % n]);
      var p0 = this.at(l.p0);
      var p1 = this.at(l.p1);
      var c = l.arcCircle();
      if (!c) {
        this.ctx.lineTo(p1[0], p1[1]);
      } else {
        var control = this.at(Line.intersect(c.tangentAt(l.p0), c.tangentAt(l.p1)));
        this.ctx.arcTo(control[0], control[1], p1[0], p1[1], c.radius * this.radius);
      }
    }
    this.ctx.fill();
    this.ctx.closePath();
    return true;
  };

  Canvas.prototype.drawCircle = function (c, r) {
    // TODO hyperbolic circle (has center offset)
    //find point c
    //find point r closer and r farther from Circle.UNIT.center
    //average those 2 points, get center
  };

  Canvas.prototype.tesselate = function () {
    // TODO tesselate the entire plane with n-gons
  };


  if (document.readyState != 'loading'){
    window.HyperbolicCanvas.ready();
  } else {
    document.addEventListener('DOMContentLoaded', window.HyperbolicCanvas.ready);
  }
})();