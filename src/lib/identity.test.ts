import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { forgetName, lastUsedName, recalledName, rememberName } from './identity';

describe('identity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('recalls nothing for a browser that has never joined', () => {
    expect(recalledName('t1')).toBeNull();
    expect(lastUsedName()).toBeNull();
  });

  it('recalls the name used on a trip', () => {
    rememberName('t1', 'Ania');
    expect(recalledName('t1')).toBe('Ania');
  });

  it('keeps trips separate', () => {
    rememberName('t1', 'Ania');
    rememberName('t2', 'Bartek');

    expect(recalledName('t1')).toBe('Ania');
    expect(recalledName('t2')).toBe('Bartek');
  });

  it('reports the most recent name for prefilling an unseen trip', () => {
    rememberName('t1', 'Ania');
    rememberName('t2', 'Bartek');

    expect(recalledName('t3')).toBeNull();
    expect(lastUsedName()).toBe('Bartek');
  });

  it('trims what it stores, so a stray space cannot make a second participant', () => {
    rememberName('t1', '  Ania  ');
    expect(recalledName('t1')).toBe('Ania');
  });

  it('overwrites the name for a trip rather than accumulating', () => {
    rememberName('t1', 'Ania');
    rememberName('t1', 'Ania K');

    expect(recalledName('t1')).toBe('Ania K');
  });

  it('ignores a blank name', () => {
    rememberName('t1', '   ');
    expect(recalledName('t1')).toBeNull();
  });

  it('ignores a name longer than the API accepts', () => {
    // The participants endpoint caps names at 64 characters, so storing a longer one
    // would recall something that cannot be sent back.
    rememberName('t1', 'x'.repeat(65));
    expect(recalledName('t1')).toBeNull();
    expect(lastUsedName()).toBeNull();
  });

  it('forgets one trip without forgetting the browser had a name', () => {
    rememberName('t1', 'Ania');
    forgetName('t1');

    expect(recalledName('t1')).toBeNull();
    // Still worth prefilling with: they withdrew from this trip, not from the product.
    expect(lastUsedName()).toBe('Ania');
  });

  it('forgetting an unknown trip is a no-op', () => {
    rememberName('t1', 'Ania');
    forgetName('t2');

    expect(recalledName('t1')).toBe('Ania');
  });

  it('drops the stalest trips once the map is full, keeping the newest', () => {
    for (let i = 0; i < 60; i++) rememberName(`t${i}`, `P${i}`);

    expect(recalledName('t59')).toBe('P59');
    expect(recalledName('t10')).toBe('P10');
    // 60 writes against a 50-entry cap: the first ten are gone.
    expect(recalledName('t0')).toBeNull();
    expect(recalledName('t9')).toBeNull();
  });

  it('re-remembering an old trip protects it from eviction', () => {
    for (let i = 0; i < 50; i++) rememberName(`t${i}`, `P${i}`);
    rememberName('t0', 'P0');
    rememberName('fresh', 'New');

    // t0 was re-inserted as the newest key, so t1 fell off instead of it.
    expect(recalledName('t0')).toBe('P0');
    expect(recalledName('t1')).toBeNull();
  });

  it('ignores a corrupt store instead of throwing on the join screen', () => {
    localStorage.setItem('wegowhen.tripNames.v1', '{not json');
    expect(recalledName('t1')).toBeNull();
  });

  it('ignores entries of the wrong shape', () => {
    localStorage.setItem('wegowhen.tripNames.v1', JSON.stringify({ t1: 42, t2: 'Ania' }));

    expect(recalledName('t1')).toBeNull();
    expect(recalledName('t2')).toBe('Ania');
  });

  it('ignores a store that is an array rather than a map', () => {
    localStorage.setItem('wegowhen.tripNames.v1', JSON.stringify(['Ania']));
    expect(recalledName('t1')).toBeNull();
  });

  /**
   * A browser set to block site data throws on the accessor itself, not just on write.
   * The join screen is the one flow that must never break, so every path is guarded.
   */
  it('survives storage that throws on read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(recalledName('t1')).toBeNull();
    expect(lastUsedName()).toBeNull();
  });

  it('survives storage that throws on write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    expect(() => rememberName('t1', 'Ania')).not.toThrow();
  });

  it('survives storage that throws on remove', () => {
    rememberName('t1', 'Ania');
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => forgetName('t1')).not.toThrow();
  });
});
