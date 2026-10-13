#!/usr/bin/env python3
"""Read-only check that GHL (GoHighLevel / LeadConnector) is receiving attribution.

Answers three questions against the live GHL location:
  1. Which booking calendars actually exist, by slug, and do they match _data/utm.json roots?
  2. Are contacts arriving with attributionSource / lastAttributionSource populated
     (utmSource, utmMedium, utmCampaign, utmContent, utmTerm)? What values?
  3. Do the utm_campaign values seen in GHL use product tokens from utm.json?

Needs a Private Integration Token with read scopes for Calendars and Contacts
(GHL: Settings > Private Integrations). Never commit the token.

    set GHL_TOKEN=pit-...            (PowerShell: $env:GHL_TOKEN="pit-...")
    python scripts/ghl_attribution_check.py [--days 30] [--limit 500]

The location id defaults to the Waya sub-account; override with GHL_LOCATION.
"""
import argparse, collections, datetime, json, os, re, sys, urllib.parse, urllib.request

API = "https://services.leadconnectorhq.com"
VERSION = "2021-07-28"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get(path, token, **q):
    url = API + path + ("?" + urllib.parse.urlencode(q) if q else "")
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}", "Version": VERSION, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=30)
    ap.add_argument("--limit", type=int, default=500, help="max contacts to inspect (most recent first)")
    a = ap.parse_args()
    token = os.environ.get("GHL_TOKEN")
    loc = os.environ.get("GHL_LOCATION", "aNwGFtDAVzS3jJa3wSAu")
    if not token:
        print("GHL_TOKEN is not set. Create a Private Integration Token in GHL (read: Calendars, Contacts) and export it.", file=sys.stderr)
        sys.exit(2)
    utm = json.load(open(os.path.join(ROOT, "_data", "utm.json"), encoding="utf-8"))

    # 1. calendars vs roots
    print("== Calendars in GHL vs utm.json roots")
    cals = get("/calendars/", token, locationId=loc).get("calendars", [])
    slugs = {}
    for c in cals:
        slug = c.get("slug") or ""
        slugs[slug] = c
        print(f"  {slug:32s} active={c.get('isActive')}  name={c.get('name')}")
    for slug, r in utm["roots"].items():
        if r["status"] == "live" and slug not in slugs:
            print(f"  !! utm.json says '{slug}' is live but GHL has no calendar with that slug")
        if r["status"] == "retired" and slug in slugs and slugs[slug].get("isActive"):
            print(f"  !! utm.json says '{slug}' is retired but GHL still has it active")

    # 2. contacts with attribution
    print(f"\n== Contacts (last {a.days} days, up to {a.limit})")
    since = (datetime.datetime.utcnow() - datetime.timedelta(days=a.days)).isoformat() + "Z"
    contacts, start_after, start_after_id = [], None, None
    while len(contacts) < a.limit:
        q = dict(locationId=loc, limit=100)
        if start_after: q.update(startAfter=start_after, startAfterId=start_after_id)
        page = get("/contacts/", token, **q)
        batch = page.get("contacts", [])
        if not batch: break
        contacts += [c for c in batch if (c.get("dateAdded") or "") >= since]
        meta = page.get("meta", {})
        start_after, start_after_id = meta.get("startAfter"), meta.get("startAfterId")
        if not start_after_id or (batch[-1].get("dateAdded") or "") < since: break
    print(f"  contacts added in window: {len(contacts)}")
    with_attr = [c for c in contacts if (c.get("attributionSource") or {}).get("utmSource") or (c.get("lastAttributionSource") or {}).get("utmSource")]
    print(f"  with any utm_source on first or last attribution: {len(with_attr)}")
    counters = {k: collections.Counter() for k in ("utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm", "sessionSource")}
    for c in contacts:
        for key in ("attributionSource", "lastAttributionSource"):
            src = c.get(key) or {}
            for k in counters:
                if src.get(k): counters[k][src[k]] += 1
    for k, cnt in counters.items():
        print(f"  {k}: {dict(cnt.most_common(12)) or '(none)'}")

    # 3. campaign values vs taxonomy
    print("\n== utm_campaign values vs utm.json")
    rx = re.compile(utm["rules"]["campaign_regex"])
    for camp, n in counters["utmCampaign"].most_common():
        m = rx.match(camp)
        if not m:
            print(f"  {camp:40s} x{n:<4d} does not match {utm['rules']['campaign_format']}")
        elif m.group("product") not in utm["products"]:
            print(f"  {camp:40s} x{n:<4d} product token '{m.group('product')}' not in utm.json")
        else:
            print(f"  {camp:40s} x{n:<4d} ok ({utm['products'][m.group('product')]['name']})")
    if not counters["utmCampaign"]:
        print("  no utm_campaign values on any contact in the window: attribution is NOT reaching GHL")


if __name__ == "__main__":
    main()
