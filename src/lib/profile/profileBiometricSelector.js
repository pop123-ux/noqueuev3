/**
 * profileBiometricSelector.js
 * Centralized biometric data retrieval with automatic defaults
 * 
 * Ensures height and eye color are always populated for passport auto-fill
 */

const DEFAULT_HEIGHT_CM = 180;
const DEFAULT_EYE_COLOR = 'Căprui';
const EYE_COLOR_OPTIONS = ['Căprui', 'Albaștri', 'Verzi', 'Negri', 'Gri', 'Căprui-verzui', 'Hazel', 'Altele'];

/**
 * Get height with automatic default
 * @param profile - User profile object
 * @returns number - height in cm (defaults to 180 if missing)
 */
export function getHeight(profile) {
  if (!profile) return DEFAULT_HEIGHT_CM;
  const h = profile.height_cm;
  if (h === null || h === undefined || h === '') return DEFAULT_HEIGHT_CM;
  const num = Number(h);
  if (isNaN(num) || num < 50 || num > 250) return DEFAULT_HEIGHT_CM;
  return num;
}

/**
 * Get eye color with automatic default
 * @param profile - User profile object
 * @returns string - eye color (defaults to "Căprui" if missing)
 */
export function getEyeColor(profile) {
  if (!profile) return DEFAULT_EYE_COLOR;
  const color = profile.eye_color;
  if (!color || !EYE_COLOR_OPTIONS.includes(color)) return DEFAULT_EYE_COLOR;
  return color;
}

/**
 * Check if biometric fields have defaults applied (not user-saved values)
 * @param profile - User profile object
 * @returns object - { heightIsDefault, eyeColorIsDefault }
 */
export function getBiometricDefaults(profile) {
  const heightIsDefault = !profile?.height_cm || profile.height_cm === DEFAULT_HEIGHT_CM;
  const eyeColorIsDefault = !profile?.eye_color || profile.eye_color === DEFAULT_EYE_COLOR;
  return { heightIsDefault, eyeColorIsDefault };
}

/**
 * Get complete biometric data object for passport export
 * @param profile - User profile object
 * @returns object - { height_cm, eye_color, heightIsDefault, eyeColorIsDefault }
 */
export function getBiometricData(profile) {
  return {
    height_cm: getHeight(profile),
    eye_color: getEyeColor(profile),
    heightIsDefault: !profile?.height_cm,
    eyeColorIsDefault: !profile?.eye_color,
  };
}

/**
 * Validate biometric values
 * @param height - height in cm
 * @param eyeColor - eye color string
 * @returns object - { valid, errors }
 */
export function validateBiometrics(height, eyeColor) {
  const errors = [];
  
  if (height !== null && height !== undefined) {
    const num = Number(height);
    if (isNaN(num)) errors.push('Height must be a number');
    else if (num < 50 || num > 250) errors.push('Height must be between 50 and 250 cm');
  }
  
  if (eyeColor && !EYE_COLOR_OPTIONS.includes(eyeColor)) {
    errors.push('Invalid eye color');
  }
  
  return { valid: errors.length === 0, errors };
}