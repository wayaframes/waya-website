#!/usr/bin/env python3
"""Check the four legal pages against _data/legal.json.

Usage:
    python scripts/check_legal.py                       # report, exit 1 on any failure
    python scripts/check_legal.py --quiet               # only failures and warnings
    python scripts/check_legal.py --surfaces PATH       # check a different surfaces file

What it checks
  * legal.json: valid, required fields present, dates look like YYYY-MM-DD, every page
    URL is the canonical https://www.wayaframes.com/<path>/ form
  * each page (privacy-policy, terms-of-service, data-handling, support):
      - the file exists
      - <link rel="canonical"> and og:url equal the URL in legal.json
      - "Last updated: <Month D, YYYY>" and JSON-LD "dateModified" equal last_updated
      - sitemap.xml lists it with a <lastmod> equal to last_updated
      - llms.txt links to it (warning only)
      - the page never says "compliant" or "certified" (we claim neither)
  * the data-request promise: any "N days of receiving/verifying" on a page equals
    promises.data_request_days, and the clock word equals promises.data_request_clock
  * every index.html and 404.html links to all four legal pages (the footer); pages marked
    noindex are skipped (embedded tools such as lean-ai/setup/app/)
  * snippets: status is draft or live, text is present, a draft names its ticket, and any
    wayaframes.com page URL inside a snippet is a canonical legal URL
  * docs/legal-surfaces.md (always; --surfaces PATH overrides): every snippet:<id> in it
    exists in legal.json, every 'live' snippet in legal.json is used by some surface, a
    "last checked" date older than 90 days is a warning, and surfaces never checked are
    counted in one warning

Exit code 0 = clean (warnings allowed), 1 = failures.
"""
import argparse, datetime, glob, html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEGAL = os.path.join(ROOT, "_data", "legal.json")
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]
CANON = re.compile(r"^https://www\.wayaframes\.com/[a-z0-9-]+/$")
DATE = re.compile(r"^20\d\d-\d\d-\d\d$")
BANNED = re.compile(r"\b(compliant|certified)\b", re.I)
SKIP_DIRS = ("node_modules/", ".git/", ".claude/", "docs/", "dist/")

findings = []  # (level, where, message)


def add(level, where, msg):
    findings.append((level, where, msg))


def rel(path):
    return os.path.relpath(path, ROOT).replace("\\", "/")


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def text_of(markup):
    markup = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", markup, flags=re.S)
    return html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", markup)))


def pretty_date(iso):
    y, m, d = (int(x) for x in iso.split("-"))
    return f"{MONTHS[m - 1]} {d}, {y}"


def load_legal():
    try:
        data = json.loads(read(LEGAL))
    except Exception as e:  # noqa: BLE001
        add("FAIL", "_data/legal.json", f"cannot read or parse: {e}")
        return None
    for key in ("version", "updated", "entity", "promises", "pages", "snippets"):
        if key not in data:
            add("FAIL", "_data/legal.json", f"missing top-level key '{key}'")
    if any(f[0] == "FAIL" for f in findings):
        return None
    for key in ("version", "updated"):
        if not DATE.match(str(data[key])):
            add("FAIL", "_data/legal.json", f"{key} must look like YYYY-MM-DD, got {data[key]!r}")
    for name, page in data["pages"].items():
        for key in ("title", "path", "url", "last_updated"):
            if key not in page:
                add("FAIL", "_data/legal.json", f"page '{name}' is missing '{key}'")
        if "url" in page and not CANON.match(page["url"]):
            add("FAIL", "_data/legal.json", f"page '{name}' url is not canonical: {page['url']}")
        if "path" in page and "url" in page and not page["url"].endswith(page["path"]):
            add("FAIL", "_data/legal.json", f"page '{name}' path and url disagree")
        if "last_updated" in page and not DATE.match(page["last_updated"]):
            add("FAIL", "_data/legal.json", f"page '{name}' last_updated must be YYYY-MM-DD")
        if "last_updated" in page and page["last_updated"] > data["updated"]:
            add("FAIL", "_data/legal.json", f"page '{name}' last_updated is later than the file's 'updated'")
    return data


