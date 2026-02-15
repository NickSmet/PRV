/**
 * Marker System Types
 * 
 * Markers are typed objects that represent visual indicators (badges, icons)
 * that can target different levels of the UI hierarchy:
 * - Node level (e.g., the CurrentVm collapsible header)
 * - Section level (e.g., "Hardware" section)
 * - Sub-section level (e.g., "HDDs" inside Hardware)
 * - Row level (e.g., a specific configuration row)
 */

// ============================================================================
// Marker Severity
// ============================================================================

export type MarkerSeverity = 'info' | 'warn' | 'danger' | 'success';

// ============================================================================
// Marker Target Types
// ============================================================================

export interface NodeTarget {
  type: 'node';
  nodeId: string;
}

export interface SectionTarget {
  type: 'section';
  nodeId: string;
  sectionTitle: string;
}

export interface SubSectionTarget {
  type: 'subSection';
  nodeId: string;
  sectionTitle: string;
  subSectionId: string;
}

export interface RowTarget {
  type: 'row';
  nodeId: string;
  /** Path in format "SectionTitle.RowLabel" */
  path: string;
}

export type MarkerTarget = NodeTarget | SectionTarget | SubSectionTarget | RowTarget;

// ============================================================================
// Marker Interface
// ============================================================================

export interface Marker {
  /** Unique ID for click-to-scroll navigation */
  id: string;
  
  /** Visual severity level */
  severity: MarkerSeverity;
  
  /** Badge text label */
  label: string;
  
  /** Hover tooltip explanation */
  tooltip?: string;
  
  /** Lucide icon key (e.g., 'hard-drive', 'network', 'alert-triangle') */
  iconKey?: string;
  
  /** Where this marker should be displayed */
  target: MarkerTarget;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a node-level marker
 */
export function createNodeMarker(
  id: string,
  nodeId: string,
  severity: MarkerSeverity,
  label: string,
  options?: { tooltip?: string; iconKey?: string }
): Marker {
  return {
    id,
    severity,
    label,
    tooltip: options?.tooltip,
    iconKey: options?.iconKey,
    target: { type: 'node', nodeId }
  };
}

/**
 * Create a section-level marker
 */
export function createSectionMarker(
  id: string,
  nodeId: string,
  sectionTitle: string,
  severity: MarkerSeverity,
  label: string,
  options?: { tooltip?: string; iconKey?: string }
): Marker {
  return {
    id,
    severity,
    label,
    tooltip: options?.tooltip,
    iconKey: options?.iconKey,
    target: { type: 'section', nodeId, sectionTitle }
  };
}

/**
 * Create a sub-section-level marker
 */
export function createSubSectionMarker(
  id: string,
  nodeId: string,
  sectionTitle: string,
  subSectionId: string,
  severity: MarkerSeverity,
  label: string,
  options?: { tooltip?: string; iconKey?: string }
): Marker {
  return {
    id,
    severity,
    label,
    tooltip: options?.tooltip,
    iconKey: options?.iconKey,
    target: { type: 'subSection', nodeId, sectionTitle, subSectionId }
  };
}

/**
 * Create a row-level marker
 */
export function createRowMarker(
  id: string,
  nodeId: string,
  path: string,
  severity: MarkerSeverity,
  label: string,
  options?: { tooltip?: string; iconKey?: string }
): Marker {
  return {
    id,
    severity,
    label,
    tooltip: options?.tooltip,
    iconKey: options?.iconKey,
    target: { type: 'row', nodeId, path }
  };
}

// ============================================================================
// Marker Filtering Utilities
// ============================================================================

/**
 * Get all markers for a specific node
 */
export function getMarkersForNode(markers: Marker[], nodeId: string): Marker[] {
  return markers.filter((m) => {
    switch (m.target.type) {
      case 'node':
        return m.target.nodeId === nodeId;
      case 'section':
      case 'subSection':
      case 'row':
        return m.target.nodeId === nodeId;
      default:
        return false;
    }
  });
}

/**
 * Get node-level markers only (not section/subsection/row)
 */
export function getNodeLevelMarkers(markers: Marker[], nodeId: string): Marker[] {
  return markers.filter(
    (m) => m.target.type === 'node' && m.target.nodeId === nodeId
  );
}

/**
 * Get markers for a specific section
 */
export function getMarkersForSection(
  markers: Marker[],
  nodeId: string,
  sectionTitle: string
): Marker[] {
  return markers.filter((m) => {
    if (m.target.type === 'section') {
      return m.target.nodeId === nodeId && m.target.sectionTitle === sectionTitle;
    }
    if (m.target.type === 'subSection') {
      return m.target.nodeId === nodeId && m.target.sectionTitle === sectionTitle;
    }
    if (m.target.type === 'row') {
      return m.target.nodeId === nodeId && m.target.path.startsWith(sectionTitle + '.');
    }
    return false;
  });
}

/**
 * Get markers for a specific sub-section
 */
export function getMarkersForSubSection(
  markers: Marker[],
  nodeId: string,
  sectionTitle: string,
  subSectionId: string
): Marker[] {
  return markers.filter(
    (m) =>
      m.target.type === 'subSection' &&
      m.target.nodeId === nodeId &&
      m.target.sectionTitle === sectionTitle &&
      m.target.subSectionId === subSectionId
  );
}

/**
 * Get markers for a specific row
 */
export function getMarkersForRow(
  markers: Marker[],
  nodeId: string,
  path: string
): Marker[] {
  return markers.filter(
    (m) =>
      m.target.type === 'row' &&
      m.target.nodeId === nodeId &&
      m.target.path === path
  );
}

/**
 * Get the highest severity among a list of markers
 */
export function getHighestSeverity(markers: Marker[]): MarkerSeverity | null {
  if (!markers.length) return null;
  
  const priority: Record<MarkerSeverity, number> = {
    danger: 3,
    warn: 2,
    info: 1,
    success: 0
  };
  
  return markers.reduce((highest, marker) => {
    if (!highest) return marker.severity;
    return priority[marker.severity] > priority[highest] ? marker.severity : highest;
  }, null as MarkerSeverity | null);
}

/**
 * Convert severity to badge variant
 */
export function severityToVariant(
  severity: MarkerSeverity
): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' {
  switch (severity) {
    case 'danger':
      return 'destructive';
    case 'warn':
      return 'default';
    case 'success':
      return 'success';
    case 'info':
    default:
      return 'secondary';
  }
}




