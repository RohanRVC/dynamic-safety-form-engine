/**
 * Determines if a submission counts as a safety alert (for dashboard and notifications).
 * @param {Object} s - Submission with submission_data
 * @returns {boolean}
 */
export function isAlertSubmission(s) {
  const d = s.submission_data || {};
  const severity = d.damage_severity ?? d.severity ?? "";
  const damage = d.damage ?? "";
  const depth = typeof d.depth === "number" ? d.depth : Number(d.depth);
  if (severity === "High" || severity === "Critical" || String(severity).toLowerCase() === "high")
    return true;
  if (damage === "Yes" || String(damage).toLowerCase() === "yes") return true;
  if (!isNaN(depth) && depth >= 4) return true;
  return false;
}
