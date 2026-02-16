/**
 * License Data Parser
 *
 * Parses the LicenseData JSON to extract:
 * - License type (STD, PDB, Pro)
 * - Expiration date
 * - License properties (trial, NFR, suspended, etc.)
 */

export interface LicenseDataSummary {
  edition?: number;                    // 1=STD, 2=PDB, 3=Pro
  editionName?: string;                // Human-readable edition name
  expirationDate?: string;             // ISO date string
  expirationTimestamp?: number;        // Timestamp for comparison
  isPirated?: boolean;                 // Expiration > 12 years in future

  // License properties
  isAutoRenewable?: boolean;
  isBeta?: boolean;
  isBytebot?: boolean;
  isChina?: boolean;
  isExpired?: boolean;
  isGracePeriod?: boolean;
  isNfr?: boolean;
  isPurchasedOnline?: boolean;
  isSublicense?: boolean;
  isSuspended?: boolean;
  isTrial?: boolean;
  isUpgrade?: boolean;
}

const LICENSE_TYPE_MAP: Record<number, string> = {
  1: 'STD',
  2: 'PDB',
  3: 'Pro'
};

/**
 * Parse LicenseData JSON
 */
export function parseLicenseData(jsonData: string): LicenseDataSummary | null {
  if (!jsonData) {
    console.warn('[parseLicenseData] No JSON data provided');
    return null;
  }

  try {
    const data = JSON.parse(jsonData);
    const license = data?.license;

    if (!license) {
      console.warn('[parseLicenseData] No license object found in JSON');
      return null;
    }

    const edition = license.edition;
    const editionName = LICENSE_TYPE_MAP[edition] || `Unknown (${edition})`;
    const expirationDate = license.main_period_ends_at;

    // Check if license is pirated (expiration > 12 years in future)
    let isPirated = false;
    let expirationTimestamp: number | undefined;

    if (expirationDate) {
      expirationTimestamp = Date.parse(expirationDate);
      const now = Date.now();
      const twelveYears = 12 * 365 * 24 * 3600 * 1000;
      isPirated = (expirationTimestamp - now) > twelveYears;
    }

    return {
      edition,
      editionName,
      expirationDate,
      expirationTimestamp,
      isPirated,

      // License properties
      isAutoRenewable: license.is_auto_renewable,
      isBeta: license.is_beta,
      isBytebot: license.is_bytebot,
      isChina: license.is_china,
      isExpired: license.is_expired,
      isGracePeriod: license.is_grace_period,
      isNfr: license.is_nfr,
      isPurchasedOnline: license.is_purchased_online,
      isSublicense: license.is_sublicense,
      isSuspended: license.is_suspended,
      isTrial: license.is_trial,
      isUpgrade: license.is_upgrade
    };
  } catch (e) {
    console.error('[parseLicenseData] Failed to parse JSON:', e);
    return null;
  }
}
