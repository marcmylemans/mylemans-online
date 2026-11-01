/* ==========================================================================
   Proxmox cluster network planner: page
   Form, live address table and risk grade, link save/restore, signup gate
   and the download. Rules live in cluster-planner-rules.js, the Excel fill
   in cluster-planner-xlsx.js.
   ========================================================================== */
(function () {
  "use strict";
  var R = window.ClusterPlannerRules, X = window.ClusterPlannerXlsx, CFG = window.CP_CONFIG || {};
  var app = document.getElementById("cp-app");
  if (!R || !X || !app) return;

  var UNLOCK_KEY = "cp-unlocked";
  var SPEEDS = [1, 2.5, 5, 10, 25, 40, 100];
  var model = R.cleanPreset();
  var step = 0;
  var unlocked = false;
  var started = false, gradeSeen = false;

  // ------------------------------------------------------------ utilities
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s === undefined || s === null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function store(get, val) {
    try {
      if (get) return window.localStorage.getItem(UNLOCK_KEY) === "1";
      window.localStorage.setItem(UNLOCK_KEY, "1");
    } catch (e) {}
    return false;
  }
  function track(name) {
    // Counted by the site's consent-mode GA (cookieless unless accepted).
    // Never put design values in event data.
    try { if (typeof window.gtag === "function") window.gtag("event", name, { event_category: "cluster_kit" }); } catch (e) {}
  }
  function getPath(path) {
    return path.split(".").reduce(function (o, k) { return o === undefined ? undefined : o[k]; }, model);
  }
  function setPath(path, value) {
    var keys = path.split("."), o = model;
    for (var i = 0; i < keys.length - 1; i++) o = o[keys[i]];
    o[keys[keys.length - 1]] = value;
  }

  // ------------------------------------------------- link save and restore
  // Only what differs from the clean example goes in the link (normalize()
  // fills the rest back in), which keeps shared and emailed links short.
  function diff(a, b) {
    if (a === null || typeof a !== "object") return a === b ? undefined : a;
    var out = {}, any = false;
    Object.keys(a).forEach(function (k) {
      var d = diff(a[k], b ? b[k] : undefined);
      if (d !== undefined) { out[k] = d; any = true; }
    });
    return any ? out : undefined;
  }
  function encode(m) {
    var base = R.cleanPreset(), c = diff(m, base) || {};
    // Arrays become {index: value} objects in the diff; turn them back.
    if (c.ports) { var ports = R.clone(m.ports); c.ports = ports; }
    if (c.nodes) {
      var last = -1;
      m.nodes.forEach(function (n, i) { if (n.name || n.macs.some(Boolean)) last = i; });
      c.nodes = R.clone(m.nodes.slice(0, last + 1));
      if (!c.nodes.length) delete c.nodes;
    }
    var json = JSON.stringify(c);
    var b64 = btoa(unescape(encodeURIComponent(json)));
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function decode(s) {
    try {
      var b64 = s.replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
      return R.normalize(JSON.parse(decodeURIComponent(escape(atob(b64)))));
    } catch (e) { return null; }
  }
  function readHash() {
    var h = (location.hash || "").replace(/^#/, ""), out = {};
    h.split("&").forEach(function (part) {
      var i = part.indexOf("=");
      if (i > 0) out[part.slice(0, i)] = part.slice(i + 1);
    });
    return out;
  }
  var hashTimer;
  function writeHash() {
    clearTimeout(hashTimer);
    hashTimer = setTimeout(function () {
      try { history.replaceState(null, "", location.pathname + location.search + "#d=" + encode(model)); } catch (e) {}
    }, 250);
  }
  function shareUrl() { return location.origin + location.pathname + "#d=" + encode(model); }

  // ------------------------------------------------------------- fields
  function errorsFor(errs, path) { return errs[path] ? '<span class="cp-err" id="err-' + path.replace(/\./g, "-") + '">' + esc(errs[path]) + "</span>" : '<span class="cp-err" id="err-' + path.replace(/\./g, "-") + '"></span>'; }
  function fid(path) { return "f-" + path.replace(/\./g, "-"); }

  function input(path, label, opts) {
    opts = opts || {};
    var v = getPath(path), id = fid(path);
    return '<div class="cp-field' + (opts.wide ? " cp-wide" : "") + '">' +
      '<label for="' + id + '">' + label + (opts.perm ? ' <span class="cp-perm" title="Permanent once the cluster exists">permanent</span>' : "") + "</label>" +
      '<input id="' + id + '" data-path="' + path + '" data-type="' + (opts.type || "text") + '" type="' + (opts.type === "int" ? "number" : "text") + '"' +
      (opts.type === "int" ? ' inputmode="numeric" step="1"' : "") +
      (opts.min !== undefined ? ' min="' + opts.min + '"' : "") + (opts.max !== undefined ? ' max="' + opts.max + '"' : "") +
      (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : "") +
      (opts.disabled ? " disabled" : "") +
      ' value="' + esc(v) + '" aria-describedby="err-' + path.replace(/\./g, "-") + (opts.hint ? " hint-" + id : "") + '" spellcheck="false" />' +
      (opts.hint ? '<span class="cp-hint" id="hint-' + id + '">' + opts.hint + "</span>" : "") +
      errorsFor({}, path) + "</div>";
  }
  function select(path, label, options, opts) {
    opts = opts || {};
    var v = String(getPath(path)), id = fid(path);
    return '<div class="cp-field' + (opts.wide ? " cp-wide" : "") + '">' +
      '<label for="' + id + '">' + label + "</label>" +
      '<select id="' + id + '" data-path="' + path + '" data-type="' + (opts.type || "text") + '"' + (opts.disabled ? " disabled" : "") +
      (opts.hint ? ' aria-describedby="hint-' + id + '"' : "") + ">" +
      options.map(function (o) {
        var val = typeof o === "object" ? o.v : o, txt = typeof o === "object" ? o.t : o;
        return '<option value="' + esc(val) + '"' + (String(val) === v ? " selected" : "") + ">" + esc(txt) + "</option>";
      }).join("") + "</select>" +
      (opts.hint ? '<span class="cp-hint" id="hint-' + id + '">' + opts.hint + "</span>" : "") + "</div>";
  }
  function toggle(path, label, opts) {
    opts = opts || {};
    var id = fid(path);
    return '<label class="cp-toggle" for="' + id + '"><input type="checkbox" id="' + id + '" data-path="' + path + '" data-type="bool"' +
      (getPath(path) ? " checked" : "") + (opts.disabled ? " disabled" : "") + " /><span>" + label + "</span></label>";
  }

  // --------------------------------------------------------------- steps
  function renderCluster() {
    var nodes = []; for (var i = 1; i <= 8; i++) nodes.push(i);
    return '<h2 class="cp-h2">Cluster</h2>' +
      '<p class="cp-note">The red "permanent" labels mark what you can\'t change once the cluster exists.</p>' +
      '<div class="cp-grid">' +
      input("cluster.name", "Cluster name", { perm: true, hint: "Lowercase letters, digits, hyphens." }) +
      input("cluster.domain", "DNS domain", { perm: true, hint: "Hostnames become name.domain." }) +
      input("cluster.prefix", "Hostname prefix", { perm: true, hint: "Nodes are named prefix + number unless you rename them in step 4." }) +
      select("cluster.nodes", "Number of nodes", nodes, { type: "int", hint: "Three or five is the sweet spot." }) +
      input("cluster.first", "First host number", { perm: true, type: "int", min: 2, max: 250, hint: "Last number of node 1 on every network." }) +
      input("cluster.gw", "Default gateway", { hint: "Your router on the management network." }) +
      input("cluster.dns", "DNS server") +
      select("cluster.switches", "Number of switches", [{ v: 1, t: "1 switch" }, { v: 2, t: "2 switches" }], { type: "int" }) +
      select("cluster.link1", "Corosync link 1 uses", R.LINK1_OPTIONS, { wide: true, hint: "Which network carries the second cluster link. None means no second link." }) +
      "</div>";
  }

  function renderPorts() {
    var two = Number(model.cluster.switches) === 2;
    return '<h2 class="cp-h2">Network ports</h2>' +
      '<p class="cp-note">The same on every node. Proxmox 9.1 and later pins port names as nic0, nic1 and so on by default.</p>' +
      '<div class="cp-cards">' + R.PORTS.map(function (p, i) {
        var present = model.ports[i].present;
        return '<fieldset class="cp-card' + (present ? "" : " is-off") + '"><legend>' + p + "</legend>" +
          toggle("ports." + i + ".present", "Present on every node") +
          '<div class="cp-grid cp-grid-tight">' +
          select("ports." + i + ".speed", "Speed", SPEEDS.map(function (s) { return { v: s, t: s + " Gbps" }; }), { type: "num", disabled: !present }) +
          select("ports." + i + ".sw", "Switch", two ? ["A", "B"] : [{ v: "A", t: "A (the only one)" }], { disabled: !present || !two }) +
          "</div></fieldset>";
      }).join("") + "</div>";
  }

  function renderNetworks() {
    return '<h2 class="cp-h2">Networks</h2>' +
      '<p class="cp-note">Management and Corosync link 0 are always on. VLAN 0 means untagged. IPs and subnets are permanent once the cluster exists.</p>' +
      '<div class="cp-cards">' + R.NETS.map(function (n) {
        var k = n.key, on = R.enabled(model, k), base = "nets." + k + ".";
        return '<fieldset class="cp-card' + (on ? "" : " is-off") + '"><legend>' + esc(n.name) + "</legend>" +
          (n.fixed ? '<p class="cp-fixed">Always on</p>' : toggle(base + "use", "Use this network")) +
          '<p class="cp-hint">' + esc(n.carries) + "</p>" +
          '<div class="cp-grid cp-grid-net">' +
          select(base + "port", "Port", R.PORTS.map(function (p, i) { return { v: p, t: p + (model.ports[i].present ? "" : " (not present)") }; }), { disabled: !on }) +
          input(base + "vlan", "VLAN", { type: "int", min: 0, max: 4094, disabled: !on }) +
          input(base + "net", "Network", { placeholder: "10.0.10", disabled: !on, hint: "First three numbers" }) +
          input(base + "plen", "Prefix", { type: "int", min: 16, max: 24, disabled: !on, hint: "/16 to /24" }) +
          input(base + "mtu", "MTU", { type: "int", min: 1280, max: 9216, disabled: !on }) +
          "</div></fieldset>";
      }).join("") + "</div>";
  }

  function renderNodes() {
    var out = '<h2 class="cp-h2">Nodes</h2>' +
      '<p class="cp-note">Leave the name empty to use the prefix and number. MAC addresses are optional, but the installer lists ports by MAC, so they save guessing. Find them on the BIOS screen or with <code>ip link</code> from a live USB.</p>';
    for (var i = 0; i < model.cluster.nodes; i++) {
      out += '<fieldset class="cp-card cp-node"><legend>Node ' + (i + 1) + "</legend>" +
        '<div class="cp-grid cp-grid-node">' +
        input("nodes." + i + ".name", "Hostname", { perm: true, placeholder: String(model.cluster.prefix || "").toLowerCase() + (i + 1) });
      R.PORTS.forEach(function (p, j) {
        if (model.ports[j].present) out += input("nodes." + i + ".macs." + j, "MAC " + p, { placeholder: "optional" });
      });
      out += "</div></fieldset>";
    }
    return out;
  }

  var RENDER = [renderCluster, renderPorts, renderNetworks, renderNodes];

  function renderStep(i) {
    var el = $("cp-step-" + i), active = document.activeElement, path = active && active.getAttribute && active.getAttribute("data-path");
    el.innerHTML = RENDER[i]();
    if (path) { var again = el.querySelector('[data-path="' + path + '"]'); if (again) again.focus(); }
  }
  function renderAll() { for (var i = 0; i < 4; i++) renderStep(i); }

  function showStep(i) {
    step = Math.max(0, Math.min(3, i));
    for (var s = 0; s < 4; s++) {
      $("cp-step-" + s).hidden = s !== step;
      $("cp-tab-" + s).setAttribute("aria-selected", s === step ? "true" : "false");
      $("cp-tab-" + s).tabIndex = s === step ? 0 : -1;
    }
    $("cp-prev").disabled = step === 0;
    $("cp-next").textContent = step === 3 ? "Get my planner ↓" : "Next →";
  }

  // ------------------------------------------------------------- results
  var STATUS_CLASS = { Problem: "is-problem", Warning: "is-warning", Info: "is-info", OK: "is-ok", "n/a": "is-na" };

  function renderResults() {
    var errs = R.validate(model), fieldErrCount = Object.keys(errs).length;
    // field errors
    document.querySelectorAll("#cp-form [data-path]").forEach(function (el) {
      var p = el.getAttribute("data-path"), msg = errs[p] || "", e = $("err-" + p.replace(/\./g, "-"));
      if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
      if (e) e.textContent = msg;
    });
    // tab badges for steps with errors
    var stepOf = function (p) { return p.indexOf("cluster.") === 0 ? 0 : p.indexOf("ports.") === 0 ? 1 : p.indexOf("nets.") === 0 ? 2 : 3; };
    var bad = [0, 0, 0, 0];
    Object.keys(errs).forEach(function (p) { bad[stepOf(p)]++; });
    for (var s = 0; s < 4; s++) $("cp-tab-" + s).classList.toggle("has-error", bad[s] > 0);

    var grade = $("cp-grade");
    if (fieldErrCount) {
      grade.className = "cp-grade is-incomplete";
      grade.innerHTML = '<div class="cp-grade-letter" aria-hidden="true">?</div><div><p class="cp-grade-label">Fix the highlighted fields</p>' +
        '<p class="cp-grade-sub">' + fieldErrCount + " field" + (fieldErrCount > 1 ? "s need" : " needs") + " a valid value before the plan can be checked.</p></div>";
      $("cp-addresses").innerHTML = "";
      $("cp-findings").innerHTML = ""; $("cp-findings-ok").innerHTML = "";
      updateDownloadState(false);
      return;
    }

    var r = R.risks(model), g = R.grade(r);
    grade.className = "cp-grade grade-" + g.letter.toLowerCase();
    grade.innerHTML = '<div class="cp-grade-letter" aria-hidden="true">' + g.letter + "</div>" +
      '<div><p class="cp-grade-label">' + esc(g.label) + "</p>" +
      '<p class="cp-grade-sub"><strong>' + r.problems + "</strong> problem" + (r.problems === 1 ? "" : "s") +
      ", <strong>" + r.warnings + "</strong> warning" + (r.warnings === 1 ? "" : "s") +
      ' <a href="#cp-findings-h">See the risk check</a></p></div>';

    // addresses
    var rows = R.addresses(model), cols = [{ k: "MG", t: "Management" }, { k: "C0", t: "Corosync 0" }];
    if (model.cluster.link1 !== "None") cols.push({ k: "L1", t: "Corosync 1" });
    R.NETS.slice(2).forEach(function (n) { if (R.enabled(model, n.key)) cols.push({ k: n.key, t: n.name }); });
    var html = '<table class="cp-table"><thead><tr><th scope="col">Node</th>' + cols.map(function (c) { return '<th scope="col">' + esc(c.t) + "</th>"; }).join("") + "</tr></thead><tbody>";
    rows.forEach(function (row) {
      html += '<tr><th scope="row"><span class="cp-host">' + esc(row.hostname) + '</span><span class="cp-fqdn">' + esc(row.fqdn) + "</span></th>" +
        cols.map(function (c) { return "<td>" + esc(row[c.k]) + "</td>"; }).join("") + "</tr>";
    });
    html += "</tbody></table>";
    var nets = '<table class="cp-table cp-table-nets"><thead><tr><th scope="col">Network</th><th scope="col">Subnet</th><th scope="col">VLAN</th><th scope="col">Port</th><th scope="col">MTU</th></tr></thead><tbody>';
    R.NETS.forEach(function (n) {
      if (!R.enabled(model, n.key)) return;
      var x = model.nets[n.key];
      nets += "<tr><th scope=\"row\">" + esc(n.name) + "</th><td>" + esc(x.net + ".0/" + x.plen) + "</td><td>" +
        (Number(x.vlan) === 0 ? "untagged" : esc(x.vlan)) + "</td><td>" + esc(x.port) + "</td><td>" + esc(x.mtu) + "</td></tr>";
    });
    nets += "</tbody></table>";
    $("cp-addresses").innerHTML = html + '<h3 class="cp-h3">Networks and switch ports</h3>' + nets;

    // findings
    var order = { Problem: 0, Warning: 1, Info: 2 };
    var notOk = r.checks.filter(function (c) { return order[c.status] !== undefined; })
      .sort(function (a, b) { return order[a.status] - order[b.status] || a.n - b.n; });
    var ok = r.checks.filter(function (c) { return order[c.status] === undefined; });
    function li(c) {
      return '<li class="cp-finding ' + STATUS_CLASS[c.status] + '"><span class="cp-badge">' + esc(c.status) + "</span>" +
        '<div><p class="cp-finding-title">' + esc(c.check) + "</p><p>" + esc(c.text) + "</p>" +
        (c.why ? '<p class="cp-why">' + esc(c.why) + "</p>" : "") + "</div></li>";
    }
    $("cp-findings").innerHTML = notOk.length ? notOk.map(li).join("") : '<li class="cp-finding is-ok"><span class="cp-badge">OK</span><div><p class="cp-finding-title">Nothing to flag</p><p>Every check passed.</p></div></li>';
    $("cp-findings-ok").innerHTML = ok.map(li).join("");
    updateDownloadState(true);
  }

  // ------------------------------------------------------------- events
  function coerce(el) {
    var t = el.getAttribute("data-type");
    if (t === "bool") return el.checked;
    if (t === "int") return el.value.trim() === "" ? "" : Number(el.value);
    if (t === "num") return Number(el.value);
    return el.value;
  }
  // Changes that alter what the form itself shows (which fields exist or
  // are enabled) re-render the affected steps.
  function structural(path) {
    return /^cluster\.(nodes|switches|prefix)$/.test(path) || /^ports\.\d\.present$/.test(path) || /^nets\.\w\w\.use$/.test(path);
  }

  function onChange(e) {
    var el = e.target, path = el.getAttribute && el.getAttribute("data-path");
    if (!path) return;
    var v = coerce(el);
    if (path === "cluster.name" || path === "cluster.domain") v = String(v).trim();
    setPath(path, v);
    if (!started) { started = true; track("cluster_kit_form_started"); }
    if (structural(path) && e.type === "change") {
      if (/^cluster\.switches$/.test(path) && Number(v) === 1) model.ports.forEach(function (p) { p.sw = "A"; });
      renderAll();
    } else if (path === "cluster.prefix") {
      renderStep(3);
    }
    renderResults();
    writeHash();
  }

  function load(m) { model = m; renderAll(); renderResults(); writeHash(); }

  // ------------------------------------------------------- gate + download
  function setUnlocked(v) {
    unlocked = v;
    $("cp-signup").hidden = v;
    $("cp-unlocked").hidden = !v;
  }
  function updateDownloadState(valid) {
    var b = $("cp-download");
    if (!b) return;
    b.disabled = !valid;
    $("cp-download-msg").textContent = valid ? "" : "Fix the highlighted fields first.";
  }

  var jszipPromise;
  function loadJSZip() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    if (!jszipPromise) {
      jszipPromise = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = CFG.jszip; s.async = true;
        s.onload = function () { window.JSZip ? resolve(window.JSZip) : reject(new Error("JSZip did not load")); };
        s.onerror = function () { jszipPromise = null; reject(new Error("Couldn't load the file builder. Check your connection and try again.")); };
        document.head.appendChild(s);
      });
    }
    return jszipPromise;
  }

  function today() {
    var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  function download() {
    var btn = $("cp-download"), msg = $("cp-download-msg");
    if (Object.keys(R.validate(model)).length) { msg.textContent = "Fix the highlighted fields first."; return; }
    var label = btn.textContent;
    btn.disabled = true; btn.textContent = "Building your planner…"; msg.textContent = "";
    Promise.all([loadJSZip(), fetch(CFG.template, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("Couldn't fetch the template (" + r.status + "). Try again.");
      return r.arrayBuffer();
    })]).then(function (res) {
      return X.fillTemplate(res[0], res[1], model, {
        expectVersion: R.TEMPLATE_VERSION,
        generatedLine: "Generated on " + today() + " from mylemans.online/cluster-kit for cluster \"" + model.cluster.name + "\". Change the yellow cells on Inputs and everything else follows.",
        inputsNote: "These are your own values, filled in from mylemans.online/cluster-kit. The link in your welcome email reopens this design on the page."
      });
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      var a = document.createElement("a"), url = URL.createObjectURL(blob);
      a.href = url; a.download = model.cluster.name + "-network-plan.xlsx";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      track("cluster_kit_file_downloaded");
      msg.textContent = "";
    }).catch(function (err) {
      msg.textContent = (err && err.message) || "Something went wrong building the file. Try again.";
    }).then(function () { btn.disabled = false; btn.textContent = label; });
  }

  function signup(e) {
    e.preventDefault();
    var email = $("cp-email").value.trim(), consent = $("cp-consent").checked, msg = $("cp-signup-msg"), btn = $("cp-signup-btn");
    msg.textContent = "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = "Enter a valid email address."; $("cp-email").focus(); return; }
    if (!consent) { msg.textContent = "Tick the box to get the planner and the newsletter."; $("cp-consent").focus(); return; }
    var label = btn.textContent;
    btn.disabled = true; btn.textContent = "Sending…";
    track("cluster_kit_signup_submitted");
    fetch("/api/subscribe", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, consent: true, source: "cluster-kit", design: encode(model), website: $("cp-website").value })
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error(data.error || "Signup failed. Try again.");
      });
    }).then(function () {
      store(false);
      setUnlocked(true);
      $("cp-download").focus();
      download();
    }).catch(function (err) {
      // Never lose the design: it's in the model and the link.
      msg.textContent = (err && err.message ? err.message : "Signup failed.") + " Your design is kept, so just try again.";
      btn.disabled = false; btn.textContent = label;
    });
  }

  // ---------------------------------------------------------------- init
  function init() {
    var h = readHash();
    if (h.d) { var m = decode(h.d); if (m) model = m; }
    unlocked = h.u === "1" || store(true);
    if (h.u === "1") store(false);

    app.hidden = false;
    $("cp-findings-wrap").hidden = false;
    $("cp-gate").hidden = false;
    renderAll(); showStep(0); renderResults(); setUnlocked(unlocked);
    if (h.u === "1" || h.d) writeHash();

    $("cp-form").addEventListener("input", onChange);
    $("cp-form").addEventListener("change", onChange);
    $("cp-form").addEventListener("submit", function (e) { e.preventDefault(); });

    document.querySelectorAll(".cp-steps [data-step]").forEach(function (b) {
      b.addEventListener("click", function () { showStep(Number(b.getAttribute("data-step"))); });
      b.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        var n = (step + (e.key === "ArrowRight" ? 1 : 3)) % 4;
        showStep(n); $("cp-tab-" + n).focus();
      });
    });
    $("cp-prev").addEventListener("click", function () { showStep(step - 1); app.scrollIntoView({ behavior: "smooth", block: "start" }); });
    $("cp-next").addEventListener("click", function () {
      if (step === 3) { $("cp-gate").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      showStep(step + 1); app.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    document.querySelectorAll("[data-preset]").forEach(function (b) {
      b.addEventListener("click", function () {
        load(b.getAttribute("data-preset") === "marc" ? R.marcPreset() : R.cleanPreset());
        $("cp-copy-status").textContent = b.getAttribute("data-preset") === "marc" ? "Loaded my own cluster (it has one Warning, on purpose)." : "Loaded the clean example.";
      });
    });
    $("cp-copy-link").addEventListener("click", function () {
      var url = shareUrl(), st = $("cp-copy-status");
      var done = function () { st.textContent = "Link copied. It holds your whole design."; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { st.textContent = url; });
      else st.textContent = url;
    });

    $("cp-signup").addEventListener("submit", signup);
    $("cp-download").addEventListener("click", download);

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (en) { return en.isIntersecting; }) && !gradeSeen) {
          gradeSeen = true; track("cluster_kit_risk_grade_viewed"); io.disconnect();
        }
      }, { threshold: 0.6 });
      io.observe($("cp-findings-wrap"));
    }
  }

  init();
})();
