const Cinema = require('./cinema');

describe('XYZ Cinema Booking System', () => {
  let cinema;

  beforeEach(() => {
    cinema = new Cinema('Test Movie', 5, 10);
  });

  test('XYZ has correct available seats', () => {
    expect(cinema.getAvailableSeatsCount()).toBe(50);
  });

  test('validates correct seat code', () => {
    expect(cinema.isValidSeatCode('A01')).toBe(true);
    expect(cinema.isValidSeatCode('Z10')).toBe(false);
    expect(cinema.isValidSeatCode('AA1')).toBe(false);
  });

  test('auto selects contiguous center seats', () => {
    const selected = cinema.autoSelectSeats(3);
    expect(selected.size).toBe(3);
    for (let key of selected) {
      const [row, col] = key.split('-').map(Number);
      expect(cinema.seatingMap[row][col]).toBe('.');
    }
  });

  test('selects seats from manual code', () => {
    const selected = cinema.selectFromSeatCode('A01', 3);
    expect(selected).toEqual(new Set(['0-0', '0-1', '0-2']));
  });

  test('Expect error if trying to book already selected seat', () => {
    cinema.seatingMap[0][0] = 'o';
    expect(() => cinema.selectFromSeatCode('A01', 3)).toThrow();
  });

  test('confirms seat selection and do the booking', () => {
    const selected = new Set(['0-0', '0-1']);
    const result = cinema.confirmSelection(selected);

    expect(result.bookingId).toBe('XYZ0001');
    expect(result.seats).toEqual([
      { row: 'A', seat: 1 },
      { row: 'A', seat: 2 }
    ]);
    expect(cinema.bookings.length).toBe(1);
  });
});
