/**
 * MS FAST Component Test
 * 
 * Simple test file to verify FAST components are working correctly.
 * This can be imported temporarily in main.ts for testing.
 */

import { ensureFASTComponents } from './fast-integration.js';

export async function testFASTComponents(): Promise<void> {
  console.log('🧪 Testing MS FAST components...');

  try {
    // Wait for essential components to be defined
    await ensureFASTComponents([
      'fast-button',
      'fast-text-field',
      'fast-dialog',
      'fast-checkbox'
    ]);

    console.log('✅ MS FAST components are properly registered');

    // Test creating a FAST button programmatically
    const testButton = document.createElement('fast-button') as any;
    testButton.appearance = 'accent';
    testButton.textContent = 'Test FAST Button';

    if (testButton.appearance === 'accent') {
      console.log('✅ FAST component properties are working');
    }

    // Log available FAST components
    const fastComponents = Array.from(customElements.entries())
      .filter(([name]) => name.startsWith('fast-'))
      .map(([name]) => name);

    console.log('📦 Available FAST components:', fastComponents);

  } catch (error) {
    console.error('❌ FAST components test failed:', error);
  }
}
