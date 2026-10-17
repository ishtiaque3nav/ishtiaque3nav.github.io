#!/usr/bin/env python3
"""Verify all-time Google Scholar Author metrics before publishing a static snapshot."""

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

AUTHOR_ID = "oIF2HdcAAAAJ"
SOURCE = f"https://scholar.google.com/citations?user={AUTHOR_ID}&hl=en"
API = "https://serpapi.com/search.json"
ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / "api" / "scholar.json"
METRICS = ("citations", "hIndex", "i10Index")


def count(value, label):
    if isinstance(value, bool):
        raise ValueError(f"Invalid {label}: Boolean")
    if isinstance(value, int):
        result = value
    elif isinstance(value, str) and re.fullmatch(r"\d[\d,]*", value.strip()):
        result = int(value.replace(",", ""))
    else:
        raise ValueError(f"Invalid or missing {label}")
    if result < 0:
        raise ValueError(f"Negative {label}")
    return result


def extract(payload):
    if not isinstance(payload, dict) or payload.get("error"):
        raise ValueError("SerpAPI returned an error or invalid response")
    metadata = payload.get("search_metadata")
    if not isinstance(metadata, dict) or metadata.get("status") != "Success":
        raise ValueError("SerpAPI search did not complete successfully")
    parameters = payload.get("search_parameters")
    if not isinstance(parameters, dict) or parameters.get("engine") != "google_scholar_author" or parameters.get("author_id") != AUTHOR_ID:
        raise ValueError("Unexpected search engine or Scholar author ID")
    author = payload.get("author") or {}
    if not isinstance(author, dict) or (author.get("name") is not None and
                                       (not isinstance(author["name"], str) or "navid" not in author["name"].lower())):
        raise ValueError("Returned author name does not match the expected profile")
    cited_by = payload.get("cited_by")
    if not isinstance(cited_by, dict):
        raise ValueError("Missing cited_by section")
    table = cited_by.get("table")
    if not isinstance(table, list):
        raise ValueError("Missing cited_by.table")
    extracted = {}
    for key, output_key in (("citations", "citations"), ("h_index", "hIndex"), ("i10_index", "i10Index")):
        matches = [row[key] for row in table if isinstance(row, dict) and key in row]
        if len(matches) != 1 or not isinstance(matches[0], dict):
            raise ValueError(f"Missing or repeated {key} metrics")
        extracted[output_key] = count(matches[0].get("all"), output_key)
    if not all(extracted[k] > 0 for k in METRICS):
        raise ValueError("Unexpected zero all-time metrics; refusing to overwrite verified values")
    if extracted["hIndex"] > extracted["citations"] or 10 * extracted["i10Index"] > extracted["citations"]:
        raise ValueError("Inconsistent all-time citation metrics")
    return extracted


def compare(previous, current):
    for key in METRICS:
        old = count(previous[key], f"previous {key}")
        if old and current[key] < old * 0.75:
            raise ValueError(f"Suspicious greater-than-25% drop in {key}; manual review required")


def check_snapshot(data):
    if not isinstance(data, dict):
        raise ValueError("Snapshot must be an object")
    for key in METRICS:
        count(data.get(key), key)
    if data.get("source") != SOURCE:
        raise ValueError("Snapshot has an unexpected Scholar source")
    value = data.get("updatedAt")
    if not isinstance(value, str):
        raise ValueError("Missing verification timestamp")
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError("Verification timestamp must have timezone")
    if parsed > datetime.now(timezone.utc).replace(microsecond=0):
        # Tiny clock drift tolerated below, but not an obviously future timestamp.
        if (parsed - datetime.now(timezone.utc)).total_seconds() > 300:
            raise ValueError("Verification timestamp is in the future")
    return data


def fetch_metrics(api_key):
    query = urllib.parse.urlencode({
        "engine": "google_scholar_author", "author_id": AUTHOR_ID,
        "hl": "en", "api_key": api_key,
    })
    request = urllib.request.Request(API + "?" + query, headers={"Accept": "application/json"})
    with urllib.request.urlopen(request, timeout=40) as response:
        if response.status != 200:
            raise ValueError(f"HTTP status {response.status}")
        data = response.read(5_000_001)
    if len(data) > 5_000_000:
        raise ValueError("SerpAPI payload exceeds safe size limit")
    return extract(json.loads(data))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check-file", action="store_true", help="Validate current snapshot offline; no API call")
    args = parser.parse_args()
    try:
        previous = check_snapshot(json.loads(SNAPSHOT.read_text(encoding="utf-8")))
        if args.check_file:
            print("Existing Scholar snapshot is valid; no API credits used.")
            return 0
        api_key = os.environ.get("SERPAPI_KEY", "").strip()
        if not api_key:
            raise ValueError("SERPAPI_KEY is not configured as a GitHub Actions repository secret")
        current = fetch_metrics(api_key)
        compare(previous, current)
        timestamp = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
        updated = {
            "citations": current["citations"], "hIndex": current["hIndex"],
            "i10Index": current["i10Index"], "updatedAt": timestamp,
            "checkedAt": timestamp, "lastAttemptOk": True, "source": SOURCE,
            "refreshIntervalHours": 24,
        }
        tmp = SNAPSHOT.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(updated, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        tmp.replace(SNAPSHOT)
        print("Verified Scholar metrics and saved timestamp:", timestamp)
        return 0
    except urllib.error.HTTPError as exc:
        print(f"Scholar refresh failed (HTTP {exc.code}); verified snapshot preserved.", file=sys.stderr)
    except urllib.error.URLError:
        print("Scholar refresh failed (network error); verified snapshot preserved.", file=sys.stderr)
    except (ValueError, KeyError, TypeError, json.JSONDecodeError, OSError, TimeoutError) as exc:
        # Never print the request URL or API key. Validation errors contain only field labels.
        print(f"Scholar refresh failed: {exc}; verified snapshot preserved.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
