"""Build the Proxmox Cluster Network Planner workbook (template v1.1).

The web planner at mylemans.online/cluster-kit/ fills this template in the
visitor's browser: it patches only the input cells on the Inputs sheet (plus
the "Generated on" line on Start here and the note on Inputs B41) and re-zips.
openpyxl writes formulas without cached values and the workbook is flagged to
recalculate fully on load, so there are no stale values to go wrong.

Changing an input cell address or the version? Update
assets/js/cluster-planner-rules.js and cluster-planner.js to match, and bump
TEMPLATE_VERSION in both places (and the template file name).

Usage: python3 build.py assets/cluster-kit/proxmox-cluster-network-planner-v1.1.xlsx

All logic is in formulas so the sheet recalculates when the reader edits Inputs.
Only Excel-2007-era functions are used (no FILTER/TEXTJOIN/MAXIFS) so it works in
Excel, LibreOffice and Google Sheets.
"""
import sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule, FormulaRule

TEMPLATE_VERSION = "1.1"
OUT = sys.argv[1] if len(sys.argv) > 1 else f"proxmox-cluster-network-planner-v{TEMPLATE_VERSION}.xlsx"

# ---------- style ----------
NAVY = "1F2A44"
F = "Arial"
MONO = "Consolas"
f_base = Font(name=F, size=10)
f_title = Font(name=F, size=18, bold=True, color=NAVY)
f_sub = Font(name=F, size=11, color="555555", italic=True)
f_h2 = Font(name=F, size=12, bold=True, color=NAVY)
f_hdr = Font(name=F, size=10, bold=True, color="FFFFFF")
f_bold = Font(name=F, size=10, bold=True)
f_perm = Font(name=F, size=10, bold=True, color="C0392B")
f_note = Font(name=F, size=9, color="666666", italic=True)
f_mono = Font(name=MONO, size=10)
f_link = Font(name=F, size=10, color="1F5FBF", underline="single")
fill_hdr = PatternFill("solid", fgColor=NAVY)
fill_in = PatternFill("solid", fgColor="FFF4C2")
fill_calc = PatternFill("solid", fgColor="F2F4F7")
fill_code = PatternFill("solid", fgColor="F7F7F2")
thin = Side(style="thin", color="D0D4DC")
box = Border(left=thin, right=thin, top=thin, bottom=thin)
wrap = Alignment(wrap_text=True, vertical="top")
top = Alignment(vertical="top")

wb = Workbook()

def style_range(ws, rng, font=None, fill=None, border=None, align=None):
    for row in ws[rng]:
        for c in row:
            if font: c.font = font
            if fill: c.fill = fill
            if border: c.border = border
            if align: c.alignment = align

def hdr(ws, row, col_start, labels):
    for i, lab in enumerate(labels):
        c = ws.cell(row=row, column=col_start + i, value=lab)
        c.font = f_hdr; c.fill = fill_hdr; c.border = box
        c.alignment = Alignment(wrap_text=True, vertical="center")

def put(ws, ref, val, font=f_base, fill=None, align=None, border=None):
    c = ws[ref]; c.value = val; c.font = font
    if fill: c.fill = fill
    if align: c.alignment = align
    if border: c.border = border
    return c

def widths(ws, d):
    for col, w in d.items():
        ws.column_dimensions[col].width = w

# ---------- sheets ----------
ws_start = wb.active; ws_start.title = "Start here"
ws_in = wb.create_sheet("Inputs")
ws_plan = wb.create_sheet("Plan")
ws_inst = wb.create_sheet("Installer")
ws_cmd = wb.create_sheet("Commands")
ws_risk = wb.create_sheet("Risk check")
ws_chk = wb.create_sheet("Checklist")
ws_c = wb.create_sheet("_calc")
for ws in wb.worksheets:
    ws.sheet_view.showGridLines = False

# ======================================================================
# INPUTS
# ======================================================================
I = "Inputs!"
put(ws_in, "B1", "Inputs", f_title)
put(ws_in, "B2", "Fill in the yellow cells. Labels in red are permanent: they can't be changed once the cluster exists.", f_sub)

put(ws_in, "B3", "Cluster", f_h2)
cluster_rows = [
    (4, "Cluster name", "homelab", True, "Lowercase letters, digits, hyphens. Cannot be changed later."),
    (5, "DNS domain", "lab.example.com", True, "Hostnames become <name>.<domain>."),
    (6, "Hostname prefix", "pve", True, "Nodes are named prefix + number unless you override them below."),
    (7, "Number of nodes", 3, False, "1 to 8. Three or five is the sweet spot."),
    (8, "First host number", 11, True, "Last octet of node 1 on every network. Node 2 gets the next one, and so on."),
    (9, "Default gateway (management)", "10.0.10.1", False, "Your router on the management network."),
    (10, "DNS server", "10.0.10.1", False, ""),
    (11, "Number of switches", 1, False, "1 or 2. Used by the risk check."),
    (12, "Corosync link 1 uses", "Ceph public", False, "Which network carries the second cluster link. None means no second link."),
]
for r, lab, val, perm, note in cluster_rows:
    put(ws_in, f"B{r}", lab, f_perm if perm else f_bold, border=box)
    put(ws_in, f"C{r}", val, f_base, fill_in, border=box)
    put(ws_in, f"D{r}", note, f_note)
put(ws_in, "B13", "Red label = permanent once the cluster is created (Proxmox docs, Cluster Manager).", f_note)

put(ws_in, "B14", "Network ports (the same on every node)", f_h2)
hdr(ws_in, 15, 2, ["Port", "Present", "Speed (Gbps)", "Switch", "Notes"])
ports = [("nic0", "Yes", 10, "A", "Proxmox 9.1+ pins port names as nic0, nic1... by default."),
         ("nic1", "Yes", 10, "A", ""),
         ("nic2", "No", 1, "A", ""),
         ("nic3", "No", 1, "A", "")]
for i, (p, pres, sp, sw, note) in enumerate(ports):
    r = 16 + i
    put(ws_in, f"B{r}", p, f_bold, border=box)
    put(ws_in, f"C{r}", pres, fill=fill_in, border=box)
    put(ws_in, f"D{r}", sp, fill=fill_in, border=box)
    put(ws_in, f"E{r}", sw, fill=fill_in, border=box)
    put(ws_in, f"F{r}", note, f_note)

