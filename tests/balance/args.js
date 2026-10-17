/* --key value / --key=value / --flag; a key given twice becomes a list (--replace a --replace b). */
"use strict";
module.exports = function parse(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      o._.push(a);
      continue;
    }
    let k = a.slice(2);
    let v;
    const eq = k.indexOf("=");
    if (eq >= 0) {
      v = k.slice(eq + 1);
      k = k.slice(0, eq);
    } else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) v = argv[++i];
    else v = true;
    if (k in o) o[k] = [].concat(o[k], v);
    else o[k] = v;
  }
  return o;
};
