"""Offline regression tests; these do not use a SerpAPI credit."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import update_scholar as scholar


def response(citations=2825, author="Ishtiaque Ahmed Navid"):
    return {"search_metadata": {"status": "Success"},
            "search_parameters": {"engine": "google_scholar_author", "author_id": scholar.AUTHOR_ID},
            "author": {"name": author},
            "cited_by": {"table": [
                {"citations": {"all": citations, "since_2021": 2200}},
                {"h_index": {"all": 20}}, {"i10_index": {"all": 29}},
            ]}}


class ScholarTests(unittest.TestCase):
    def test_valid_all_time_counts(self):
        self.assertEqual(scholar.extract(response()), {"citations": 2825, "hIndex": 20, "i10Index": 29})

    def test_commas_in_numeric_string(self):
        self.assertEqual(scholar.extract(response(citations="2,825"))["citations"], 2825)

    def test_wrong_profile_rejected(self):
        r = response()
        r["search_parameters"]["author_id"] = "AnotherProfile"
        with self.assertRaises(ValueError): scholar.extract(r)

    def test_wrong_name_rejected(self):
        with self.assertRaises(ValueError): scholar.extract(response(author="An unrelated scholar"))

    def test_missing_statistics_rejected(self):
        r = response()
        r["cited_by"]["table"] = []
        with self.assertRaises(ValueError): scholar.extract(r)

    def test_api_error_rejected(self):
        r = response()
        r["error"] = "Service unavailable"
        with self.assertRaises(ValueError): scholar.extract(r)

    def test_zero_rejected(self):
        with self.assertRaises(ValueError): scholar.extract(response(citations=0))

    def test_large_drop_rejected(self):
        with self.assertRaises(ValueError): scholar.compare(
            {"citations": 2808, "hIndex": 20, "i10Index": 29},
            {"citations": 100, "hIndex": 20, "i10Index": 29})


if __name__ == "__main__": unittest.main()