put(ws_in, "B21", "Networks", f_h2)
hdr(ws_in, 22, 2, ["Network", "Use", "Port", "VLAN ID (0 = untagged)", "Network (first 3 octets)", "Prefix length", "MTU", "What it carries"])
# key, row, name, use, port, vlan, net, plen, mtu, note, use_fixed
NETS = [
    ("MG", 23, "Management", "Yes", "nic0", 0, "10.0.10", 24, 1500, "Web UI, SSH, default gateway. Becomes the VM bridge vmbr0. Must be untagged.", True),
    ("C0", 24, "Corosync link 0", "Yes", "nic0", 20, "10.0.20", 24, 1500, "Cluster heartbeat. Needs low latency, not bandwidth.", True),
    ("CP", 25, "Ceph public", "Yes", "nic1", 0, "10.0.30", 24, 9000, "VM disk traffic to Ceph and Ceph service traffic.", False),
    ("CC", 26, "Ceph cluster", "No", "nic1", 40, "10.0.40", 24, 9000, "Optional: OSD replication on its own network.", False),
    ("MI", 27, "Migration", "No", "nic1", 50, "10.0.50", 24, 9000, "Optional: live migration on its own network.", False),
    ("C2", 28, "Dedicated link 1", "No", "nic1", 60, "10.0.60", 24, 1500, "Optional: a network only for Corosync link 1.", False),
]
NROW = {k: r for k, r, *_ in NETS}
NNAME = {k: n for k, r, n, *_ in NETS}
for k, r, name, use, port, vlan, net, plen, mtu, note, fixed in NETS:
    put(ws_in, f"B{r}", name, f_perm if k in ("MG", "C0") else f_bold, border=box)
    put(ws_in, f"C{r}", use, fill=fill_calc if fixed else fill_in, border=box)
    for col, v in zip("DEFGH", [port, vlan, net, plen, mtu]):
        put(ws_in, f"{col}{r}", v, fill=fill_in, border=box)
    put(ws_in, f"I{r}", note, f_note)
put(ws_in, "B29", "Management and Corosync link 0 are always on. IP and subnet choices are permanent: Proxmox can't change node IPs after the cluster exists.", f_note)

put(ws_in, "B30", "Nodes", f_h2)
hdr(ws_in, 31, 1, ["#", "Hostname override", "Hostname", "FQDN", "MAC nic0", "MAC nic1", "MAC nic2", "MAC nic3"])
for n in range(1, 9):
    r = 31 + n
    put(ws_in, f"A{r}", n, f_bold, border=box)
    put(ws_in, f"B{r}", None, fill=fill_in, border=box)
    put(ws_in, f"C{r}", f'=IF(A{r}>$C$7,"",IF(B{r}<>"",LOWER(TRIM(B{r})),LOWER($C$6)&A{r}))', fill=fill_calc, border=box)
    put(ws_in, f"D{r}", f'=IF(C{r}="","",C{r}&"."&$C$5)', fill=fill_calc, border=box)
    for col in "EFGH":
        put(ws_in, f"{col}{r}", None, fill=fill_in, border=box)
put(ws_in, "B40", "MACs are optional but save guessing in the installer, which lists ports by MAC. Find them on the BIOS screen or with 'ip link' from a live USB.", f_note)
put(ws_in, "B41", "The example values are my own cluster: three Lenovo M720q nodes, two 10GbE ports each, one switch.", f_note)

widths(ws_in, {"A": 5, "B": 30, "C": 20, "D": 22, "E": 22, "F": 24, "G": 14, "H": 10, "I": 60})
ws_in.freeze_panes = "A3"

# validations
dv_yesno = DataValidation(type="list", formula1='"Yes,No"', allow_blank=False)
dv_port = DataValidation(type="list", formula1='"nic0,nic1,nic2,nic3"', allow_blank=False)
dv_sw = DataValidation(type="list", formula1='"A,B"', allow_blank=False)
dv_link1 = DataValidation(type="list", formula1='"None,Management,Ceph public,Ceph cluster,Migration,Dedicated link 1"', allow_blank=False)
dv_nodes = DataValidation(type="whole", operator="between", formula1="1", formula2="8")
dv_sws = DataValidation(type="whole", operator="between", formula1="1", formula2="2")
dv_host = DataValidation(type="whole", operator="between", formula1="2", formula2="250")
dv_vlan = DataValidation(type="whole", operator="between", formula1="0", formula2="4094")
dv_plen = DataValidation(type="whole", operator="between", formula1="16", formula2="24")
dv_mtu = DataValidation(type="whole", operator="between", formula1="1280", formula2="9216")
for dv in (dv_yesno, dv_port, dv_sw, dv_link1, dv_nodes, dv_sws, dv_host, dv_vlan, dv_plen, dv_mtu):
    ws_in.add_data_validation(dv)
dv_nodes.add("C7"); dv_host.add("C8"); dv_sws.add("C11"); dv_link1.add("C12")
dv_yesno.add("C16:C19"); dv_sw.add("E16:E19")
dv_yesno.add("C25:C28"); dv_port.add("D23:D28"); dv_vlan.add("E23:E28"); dv_plen.add("G23:G28"); dv_mtu.add("H23:H28")

def en(k): return f'{I}$C${NROW[k]}="Yes"'
def port(k): return f'{I}$D${NROW[k]}'
def vlan(k): return f'{I}$E${NROW[k]}'
def net(k): return f'{I}$F${NROW[k]}'
def plen(k): return f'{I}$G${NROW[k]}'
def mtu(k): return f'{I}$H${NROW[k]}'
COUNT = f"{I}$C$7"; START = f"{I}$C$8"; GW = f"{I}$C$9"; DNS = f"{I}$C$10"
SWITCHES = f"{I}$C$11"; L1 = f"{I}$C$12"; CNAME = f"{I}$C$4"
def host(n): return f"{I}$C${31+n}"
def fqdn(n): return f"{I}$D${31+n}"
def ip(k, n_expr): return f'{net(k)}&"."&({START}+{n_expr}-1)'

