#!/usr/bin/env python3
"""Build a correctly attributed link from _data/utm.json. Never hand-type one.

Campaign link (email, post, ad):
    python scripts/utm_link.py --product dataroom --placement "Apollo cold email" \
        --audience yc --period 2026q1 --content E1VA --term founder_seed

    -> https://api.leadconnectorhq.com/widget/bookings/waya-consultation?utm_source=apollo&utm_medium=ce&utm_campaign=dataroom_yc_2026q1&utm_content=E1VA&utm_term=founder_seed

Campaign link that lands on a site page instead of a calendar:
    python scripts/utm_link.py --product leanai --placement "GHL workflow email" \
        --audience cohort --period 2026q4 --content E1VA --landing /lean-ai/setup/

Website button (what goes in the page HTML):
    python scripts/utm_link.py --product dataroom --button hero
    -> https://api.leadconnectorhq.com/widget/bookings/waya-consultation?utm_button=hero

Any value that is not in utm.json, or any token/code that is not active, is refused
with the reason. Add the row to utm.json first; that is the discipline.
"""
import argparse, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UTM = json.load(open(os.path.join(ROOT, "_data", "utm.json"), encoding="utf-8"))


def die(msg):
    print("REFUSED: " + msg, file=sys.stderr)
    sys.exit(2)


def find_placement(name):
    name_l = name.lower()
    for p in UTM["placements"]:
        if p["placement"].lower() == name_l:
            return p
    die(f"placement '{name}' is not in utm.json placements: " + "; ".join(p["placement"] for p in UTM["placements"]))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--product", required=True, help="product token from utm.json")
    ap.add_argument("--button", help="website button placement (nav, hero, ...). Produces a website-context link.")
    ap.add_argument("--placement", help="campaign placement name from utm.json")
    ap.add_argument("--source", help="override utm_source (only when the placement lists alternatives)")
    ap.add_argument("--audience", help="<audience> segment of utm_campaign")
    ap.add_argument("--period", help="<period> segment, e.g. 2026q4 (quarter the campaign launches)")
    ap.add_argument("--content", help="utm_content code, e.g. E1VA")
    ap.add_argument("--term", help="utm_term persona, e.g. founder_seed")
    ap.add_argument("--landing", help="site path to land on instead of a booking calendar, e.g. /lean-ai/setup/")
    ap.add_argument("--allow-proposed", action="store_true", help="allow proposed tokens/codes (for drafts only)")
    a = ap.parse_args()

    prod = UTM["products"].get(a.product)
    if prod is None:
        die(f"product token '{a.product}' is not in utm.json. Known: {', '.join(UTM['products'])}")
    if prod["status"] == "retired":
        die(f"product token '{a.product}' is retired")
    if prod["status"] != "active" and not a.allow_proposed:
        die(f"product token '{a.product}' is {prod['status']}: get it confirmed (status active) before shipping links")

    # ---- website button -------------------------------------------------
    if a.button:
        if a.button not in UTM["website_buttons"]["allowed"]:
            die(f"button '{a.button}' not in allowed list {UTM['website_buttons']['allowed']}")
        root_slug = prod["root_website"] or "waya-consultation"
        root = UTM["roots"][root_slug]
        if root["status"] != "live":
            die(f"root '{root_slug}' is {root['status']}")
        print(f"{root['url']}?{UTM['website_buttons']['param']}={a.button}")
        return

    # ---- campaign link ----------------------------------------------------
    if not a.placement:
        die("give --button for a website button or --placement for a campaign link")
    pl = find_placement(a.placement)
    if pl["status"] == "retired":
        die(f"placement '{pl['placement']}' is retired")
    if pl["status"] != "active" and not a.allow_proposed:
        die(f"placement '{pl['placement']}' is {pl['status']}: confirm it in utm.json first")
    sources = pl["source"].split("|")
    source = a.source or sources[0]
    if source not in sources:
        die(f"source '{source}' is not valid for this placement (allowed: {', '.join(sources)})")
    medium = pl["medium"]
    med = UTM["mediums"][medium]
    if med["status"] not in ("active",) and not a.allow_proposed:
        die(f"medium '{medium}' is {med['status']}")
    audience = a.audience or prod.get("default_audience")
    if not audience:
        die(f"--audience is required (product '{a.product}' has no default audience; set one in utm.json)")
    if not a.period or not re.match(r"^20[0-9]{2}q[1-4]$", a.period):
        die("--period is required and must look like 2026q4 (the quarter the campaign launches)")
    campaign = f"{a.product}_{audience}_{a.period}"
    if not re.match(UTM["rules"]["campaign_regex"], campaign):
        die(f"campaign '{campaign}' violates {UTM['rules']['campaign_format']}: lowercase a-z 0-9 only inside segments")
    params = [("utm_source", source), ("utm_medium", medium), ("utm_campaign", campaign)]
    if pl.get("content_pattern"):
        if not a.content:
            die(f"--content is required for this placement (pattern {pl['content_pattern']}, e.g. E1VA)")
        pats = [p for p in UTM["content_patterns"] if re.match(p["regex"], a.content)]
        if not pats:
            die(f"content '{a.content}' matches no content pattern in utm.json")
        if pats[0]["status"] != "active" and not a.allow_proposed:
            die(f"content pattern '{pats[0]['meaning']}' is {pats[0]['status']}")
        params.append(("utm_content", a.content))
    elif a.content:
        params.append(("utm_content", a.content))
    term = a.term or prod.get("default_term")
    if term:
        if not re.match(UTM["rules"]["value_charset_regex"], term):
            die(f"term '{term}' must be lowercase a-z 0-9 _")
        params.append(("utm_term", term))
    if a.landing:
        if not a.landing.startswith("/") or not a.landing.endswith("/"):
            die("--landing must be a site path like /lean-ai/setup/")
        base = "https://www.wayaframes.com" + a.landing
    else:
        root_slug = pl["root"] if pl["root"] in UTM["roots"] else (prod["root_website"] or "waya-consultation")
        root = UTM["roots"][root_slug]
        if root["status"] != "live":
            die(f"root '{root_slug}' is {root['status']}")
        base = root["url"]
    print(base + "?" + "&".join(f"{k}={v}" for k, v in params))


if __name__ == "__main__":
    main()