def check_pages(data):
    sitemap = read(os.path.join(ROOT, "sitemap.xml")) if os.path.exists(os.path.join(ROOT, "sitemap.xml")) else ""
    llms = read(os.path.join(ROOT, "llms.txt")) if os.path.exists(os.path.join(ROOT, "llms.txt")) else ""
    promises = data["promises"]
    for name, page in data["pages"].items():
        path = os.path.join(ROOT, name, "index.html")
        where = f"{name}/index.html"
        if not os.path.exists(path):
            add("FAIL", where, "page file does not exist")
            continue
        src = read(path)
        m = re.search(r'<link rel="canonical" href="([^"]+)"', src)
        if not m or m.group(1) != page["url"]:
            add("FAIL", where, f"canonical is {m.group(1) if m else 'missing'}, expected {page['url']}")
        m = re.search(r'<meta property="og:url" content="([^"]+)"', src)
        if not m or m.group(1) != page["url"]:
            add("FAIL", where, f"og:url is {m.group(1) if m else 'missing'}, expected {page['url']}")
        m = re.search(r"Last updated:\s*([A-Za-z]+ \d{1,2}, \d{4})", src)
        want = pretty_date(page["last_updated"])
        if not m or m.group(1) != want:
            add("FAIL", where, f"'Last updated' is {m.group(1) if m else 'missing'}, expected {want}")
        m = re.search(r'"dateModified":\s*"([^"]+)"', src)
        if not m or m.group(1) != page["last_updated"]:
            add("FAIL", where, f"dateModified is {m.group(1) if m else 'missing'}, expected {page['last_updated']}")
        m = re.search(r"<loc>" + re.escape(page["url"]) + r"</loc><lastmod>([^<]+)</lastmod>", sitemap)
        if not m:
            add("FAIL", "sitemap.xml", f"{page['url']} is not listed")
        elif m.group(1) != page["last_updated"]:
            add("FAIL", "sitemap.xml", f"lastmod for {name} is {m.group(1)}, expected {page['last_updated']}")
        if page["url"] not in llms:
            add("WARN", "llms.txt", f"does not link to {page['url']}")
        body = text_of(src)
        for hit in BANNED.finditer(body):
            ctx = body[max(0, hit.start() - 40): hit.end() + 40]
            add("FAIL", where, f"uses the word '{hit.group(1)}' (we claim neither): ...{ctx}...")
        for hit in re.finditer(r"(\d+) days of (receiving|verifying)", body):
            days, clock = int(hit.group(1)), hit.group(2)
            if days != promises["data_request_days"]:
                add("FAIL", where, f"says {days} days, legal.json says {promises['data_request_days']}")
            want_clock = "receiving" if promises["data_request_clock"] == "receipt" else "verifying"
            if clock != want_clock:
                add("FAIL", where, f"counts from '{clock}', legal.json says the clock starts at {promises['data_request_clock']}")


def check_footers(data):
    paths = [p["path"] for p in data["pages"].values()]
    files = glob.glob(os.path.join(ROOT, "**", "index.html"), recursive=True) + [os.path.join(ROOT, "404.html")]
    for f in sorted(files):
        r = rel(f)
        if r.startswith(SKIP_DIRS) or not os.path.exists(f):
            continue
        src = read(f)
        if re.search(r'<meta name="robots" content="noindex', src):
            continue  # embedded tools (loaded in an iframe on a page that has the footer)
        missing = [p for p in paths if f'href="{p}"' not in src]
        if missing:
            add("FAIL", r, "footer is missing links to: " + ", ".join(missing))


def check_snippets(data):
    urls = {p["url"] for p in data["pages"].values()}
    for sid, s in data["snippets"].items():
        if sid.startswith("$"):
            continue
        where = f"legal.json snippet '{sid}'"
        if s.get("status") not in ("draft", "live"):
            add("FAIL", where, "status must be 'draft' or 'live'")
        if not s.get("text"):
            add("FAIL", where, "text is empty")
        if not s.get("use"):
            add("FAIL", where, "'use' (where it is pasted) is empty")
        if s.get("status") == "draft" and not s.get("ticket"):
            add("FAIL", where, "a draft must name its ticket")
        for url in re.findall(r"https://www\.wayaframes\.com/[^\s,\"')]*", s.get("text", "")):
            if url.rstrip(".") not in urls:
                add("FAIL", where, f"links to {url}, which is not a legal page in legal.json")
        for ph in re.findall(r"\{([a-z_]+)\}", s.get("text", "")):
            if ph not in ("price", "end_date"):
                add("FAIL", where, f"unknown placeholder {{{ph}}}")
        if BANNED.search(s.get("text", "")):
            add("FAIL", where, "uses 'compliant' or 'certified'")


def check_surfaces(data, path):
    where = rel(path) if path.startswith(ROOT) else path
    if not os.path.exists(path):
        add("FAIL", where, "surfaces file not found")
        return
    today = datetime.date.today()
    ids = {k for k in data["snippets"] if not k.startswith("$")}
    used, unchecked = set(), 0
    for i, line in enumerate(read(path).splitlines(), 1):
        if not line.startswith("|") or set(line.replace("|", "").strip()) <= set("-: "):
            continue
        for sid in re.findall(r"snippet:([a-z_]+)", line):
            used.add(sid)
            if sid not in ids:
                add("FAIL", f"{where}:{i}", f"unknown snippet id '{sid}'")
        dates = re.findall(r"(20\d\d-\d\d-\d\d)", line)
        if dates:
            age = (today - datetime.date.fromisoformat(dates[-1])).days
            if age > 90:
                add("WARN", f"{where}:{i}", f"last checked {age} days ago")
        elif "not yet checked" in line.lower():
            unchecked += 1
    for sid, s in data["snippets"].items():
        if not sid.startswith("$") and s.get("status") == "live" and sid not in used:
            add("FAIL", where, f"snippet '{sid}' is live but no surface lists it")
    if unchecked:
        add("WARN", where, f"{unchecked} surface(s) not yet checked")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--quiet", action="store_true", help="print only failures and warnings")
    ap.add_argument("--surfaces", help="path to a surfaces file (default: docs/legal-surfaces.md)")
    args = ap.parse_args()

    data = load_legal()
    if data:
        check_pages(data)
        check_footers(data)
        check_snippets(data)
        surfaces = args.surfaces or os.path.join(ROOT, "docs", "legal-surfaces.md")
        check_surfaces(data, surfaces)

    fails = [f for f in findings if f[0] == "FAIL"]
    warns = [f for f in findings if f[0] == "WARN"]
    for level, where, msg in findings:
        print(f"{level:4}  {where}: {msg}")
    if not args.quiet:
        if data:
            print(f"\nChecked {len(data['pages'])} pages, {len([k for k in data['snippets'] if not k.startswith('$')])} snippets, "
                  f"version {data['version']}.")
        print(f"{len(fails)} failure(s), {len(warns)} warning(s).")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
