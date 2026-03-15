# Timeline Display Modes

This document defines the intended visual semantics for timeline items in the lab timeline.

## Goal

Timeline width must not mix two meanings without making that explicit:

- real elapsed time
- temporary readability affordance

The display should stay readable at wide zoom levels without visually lying about duration more than necessary.

## Modes

### 1. Point Mode

Use point mode when:

- the event has no `end`, or
- the event duration is `<= 5s`

Point-mode items should:

- render as a true point marker on the time axis
- show a bounded chip label for readability
- stack vertically when close together
- keep the marker anchored at the actual event start

Point-mode label sizing:

- minimum readable width: about `7ch`
- maximum readable width: about `24ch`
- overflow should ellipsize

Point-mode width is not a duration claim.
Current implementation uses vis-timeline `point` items with a separate marker glyph and chip label.

### 2. Readability Range Mode

Use readability range mode when:

- the event duration is `> 5s`, and
- the real on-screen width is too small to read comfortably

Readability range items should:

- start at the real event start
- extend rightward only as much as needed for readability
- remain visually distinct from true-duration bars

This mode is a temporary zoom-dependent affordance.
Current implementation targets a readability footprint of roughly `168px` at an assumed `800px` viewport when computing the temporary widened range.

### 3. True-Duration Range Mode

Use true-duration range mode when:

- the event duration is `> 5s`, and
- the real timespan is already wide enough to read at the current zoom

True-duration range items should:

- render exactly from real `start` to real `end`
- not receive synthetic widening
- visually read as actual elapsed time

### 4. Cluster Summary Mode

Cluster items are summaries, not literal elapsed-time bars.

They should:

- remain readable at wide zoom levels
- use bounded visual width
- look distinct from true-duration bars

Current implementation caps cluster display width at roughly `220px` at an assumed `800px` viewport.

## Boundaries

Synthetic display widening should prefer common-sense bounds:

- do not extend past the report cutoff when it can be avoided
- preserve the actual timestamp anchor
- once a true-duration item is readable at current zoom, stop widening it

Point-like and narrow items also participate in clustering using a smaller clustering footprint than their full rendered readability width. This is intentional: clustering should reflect temporal neighborhood, not only label size.

## Practical Summary

- `<= 5s` means semantic point
- `> 5s` means semantic duration
- narrow duration items may temporarily borrow a readability width
- wide enough duration items must converge to their true elapsed span