# ======================================================================
# _calc (hidden helpers)
# ======================================================================
C = "_calc!"
put(ws_c, "A1", "Helper calculations. Don't edit.", f_bold)
# link 1 helpers
L1MAP = {"Management": "MG", "Ceph public": "CP", "Ceph cluster": "CC", "Migration": "MI", "Dedicated link 1": "C2"}
def l1_pick(fn, none_val):
    expr = none_val
    for label, k in reversed(list(L1MAP.items())):
        expr = f'IF({L1}="{label}",{fn(k)},{expr})'
    return expr
put(ws_c, "A2", "link1 port"); put(ws_c, "B2", "=" + l1_pick(port, '""'))
put(ws_c, "A3", "link1 enabled"); put(ws_c, "B3", f'=IF({L1}="None",TRUE,' + l1_pick(lambda k: f'({en(k)})', "FALSE") + ")")
put(ws_c, "A5", "template version"); put(ws_c, "B5", TEMPLATE_VERSION)
put(ws_c, "A4", "selected node"); put(ws_c, "B4", "=MIN(MAX(Commands!$C$3,1),Inputs!$C$7)")
SEL = "_calc!$B$4"

# per-port helpers rows 10-13
hdr(ws_c, 9, 1, ["port", "present", "speed", "switch", "carries", "mtu", "untagged", "count"])
KEYS = [k for k, *_ in NETS]
for i, p in enumerate(["nic0", "nic1", "nic2", "nic3"]):
    r = 10 + i
    put(ws_c, f"A{r}", p)
    put(ws_c, f"B{r}", f"={I}C{16+i}")
    put(ws_c, f"C{r}", f"={I}D{16+i}")
    put(ws_c, f"D{r}", f"={I}E{16+i}")
    lst = "&".join(f'IF(AND({en(k)},{port(k)}=A{r}),", {NNAME[k]}","")' for k in KEYS)
    put(ws_c, f"E{r}", f"=MID({lst},3,300)")
    put(ws_c, f"F{r}", "=MAX(" + ",".join(f"IF(AND({en(k)},{port(k)}=A{r}),{mtu(k)},0)" for k in KEYS) + ")")
    put(ws_c, f"G{r}", "=" + "+".join(f"IF(AND({en(k)},{port(k)}=A{r},{vlan(k)}=0),1,0)" for k in KEYS))
    put(ws_c, f"H{r}", "=" + "+".join(f"IF(AND({en(k)},{port(k)}=A{r}),1,0)" for k in KEYS))
PRANGE = "_calc!$A$10:$A$13"
def port_attr(col, port_expr):
    return f"INDEX(_calc!${col}$10:${col}$13,MATCH({port_expr},{PRANGE},0))"

# per-network helpers rows 20-25
hdr(ws_c, 19, 1, ["net", "enabled", "port", "vlan", "mtu", "ifname", "ip (selected node)", "subnet", "speed", "switch", "present", "dupes", "if mtu"])
NC = {}
for i, k in enumerate(KEYS):
    r = 20 + i; NC[k] = r
    put(ws_c, f"A{r}", k)
    put(ws_c, f"B{r}", f"={en(k)}")
    put(ws_c, f"C{r}", f"={port(k)}")
    put(ws_c, f"D{r}", f"={vlan(k)}")
    put(ws_c, f"E{r}", f"={mtu(k)}")
    if k == "MG":
        put(ws_c, f"F{r}", '="vmbr0"')
    else:
        put(ws_c, f"F{r}", f'=IF(C{r}={port("MG")},"vmbr0."&D{r},IF(D{r}=0,C{r},C{r}&"."&D{r}))')
    put(ws_c, f"G{r}", f"={ip(k, SEL)}")
    put(ws_c, f"H{r}", f'={net(k)}&".0/"&{plen(k)}')
    put(ws_c, f"I{r}", f"=IFERROR({port_attr('C', f'C{r}')},0)")
    put(ws_c, f"J{r}", f'=IFERROR({port_attr("D", f"C{r}")},"")')
    put(ws_c, f"K{r}", f'=IFERROR({port_attr("B", f"C{r}")}="Yes",FALSE)')
    put(ws_c, f"L{r}", f"=IF(B{r},SUMPRODUCT(--($B$20:$B$25),--({I}$F$23:$F$28={net(k)})),0)")
    # mtu to put on this interface: untagged on its own port -> the port's MTU
    put(ws_c, f"M{r}", f"=IF(F{r}=C{r},IFERROR({port_attr('F', f'C{r}')},E{r}),E{r})")

# ---------- line generators: A=text, B=keep, C=cumulative ----------
blocks = {}
def block(start, lines, name):
    """lines: list of (text_formula, keep_formula). Writes rows, returns (first,last)."""
    r = start
    for text, keep in lines:
        put(ws_c, f"A{r}", "=" + text if not text.startswith("=") else text)
        put(ws_c, f"B{r}", f"=IF({keep},1,0)")
        put(ws_c, f"C{r}", f"=B{r}" if r == start else f"=C{r-1}+B{r}")
        r += 1
    blocks[name] = (start, r - 1)
    return r

# interfaces for selected node
mg_mtu = port_attr("F", port("MG"))
lines = [('"auto lo"', "TRUE"), ('"iface lo inet loopback"', "TRUE"), ('""', "TRUE")]
for i in range(4):
    pr = 10 + i
    used = f'AND(_calc!$H${pr}>0,OR(_calc!$A${pr}={port("MG")},_calc!$G${pr}=0))'
    lines += [(f'"iface "&_calc!$A${pr}&" inet manual"', used),
              (f'"    mtu "&_calc!$F${pr}', f"AND({used},_calc!$F${pr}>1500)"),
              ('""', used)]
mg = NC["MG"]
lines += [('"auto vmbr0"', "TRUE"),
          ('"iface vmbr0 inet static"', "TRUE"),
          (f'"    address "&_calc!$G${mg}&"/"&{plen("MG")}', "TRUE"),
          (f'"    gateway "&{GW}', f'{GW}<>""'),
          (f'"    bridge-ports "&{port("MG")}', "TRUE"),
          ('"    bridge-stp off"', "TRUE"),
          ('"    bridge-fd 0"', "TRUE"),
          ('"    bridge-vlan-aware yes"', "TRUE"),
          ('"    bridge-vids 2-4094"', "TRUE"),
          (f'"    mtu "&{mg_mtu}', f"{mg_mtu}>1500"),
          ('""', "TRUE")]
