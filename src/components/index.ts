/**
 * Custom FAST Components
 * Export all custom components for easy registration
 */

import './fast-alert.js';
import './fast-badge.js';

export { FastAlert } from './fast-alert.js';
export { FastBadge } from './fast-badge.js';

// Register all custom components
export function registerCustomComponents() {
  // Components are auto-registered when their modules are imported
  console.log('✅ Custom FAST components registered');
}
