# AI Shaping Specification

## Overview

`packages/report-ai/` converts parsed report data into agent-friendly JSON and applies safe truncation.

**Key principle:** shaping is additive and must not affect parsing/model correctness.

## Interfaces

- `toAgentSummary(report: ReportModel): object`
- `truncateText(text, { maxChars }): { text: string; truncated: boolean }`

## Status

**Outline** — minimal shaping is implemented; extend cautiously and keep outputs stable for tool consumers.
