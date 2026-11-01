// Runs the plan's test cases through the JS rules and writes filled-in
// workbooks for checking in a spreadsheet app (see check_xlsx.py).
// Usage: node tools/cluster-planner/test.js [outdir]   (needs: npm i jszip)
const fs = require("fs");
const path = require("path");
const R = require("../../assets/js/cluster-planner-rules.js");
const X = require("../../assets/js/cluster-planner-xlsx.js");
const JSZip = require(process.env.JSZIP_PATH || "jszip");

const out = process.argv[2] || "cluster-planner-test-out";
fs.mkdirSync(out, { recursive: true });
const tpl = fs.readFileSync(path.join(__dirname, "../../assets/cluster-kit/proxmox-cluster-network-planner-v" + R.TEMPLATE_VERSION + ".xlsx"));

function broken() {
  const m = R.marcPreset();
  m.cluster.nodes = 4; m.cluster.switches = 2; m.cluster.link1 = "Management";
  m.ports[2] = { present: true, speed: 1, sw: "B" };
  m.nets.C0.port = "nic2"; m.nets.C0.vlan = 0;
  m.nets.CC.use = true;
  m.nets.MI.use = true; m.nets.MI.net = "10.0.30";
  m.nets.MG.vlan = 10;
  m.nodes[1].name = "Node_2";
  return m;
}
function singlePort() {
  const m = R.cleanPreset();
  m.cluster.link1 = "None";
  m.ports = [{ present: true, speed: 1, sw: "A" }, { present: false, speed: 1, sw: "A" }, { present: false, speed: 1, sw: "A" }, { present: false, speed: 1, sw: "A" }];
  m.nets.C0 = { use: true, port: "nic0", vlan: 20, net: "10.0.20", plen: 24, mtu: 1500 };
  m.nets.CP = { use: true, port: "nic0", vlan: 30, net: "10.0.30", plen: 24, mtu: 1500 };
  return m;
}

const cases = [
  { id: "default", model: R.marcPreset(), expect: { summary: "0 problem(s), 1 warning(s)",
    status: { 3: "Warning", 7: "Info", 9: "Info", 15: "Info" },
    node1: ["10.0.10.11", "10.0.20.11", "10.0.30.11"],
    create: "pvecm create homelab --link0 10.0.20.11 --link1 10.0.30.11",
    ceph: "pveceph init --network 10.0.30.0/24" } },
  { id: "broken", model: broken(), expect: { summary: "3 problem(s), 1 warning(s)",
    status: { 1: "Warning", 2: "Problem", 9: "Info", 11: "Problem", 14: "Problem", 15: "Info" },
    node1: ["10.0.10.11", "10.0.20.11", "10.0.30.11", "10.0.40.11"],
    create: "pvecm create homelab --link0 10.0.20.11 --link1 10.0.10.11",
    ceph: "pveceph init --network 10.0.30.0/24 --cluster-network 10.0.40.0/24" } },
  { id: "clean", model: R.cleanPreset(), expect: { summary: "0 problem(s), 0 warning(s)" } },
  { id: "singleport", model: singlePort(), expect: {} }
];

let failed = 0;
function check(label, got, want) {
  if (JSON.stringify(got) !== JSON.stringify(want)) { failed++; console.log("  FAIL " + label + ": got " + JSON.stringify(got) + ", want " + JSON.stringify(want)); }
}
(async () => {
  const report = {};
  for (const c of cases) {
    const r = R.risks(c.model), a = R.addresses(c.model)[0], e = c.expect;
    console.log(c.id + ": " + r.summary + " | " + r.checks.filter(x => x.status !== "OK").map(x => x.n + " " + x.check + "=" + x.status).join("; "));
    const errs = R.validate(c.model);
    check(c.id + " field errors", Object.keys(errs), []);
    if (e.summary) check(c.id + " summary", r.summary, e.summary);
    if (e.status) for (const n in e.status) check(c.id + " check " + n, r.checks[n - 1].status, e.status[n]);
    if (e.status) check(c.id + " non-OK set", r.checks.filter(x => !["OK", "n/a"].includes(x.status)).map(x => x.n).sort((x, y) => x - y), Object.keys(e.status).map(Number));
    if (e.node1) check(c.id + " node 1", [a.MG, a.C0, a.CP].concat(R.enabled(c.model, "CC") ? [a.CC] : []), e.node1);
    if (e.create) check(c.id + " create", R.createCommand(c.model), e.create);
    if (e.ceph) check(c.id + " ceph", R.cephInit(c.model), e.ceph);
    const bytes = await X.fillTemplate(JSZip, tpl, c.model, { expectVersion: R.TEMPLATE_VERSION,
      generatedLine: "Generated on 2026-11-01 from mylemans.online/cluster-kit", inputsNote: "Filled in from your design." });
    fs.writeFileSync(path.join(out, c.id + ".xlsx"), bytes);
    report[c.id] = { summary: r.summary, statuses: r.checks.map(x => x.status), addresses: R.addresses(c.model),
                     create: R.createCommand(c.model), ceph: R.cephInit(c.model) };
  }
  fs.writeFileSync(path.join(out, "expected.json"), JSON.stringify(report, null, 1));
  console.log(failed ? failed + " check(s) failed" : "all rule checks passed");
  process.exit(failed ? 1 : 0);
})();