for k in ["C0", "CP", "CC", "MI", "C2"]:
    r = NC[k]
    e = f"_calc!$B${r}"
    lines += [(f'"auto "&_calc!$F${r}', e),
              (f'"iface "&_calc!$F${r}&" inet static"', e),
              (f'"    address "&_calc!$G${r}&"/"&{plen(k)}', e),
              (f'"    mtu "&_calc!$M${r}', f"AND({e},_calc!$M${r}>1500)"),
              ('""', e)]
nxt = block(40, lines, "ifaces")

# jumbo tests from selected node
jl = []
for k in KEYS:
    r = NC[k]
    for t in range(1, 9):
        jl.append((f'"ping -M do -s "&({mtu(k)}-28)&" -c 3 "&{ip(k, t)}&"    # {NNAME[k]} to "&{host(t)}',
                   f"AND(_calc!$B${r},{mtu(k)}>1500,{t}<={COUNT},{t}<>{SEL})"))
nxt = block(120, jl, "jumbo")
# latency tests
ll = [(f'"ping -c 50 -i 0.2 "&{ip("C0", t)}&"    # Corosync link 0 to "&{host(t)}', f"AND({t}<={COUNT},{t}<>{SEL})") for t in range(1, 9)]
nxt = block(175, ll, "lat")
# hosts block
hl = [(f'{ip("MG", t)}&"  "&{fqdn(t)}&"  "&{host(t)}', f"{t}<={COUNT}") for t in range(1, 9)]
nxt = block(190, hl, "hosts")
# join commands
jn = []
for t in range(2, 9):
    jn.append((f'"pvecm add "&Plan!$D$6&" --link0 "&Plan!$E${5+t}&IF({L1}<>"None"," --link1 "&Plan!$F${5+t},"")&"    # run on "&{host(t)}',
               f"{t}<={COUNT}"))
nxt = block(205, jn, "join")
ws_c.sheet_state = "hidden"
widths(ws_c, {"A": 60})

def out_formula(name, k_expr):
    a, b = blocks[name]
    return f'=IFERROR(INDEX(_calc!$A${a}:$A${b},MATCH({k_expr},_calc!$C${a}:$C${b},0)),"")'

# ======================================================================
# PLAN
# ======================================================================
put(ws_plan, "B1", "Plan", f_title)
put(ws_plan, "B2", "Generated from Inputs. Every node gets the same last octet on every network, so 10.0.x.11 is always node 1.", f_sub)
put(ws_plan, "B3", "Addresses per node", f_h2)
cols = ["#", "Hostname", "FQDN", "Management IP", "Corosync link 0", "Corosync link 1", "Ceph public", "Ceph cluster", "Migration", "Dedicated link 1"]
hdr(ws_plan, 5, 1, cols)
colkey = {"D": "MG", "E": "C0", "G": "CP", "H": "CC", "I": "MI", "J": "C2"}
for n in range(1, 9):
    r = 5 + n
    put(ws_plan, f"A{r}", n, f_bold, border=box)
    put(ws_plan, f"B{r}", f"={host(n)}", border=box)
    put(ws_plan, f"C{r}", f"={fqdn(n)}", border=box)
    for col, k in colkey.items():
        if k in ("MG", "C0"):
            fml = f'=IF($A{r}>{COUNT},"",{ip(k, f"$A{r}")})'
        else:
            fml = f'=IF($A{r}>{COUNT},"",IF({en(k)},{ip(k, f"$A{r}")},"-"))'
        put(ws_plan, f"{col}{r}", fml, border=box)
    l1 = (f'IF({L1}="Management",D{r},IF({L1}="Ceph public",G{r},IF({L1}="Ceph cluster",H{r},'
          f'IF({L1}="Migration",I{r},IF({L1}="Dedicated link 1",J{r},"-")))))')
    put(ws_plan, f"F{r}", f'=IF($A{r}>{COUNT},"",IF({L1}="None","-",{l1}))', border=box)
style_range(ws_plan, "B6:C13", font=f_perm)

put(ws_plan, "B15", "Networks", f_h2)
hdr(ws_plan, 16, 2, ["Network", "In use", "Subnet", "VLAN", "Port", "MTU", "Switch port setting"])
for i, k in enumerate(KEYS):
    r = 17 + i; cr = NC[k]
    put(ws_plan, f"B{r}", NNAME[k], f_bold, border=box)
    put(ws_plan, f"C{r}", f'=IF(_calc!$B${cr},"Yes","No")', border=box)
    put(ws_plan, f"D{r}", f'=IF(_calc!$B${cr},_calc!$H${cr},"-")', border=box)
    put(ws_plan, f"E{r}", f'=IF(_calc!$B${cr},IF({vlan(k)}=0,"untagged",{vlan(k)}),"-")', border=box)
    put(ws_plan, f"F{r}", f'=IF(_calc!$B${cr},{port(k)},"-")', border=box)
    put(ws_plan, f"G{r}", f'=IF(_calc!$B${cr},{mtu(k)},"-")', border=box)
    put(ws_plan, f"H{r}", f'=IF(_calc!$B${cr},IF({vlan(k)}=0,"Native/untagged VLAN on the port","Tag VLAN "&{vlan(k)}&" on the port"),"-")', border=box)

put(ws_plan, "B24", "Ports", f_h2)
hdr(ws_plan, 25, 2, ["Port", "Speed (Gbps)", "Switch", "Carries", "MTU to set on port and switch"])
for i in range(4):
    r = 26 + i; cr = 10 + i
    put(ws_plan, f"B{r}", f"=_calc!A{cr}", f_bold, border=box)
    put(ws_plan, f"C{r}", f'=IF(_calc!B{cr}="Yes",_calc!C{cr},"not present")', border=box)
    put(ws_plan, f"D{r}", f'=IF(_calc!B{cr}="Yes",_calc!D{cr},"-")', border=box)
    put(ws_plan, f"E{r}", f'=IF(_calc!H{cr}=0,"unused",_calc!E{cr})', border=box)
    put(ws_plan, f"F{r}", f'=IF(_calc!H{cr}=0,"-",_calc!F{cr})', border=box)
