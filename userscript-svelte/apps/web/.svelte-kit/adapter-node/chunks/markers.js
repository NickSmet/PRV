function createNodeMarker(id, nodeId, severity, label, options) {
  return {
    id,
    severity,
    label,
    tooltip: options?.tooltip,
    iconKey: options?.iconKey,
    target: { type: "node", nodeId }
  };
}
function createSubSectionMarker(id, nodeId, sectionTitle, subSectionId, severity, label, options) {
  return {
    id,
    severity,
    label,
    tooltip: options?.tooltip,
    iconKey: options?.iconKey,
    target: { type: "subSection", nodeId, sectionTitle, subSectionId }
  };
}
function createRowMarker(id, nodeId, path, severity, label, options) {
  return {
    id,
    severity,
    label,
    tooltip: options?.tooltip,
    iconKey: options?.iconKey,
    target: { type: "row", nodeId, path }
  };
}
function getNodeLevelMarkers(markers, nodeId) {
  return markers.filter(
    (m) => m.target.type === "node" && m.target.nodeId === nodeId
  );
}
function getMarkersForSubSection(markers, nodeId, sectionTitle, subSectionId) {
  return markers.filter(
    (m) => m.target.type === "subSection" && m.target.nodeId === nodeId && m.target.sectionTitle === sectionTitle && m.target.subSectionId === subSectionId
  );
}
function severityToVariant(severity) {
  switch (severity) {
    case "danger":
      return "destructive";
    case "warn":
      return "default";
    case "success":
      return "success";
    case "info":
    default:
      return "secondary";
  }
}
export {
  createSubSectionMarker as a,
  createRowMarker as b,
  createNodeMarker as c,
  getMarkersForSubSection as d,
  getNodeLevelMarkers as g,
  severityToVariant as s
};
