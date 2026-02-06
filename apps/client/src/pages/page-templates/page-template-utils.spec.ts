import {
  buildDraft,
  buildPayload,
  getAspectRatioOptions,
  getDefaultAspectRatio,
  slugify,
  validatePageTemplateDraft,
} from './page-template-utils';

describe('page-template-utils', () => {
  it('slugifies names into stable keys', () => {
    expect(slugify(' Cover Verticale 16:9 ')).toBe('cover-verticale-169');
    expect(slugify('Multi   Panel___Story')).toBe('multi-panelstory');
  });

  it('auto-computes panelCount for grid layouts', () => {
    const draft = buildDraft({
      name: 'Grid layout',
      key: 'grid-layout',
      layout: 'grid',
      rows: 3,
      cols: 2,
      panelCount: 1,
    });

    const payload = buildPayload(draft);

    expect(payload.layout).toBe('grid');
    expect(payload.rows).toBe(3);
    expect(payload.cols).toBe(2);
    expect(payload.panelCount).toBe(6);
  });

  it('keeps explicit panelCount for custom layouts', () => {
    const draft = buildDraft({
      name: 'Custom layout',
      key: 'custom-layout',
      layout: 'custom',
      rows: 2,
      cols: 2,
      panelCount: 5,
    });

    const payload = buildPayload(draft);

    expect(payload.layout).toBe('custom');
    expect(payload.panelCount).toBe(5);
  });

  it('fails validation when required fields are missing', () => {
    const invalid = buildDraft({
      name: '',
      key: '',
      aspectRatio: '',
      panelCount: 0,
    });

    const result = validatePageTemplateDraft(invalid);

    expect(result.valid).toBe(false);
    expect(result.missing).toContain('name');
    expect(result.missing).toContain('key');
    expect(result.missing).toContain('aspectRatio');
    expect(result.missing).toContain('panelCount');
  });

  it('returns aspect ratio presets based on orientation', () => {
    const portrait = getAspectRatioOptions('portrait');
    const landscape = getAspectRatioOptions('landscape');
    const square = getAspectRatioOptions('square');

    expect(portrait.map((item) => item.value)).toContain('9:16');
    expect(landscape.map((item) => item.value)).toContain('16:9');
    expect(square.map((item) => item.value)).toEqual(['1:1']);
    expect(getDefaultAspectRatio('portrait')).toBe('9:16');
    expect(getDefaultAspectRatio('landscape')).toBe('16:9');
    expect(getDefaultAspectRatio('square')).toBe('1:1');
  });
});