put(ws_plan, "B31", "Red = permanent. Hostnames and node IPs can't be changed once the cluster exists.", f_note)
widths(ws_plan, {"A": 5, "B": 20, "C": 24, "D": 18, "E": 18, "F": 34, "G": 16, "H": 34, "I": 14, "J": 16})
ws_plan.freeze_panes = "A6"

# ======================================================================
# INSTALLER CARD
# ======================================================================
put(ws_inst, "B1", "Installer card", f_title)
put(ws_inst, "B2", "What to type on the installer's network screen, per node. Red rows are permanent.", f_sub)
hdr(ws_inst, 4, 2, ["Field"] + [f"Node {n}" for n in range(1, 9)])
rows = [
    ("Hostname (FQDN)", lambda n: f"={fqdn(n)}", True),
    ("IP address (CIDR)", lambda n: f'=IF({n}>{COUNT},"",{ip("MG", n)}&"/"&{plen("MG")})', True),
    ("Gateway", lambda n: f'=IF({n}>{COUNT},"",{GW})', False),
    ("DNS server", lambda n: f'=IF({n}>{COUNT},"",{DNS})', False),
    ("Management interface", lambda n: f'=IF({n}>{COUNT},"",{port("MG")})', False),
    ("MAC of that port", lambda n: f'=IF({n}>{COUNT},"",IFERROR(IF(INDEX({I}$E${31+n}:$H${31+n},1,MATCH({port("MG")},{I}$B$16:$B$19,0))&""="","(add on Inputs)",INDEX({I}$E${31+n}:$H${31+n},1,MATCH({port("MG")},{I}$B$16:$B$19,0))&""),""))', False),
    ("Pin network interface names", lambda n: f'=IF({n}>{COUNT},"","Leave ticked")', False),
]
for i, (lab, fn, perm) in enumerate(rows):
    r = 5 + i
    put(ws_inst, f"B{r}", lab, f_perm if perm else f_bold, border=box)
    for n in range(1, 9):
        col = chr(ord("B") + n)
        put(ws_inst, f"{col}{r}", fn(n), f_perm if perm else f_base, border=box)
notes = [
    "The installer can't tag a VLAN, so the switch port for management must send it untagged (native VLAN).",
    "Pick the management port by its MAC, not by its position in the list.",
    "Read the summary page before you press Install. A wrong hostname takes minutes to fix now and a reinstall after clustering.",
    "Only management is set in the installer. The other networks come from the Commands tab after the first boot.",
]
for i, t in enumerate(notes):
    put(ws_inst, f"B{14+i}", t, f_note)
widths(ws_inst, {"A": 3, "B": 28, **{chr(ord("B") + n): 24 for n in range(1, 9)}})
ws_inst.freeze_panes = "C5"

# ======================================================================
# COMMANDS
# ======================================================================
put(ws_cmd, "B1", "Commands", f_title)
put(ws_cmd, "B2", "Paste-ready config and tests. Select the cells in a block and copy; empty cells become empty lines.", f_sub)
put(ws_cmd, "B3", "Node for the per-node blocks:", f_bold)
put(ws_cmd, "C3", 1, f_bold, fill_in, border=box)
dv_sel = DataValidation(type="list", formula1='"1,2,3,4,5,6,7,8"', allow_blank=False)
ws_cmd.add_data_validation(dv_sel); dv_sel.add("C3")
put(ws_cmd, "D3", f'="Showing "&{C}$B$4&": "&INDEX({I}$C$32:$C$39,{C}$B$4)', f_bold)

def section(row, title, note):
    put(ws_cmd, f"B{row}", title, f_h2)
    put(ws_cmd, f"B{row+1}", note, f_note)

def code(ref, fml):
    c = put(ws_cmd, ref, fml, f_mono, fill_code)
    return c

r = 5
section(r, "1. /etc/hosts (all nodes)", "Append to /etc/hosts on every node so they find each other by name.")
for k in range(1, 9):
    code(f"B{r+1+k}", out_formula("hosts", k))
r = 16
section(r, "2. Create the cluster (on node 1 only)", "Pins Corosync to your planned links instead of whatever the hostname resolves to.")
code(f"B{r+2}", f'="pvecm create "&{CNAME}&" --link0 "&Plan!$E$6&IF({L1}<>"None"," --link1 "&Plan!$F$6,"")')
code(f"B{r+3}", '="pvecm status"')
r = 21
section(r, "3. Join the other nodes (run each line on that node)", "Joins via node 1's management IP; each node sets its own link addresses.")
for k in range(1, 8):
    code(f"B{r+1+k}", out_formula("join", k))
code(f"B{r+9}", '="corosync-cfgtool -s    # every link should show connected"')
r = 32
section(r, "4. Ceph (once the cluster is up)", "Install Ceph on every node from the GUI wizard or with 'pveceph install', then:")
code(f"B{r+2}", f'=IF({en("CP")},"pveceph init --network "&_calc!$H${NC["CP"]}&IF({en("CC")}," --cluster-network "&_calc!$H${NC["CC"]},"")&"    # on node 1","Ceph public is off on Inputs.")')
code(f"B{r+3}", f'=IF(AND({en("CP")},{COUNT}>=3),"pveceph mon create    # on "&{host(1)}&", "&{host(2)}&" and "&{host(3)},"")')
code(f"B{r+4}", f'=IF(AND({en("CP")},{COUNT}>=3),"pveceph mgr create    # on "&{host(2)}&" and "&{host(3)}&" (node 1 got one from init)","")')
code(f"B{r+5}", f'=IF({en("MI")},"migration: secure,network="&_calc!$H${NC["MI"]}&"    # add to /etc/pve/datacenter.cfg","(Migration network off: live migrations use the cluster network.)")')
r = 39
section(r, "5. /etc/network/interfaces for the selected node", "Keep console access (KVM or a monitor) when you apply it: ifreload -a. Check the port names first with 'ip link'.")
IF_START = r + 2
for k in range(1, 65):
    code(f"B{IF_START + k - 1}", out_formula("ifaces", k))
