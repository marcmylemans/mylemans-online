/* ==========================================================================
   Proxmox cluster network planner: fill the Excel template
   --------------------------------------------------------------------------
   Treats the .xlsx as the zip it is and patches only the input cells on the
   Inputs sheet (plus two text lines), so data validation, conditional
   formatting, styles and formulas stay exactly as built by build.py. The
   template has no cached formula values and is flagged fullCalcOnLoad, so
   every spreadsheet app computes the visitor's own results on open.

   fillTemplate(JSZip, templateBytes, model, opts) -> Promise<Uint8Array>
   Works in the browser (window.ClusterPlannerXlsx) and in Node.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ClusterPlannerXlsx = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var NET_ROWS = { MG: 23, C0: 24, CP: 25, CC: 26, MI: 27, C2: 28 };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Every input cell as [ref, value]; strings are written as inline
  // strings, numbers as numbers, null/"" as an empty (styled) cell.
  function inputCells(m) {
    var c = m.cluster, cells = [
      ["C4", c.name], ["C5", c.domain], ["C6", c.prefix], ["C7", Number(c.nodes)], ["C8", Number(c.first)],
      ["C9", c.gw], ["C10", c.dns], ["C11", Number(c.switches)], ["C12", c.link1]
    ];
    m.ports.forEach(function (p, i) {
      var r = 16 + i;
      cells.push(["C" + r, p.present ? "Yes" : "No"], ["D" + r, Number(p.speed)], ["E" + r, p.sw]);
    });
    Object.keys(NET_ROWS).forEach(function (k) {
      var r = NET_ROWS[k], n = m.nets[k];
      cells.push(["C" + r, (k === "MG" || k === "C0" || n.use) ? "Yes" : "No"], ["D" + r, n.port],
        ["E" + r, Number(n.vlan)], ["F" + r, String(n.net)], ["G" + r, Number(n.plen)], ["H" + r, Number(n.mtu)]);
    });
    for (var i = 0; i < 8; i++) {
      var nd = m.nodes[i] || { name: "", macs: [] }, r = 32 + i;
      cells.push(["B" + r, nd.name || null]);
      ["E", "F", "G", "H"].forEach(function (col, j) { cells.push([col + r, (nd.macs && nd.macs[j]) || null]); });
    }
    return cells;
  }

  function cellXml(ref, style, v) {
    var s = style ? ' s="' + style + '"' : "";
    if (v === null || v === undefined || v === "") return '<c r="' + ref + '"' + s + "/>";
    if (typeof v === "number" && isFinite(v)) return '<c r="' + ref + '"' + s + ' t="n"><v>' + v + "</v></c>";
    return '<c r="' + ref + '"' + s + ' t="inlineStr"><is><t xml:space="preserve">' + esc(v) + "</t></is></c>";
  }

  function cellRe(ref) { return new RegExp('<c r="' + ref + '"(?=[\\s/>])[^>]*?(?:/>|>[\\s\\S]*?</c>)'); }

  function setCells(xml, cells) {
    cells.forEach(function (pair) {
      var ref = pair[0], re = cellRe(ref), m = xml.match(re);
      if (!m) throw new Error("Template cell " + ref + " not found");
      var st = m[0].match(/\ss="(\d+)"/);
      xml = xml.replace(re, cellXml(ref, st ? st[1] : null, pair[1]));
    });
    return xml;
  }

  function readCellText(xml, ref) {
    var m = xml.match(cellRe(ref));
    if (!m) return null;
    var t = m[0].match(/<t[^>]*>([\s\S]*?)<\/t>/) || m[0].match(/<v>([\s\S]*?)<\/v>/);
    return t ? t[1] : null;
  }

  // Sheet name -> zip path, via workbook.xml and its rels.
  function sheetPaths(zip) {
    return Promise.all([zip.file("xl/workbook.xml").async("string"), zip.file("xl/_rels/workbook.xml.rels").async("string")])
      .then(function (r) {
        var rels = {}, out = {};
        r[1].replace(/<Relationship\b[^>]*>/g, function (tag) {
          var id = (tag.match(/\sId="([^"]+)"/) || [])[1], tgt = (tag.match(/\sTarget="([^"]+)"/) || [])[1];
          if (id && tgt) rels[id] = tgt.charAt(0) === "/" ? tgt.slice(1) : "xl/" + tgt;
        });
        r[0].replace(/<sheet\b[^>]*>/g, function (tag) {
          var name = (tag.match(/\sname="([^"]+)"/) || [])[1], id = (tag.match(/\sr:id="([^"]+)"/) || [])[1];
          if (name && rels[id]) out[name] = rels[id];
        });
        return out;
      });
  }

  function fillTemplate(JSZip, bytes, model, opts) {
    opts = opts || {};
    var zip, paths;
    return JSZip.loadAsync(bytes).then(function (z) {
      zip = z;
      return sheetPaths(zip);
    }).then(function (p) {
      paths = p;
      if (!paths["Inputs"] || !paths["Start here"] || !paths["_calc"]) throw new Error("Template sheets missing");
      return Promise.all([zip.file(paths["Inputs"]).async("string"), zip.file(paths["Start here"]).async("string"),
                          zip.file(paths["_calc"]).async("string")]);
    }).then(function (x) {
      var version = readCellText(x[2], "B5");
      if (opts.expectVersion && version !== opts.expectVersion) {
        throw new Error("Template version " + version + " does not match the page (" + opts.expectVersion + "). Reload the page.");
      }
      var cells = inputCells(model);
      if (opts.inputsNote) cells.push(["B41", opts.inputsNote]);
      zip.file(paths["Inputs"], setCells(x[0], cells));
      if (opts.generatedLine) zip.file(paths["Start here"], setCells(x[1], [["B5", opts.generatedLine]]));
      return zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 },
                                 mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    });
  }

  return { fillTemplate: fillTemplate, inputCells: inputCells, readCellText: readCellText };
});
