import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatINR,
  parseAmount,
  calculateBudgetRemainder,
  detectSensitiveContent,
  validateImageUpload,
} from './budget';

test('formatINR formats amounts accurately in Indian Rupee format', () => {
  assert.equal(formatINR(18000), '₹18,000');
  assert.equal(formatINR(6500), '₹6,500');
  assert.equal(formatINR(0), '₹0');
  assert.equal(formatINR(-2000), '-₹2,000');
});

test('parseAmount parses varied numerical representations', () => {
  assert.equal(parseAmount('18000'), 18000);
  assert.equal(parseAmount('₹18,000'), 18000);
  assert.equal(parseAmount('6.5k'), 6500);
  assert.equal(parseAmount('20k'), 20000);
  assert.equal(parseAmount('1.5 lakh'), 150000);
  assert.equal(parseAmount('Rs. 9,250'), 9250);
});

test('calculateBudgetRemainder accurately computes remainder and prevents false claims of pure savings', () => {
  const result = calculateBudgetRemainder(18000, [
    { name: 'Rent', amount: 6000, category: 'fixed' },
    { name: 'Food', amount: 2000, category: 'essential' },
  ]);

  assert.equal(result.income, 18000);
  assert.equal(result.totalExpenses, 8000);
  assert.equal(result.remainder, 10000);
  assert.equal(result.isDeficit, false);
  assert.equal(result.formattedRemainder, '₹10,000');
  assert.equal(result.unallocatedPercentage, 56);
});

test('calculateBudgetRemainder handles deficit correctly', () => {
  const result = calculateBudgetRemainder(15000, [
    { name: 'Rent', amount: 10000 },
    { name: 'Food & Bills', amount: 6500 },
  ]);

  assert.equal(result.totalExpenses, 16500);
  assert.equal(result.remainder, -1500);
  assert.equal(result.isDeficit, true);
  assert.equal(result.formattedRemainder, '-₹1,500');
});

test('detectSensitiveContent catches UPI IDs and card numbers to protect user privacy', () => {
  const upiCheck = detectSensitiveContent('Send it to rohan@okaxis please');
  assert.equal(upiCheck.containsSensitive, true);
  assert.ok(upiCheck.issues.length > 0);

  const cardCheck = detectSensitiveContent('Here is 4111 2222 3333 4444');
  assert.equal(cardCheck.containsSensitive, true);

  const cleanCheck = detectSensitiveContent('I spent ₹2,500 on groceries at the local store.');
  assert.equal(cleanCheck.containsSensitive, false);
});

test('validateImageUpload enforces allowed MIME types and size limit', () => {
  const validJpg = validateImageUpload({ size: 1024 * 1024, type: 'image/jpeg' });
  assert.equal(validJpg.valid, true);

  const validPng = validateImageUpload({ size: 2 * 1024 * 1024, type: 'image/png' });
  assert.equal(validPng.valid, true);

  const invalidType = validateImageUpload({ size: 1024, type: 'application/pdf' });
  assert.equal(invalidType.valid, false);
  assert.match(invalidType.error || '', /Only JPG, PNG, and WebP/);

  const oversized = validateImageUpload({ size: 10 * 1024 * 1024, type: 'image/jpeg' });
  assert.equal(oversized.valid, false);
  assert.match(oversized.error || '', /exceeds the 5MB limit/);
});
