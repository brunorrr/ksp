// Generated by CoffeeScript 1.3.3
(function() {
  var PLOT_HEIGHT, PLOT_WIDTH, PLOT_X_OFFSET, TIC_LENGTH, angleString, canvasContext, clamp, deltaVs, destinationOrbit, distanceString, durationString, earliestArrival, earliestDeparture, finalOrbitalVelocity, hourMinSec, i, initialOrbitalVelocity, kerbalDateString, numberWithCommas, originOrbit, palette, plotImageData, prepareCanvas, worker, xScale, yScale, _i, _j, _k, _l, _m;

  PLOT_WIDTH = 300;

  PLOT_HEIGHT = 300;

  PLOT_X_OFFSET = 70;

  TIC_LENGTH = 5;

  originOrbit = null;

  destinationOrbit = null;

  initialOrbitalVelocity = null;

  finalOrbitalVelocity = null;

  earliestDeparture = null;

  earliestArrival = null;

  xScale = null;

  yScale = null;

  deltaVs = null;

  canvasContext = null;

  plotImageData = null;

  palette = [];

  for (i = _i = 64; _i < 69; i = ++_i) {
    palette.push([64, i, 255]);
  }

  for (i = _j = 133; _j <= 255; i = ++_j) {
    palette.push([128, i, 255]);
  }

  for (i = _k = 255; _k >= 128; i = --_k) {
    palette.push([128, 255, i]);
  }

  for (i = _l = 128; _l <= 255; i = ++_l) {
    palette.push([i, 255, 128]);
  }

  for (i = _m = 255; _m >= 128; i = --_m) {
    palette.push([255, i, 128]);
  }

  clamp = function(n, min, max) {
    return Math.max(min, Math.min(n, max));
  };

  numberWithCommas = function(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  hourMinSec = function(t) {
    var hour, min, sec;
    hour = (t / 3600) | 0;
    t %= 3600;
    min = (t / 60) | 0;
    if (min < 10) {
      min = "0" + min;
    }
    sec = (t % 60).toFixed();
    if (sec < 10) {
      sec = "0" + sec;
    }
    return "" + hour + ":" + min + ":" + sec;
  };

  kerbalDateString = function(t) {
    var day, year;
    year = ((t / (365 * 24 * 3600)) | 0) + 1;
    t %= 365 * 24 * 3600;
    day = ((t / (24 * 3600)) | 0) + 1;
    t %= 24 * 3600;
    return "Year " + year + ", day " + day + " at " + (hourMinSec(t));
  };

  durationString = function(t) {
    var result;
    result = "";
    if (t >= 365 * 24 * 3600) {
      result += (t / (365 * 24 * 3600) | 0) + " years ";
      t %= 365 * 24 * 3600;
      if (t < 24 * 3600) {
        result += "0d";
      }
    }
    if (t >= 24 * 3600) {
      result += (t / (24 * 3600) | 0) + " days ";
    }
    t %= 24 * 3600;
    return result + hourMinSec(t);
  };

  distanceString = function(d) {
    if (d > 1e12) {
      return numberWithCommas((d / 1e9).toFixed()) + " Gm";
    } else if (d >= 1e9) {
      return numberWithCommas((d / 1e6).toFixed()) + " Mm";
    } else if (d >= 1e6) {
      return numberWithCommas((d / 1e3).toFixed()) + " km";
    } else {
      return numberWithCommas(d.toFixed()) + " m";
    }
  };

  angleString = function(angle, precision) {
    if (precision == null) {
      precision = 0;
    }
    return (angle * 180 / Math.PI).toFixed(precision) + String.fromCharCode(0x00b0);
  };

  worker = new Worker("javascripts/porkchopworker.js");

  worker.onmessage = function(event) {
    var color, colorIndex, ctx, deltaV, j, maxDeltaV, minDeltaV, relativeDeltaV, x, y, _n, _o, _p;
    if ('progress' in event.data) {
      return $('#porkchopProgress .bar').show().width((event.data.progress * 100 | 0) + "%");
    } else if ('deltaVs' in event.data) {
      $('#porkchopProgress .bar').hide().width("0%");
      deltaVs = new Float64Array(event.data.deltaVs);
      minDeltaV = event.data.minDeltaV;
      maxDeltaV = 4 * minDeltaV;
      i = 0;
      j = 0;
      for (y = _n = 0; 0 <= PLOT_HEIGHT ? _n < PLOT_HEIGHT : _n > PLOT_HEIGHT; y = 0 <= PLOT_HEIGHT ? ++_n : --_n) {
        for (x = _o = 0; 0 <= PLOT_WIDTH ? _o < PLOT_WIDTH : _o > PLOT_WIDTH; x = 0 <= PLOT_WIDTH ? ++_o : --_o) {
          deltaV = deltaVs[i++];
          relativeDeltaV = isNaN(deltaV) ? 1.0 : (clamp(deltaV, minDeltaV, maxDeltaV) - minDeltaV) / (maxDeltaV - minDeltaV);
          colorIndex = Math.min(relativeDeltaV * palette.length | 0, palette.length - 1);
          color = palette[colorIndex];
          plotImageData.data[j++] = color[0];
          plotImageData.data[j++] = color[1];
          plotImageData.data[j++] = color[2];
          plotImageData.data[j++] = 255;
        }
      }
      ctx = canvasContext;
      ctx.save();
      ctx.putImageData(plotImageData, PLOT_X_OFFSET, 0);
      ctx.font = '10pt "Helvetic Neue",Helvetica,Arial,sans serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'black';
      ctx.textBaseline = 'alphabetic';
      for (i = _p = 0; 0 <= 1.0 ? _p < 1.0 : _p > 1.0; i = _p += 0.25) {
        ctx.fillText(((minDeltaV + i * (maxDeltaV - minDeltaV)) | 0) + " m/s", PLOT_X_OFFSET + PLOT_WIDTH + 85, (1.0 - i) * PLOT_HEIGHT);
        ctx.textBaseline = 'middle';
      }
      ctx.textBaseline = 'top';
      ctx.fillText((maxDeltaV | 0) + " m/s", PLOT_X_OFFSET + PLOT_WIDTH + 85, 0);
      ctx.restore();
      return $('#porkchopSubmit').prop('disabled', false);
    }
  };

  prepareCanvas = function() {
    var ctx, j, paletteKey, x, y, _n, _o, _p, _q;
    ctx = canvasContext;
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(PLOT_X_OFFSET - 1, 0);
    ctx.lineTo(PLOT_X_OFFSET - 1, PLOT_HEIGHT + 1);
    ctx.lineTo(PLOT_X_OFFSET + PLOT_WIDTH, PLOT_HEIGHT + 1);
    ctx.stroke();
    ctx.beginPath();
    for (i = _n = 0; 0 <= 1.0 ? _n <= 1.0 : _n >= 1.0; i = _n += 0.25) {
      y = PLOT_HEIGHT * i + 1;
      ctx.moveTo(PLOT_X_OFFSET - 1, y);
      ctx.lineTo(PLOT_X_OFFSET - 1 - TIC_LENGTH, y);
      x = PLOT_X_OFFSET - 1 + PLOT_WIDTH * i;
      ctx.moveTo(x, PLOT_HEIGHT + 1);
      ctx.lineTo(x, PLOT_HEIGHT + 1 + TIC_LENGTH);
    }
    ctx.stroke();
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (i = _o = 0; 0 <= 1.0 ? _o <= 1.0 : _o >= 1.0; i = _o += 0.05) {
      if (i % 0.25 === 0) {
        continue;
      }
      y = PLOT_HEIGHT * i + 1;
      ctx.moveTo(PLOT_X_OFFSET - 1, y);
      ctx.lineTo(PLOT_X_OFFSET - 1 - TIC_LENGTH, y);
      x = PLOT_X_OFFSET - 1 + PLOT_WIDTH * i;
      ctx.moveTo(x, PLOT_HEIGHT + 1);
      ctx.lineTo(x, PLOT_HEIGHT + 1 + TIC_LENGTH);
    }
    ctx.stroke();
    ctx.font = 'italic 12pt "Helvetic Neue",Helvetica,Arial,sans serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    ctx.fillText("Departure Date (days from epoch)", PLOT_X_OFFSET + PLOT_WIDTH / 2, PLOT_HEIGHT + 40);
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.textBaseline = 'top';
    ctx.fillText("Arrival Date (days from epoch)", -PLOT_HEIGHT / 2, 0);
    ctx.restore();
    paletteKey = ctx.createImageData(20, PLOT_HEIGHT);
    i = 0;
    for (y = _p = 0; 0 <= PLOT_HEIGHT ? _p < PLOT_HEIGHT : _p > PLOT_HEIGHT; y = 0 <= PLOT_HEIGHT ? ++_p : --_p) {
      j = ((PLOT_HEIGHT - y - 1) * palette.length / PLOT_HEIGHT) | 0;
      for (x = _q = 0; _q < 20; x = ++_q) {
        paletteKey.data[i++] = palette[j][0];
        paletteKey.data[i++] = palette[j][1];
        paletteKey.data[i++] = palette[j][2];
        paletteKey.data[i++] = 255;
      }
    }
    ctx.putImageData(paletteKey, PLOT_X_OFFSET + PLOT_WIDTH + 60, 0);
    ctx.fillText(String.fromCharCode(0x2206) + "v", PLOT_X_OFFSET + PLOT_WIDTH + 45, PLOT_HEIGHT / 2);
    return ctx.restore();
  };

  $(document).ready(function() {
    canvasContext = $('#porkchopCanvas')[0].getContext('2d');
    plotImageData = canvasContext.createImageData(PLOT_WIDTH, PLOT_HEIGHT);
    prepareCanvas();
    $('#porkchopCanvas').mousemove(function(event) {
      var ctx, deltaV, tip, x, y;
      if (deltaVs != null) {
        x = event.offsetX - PLOT_X_OFFSET;
        y = event.offsetY;
        ctx = canvasContext;
        ctx.putImageData(plotImageData, PLOT_X_OFFSET, 0);
        if (x >= 0 && x < PLOT_WIDTH && y < PLOT_HEIGHT) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(PLOT_X_OFFSET + x, 0);
          ctx.lineTo(PLOT_X_OFFSET + x, PLOT_HEIGHT);
          ctx.moveTo(PLOT_X_OFFSET, y);
          ctx.lineTo(PLOT_X_OFFSET + PLOT_WIDTH, y);
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(255,255,255,0.75)';
          ctx.stroke();
          deltaV = deltaVs[(y * PLOT_WIDTH + x) | 0];
          if (!isNaN(deltaV)) {
            tip = " " + String.fromCharCode(0x2206) + "v = " + deltaV.toFixed() + " m/s ";
            ctx.font = '10pt "Helvetic Neue",Helvetica,Arial,sans serif';
            ctx.fillStyle = 'black';
            ctx.textAlign = x < PLOT_WIDTH / 2 ? 'left' : 'right';
            ctx.textBaseline = y > 15 ? 'bottom' : 'top';
            ctx.fillText(tip, event.offsetX, event.offsetY);
          }
          return ctx.restore();
        }
      }
    });
    $('#porkchopCanvas').mouseleave(function(event) {
      if (deltaVs != null) {
        return canvasContext.putImageData(plotImageData, PLOT_X_OFFSET, 0);
      }
    });
    $('#porkchopCanvas').click(function(event) {
      var n0, n1, p0, p1, t0, t1, transfer, trueAnomaly, v0, v1, x, y;
      if (deltaVs != null) {
        x = event.offsetX - PLOT_X_OFFSET;
        y = event.offsetY;
        if (x >= 0 && x < PLOT_WIDTH && y < PLOT_HEIGHT) {
          t0 = earliestDeparture + x * xScale / PLOT_WIDTH;
          t1 = earliestArrival + ((PLOT_HEIGHT - 1) - y) * yScale / PLOT_HEIGHT;
          trueAnomaly = originOrbit.trueAnomalyAt(t0);
          p0 = originOrbit.positionAtTrueAnomaly(trueAnomaly);
          v0 = originOrbit.velocityAtTrueAnomaly(trueAnomaly);
          n0 = originOrbit.normalVector();
          trueAnomaly = destinationOrbit.trueAnomalyAt(t1);
          p1 = destinationOrbit.positionAtTrueAnomaly(trueAnomaly);
          v1 = destinationOrbit.velocityAtTrueAnomaly(trueAnomaly);
          n1 = destinationOrbit.normalVector();
          transfer = Orbit.ballisticTransfer(originOrbit.referenceBody, t0, p0, v0, n0, t1, p1, v1, n1, initialOrbitalVelocity, finalOrbitalVelocity, true);
          $('#departureTime').text(kerbalDateString(t0));
          $('#arrivalTime').text(kerbalDateString(t1));
          $('#timeOfFlight').text(durationString(t1 - t0));
          $('#phaseAngle').text(angleString(originOrbit.phaseAngle(destinationOrbit, t0), 2));
          $('#transferPeriapsis').text(distanceString(transfer.orbit.periapsis()));
          $('#transferApoapsis').text(distanceString(transfer.orbit.apoapsis()));
          $('#transferAngle').text(angleString(transfer.angle));
          $('#ejectionAngle').text(angleString(0));
          $('#ejectionInclination').text(angleString(transfer.ejectionInclination, 2));
          $('#ejectionDeltaV').text(numberWithCommas(transfer.ejectionDeltaV.toFixed()) + " m/s");
          if (finalOrbitalVelocity === 0) {
            $('#insertionInclination').text("N/A");
            $('#insertionDeltaV').text("N/A");
          } else {
            $('#insertionInclination').text(angleString(transfer.insertionInclination, 2));
            $('#insertionDeltaV').text(numberWithCommas(transfer.insertionDeltaV.toFixed()) + " m/s");
          }
          return $('#totalDeltaV').text(numberWithCommas(transfer.deltaV.toFixed()) + " m/s");
        }
      }
    });
    $('#originSelect').change(function(event) {
      var k, origin, previousDestination, referenceBody, s, v, _ref;
      origin = CelestialBody[$(this).val()];
      referenceBody = origin.orbit.referenceBody;
      s = $('#destinationSelect');
      previousDestination = s.val();
      s.empty();
      for (k in CelestialBody) {
        v = CelestialBody[k];
        if (v !== origin && (v != null ? (_ref = v.orbit) != null ? _ref.referenceBody : void 0 : void 0) === referenceBody) {
          s.append($('<option>').text(k));
        }
      }
      s.val(previousDestination);
      if (s.val() == null) {
        s.val($('option:first', s).val());
      }
      return s.prop('disabled', s[0].childNodes.length === 0);
    });
    $('#originSelect').change();
    $('#destinationSelect').val('Duna');
    return $('#porkchopForm').submit(function(event) {
      var ctx, destinationBody, destinationBodyName, finalOrbit, hohmannTransfer, initialOrbit, originBody, originBodyName, _n, _o;
      event.preventDefault();
      $('#porkchopSubmit').prop('disabled', true);
      originBodyName = $('#originSelect').val();
      destinationBodyName = $('#destinationSelect').val();
      initialOrbit = $('#initialOrbit').val().trim();
      finalOrbit = $('#finalOrbit').val().trim();
      originBody = CelestialBody[originBodyName];
      destinationBody = CelestialBody[destinationBodyName];
      initialOrbitalVelocity = originBody.circularOrbitVelocity(initialOrbit * 1e3);
      if (finalOrbit) {
        finalOrbitalVelocity = destinationBody.circularOrbitVelocity(finalOrbit * 1e3);
      } else {
        finalOrbitalVelocity = null;
      }
      earliestDeparture = ($('#earliestDepartureYear').val() - 1) * 365 + ($('#earliestDepartureDay').val() - 1);
      earliestDeparture *= 24 * 3600;
      earliestArrival = ($('#earliestArrivalYear').val() - 1) * 365 + ($('#earliestArrivalDay').val() - 1);
      earliestArrival *= 24 * 3600;
      originOrbit = originBody.orbit;
      destinationOrbit = destinationBody.orbit;
      hohmannTransfer = Orbit.fromApoapsisAndPeriapsis(originOrbit.referenceBody, destinationOrbit.semiMajorAxis, originOrbit.semiMajorAxis, 0, 0, 0, 0);
      earliestArrival = earliestDeparture + hohmannTransfer.period() / 4;
      xScale = 2 * Math.min(originOrbit.period(), destinationOrbit.period());
      if (destinationOrbit.semiMajorAxis < originOrbit.semiMajorAxis) {
        yScale = 2 * destinationOrbit.period();
      } else {
        yScale = hohmannTransfer.period();
      }
      ctx = canvasContext;
      ctx.clearRect(PLOT_X_OFFSET, 0, PLOT_WIDTH, PLOT_HEIGHT);
      ctx.clearRect(PLOT_X_OFFSET + PLOT_WIDTH + 85, 0, 65, PLOT_HEIGHT + 10);
      ctx.clearRect(20, 0, PLOT_X_OFFSET - TIC_LENGTH - 21, PLOT_HEIGHT + TIC_LENGTH);
      ctx.clearRect(PLOT_X_OFFSET - 40, PLOT_HEIGHT + TIC_LENGTH, PLOT_WIDTH + 80, 20);
      ctx.font = '10pt "Helvetic Neue",Helvetica,Arial,sans serif';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (i = _n = 0; 0 <= 1.0 ? _n <= 1.0 : _n >= 1.0; i = _n += 0.25) {
        if (i === 1.0) {
          ctx.textBaseline = 'top';
        }
        ctx.fillText(((earliestArrival + i * yScale) / 3600 / 24) | 0, PLOT_X_OFFSET - TIC_LENGTH - 3, (1.0 - i) * PLOT_HEIGHT);
      }
      ctx.textAlign = 'center';
      for (i = _o = 0; 0 <= 1.0 ? _o <= 1.0 : _o >= 1.0; i = _o += 0.25) {
        ctx.fillText(((earliestDeparture + i * xScale) / 3600 / 24) | 0, PLOT_X_OFFSET + i * PLOT_WIDTH, PLOT_HEIGHT + TIC_LENGTH + 3);
      }
      console.log(initialOrbitalVelocity, finalOrbitalVelocity);
      deltaVs = null;
      return worker.postMessage({
        originOrbit: originOrbit,
        destinationOrbit: destinationOrbit,
        initialOrbitalVelocity: initialOrbitalVelocity,
        finalOrbitalVelocity: finalOrbitalVelocity,
        earliestDeparture: earliestDeparture,
        xScale: xScale,
        earliestArrival: earliestArrival,
        yScale: yScale
      });
    });
  });

}).call(this);