r = IF_START + 66
section(r, "6. Jumbo frame tests from the selected node", "Every line must answer. 'Message too long' or silence means an MTU mismatch somewhere in the path.")
for k in range(1, 49):
    code(f"B{r + 1 + k}", out_formula("jumbo", k))
r = r + 52
section(r, "7. Corosync latency from the selected node", "Look at the avg value in the summary: Proxmox wants well under 5 ms.")
for k in range(1, 9):
    code(f"B{r + 1 + k}", out_formula("lat", k))
widths(ws_cmd, {"A": 3, "B": 110, "C": 8, "D": 30})
ws_cmd.freeze_panes = "A4"

# ======================================================================
# RISK CHECK
# ======================================================================
put(ws_risk, "B1", "Risk check", f_title)
put(ws_risk, "B2", "Fix every Problem before you install. Decide on every Warning: fix it, or accept it on purpose.", f_sub)
put(ws_risk, "B3", '=COUNTIF(D7:D25,"Problem")&" problem(s), "&COUNTIF(D7:D25,"Warning")&" warning(s)"', f_h2)
hdr(ws_risk, 6, 2, ["#", "Check", "Result", "What it means for your plan", "Why"])

c0p = port("C0"); mgp = port("MG"); cpp = port("CP"); ccp = port("CC")
c0cnt = port_attr("H", c0p); c0list = port_attr("E", c0p)
c0sw = port_attr("D", c0p); l1sw = f'IFERROR({port_attr("D", "_calc!$B$2")},"")'
cpspeed = port_attr("C", cpp)
rules = [
    ("Node count",
     f'=IF({COUNT}<3,"Problem",IF(MOD({COUNT},2)=0,"Warning","OK"))',
     f'=IF({COUNT}<3,"Ceph and HA need at least three nodes for a reliable majority.",IF(MOD({COUNT},2)=0,"An even count can split down the middle with no majority. Add a QDevice as an extra vote.","Odd node count: the cluster keeps quorum with one node down."))',
     "Quorum needs a majority of votes. Proxmox supports a QDevice for even node counts."),
    ("Management untagged",
     f'=IF({vlan("MG")}=0,"OK","Problem")',
     f'=IF({vlan("MG")}=0,"Management arrives untagged, which is what the installer sets up.","The installer can\'t tag a VLAN. Make management the native VLAN on the switch port and enter 0.")',
     "The installer configures one untagged address on vmbr0."),
    ("Corosync link 0 has its own port",
     f'=IF({c0cnt}<=1,"OK","Warning")',
     f'=IF({c0cnt}<=1,"Link 0 has "&{c0p}&" to itself.","Link 0 is not alone: "&{c0p}&" carries "&{c0list}&". Heavy traffic on that port can delay heartbeats.")',
     "Proxmox recommends a dedicated physical NIC for cluster traffic; a 1 Gbit port is enough."),
    ("Corosync apart from Ceph",
     f'=IF(OR(AND({en("CP")},{c0p}={cpp}),AND({en("CC")},{c0p}={ccp})),"Problem","OK")',
     f'=IF(OR(AND({en("CP")},{c0p}={cpp}),AND({en("CC")},{c0p}={ccp})),"Link 0 is on the same port as Ceph. A Ceph recovery can fill that link and cost you quorum.","Corosync link 0 and Ceph use different ports.")',
     "Proxmox: do not share a network between Corosync and storage, except as a low-priority fallback link."),
    ("Second Corosync link",
     f'=IF({L1}="None","Warning",IF(_calc!$B$3,"OK","Problem"))',
     f'=IF({L1}="None","No second link. If link 0 fails, the node drops out of the cluster.",IF(_calc!$B$3,"Link 1 runs over "&{L1}&". It only carries heartbeats if link 0 fails.","Link 1 points at a network that is switched off on Inputs."))',
     "Reliable redundancy needs at least one more link on a different physical network."),
    ("Link 1 on another port",
     f'=IF({L1}="None","n/a",IF(_calc!$B$2={c0p},"Warning","OK"))',
     f'=IF({L1}="None","No second link.",IF(_calc!$B$2={c0p},"Both links use "&{c0p}&". One cable takes both down.","Link 0 on "&{c0p}&", link 1 on "&_calc!$B$2&"."))',
     "Every link should be on its own physical connection to be useful as failover."),
    ("Links on different switches",
     f'=IF({L1}="None","n/a",IF({SWITCHES}<2,"Info",IF({l1sw}={c0sw},"Warning","OK")))',
     f'=IF({L1}="None","No second link.",IF({SWITCHES}<2,"One switch: if it fails or reboots, both links drop together. Common in a homelab; plan switch maintenance around it.",IF({l1sw}={c0sw},"Both links end on switch "&{c0sw}&".","Link 0 on switch "&{c0sw}&", link 1 on switch "&{l1sw}&".")))',
     "A second switch only helps if each link really uses a different one."),
    ("Ceph public bandwidth",
     f'=IF(NOT({en("CP")}),"n/a",IF({cpspeed}>=10,"OK","Warning"))',
     f'=IF(NOT({en("CP")}),"Ceph not used.",IF({cpspeed}>=10,"Ceph public on "&{cpspeed}&" Gbps.","Ceph public on "&{cpspeed}&" Gbps. Expect slow VMs and long recoveries."))',
     "Proxmox recommends at least 10 Gbps used only for Ceph."),
    ("Ceph cluster network",
     f'=IF(NOT({en("CP")}),"n/a",IF(NOT({en("CC")}),"Info",IF({ccp}={cpp},"Info","OK")))',
     f'=IF(NOT({en("CP")}),"Ceph not used.",IF(NOT({en("CC")}),"Replication shares the public network. Fine for small clusters, and it can be moved later.",IF({ccp}={cpp},"Own subnet, same port: tidier, but no extra bandwidth.","Replication has its own port.")))',
     "The Ceph cluster network is optional and can be moved to its own network later."),
    ("One untagged network per port",
     '=IF(MAX(_calc!$G$10:$G$13)>1,"Problem","OK")',
     '=IF(MAX(_calc!$G$10:$G$13)>1,"Two networks are untagged on the same port. Give all but one a VLAN ID.","Each port has at most one untagged network.")',
     "A port can only carry one untagged network; the rest need VLAN tags."),
    ("Unique subnets",
     '=IF(MAX(_calc!$L$20:$L$25)>1,"Problem","OK")',
     '=IF(MAX(_calc!$L$20:$L$25)>1,"Two networks in use share a subnet. Give each its own.","Every network has its own subnet.")',
     "Separate subnets keep traffic on the port you planned it for."),
    ("Host numbers fit",
     f'=IF(AND({START}>=2,{START}+{COUNT}-1<=254),"OK","Problem")',
     f'=IF(AND({START}>=2,{START}+{COUNT}-1<=254),"Nodes use ."&{START}&" to ."&({START}+{COUNT}-1)&".","Host numbers run outside 2 to 254.")',
     "Last octets 0, 1 (usually the gateway) and 255 are off limits."),
    ("Ports exist",
     '=IF(SUMPRODUCT(--(_calc!$B$20:$B$25),--(_calc!$K$20:$K$25=FALSE))>0,"Problem","OK")',
     '=IF(SUMPRODUCT(--(_calc!$B$20:$B$25),--(_calc!$K$20:$K$25=FALSE))>0,"A network is set on a port marked not present.","Every network sits on a port that exists.")',
     ""),
    ("Hostnames valid",
     f'=IF(SUMPRODUCT(ISNUMBER(SEARCH(" ",{I}$C$32:$C$39))+ISNUMBER(SEARCH("_",{I}$C$32:$C$39))+ISNUMBER(SEARCH(".",{I}$C$32:$C$39)))>0,"Problem","OK")',
     f'=IF(SUMPRODUCT(ISNUMBER(SEARCH(" ",{I}$C$32:$C$39))+ISNUMBER(SEARCH("_",{I}$C$32:$C$39))+ISNUMBER(SEARCH(".",{I}$C$32:$C$39)))>0,"A hostname has a space, dot or underscore. Use letters, digits and hyphens.","Hostnames look valid.")',
     "Hostnames are permanent once the cluster exists."),
    ("Jumbo frames",
     f'=IF(MAX(_calc!$F$10:$F$13)>1500,"Info","OK")',
     f'=IF(MAX(_calc!$F$10:$F$13)>1500,"MTU above 1500 is in use. Set it on every switch port in the path and run the jumbo tests on Commands before you create the cluster.","Standard MTU everywhere.")',
     "Every device in the path has to support the larger MTU, or large packets get dropped."),
]
for i, (name, st, mean, why) in enumerate(rules):
    r = 7 + i
    put(ws_risk, f"B{r}", i + 1, f_bold, border=box, align=top)
    put(ws_risk, f"C{r}", name, f_bold, border=box, align=top)
    put(ws_risk, f"D{r}", st, f_bold, border=box, align=Alignment(horizontal="center", vertical="top"))
    put(ws_risk, f"E{r}", mean, border=box, align=wrap)
    put(ws_risk, f"F{r}", why, f_note, border=box, align=wrap)
    ws_risk.row_dimensions[r].height = 42
