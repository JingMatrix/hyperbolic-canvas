;
(function() {
if (typeof HyperbolicCanvas === 'undefined') {
  window.HyperbolicCanvas = {};
}
if (typeof HyperbolicCanvas.scripts === 'undefined') {
  window.HyperbolicCanvas.scripts = {};
}

HyperbolicCanvas.scripts['octagon'] = function(canvas) {
  var maxN = 4 * 7;
  var n = 8;
  var location = HyperbolicCanvas.Point.ORIGIN;
  var rotation = 0;
  var rotationInterval = Math.TAU / 30000;
  var radius = 3 * Math.pow(n / 8, 3);

  canvas.setContextProperties({fillStyle : '#DD4814'});

  var render = function(event) {
    canvas.clear();

    var polygon = HyperbolicCanvas.Polygon.givenHyperbolicNCenterRadius(
        n, location, base(radius), rotation);

    if (polygon) {
      var path = canvas.pathForHyperbolic(polygon);

      // polygon.getVertices().forEach(function (v) {
      //   var angle = location.hyperbolicAngleTo(v);
      //   path =
      //   canvas.pathForHyperbolic(HyperbolicCanvas.Polygon.givenHyperbolicNCenterRadius(
      //     n,
      //     location.hyperbolicDistantPoint(radius * 1.5, angle),
      //     radius / 2,
      //     angle + rotation
      //   ), { path2D: true, path: path });
      // });

      canvas.fillAndStroke(path);
      canvas.stroke(canvas.pathForHyperbolic(
          HyperbolicCanvas.Polygon.givenHyperbolicNCenterRadius(
              n, HyperbolicCanvas.Point.ORIGIN, radius, 0)))
    }
    rotation += rotationInterval;
    if (rotation > Math.TAU) {
      rotation -= Math.TAU;
    }
    requestAnimationFrame(render);
  };

  var base =
      function(radius) {
    const ct1 = Math.sqrt(Math.pow(1 - Math.cos(Math.TAU / n), 2) +
                          Math.pow(Math.sin(Math.TAU / n), 2));
    r = Math.tanh(radius / 2)
    // console.log(r)
    return Math.atanh(
        ct1 * r /
        Math.sqrt(Math.pow(1 - Math.cos(Math.TAU / n) * Math.pow(r, 2), 2) +
                  Math.pow(Math.sin(Math.TAU / n) * Math.pow(r, 2), 2)))
  }

  var resetLocation = function(event) {
    if (event) {
      x = event.clientX;
      y = event.clientY;
    }
    location = canvas.at([ x, y ]);
  };

  var incrementN = function() {
    n += 4;
    n %= maxN;
    n = n < 4 ? 4 : n;
  };

  var scroll = function(event) {
    radius += event.deltaY * .01;
    if (radius < .05) {
      radius = .05;
    } else if (radius > 20) {
      radius = 20;
    }
  };

  canvas.getCanvasElement().addEventListener('click', incrementN);
  canvas.getCanvasElement().addEventListener('mousemove', resetLocation);
  document.addEventListener('wheel', scroll);

  requestAnimationFrame(render);
};
})();
