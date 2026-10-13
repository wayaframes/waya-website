#!/usr/bin/env python3
"""Validate every booking / campaign link in the repo against _data/utm.json.

Usage:
    python scripts/check_utm.py            # report, exit 1 on any failure
    python scripts/check_utm.py --quiet    # only failures
    python scripts/check_utm.py --url "<one url>" [--context website|campaign]

What it checks
  * the booking root exists in utm.json and is "live"
  * link format: one "?", no duplicate params, params before "#", lowercase values
  * website context (any page under the site root): the link carries ONLY
    utm_button, and its value is in website_buttons.allowed
  * campaign context (emails/, anything passed with --context campaign):
    utm_source present; utm_medium is an active code; utm_campaign matches
    <product>_<audience>_<period> with an active product token; utm_content
    matches an active content pattern; utm_term (optional) is lowercase
  * window.WAYA_ATTR_DEFAULTS blocks on pages use an active/proposed product
    token and the "web" medium

Exit code 0 = clean, 1 = failures. Proposed tokens/codes produce WARN, not FAIL,
so the report shows what still needs a decision without blocking.
"""
import argparse, glob, json, os, re, sys
from urllib.parse import urlsplit, parse_qsl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UTM = json.load(open(os.path.join(ROOT, "_data", "utm.json"), encoding="utf-8"))
BOOKING_RE = re.compile(r'https://api\.leadconnectorhq\.com/widget/bookings/[^"\'\s<>]+')
SITE_LINK_RE = re.compile(r'https://www\.wayaframes\.com/[^"\'\s<>]*utm_[^"\'\s<>]*')
CAMPAIGN_DIRS = ("waya-os-mcp/emails/",)
SKIP_DIRS = ("docs/", "node_modules/", ".git/", "scripts/")

findings = []  # (level, file, line, message, url)


def add(level, f, line, msg, url=""):
    findings.append((level, f, line, msg, url))


def split_params(url):
    """Return (root_or_path, params list) with format checks applied."""
    problems = []
    if url.count("?") != 1 and "utm_" in url:
        problems.append("expected exactly one '?'")
    if "#" in url and url.index("#") < url.index("?") if "?" in url else False:
        problems.append("params must come before #fragment")
    if " " in url or "%20" in url:
        problems.append("spaces in URL")
    parts = urlsplit(url)
    params = parse_qsl(parts.query, keep_blank_values=True)
    keys = [k for k, _ in params]
    dupes = {k for k in keys if keys.count(k) > 1}
    if dupes:
        problems.append("duplicate params: " + ", ".join(sorted(dupes)))
    for k, v in params:
        if k.startswith("utm_") and v == "":
            problems.append(f"{k} is empty")
    return parts, params, problems


def check_value_charset(k, v):
    if k == "utm_content" and re.match(r"^[A-Z0-9]+$", v):
        return None  # structural code with variant letter
    if not re.match(UTM["rules"]["value_charset_regex"], v):
        return f"{k}={v}: must be lowercase a-z 0-9 _ (hyphens are not allowed)"
    return None


def check_root(url, f, line):
    m = re.match(r"https://api\.leadconnectorhq\.com/widget/bookings/([a-z0-9-]+)", url)
    if not m:
        add("FAIL", f, line, "unparseable booking URL", url); return None
    slug = m.group(1)
    root = UTM["roots"].get(slug)
    if root is None:
        add("FAIL", f, line, f"booking root '{slug}' is not in utm.json roots", url)
    elif root["status"] != "live":
        add("FAIL", f, line, f"booking root '{slug}' is {root['status']} (since {root.get('retired_on','?')})", url)
    return slug


def check_website(url, f, line):
    parts, params, problems = split_params(url)
    for p in problems:
        add("FAIL", f, line, p, url)
    keys = {k for k, _ in params}
    allowed_param = UTM["website_buttons"]["param"]
    extra = sorted(k for k in keys if k.startswith("utm_") and k != allowed_param)
    if extra:
        add("FAIL", f, line, f"website button hardcodes {', '.join(extra)}; only {allowed_param} is allowed (engine fills the rest)", url)
    if allowed_param not in keys:
        add("FAIL", f, line, f"website button has no {allowed_param}", url)
    for k, v in params:
        if k == allowed_param and v not in UTM["website_buttons"]["allowed"]:
            add("FAIL", f, line, f"{allowed_param}={v} not in allowed list {UTM['website_buttons']['allowed']}", url)
        if k.startswith("utm_"):
            err = check_value_charset(k, v)
            if err: add("FAIL", f, line, err, url)