last = 6 + len(rules)
for val, color in [("OK", "D5F0DD"), ("Warning", "FCE8C3"), ("Problem", "F8D0CC"), ("Info", "DCE8F7"), ("n/a", "EEEEEE")]:
    ws_risk.conditional_formatting.add(f"D7:D{last}", CellIsRule(operator="equal", formula=[f'"{val}"'], fill=PatternFill("solid", fgColor=color)))
put(ws_risk, f"B{last+2}", "Sources: Proxmox VE docs, Cluster Manager and Deploy Hyper-Converged Ceph Cluster (pve.proxmox.com/wiki), checked November 2026.", f_note)
widths(ws_risk, {"A": 3, "B": 5, "C": 30, "D": 12, "E": 70, "F": 50})
ws_risk.freeze_panes = "A7"

# ======================================================================
# CHECKLIST
# ======================================================================
put(ws_chk, "B1", "Checklist", f_title)
put(ws_chk, "B2", "Work top to bottom. The failure tests at the end are the part most people skip; they're the ones that tell you the plan works.", f_sub)
hdr(ws_chk, 4, 2, ["Phase", "Step", "Why", "Done"])
steps = [
    ("Plan", "Fill in Inputs and clear every Problem on Risk check.", "Problems turn into reinstalls later."),
    ("Plan", "Decide on every Warning: fix it, or accept it and write down why.", "A trade-off you chose is fine; one you didn't notice isn't."),
    ("Plan", "Confirm the switch supports VLAN tagging and your MTU on every port you use.", "Cheap switches sometimes do jumbo frames on some ports only."),
    ("Plan", "Record each node's port MACs on Inputs.", "The installer lists ports by MAC."),
    ("Before install", "Cluster name is final.", "It can't be changed later."),
    ("Before install", "Hostnames and domain are final.", "Permanent once the cluster exists."),
    ("Before install", "Node IPs are final.", "Permanent once the cluster exists."),
    ("Before install", "Switch ports set: management untagged, other VLANs tagged, MTU set.", "The installer can't tag management."),
    ("Install", "Wipe disks you'll reuse for Ceph before you start (this destroys their data).", "Old partition tables turn into strange OSDs."),
    ("Install", "Use the Installer card for each node; leave Pin network interface names ticked.", "Stable nic0/nic1 names match the generated config."),
    ("Install", "Read the summary page before you press Install.", "Last chance to catch a typo for free."),
    ("After install", "Apply the node's /etc/network/interfaces from Commands with ifreload -a, with console access ready.", "A typo here can cut you off from the node."),
    ("After install", "Add the /etc/hosts block on every node.", "Nodes find each other by name."),
    ("After install", "Run the jumbo frame tests from every node.", "MTU mismatches fail silently until Ceph is under load."),
    ("After install", "Run the Corosync latency test from every node.", "Average must stay well under 5 ms."),
    ("Cluster", "Create the cluster on node 1, join the others with the Commands lines.", "Pins Corosync to the planned links."),
    ("Cluster", "pvecm status shows every node and Quorate: Yes; corosync-cfgtool -s shows every link connected.", "Proves both links are live."),
    ("Ceph", "Install Ceph, run pveceph init with the planned networks, add monitors and managers.", "Three monitors for quorum."),
    ("Ceph", "One OSD per disk; ceph -s shows HEALTH_OK.", "Healthy baseline before you add VMs."),
    ("Failure test", "Shut down one node. Expect: the rest stay quorate; Ceph shows degraded but VMs on the other nodes keep running.", "Size 3 / min_size 2 keeps I/O going with one copy missing."),
    ("Failure test", "Unplug link 0 on one node. Expect: corosync-cfgtool -s shows link 0 down; the node stays in the cluster.", "Proves link 1 actually works."),
    ("Failure test", "Unplug the Ceph cable on one node. Expect: its OSD goes down after a short delay; I/O continues on the other copies.", "Shows what a storage-path failure looks like."),
    ("Failure test", "Only with no HA guests, or accepting reboots: restart the switch. Expect: with one switch, every node loses all links; HA nodes can fence (reboot) themselves after about a minute.", "This is the single-switch trade-off, seen once on purpose."),
    ("Failure test", "Bring everything back. Expect: pvecm status quorate and ceph -s back to HEALTH_OK.", "The cluster heals itself."),
]
dv_done = DataValidation(type="list", formula1='"Yes,"', allow_blank=True)
ws_chk.add_data_validation(dv_done)
for i, (ph, st, why) in enumerate(steps):
    r = 5 + i
    put(ws_chk, f"B{r}", ph, f_bold, border=box, align=top)
    put(ws_chk, f"C{r}", st, border=box, align=wrap)
    put(ws_chk, f"D{r}", why, f_note, border=box, align=wrap)
    put(ws_chk, f"E{r}", None, fill=fill_in, border=box, align=Alignment(horizontal="center", vertical="top"))
    ws_chk.row_dimensions[r].height = 30
