/**
 * Robust phone number formatting helper for Tanzanian phone numbers.
 * Cleans spaces, hyphens, and parentheses, and normalizes prefix formats:
 * - "+255 755 123 456" -> "+255755123456"
 * - "255755123456" -> "+255755123456"
 * - "0755123456" -> "+255755123456"
 * - "755123456" -> "+255755123456"
 */
export const formatPhoneNumber = (phone: string): string => {
    if (!phone) return "";
    let clean = phone.replace(/[\s\-\(\)]/g, ""); // Strip spaces, hyphens, parentheses
    if (clean.startsWith("+")) {
        return clean;
    }
    if (clean.startsWith("255")) {
        return `+${clean}`;
    }
    if (clean.startsWith("0")) {
        return `+255${clean.substring(1)}`;
    }
    return `+255${clean}`;
};
