"""Compare spreadsheet-calculated results with the JS rules.

1. node tools/cluster-planner/test.js OUT          (writes OUT/*.xlsx + expected.json)
2. soffice --headless --calc --convert-to xlsx --outdir OUT/lo OUT/*.xlsx
3. python3 tools/cluster-planner/check_xlsx.py OUT
"""
import json, sys, os
from openpyxl import load_workbook

out = sys.argv[1]
exp = json.load(open(os.path.join(out, "expected.json")))
cols = {"MG": "D", "C0": "E", "L1": "F", "CP": "G", "CC": "H", "MI": "I", "C2": "J"}
bad = 0
for case, e in exp.items():
    wb = load_workbook(os.path.join(out, "lo", case + ".xlsx"), data_only=True)
    rk, plan, cmd = wb["Risk check"], wb["Plan"], wb["Commands"]
    got = {"summary": rk["B3"].value, "statuses": [rk[f"D{7+i}"].value for i in range(15)],
           "create": cmd["B18"].value, "ceph": (cmd["B34"].value or "").split("    #")[0]}
    probs = []
    for k in ("summary", "statuses", "create", "ceph"):
        if got[k] != e[k]: probs.append(f"{k}: sheet {got[k]!r} vs js {e[k]!r}")
    for a in e["addresses"]:
        r = 5 + a["n"]
        if plan[f"B{r}"].value != a["hostname"]: probs.append(f"host {a['n']}: {plan[f'B{r}'].value} vs {a['hostname']}")
        for k, c in cols.items():
            if plan[f"{c}{r}"].value != a[k]: probs.append(f"{k} node {a['n']}: {plan[f'{c}{r}'].value} vs {a[k]}")
    iface = [cmd[f"B{r}"].value for r in range(41, 105) if cmd[f"B{r}"].value]
    print(f"{case}: {'OK' if not probs else 'MISMATCH'}  sheet says {got['summary']}; interfaces file {len(iface)} lines")
    for p in probs: print("   ", p)
    bad += len(probs)
    if case == "singleport": print("    " + "\n    ".join(iface))
print("all match" if not bad else f"{bad} mismatch(es)")
sys.exit(1 if bad else 0)
