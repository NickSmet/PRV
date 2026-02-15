/**
 * Rule Engine Types
 * 
 * Rules are pure functions that take a ReportModel and return an array of Markers.
 * This enables declarative, testable, and composable rule definitions.
 */

import type { ReportModel } from '../types/report';
import type { Marker } from '../types/markers';

/**
 * A Rule is a pure function that evaluates report data and returns markers.
 */
export type Rule = (report: ReportModel) => Marker[];

/**
 * A named rule with metadata for debugging and documentation.
 */
export interface NamedRule {
  /** Unique identifier for this rule */
  id: string;
  
  /** Human-readable description */
  description: string;
  
  /** Which node(s) this rule primarily affects */
  affectsNodes: string[];
  
  /** The rule function */
  evaluate: Rule;
}

/**
 * Rule evaluation result with timing info for debugging
 */
export interface RuleEvaluationResult {
  totalMarkers: number;
  evaluationTimeMs: number;
  markersByNode: Map<string, number>;
}




