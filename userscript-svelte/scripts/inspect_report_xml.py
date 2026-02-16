#!/usr/bin/env python3
"""
Inspect ParallelsProblemReport XML structure without dumping the entire file.

Usage:
  scripts/inspect_report_xml.py "/path/to/Report.xml"

Outputs:
- Root tag + attributes
- Direct children of root (counts)
- Classification of each top-level node:
  - inline-xml (has child elements)
  - json-text (text starts with { or [)
  - xml-text (text starts with < or <?xml)
  - reference (text looks like a filename *.xml/*.txt/*.log/*.plist/*.png)
  - text / empty
"""

from __future__ import annotations

import os
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from typing import Dict, Optional, Tuple
import xml.etree.ElementTree as ET


@dataclass(frozen=True)
class NodeSample:
  kind: str
  text_len: int
  sample: str


def classify_text(text: str) -> str:
  t = text.strip()
  if not t:
    return "empty"
  if t.startswith("{") or t.startswith("["):
    return "json-text"
  if t.startswith("<?xml") or t.startswith("<"):
    return "xml-text"

  lower = t.lower()
  if any(lower.endswith(suffix) for suffix in (".xml", ".txt", ".log", ".plist", ".png", ".jpg", ".jpeg")):
    return "reference"

  return "text"


def main(argv: list[str]) -> int:
  if len(argv) != 2:
    print(__doc__.strip())
    return 2

  path = argv[1]
  if not os.path.exists(path):
    print(f"File not found: {path}")
    return 1

  context = ET.iterparse(path, events=("start", "end"))
  stack: list[ET.Element] = []

  root_tag: Optional[str] = None
  root_attrib: Optional[Dict[str, str]] = None

  child_counts = Counter()
  child_kind_counts: dict[str, Counter[str]] = defaultdict(Counter)
  child_samples: dict[str, NodeSample] = {}
  child_childtag_samples: dict[str, Tuple[str, ...]] = {}

  for event, elem in context:
    if event == "start":
      stack.append(elem)
      if len(stack) == 1:
        root_tag = elem.tag
        root_attrib = dict(elem.attrib)
      continue

    # end
    if root_tag and len(stack) == 2 and stack[0].tag == root_tag:
      tag = elem.tag
      child_counts[tag] += 1

      has_children = len(list(elem)) > 0
      direct_text = elem.text or ""

      if has_children:
        kind = "inline-xml"
        if tag not in child_childtag_samples:
          child_childtag_samples[tag] = tuple(child.tag for child in list(elem)[:12])
      else:
        kind = classify_text(direct_text)

      child_kind_counts[tag][kind] += 1

      if tag not in child_samples:
        sample = (direct_text.strip()[:140]).replace("\n", "\\n")
        child_samples[tag] = NodeSample(kind=kind, text_len=len(direct_text), sample=sample)

    stack.pop()
    elem.clear()

  print(f"Root: {root_tag}")
  print(f"Root attributes: {root_attrib or {}}")
  print("")
  print(f"Top-level nodes: {sum(child_counts.values())} (unique: {len(child_counts)})")
  print("")

  print("Top-level tags (count | kind | textLen | sample):")
  for tag, count in child_counts.most_common():
    sample = child_samples.get(tag)
    if not sample:
      print(f"- {tag}: x{count}")
      continue
    print(f"- {tag}: x{count} | {sample.kind} | textLen={sample.text_len} | {sample.sample!r}")

  inline = [t for t in child_counts if any(k == "inline-xml" for k in child_kind_counts[t])]
  if inline:
    print("")
    print("Inline nodes (tag -> first child tags):")
    for tag in sorted(inline):
      kids = child_childtag_samples.get(tag, ())
      print(f"- {tag}: {list(kids)}")

  varying = {t: dict(k) for t, k in child_kind_counts.items() if len(k) > 1}
  if varying:
    print("")
    print("Tags with varying kinds across occurrences:")
    for tag in sorted(varying):
      print(f"- {tag}: {varying[tag]}")

  return 0


if __name__ == "__main__":
  raise SystemExit(main(sys.argv))

