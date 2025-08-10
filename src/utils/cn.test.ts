import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cn } from './cn.ts';

test('tailwind merge keeps latest conflicting class', () => {
  const result = cn('px-2', 'px-4');
  assert.equal(result, 'px-4');
});
