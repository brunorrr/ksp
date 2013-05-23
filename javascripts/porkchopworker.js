// Generated by CoffeeScript 1.3.3
(function() {
  var HEIGHT, WIDTH;

  importScripts('numeric-1.2.6.min.js');

  importScripts('quaternion.js');

  importScripts('orbit.js');

  WIDTH = 300;

  HEIGHT = 300;

  this.onmessage = function(event) {
    var arrivalTime, deltaV, deltaVs, departureTime, destinationOrbit, dt, earliestArrival, earliestDeparture, finalOrbitalVelocity, i, initialOrbitalVelocity, lastProgress, maxDeltaV, minDeltaV, n1, n2, now, originOrbit, originPositions, originVelocities, p1, p2, referenceBody, transfer, trueAnomaly, v1, v2, x, xResolution, y, yResolution, _i, _j, _k;
    originOrbit = Orbit.fromJSON(event.data.originOrbit);
    initialOrbitalVelocity = event.data.initialOrbitalVelocity;
    destinationOrbit = Orbit.fromJSON(event.data.destinationOrbit);
    finalOrbitalVelocity = event.data.finalOrbitalVelocity;
    earliestDeparture = event.data.earliestDeparture;
    earliestArrival = event.data.earliestArrival;
    xResolution = event.data.xScale / WIDTH;
    yResolution = event.data.yScale / HEIGHT;
    referenceBody = originOrbit.referenceBody;
    n1 = originOrbit.normalVector();
    n2 = destinationOrbit.normalVector();
    originPositions = [];
    originVelocities = [];
    for (x = _i = 0; 0 <= WIDTH ? _i < WIDTH : _i > WIDTH; x = 0 <= WIDTH ? ++_i : --_i) {
      departureTime = earliestDeparture + x * xResolution;
      trueAnomaly = originOrbit.trueAnomalyAt(departureTime);
      originPositions[x] = originOrbit.positionAtTrueAnomaly(trueAnomaly);
      originVelocities[x] = originOrbit.velocityAtTrueAnomaly(trueAnomaly);
    }
    deltaVs = new Float64Array(WIDTH * HEIGHT);
    i = 0;
    minDeltaV = Infinity;
    maxDeltaV = 0;
    lastProgress = 0;
    for (y = _j = 0; 0 <= HEIGHT ? _j < HEIGHT : _j > HEIGHT; y = 0 <= HEIGHT ? ++_j : --_j) {
      arrivalTime = earliestArrival + ((HEIGHT - 1) - y) * yResolution;
      trueAnomaly = destinationOrbit.trueAnomalyAt(arrivalTime);
      p2 = destinationOrbit.positionAtTrueAnomaly(trueAnomaly);
      v2 = destinationOrbit.velocityAtTrueAnomaly(trueAnomaly);
      for (x = _k = 0; 0 <= WIDTH ? _k < WIDTH : _k > WIDTH; x = 0 <= WIDTH ? ++_k : --_k) {
        departureTime = earliestDeparture + x * xResolution;
        if (arrivalTime <= departureTime) {
          deltaVs[i++] = NaN;
          continue;
        }
        p1 = originPositions[x];
        v1 = originVelocities[x];
        dt = arrivalTime - departureTime;
        transfer = Orbit.ballisticTransfer(referenceBody, departureTime, p1, v1, n1, arrivalTime, p2, v2, n2, initialOrbitalVelocity, finalOrbitalVelocity);
        deltaVs[i++] = deltaV = transfer.deltaV;
        minDeltaV = Math.min(deltaV, minDeltaV);
        maxDeltaV = Math.max(deltaV, maxDeltaV);
      }
      now = Date.now();
      if (now - lastProgress > 100) {
        postMessage({
          progress: (y + 1) / HEIGHT
        });
        lastProgress = now;
      }
    }
    try {
      return postMessage({
        deltaVs: deltaVs.buffer,
        minDeltaV: minDeltaV,
        maxDeltaV: maxDeltaV
      }, [deltaVs.buffer]);
    } catch (error) {
      if (error instanceof TypeError) {
        return postMessage({
          deltaVs: deltaVs.buffer,
          minDeltaV: minDeltaV,
          maxDeltaV: maxDeltaV
        });
      } else {
        throw error;
      }
    }
  };

}).call(this);
