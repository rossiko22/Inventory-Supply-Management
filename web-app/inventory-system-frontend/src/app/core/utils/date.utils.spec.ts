import { getWeekRange } from './date.utils';

describe('getWeekRange', () => {
  it('returns Monday-Sunday range for a Wednesday', () => {
    // 2026-03-04 is a Wednesday
    const { monday, sunday } = getWeekRange(new Date('2026-03-04T10:00:00'));

    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(2);
    expect(monday.getHours()).toBe(0);
    expect(monday.getMinutes()).toBe(0);

    expect(sunday.getDay()).toBe(0);
    expect(sunday.getDate()).toBe(8);
    expect(sunday.getHours()).toBe(23);
    expect(sunday.getMinutes()).toBe(59);
  });

  it('handles a Sunday correctly (treats as end of week)', () => {
    // 2026-03-08 is a Sunday — week should be Mon 2 - Sun 8
    const { monday, sunday } = getWeekRange(new Date('2026-03-08T10:00:00'));

    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(2);
    expect(sunday.getDay()).toBe(0);
    expect(sunday.getDate()).toBe(8);
  });

  it('handles a Monday correctly', () => {
    const { monday, sunday } = getWeekRange(new Date('2026-03-02T10:00:00'));
    expect(monday.getDate()).toBe(2);
    expect(sunday.getDate()).toBe(8);
  });

  it('returns a 6-day span from Monday to Sunday', () => {
    const { monday, sunday } = getWeekRange(new Date('2026-03-04T10:00:00'));
    const diffMs = sunday.getTime() - monday.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(6);
  });
});