last_chk = 4 + len(steps)
dv_done.add(f"E5:E{last_chk}")
ws_chk.conditional_formatting.add(f"B5:E{last_chk}", FormulaRule(formula=[f'$E5="Yes"'], fill=PatternFill("solid", fgColor="D5F0DD")))
put(ws_chk, f"B{last_chk+2}", f'="Done: "&COUNTIF(E5:E{last_chk},"Yes")&" of {len(steps)}"', f_h2)
widths(ws_chk, {"A": 3, "B": 16, "C": 70, "D": 50, "E": 8})
ws_chk.freeze_panes = "A5"

# ======================================================================
# START HERE
# ======================================================================
s = ws_start
put(s, "B2", "Proxmox Cluster Network Planner", f_title)
put(s, "B3", "Plan the parts you can't change later, before you boot the installer.", f_sub)
put(s, "B4", "Marc Mylemans · mylemans.online · version " + TEMPLATE_VERSION + ", November 2026 · written for Proxmox VE 9", f_note)
put(s, "B5", "Blank template with my own cluster as the example. Design yours at mylemans.online/cluster-kit to get a pre-filled copy.", f_note)
put(s, "B6", "How to use it", f_h2)
how = [
    "1. Inputs: fill in the yellow cells. The example values are my own three-node cluster.",
    "2. Plan: read the addresses, VLANs and port map it generates.",
    "3. Risk check: fix every Problem, and decide on every Warning.",
    "4. Installer: take the card to each node and type exactly what it says.",
    "5. Commands: paste the hosts block, cluster commands and each node's network config, then run the tests.",
    "6. Checklist: work through it, including the failure tests at the end.",
]
for i, t in enumerate(how):
    put(s, f"B{7+i}", t)
put(s, "B14", "Colour code", f_h2)
put(s, "B15", "Yellow cells: you fill these in.", fill=fill_in, border=box)
put(s, "B16", "Red text: permanent, can't be changed once the cluster exists (cluster name, hostnames, node IPs).", f_perm, border=box)
put(s, "B17", "Grey cells: calculated. Don't type over them.", fill=fill_calc, border=box)
put(s, "B19", "Why this exists", f_h2)
why_lines = [
    "Proxmox asks you to install every node with its final hostname and IP, because they can't be changed after the cluster is created.",
    "The forums are full of people fixing that afterwards. This planner makes those decisions first and then grades them against the Proxmox recommendations.",
    "My own cluster gets one Warning: Corosync link 0 shares a port with the VM bridge. That's a trade-off I chose for a two-port homelab node; the risk check shows what it means so you can decide for yours.",
]
for i, t in enumerate(why_lines):
    put(s, f"B{20+i}", t, align=wrap)
put(s, "B24", "Next steps", f_h2)
c = put(s, "B25", "Learn the concepts behind this (quorum, Corosync, Ceph): the free virtualization path on Mylemans Labs", f_link)
c.hyperlink = "https://labs.mylemans.online/?path=virtualization"
c = put(s, "B26", "Want a second pair of eyes before you buy hardware? Homelab design review", f_link)
c.hyperlink = "https://mylemans.online/services.html"
c = put(s, "B27", "The full build: the hardware and install posts on mylemans.online", f_link)
c.hyperlink = "https://mylemans.online/posts/proxmox-cluster-without-a-monitor/"
put(s, "B29", "Good to know", f_h2)
fine = [
    "Check the generated config before you apply it, and keep console access (KVM or a monitor) when you change network settings.",
    "Based on the Proxmox VE documentation (Cluster Manager; Deploy Hyper-Converged Ceph Cluster) as of November 2026. Proxmox changes; when in doubt, the docs win.",
    "Questions? Reply to any newsletter email; it comes straight to me.",
]
for i, t in enumerate(fine):
    put(s, f"B{30+i}", t, f_note, align=wrap)
widths(s, {"A": 3, "B": 120, "C": 90})
for r in range(20, 23):
    s.row_dimensions[r].height = 28

from openpyxl.worksheet.properties import PageSetupProperties
for ws in wb.worksheets:
    ws.sheet_properties.pageSetUpPr = PageSetupProperties(fitToPage=True)
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.page_setup.orientation = "portrait" if ws.title == "Commands" else "landscape"
    ws.page_setup.paperSize = ws.PAPERSIZE_A4

from openpyxl.workbook.properties import CalcProperties
wb.calculation = CalcProperties(fullCalcOnLoad=True)
wb.save(OUT)
print("saved", OUT)
