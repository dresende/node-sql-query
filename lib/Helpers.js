
// Transforms:
// "name LIKE ? AND age > ?", ["John", 23]
// into:
// "name LIKE 'John' AND age > 23"
module.exports.escapeQuery = function (Dialect, query, args) {
	return query.replace(/[?]+/g, function (match) {
		if (match == '?') {
			return Dialect.escapeVal(args.shift());
		} else if (match == '??') {
			return Dialect.escapeId(args.shift());
		}
	});
}

module.exports.dateToString = function (date, timeZone, opts) {
  var dt = new Date(date);

  if (timeZone != 'local') {
    var tz = convertTimezone(timeZone);

    dt.setTime(dt.getTime() + (dt.getTimezoneOffset() * 60000));
    if (tz !== false) {
      dt.setTime(dt.getTime() + (tz * 60000));
    }
  }

  var year   = dt.getFullYear();
  var month  = zeroPad(dt.getMonth() + 1);
  var day    = zeroPad(dt.getDate());
  var hour   = zeroPad(dt.getHours());
  var minute = zeroPad(dt.getMinutes());
  var second = zeroPad(dt.getSeconds());
  var milli  = zeroPad(dt.getMilliseconds(), 3);

  if (opts.dialect == 'mysql') {
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + milli;
  } else {
    return year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second + '.' + milli + 'Z';
  }
}

function zeroPad(number, n) {
  if (arguments.length == 1) n = 2;

  number = "" + number;

  while (number.length < n) {
    number = "0" + number;
  }
  return number;
}

function convertTimezone(tz) {
  if (tz == "Z") return 0;

  var m = tz.match(/([\+\-\s])(\d\d):?(\d\d)?/);
  if (m) {
    return (m[1] == '-' ? -1 : 1) * (parseInt(m[2], 10) + ((m[3] ? parseInt(m[3], 10) : 0) / 60)) * 60;
  }
  return false;
}
