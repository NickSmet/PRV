/**
 * Marker Store
 * 
 * A Svelte 5 reactive store that manages all markers for the report viewer.
 * Components can query this store to get markers for their specific location
 * in the UI hierarchy.
 */

import type {
  Marker,
  MarkerSeverity
} from '../types/markers';
import {
  getNodeLevelMarkers,
  getMarkersForSection,
  getMarkersForSubSection,
  getMarkersForRow,
  getHighestSeverity
} from '../types/markers';

// ============================================================================
// Reactive State
// ============================================================================

let markers = $state<Marker[]>([]);

// ============================================================================
// Store Actions
// ============================================================================

/**
 * Clear all markers
 */
export function clearMarkers(): void {
  markers = [];
}

/**
 * Add a single marker
 */
export function addMarker(marker: Marker): void {
  markers = [...markers, marker];
}

/**
 * Add multiple markers at once
 */
export function addMarkers(newMarkers: Marker[]): void {
  markers = [...markers, ...newMarkers];
}

/**
 * Replace all markers with a new set
 */
export function setMarkers(newMarkers: Marker[]): void {
  markers = newMarkers;
}

/**
 * Remove a marker by ID
 */
export function removeMarker(markerId: string): void {
  markers = markers.filter((m) => m.id !== markerId);
}

// ============================================================================
// Store Getters (Reactive)
// ============================================================================

/**
 * Get all markers (reactive)
 */
export function getAllMarkers(): Marker[] {
  return markers;
}

/**
 * Get node-level markers for a specific node
 */
export function getNodeMarkers(nodeId: string): Marker[] {
  return getNodeLevelMarkers(markers, nodeId);
}

/**
 * Get markers for a specific section
 */
export function getSectionMarkers(nodeId: string, sectionTitle: string): Marker[] {
  return getMarkersForSection(markers, nodeId, sectionTitle);
}

/**
 * Get markers for a specific sub-section
 */
export function getSubSectionMarkers(
  nodeId: string,
  sectionTitle: string,
  subSectionId: string
): Marker[] {
  return getMarkersForSubSection(markers, nodeId, sectionTitle, subSectionId);
}

/**
 * Get markers for a specific row
 */
export function getRowMarkers(nodeId: string, path: string): Marker[] {
  return getMarkersForRow(markers, nodeId, path);
}

/**
 * Get the count of markers for a node
 */
export function getNodeMarkerCount(nodeId: string): number {
  return getNodeLevelMarkers(markers, nodeId).length;
}

/**
 * Get the highest severity for a node
 */
export function getNodeHighestSeverity(nodeId: string): MarkerSeverity | null {
  return getHighestSeverity(getNodeLevelMarkers(markers, nodeId));
}

/**
 * Check if a node has any markers with a specific severity
 */
export function nodeHasSeverity(nodeId: string, severity: MarkerSeverity): boolean {
  return getNodeLevelMarkers(markers, nodeId).some((m) => m.severity === severity);
}

/**
 * Check if a sub-section has any markers
 */
export function subSectionHasMarkers(
  nodeId: string,
  sectionTitle: string,
  subSectionId: string
): boolean {
  return getMarkersForSubSection(markers, nodeId, sectionTitle, subSectionId).length > 0;
}

// ============================================================================
// Navigation Helpers
// ============================================================================

/**
 * Scroll to a marker's target element with optional highlight animation
 */
export function scrollToMarker(markerId: string): void {
  const el = document.querySelector(`[data-marker-id="${markerId}"]`);
  if (!el) {
    console.warn(`[PRV] scrollToMarker: element with data-marker-id="${markerId}" not found`);
    return;
  }

  // Scroll into view
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Add highlight animation
  el.classList.add('marker-highlight-flash');
  
  // Remove animation class after it completes
  setTimeout(() => {
    el.classList.remove('marker-highlight-flash');
  }, 1500);
}

/**
 * Find a marker by ID
 */
export function findMarker(markerId: string): Marker | undefined {
  return markers.find((m) => m.id === markerId);
}

// ============================================================================
// Debug Helpers
// ============================================================================

/**
 * Log all markers to console (for debugging)
 */
export function debugLogMarkers(): void {
  console.log('[PRV] Current markers:', markers);
  console.log('[PRV] Marker count:', markers.length);
  
  const byNode = new Map<string, Marker[]>();
  for (const marker of markers) {
    const nodeId = marker.target.type === 'node' 
      ? marker.target.nodeId 
      : marker.target.nodeId;
    if (!byNode.has(nodeId)) {
      byNode.set(nodeId, []);
    }
    byNode.get(nodeId)!.push(marker);
  }
  
  for (const [nodeId, nodeMarkers] of byNode) {
    console.log(`[PRV] Node "${nodeId}":`, nodeMarkers.length, 'markers');
  }
}




