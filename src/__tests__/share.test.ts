import { describe, it, expect } from 'vitest';
import { encodeProblem, decodeProblem } from '../utils/share';

describe('share encoding & decoding', () => {
  it('encodes and decodes Lv.1 problem correctly', () => {
    const level = 1;
    const titles = ['専業主婦の秘密'];

    const encoded = encodeProblem(level, titles);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodeProblem(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.level).toBe(1);
    expect(decoded?.titles).toEqual(['専業主婦の秘密']);
  });

  it('encodes and decodes Lv.2 multi-title problem correctly', () => {
    const level = 2;
    const titles = ['専業主婦', '秘密の部屋'];

    const encoded = encodeProblem(level, titles);
    const decoded = decodeProblem(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded?.level).toBe(2);
    expect(decoded?.titles).toEqual(['専業主婦', '秘密の部屋']);
  });

  it('encodes and decodes Lv.3 problem with Japanese characters correctly', () => {
    const level = 3;
    const titles = ['作品１', '作品２', '作品３'];

    const encoded = encodeProblem(level, titles);
    const decoded = decodeProblem(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded?.level).toBe(3);
    expect(decoded?.titles).toEqual(['作品１', '作品２', '作品３']);
  });

  it('returns null for invalid or corrupted share payload', () => {
    expect(decodeProblem('invalid_base64_string!!!')).toBeNull();
    expect(decodeProblem('')).toBeNull();
  });
});