def check_campaign(url, f, line):
    parts, params, problems = split_params(url)
    for p in problems:
        add("FAIL", f, line, p, url)
    d = dict(params)
    for k, v in params:
        if k.startswith("utm_"):
            err = check_value_charset(k, v)
            if err: add("FAIL", f, line, err, url)
    if "utm_source" not in d:
        add("FAIL", f, line, "campaign link missing utm_source", url)
    med = d.get("utm_medium")
    if med is None:
        add("FAIL", f, line, "campaign link missing utm_medium", url)
    else:
        m = UTM["mediums"].get(med)
        if m is None:
            add("FAIL", f, line, f"utm_medium={med} is not in the code legend", url)
        elif m["status"] == "retired":
            add("FAIL", f, line, f"utm_medium={med} is retired: {m.get('note','')}", url)
        elif m["status"] != "active":
            add("WARN", f, line, f"utm_medium={med} is {m['status']}", url)
    camp = d.get("utm_campaign")
    if camp is None:
        add("FAIL", f, line, "campaign link missing utm_campaign", url)
    else:
        cm = re.match(UTM["rules"]["campaign_regex"], camp)
        if not cm:
            add("FAIL", f, line, f"utm_campaign={camp} does not match {UTM['rules']['campaign_format']} (e.g. {UTM['rules']['campaign_example']})", url)
        else:
            prod = UTM["products"].get(cm.group("product"))
            if prod is None:
                add("FAIL", f, line, f"utm_campaign product token '{cm.group('product')}' is not in utm.json products", url)
            elif prod["status"] == "retired":
                add("FAIL", f, line, f"product token '{cm.group('product')}' is retired", url)
            elif prod["status"] != "active":
                add("WARN", f, line, f"product token '{cm.group('product')}' is {prod['status']}: do not ship until confirmed", url)
    cont = d.get("utm_content")
    if cont is not None:
        pats = [p for p in UTM["content_patterns"] if re.match(p["regex"], cont)]
        if not pats:
            add("FAIL", f, line, f"utm_content={cont} matches no content pattern (expected e.g. E1VA, P1VA)", url)
        elif pats[0]["status"] != "active":
            add("WARN", f, line, f"utm_content pattern '{pats[0]['meaning']}' is {pats[0]['status']}", url)
    if "utm_button" in d:
        add("FAIL", f, line, "utm_button belongs on website buttons only, not campaign links", url)


def check_defaults(text, f):
    for m in re.finditer(r"WAYA_ATTR_DEFAULTS\s*=\s*(\{.*?\})", text, re.S):
        block = m.group(1)
        line = text[: m.start()].count("\n") + 1
        camp = re.search(r"utm_campaign\s*:\s*['\"]([^'\"]+)", block)
        med = re.search(r"utm_medium\s*:\s*['\"]([^'\"]+)", block)
        if med and med.group(1) != "web":
            add("FAIL", f, line, f"WAYA_ATTR_DEFAULTS utm_medium should be 'web', found {med.group(1)}")
        if camp:
            cm = re.match(UTM["rules"]["campaign_regex"], camp.group(1))
            if not cm:
                add("FAIL", f, line, f"WAYA_ATTR_DEFAULTS utm_campaign={camp.group(1)} does not match {UTM['rules']['campaign_format']}")
            else:
                prod = UTM["products"].get(cm.group("product"))
                if prod is None:
                    add("FAIL", f, line, f"WAYA_ATTR_DEFAULTS product token '{cm.group('product')}' unknown")
                elif prod["status"] != "active":
                    add("WARN", f, line, f"WAYA_ATTR_DEFAULTS product token '{cm.group('product')}' is {prod['status']}")
        else:
            add("WARN", f, line, "WAYA_ATTR_DEFAULTS has no utm_campaign; direct visitors will not route in GHL")


def scan_file(path):
    rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
    if rel.startswith(SKIP_DIRS):
        return
    context = "campaign" if rel.startswith(CAMPAIGN_DIRS) else "website"
    text = open(path, encoding="utf-8", errors="replace").read()
    for m in BOOKING_RE.finditer(text):
        url = m.group(0).rstrip(".,)")
        line = text[: m.start()].count("\n") + 1
        slug = check_root(url, rel, line)
        if slug is None:
            continue
        if context == "website":
            check_website(url, rel, line)
        else:
            check_campaign(url, rel, line)
    if context == "campaign":
        for m in SITE_LINK_RE.finditer(text):
            url = m.group(0)
            line = text[: m.start()].count("\n") + 1
            check_campaign(url, rel, line)
    check_defaults(text, rel)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quiet", action="store_true")
    ap.add_argument("--url", help="validate one URL instead of the repo")
    ap.add_argument("--context", choices=["website", "campaign"], default="campaign")
    args = ap.parse_args()

    if args.url:
        slug = check_root(args.url, "<arg>", 0) if "leadconnectorhq" in args.url else "n/a"
        if slug is not None:
            (check_website if args.context == "website" else check_campaign)(args.url, "<arg>", 0)
    else:
        files = [p for p in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True)]
        files += glob.glob(os.path.join(ROOT, "assets", "*.js"))
        for p in sorted(files):
            scan_file(p)

    fails = [x for x in findings if x[0] == "FAIL"]
    warns = [x for x in findings if x[0] == "WARN"]
    for level, f, line, msg, url in findings:
        if args.quiet and level != "FAIL":
            continue
        loc = f"{f}:{line}" if line else f
        print(f"{level}  {loc}  {msg}" + (f"\n      {url}" if url else ""))
    print(f"\n{len(fails)} failures, {len(warns)} warnings")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
