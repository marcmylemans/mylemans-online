/* ==========================================================================
   Proxmox cluster network planner: rules
   --------------------------------------------------------------------------
   The data model, presets, address calculation, field validation and the
   15 risk checks. This is a JavaScript copy of the formulas in the Excel
   template (tools/cluster-planner/build.py), so the page and the downloaded
   file always agree. Any rule change goes in BOTH places, then rerun
   tools/cluster-planner/test.js.

   No DOM access in here: the future Network Designer imports it unchanged.
   Works as a browser global (window.ClusterPlannerRules) and in Node.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ClusterPlannerRules = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var TEMPLATE_VERSION = "1.1";
  var PORTS = ["nic0", "nic1", "nic2", "nic3"];
  // Row order matches Inputs!B23:B28 in the template.
  var NETS = [
    { key: "MG", name: "Management", fixed: true, carries: "Web UI, SSH and the default gateway. Becomes the VM bridge vmbr0. Must be untagged." },
    { key: "C0", name: "Corosync link 0", fixed: true, carries: "Cluster heartbeat. Needs low latency, not bandwidth." },
    { key: "CP", name: "Ceph public", fixed: false, carries: "VM disk traffic to Ceph and Ceph service traffic." },
    { key: "CC", name: "Ceph cluster", fixed: false, carries: "Optional: OSD replication on its own network." },
    { key: "MI", name: "Migration", fixed: false, carries: "Optional: live migration on its own network." },
    { key: "C2", name: "Dedicated link 1", fixed: false, carries: "Optional: a network only for Corosync link 1." }
  ];
  var KEYS = NETS.map(function (n) { return n.key; });
  var NAME = {};
  NETS.forEach(function (n) { NAME[n.key] = n.name; });
  var LINK1_OPTIONS = ["None", "Management", "Ceph public", "Ceph cluster", "Migration", "Dedicated link 1"];
  var LINK1_KEY = { "Management": "MG", "Ceph public": "CP", "Ceph cluster": "CC", "Migration": "MI", "Dedicated link 1": "C2" };
  var MAX_NODES = 8;

  function emptyNodes() {
    var out = [];
    for (var i = 0; i < MAX_NODES; i++) out.push({ name: "", macs: ["", "", "", ""] });
    return out;
  }

  function net(use, port, vlan, prefix, plen, mtu) {
    return { use: use, port: port, vlan: vlan, net: prefix, plen: plen, mtu: mtu };
  }

  // Marc's own cluster: identical to the template defaults (and test case 1).
  function marcPreset() {
    return {
      cluster: { name: "homelab", domain: "lab.example.com", prefix: "pve", nodes: 3, first: 11,
                 gw: "10.0.10.1", dns: "10.0.10.1", switches: 1, link1: "Ceph public" },
      ports: [
        { present: true, speed: 10, sw: "A" },
        { present: true, speed: 10, sw: "A" },
        { present: false, speed: 1, sw: "A" },
        { present: false, speed: 1, sw: "A" }
      ],
      nets: {
        MG: net(true, "nic0", 0, "10.0.10", 24, 1500),
        C0: net(true, "nic0", 20, "10.0.20", 24, 1500),
        CP: net(true, "nic1", 0, "10.0.30", 24, 9000),
        CC: net(false, "nic1", 40, "10.0.40", 24, 9000),
        MI: net(false, "nic1", 50, "10.0.50", 24, 9000),
        C2: net(false, "nic1", 60, "10.0.60", 24, 1500)
      },
      nodes: emptyNodes()
    };
  }

  // A clean example with no Problems and no Warnings: Corosync link 0 gets a
  // 1 GbE port of its own, link 1 falls back over management.
  function cleanPreset() {
    var m = marcPreset();
    m.cluster.link1 = "Management";
    m.ports[2] = { present: true, speed: 1, sw: "A" };
    m.nets.C0 = net(true, "nic2", 0, "10.0.20", 24, 1500);
    return m;
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // ---------------------------------------------------------------- helpers
  function enabled(m, k) { return k === "MG" || k === "C0" ? true : !!m.nets[k].use; }
  function portIndex(p) { return PORTS.indexOf(p); }
  function excelTrim(s) { return String(s || "").replace(/^ +| +$/g, "").replace(/ {2,}/g, " "); }

  function hostname(m, n) {
    if (n > m.cluster.nodes) return "";
    var o = m.nodes[n - 1] && m.nodes[n - 1].name;
    if (o !== undefined && o !== null && String(o) !== "") return excelTrim(o).toLowerCase();
    return String(m.cluster.prefix || "").toLowerCase() + n;
  }
  function fqdn(m, n) {
    var h = hostname(m, n);
    return h === "" ? "" : h + "." + m.cluster.domain;
  }
  function ip(m, k, n) { return m.nets[k].net + "." + (Number(m.cluster.first) + n - 1); }

  // Per-port summary, as _calc!A10:H13 in the template.
  function portInfo(m) {
    return PORTS.map(function (p, i) {
      var carries = [], mtu = 0, untagged = 0, count = 0;
      KEYS.forEach(function (k) {
        var nn = m.nets[k];
        if (enabled(m, k) && nn.port === p) {
          carries.push(NAME[k]);
          mtu = Math.max(mtu, Number(nn.mtu));
          if (Number(nn.vlan) === 0) untagged++;
          count++;
        }
      });
      return { port: p, present: !!m.ports[i].present, speed: Number(m.ports[i].speed), sw: m.ports[i].sw,
               carries: carries.join(", "), mtu: mtu, untagged: untagged, count: count };
    });
  }
  function portAttr(info, p) { var i = portIndex(p); return i < 0 ? null : info[i]; }

  // ------------------------------------------------------------ addresses
  // Rows as the Plan sheet's "Addresses per node" table.
  function addresses(m) {
    var rows = [];
    var l1 = m.cluster.link1;
    for (var n = 1; n <= m.cluster.nodes; n++) {
      var row = { n: n, hostname: hostname(m, n), fqdn: fqdn(m, n) };
      KEYS.forEach(function (k) { row[k] = enabled(m, k) ? ip(m, k, n) : "-"; });
      row.L1 = l1 === "None" ? "-" : row[LINK1_KEY[l1]];
      rows.push(row);
    }
    return rows;
  }

  // -------------------------------------------------------------- risks
  function risks(m) {
    var c = m.cluster, info = portInfo(m), N = m.nets;
    var count = Number(c.nodes), start = Number(c.first), L1 = c.link1;
    var c0p = N.C0.port, cpp = N.CP.port, ccp = N.CC.port;
    var c0 = portAttr(info, c0p) || { count: 0, carries: "", sw: "" };
    var l1key = LINK1_KEY[L1];
    var l1port = l1key ? N[l1key].port : "";
    var l1enabled = L1 === "None" ? true : enabled(m, l1key);
    var l1info = l1port ? portAttr(info, l1port) : null;
    var l1sw = l1info ? l1info.sw : "";
    var cpinfo = portAttr(info, cpp);
    var cpspeed = cpinfo ? cpinfo.speed : 0;
    var out = [];
    function add(name, status, text, why) { out.push({ n: out.length + 1, check: name, status: status, text: text, why: why }); }

    // 1
    add("Node count",
      count < 3 ? "Problem" : count % 2 === 0 ? "Warning" : "OK",
      count < 3 ? "Ceph and HA need at least three nodes for a reliable majority."
        : count % 2 === 0 ? "An even count can split down the middle with no majority. Add a QDevice as an extra vote."
        : "Odd node count: the cluster keeps quorum with one node down.",
      "Quorum needs a majority of votes. Proxmox supports a QDevice for even node counts.");
    // 2
    var mgUntagged = Number(N.MG.vlan) === 0;
    add("Management untagged", mgUntagged ? "OK" : "Problem",
      mgUntagged ? "Management arrives untagged, which is what the installer sets up."
        : "The installer can't tag a VLAN. Make management the native VLAN on the switch port and enter 0.",
      "The installer configures one untagged address on vmbr0.");
    // 3
    add("Corosync link 0 has its own port", c0.count <= 1 ? "OK" : "Warning",
      c0.count <= 1 ? "Link 0 has " + c0p + " to itself."
        : "Link 0 is not alone: " + c0p + " carries " + c0.carries + ". Heavy traffic on that port can delay heartbeats.",
      "Proxmox recommends a dedicated physical NIC for cluster traffic; a 1 Gbit port is enough.");
    // 4
    var shareCeph = (enabled(m, "CP") && c0p === cpp) || (enabled(m, "CC") && c0p === ccp);
    add("Corosync apart from Ceph", shareCeph ? "Problem" : "OK",
      shareCeph ? "Link 0 is on the same port as Ceph. A Ceph recovery can fill that link and cost you quorum."
        : "Corosync link 0 and Ceph use different ports.",
      "Proxmox: do not share a network between Corosync and storage, except as a low-priority fallback link.");
    // 5
    add("Second Corosync link", L1 === "None" ? "Warning" : l1enabled ? "OK" : "Problem",
      L1 === "None" ? "No second link. If link 0 fails, the node drops out of the cluster."
        : l1enabled ? "Link 1 runs over " + L1 + ". It only carries heartbeats if link 0 fails."
        : "Link 1 points at a network that is switched off.",
      "Reliable redundancy needs at least one more link on a different physical network.");
    // 6
    add("Link 1 on another port", L1 === "None" ? "n/a" : l1port === c0p ? "Warning" : "OK",
      L1 === "None" ? "No second link."
        : l1port === c0p ? "Both links use " + c0p + ". One cable takes both down."
        : "Link 0 on " + c0p + ", link 1 on " + l1port + ".",
      "Every link should be on its own physical connection to be useful as failover.");
    // 7
    var sws = Number(c.switches);
    add("Links on different switches",
      L1 === "None" ? "n/a" : sws < 2 ? "Info" : l1sw === c0.sw ? "Warning" : "OK",
      L1 === "None" ? "No second link."
        : sws < 2 ? "One switch: if it fails or reboots, both links drop together. Common in a homelab; plan switch maintenance around it."
        : l1sw === c0.sw ? "Both links end on switch " + c0.sw + "."
        : "Link 0 on switch " + c0.sw + ", link 1 on switch " + l1sw + ".",
      "A second switch only helps if each link really uses a different one.");
    // 8
    var cpOn = enabled(m, "CP");
    add("Ceph public bandwidth", !cpOn ? "n/a" : cpspeed >= 10 ? "OK" : "Warning",
      !cpOn ? "Ceph not used."
        : cpspeed >= 10 ? "Ceph public on " + cpspeed + " Gbps."
        : "Ceph public on " + cpspeed + " Gbps. Expect slow VMs and long recoveries.",
      "Proxmox recommends at least 10 Gbps used only for Ceph.");
    // 9
    var ccOn = enabled(m, "CC");
    add("Ceph cluster network", !cpOn ? "n/a" : !ccOn ? "Info" : ccp === cpp ? "Info" : "OK",
      !cpOn ? "Ceph not used."
        : !ccOn ? "Replication shares the public network. Fine for small clusters, and it can be moved later."
        : ccp === cpp ? "Own subnet, same port: tidier, but no extra bandwidth."
        : "Replication has its own port.",
      "The Ceph cluster network is optional and can be moved to its own network later.");
    // 10
    var maxUntagged = Math.max.apply(null, info.map(function (p) { return p.untagged; }));
    add("One untagged network per port", maxUntagged > 1 ? "Problem" : "OK",
      maxUntagged > 1 ? "Two networks are untagged on the same port. Give all but one a VLAN ID."
        : "Each port has at most one untagged network.",
      "A port can only carry one untagged network; the rest need VLAN tags.");
    // 11
    var dupes = KEYS.some(function (k) {
      if (!enabled(m, k)) return false;
      return KEYS.filter(function (j) { return enabled(m, j) && String(N[j].net).toLowerCase() === String(N[k].net).toLowerCase(); }).length > 1;
    });
    add("Unique subnets", dupes ? "Problem" : "OK",
      dupes ? "Two networks in use share a subnet. Give each its own." : "Every network has its own subnet.",
      "Separate subnets keep traffic on the port you planned it for.");
    // 12
    var fits = start >= 2 && start + count - 1 <= 254;
    add("Host numbers fit", fits ? "OK" : "Problem",
      fits ? "Nodes use ." + start + " to ." + (start + count - 1) + "." : "Host numbers run outside 2 to 254.",
      "Last octets 0, 1 (usually the gateway) and 255 are off limits.");
    // 13
    var missing = KEYS.some(function (k) {
      if (!enabled(m, k)) return false;
      var p = portAttr(info, N[k].port);
      return !p || !p.present;
    });
    add("Ports exist", missing ? "Problem" : "OK",
      missing ? "A network is set on a port marked not present." : "Every network sits on a port that exists.", "");
    // 14 (the template checks all eight hostname cells; unused nodes are "")
    var badHost = false;
    for (var n = 1; n <= MAX_NODES; n++) { if (/[ _.]/.test(hostname(m, n))) badHost = true; }
    add("Hostnames valid", badHost ? "Problem" : "OK",
      badHost ? "A hostname has a space, dot or underscore. Use letters, digits and hyphens." : "Hostnames look valid.",
      "Hostnames are permanent once the cluster exists.");
    // 15
    var jumbo = Math.max.apply(null, info.map(function (p) { return p.mtu; })) > 1500;
    add("Jumbo frames", jumbo ? "Info" : "OK",
      jumbo ? "MTU above 1500 is in use. Set it on every switch port in the path and run the jumbo frame tests from the planner file before you create the cluster."
        : "Standard MTU everywhere.",
      "Every device in the path has to support the larger MTU, or large packets get dropped.");

    var problems = out.filter(function (r) { return r.status === "Problem"; }).length;
    var warnings = out.filter(function (r) { return r.status === "Warning"; }).length;
    return { checks: out, problems: problems, warnings: warnings,
             summary: problems + " problem(s), " + warnings + " warning(s)" };
  }

  // A one-letter grade for the page; the spreadsheet itself only counts.
  function grade(r) {
    if (r.problems > 0) return { letter: "C", label: "Fix before you install" };
    if (r.warnings > 0) return { letter: "B", label: "Decide on the warnings" };
    return { letter: "A", label: "Ready to install" };
  }

  // Commands the plan's test cases compare (also shown nowhere on the page;
  // the full set lives in the downloaded file).
  function createCommand(m) {
    var a = addresses(m)[0];
    return "pvecm create " + m.cluster.name + " --link0 " + a.C0 + (m.cluster.link1 !== "None" ? " --link1 " + a.L1 : "");
  }
  function cephInit(m) {
    if (!enabled(m, "CP")) return "Ceph public is off on Inputs.";
    var s = function (k) { return m.nets[k].net + ".0/" + m.nets[k].plen; };
    return "pveceph init --network " + s("CP") + (enabled(m, "CC") ? " --cluster-network " + s("CC") : "");
  }

  // ------------------------------------------------------------ validation
  var IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  var OCT3 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){2}$/;
  var MAC = /^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/i;
  function intIn(v, lo, hi) { var n = Number(v); return v !== "" && v !== null && Number.isInteger(n) && n >= lo && n <= hi; }

  // Returns { "<field path>": "message" } for anything the template would
  // reject with its data validation (or that would make no sense).
  function validate(m) {
    var e = {}, c = m.cluster;
    if (!/^[a-z0-9-]{1,15}$/.test(c.name || "")) e["cluster.name"] = "Lowercase letters, digits and hyphens, up to 15 characters.";
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i.test(c.domain || "")) e["cluster.domain"] = "A domain like lab.example.com.";
    if (!/^[a-z0-9-]{1,40}$/i.test(c.prefix || "")) e["cluster.prefix"] = "Letters, digits and hyphens.";
    if (!intIn(c.nodes, 1, 8)) e["cluster.nodes"] = "1 to 8.";
    if (!intIn(c.first, 2, 250)) e["cluster.first"] = "2 to 250.";
    if (!IPV4.test(c.gw || "")) e["cluster.gw"] = "An IPv4 address.";
    if (!IPV4.test(c.dns || "")) e["cluster.dns"] = "An IPv4 address.";
    if (!intIn(c.switches, 1, 2)) e["cluster.switches"] = "1 or 2.";
    if (LINK1_OPTIONS.indexOf(c.link1) < 0) e["cluster.link1"] = "Pick an option.";
    m.ports.forEach(function (p, i) {
      if (!(Number(p.speed) > 0 && Number(p.speed) <= 800)) e["ports." + i + ".speed"] = "Speed in Gbps.";
    });
    KEYS.forEach(function (k) {
      var n = m.nets[k];
      if (PORTS.indexOf(n.port) < 0) e["nets." + k + ".port"] = "Pick a port.";
      if (!intIn(n.vlan, 0, 4094)) e["nets." + k + ".vlan"] = "0 to 4094.";
      if (!OCT3.test(n.net || "")) e["nets." + k + ".net"] = "First three octets, like 10.0.10.";
      if (!intIn(n.plen, 16, 24)) e["nets." + k + ".plen"] = "16 to 24.";
      if (!intIn(n.mtu, 1280, 9216)) e["nets." + k + ".mtu"] = "1280 to 9216.";
    });
    m.nodes.forEach(function (nd, i) {
      if (i >= c.nodes) return;
      (nd.macs || []).forEach(function (mac, j) {
        if (mac && !MAC.test(mac)) e["nodes." + i + ".macs." + j] = "Like 6c:4b:90:12:34:56.";
      });
      if (nd.name && nd.name.length > 63) e["nodes." + i + ".name"] = "Too long.";
    });
    return e;
  }

  // Fill missing fields from the clean preset, coerce types, clamp list
  // lengths. Used for anything restored from a link.
  function normalize(raw) {
    var d = cleanPreset();
    if (!raw || typeof raw !== "object") return d;
    var c = raw.cluster || {};
    Object.keys(d.cluster).forEach(function (k) { if (c[k] !== undefined) d.cluster[k] = c[k]; });
    ["nodes", "first", "switches"].forEach(function (k) { d.cluster[k] = Number(d.cluster[k]); });
    (raw.ports || []).slice(0, 4).forEach(function (p, i) {
      d.ports[i] = { present: !!p.present, speed: Number(p.speed), sw: p.sw === "B" ? "B" : "A" };
    });
    var rn = raw.nets || {};
    KEYS.forEach(function (k) {
      var s = rn[k];
      if (!s) return;
      var t = d.nets[k];
      if (k === "MG" || k === "C0") t.use = true; else if (s.use !== undefined) t.use = !!s.use;
      if (s.port !== undefined) t.port = String(s.port);
      ["vlan", "plen", "mtu"].forEach(function (f) { if (s[f] !== undefined) t[f] = Number(s[f]); });
      if (s.net !== undefined) t.net = String(s.net);
    });
    (raw.nodes || []).slice(0, MAX_NODES).forEach(function (n, i) {
      d.nodes[i] = { name: String(n.name || ""), macs: [0, 1, 2, 3].map(function (j) { return String((n.macs || [])[j] || ""); }) };
    });
    return d;
  }

  return {
    TEMPLATE_VERSION: TEMPLATE_VERSION, PORTS: PORTS, NETS: NETS, KEYS: KEYS, NAME: NAME,
    LINK1_OPTIONS: LINK1_OPTIONS, LINK1_KEY: LINK1_KEY, MAX_NODES: MAX_NODES,
    marcPreset: marcPreset, cleanPreset: cleanPreset, clone: clone, normalize: normalize,
    enabled: enabled, hostname: hostname, fqdn: fqdn, ip: ip, portInfo: portInfo,
    addresses: addresses, risks: risks, grade: grade, validate: validate,
    createCommand: createCommand, cephInit: cephInit
  };
});
