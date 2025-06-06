class Cinema {
  title: string;
  rows: number;
  seatsPerRow: number;
  seatingMap: string[][];
  bookings: { bookingId: string; seats: { row: string; seat: number }[] }[];
  bookingCount: number;

  constructor(title: string, rows: number, seatsPerRow: number) {
    this.title = title;
    this.rows = rows;
    this.seatsPerRow = seatsPerRow;
    this.seatingMap = Array.from({ length: rows }, () => Array(seatsPerRow).fill('.'));
    this.bookings = [];
    this.bookingCount = 0;
  }

  getAvailableSeatsCount(): number {
    return this.seatingMap.flat().filter(seat => seat === '.').length;
  }

  isValidSeatCode(code: string): boolean {
    const match = code.match(/^([A-Z])(\d{2})$/);
    if (!match) return false;
    const [, letter, num] = match;
    const row = letter.charCodeAt(0) - 65;
    const seat = parseInt(num, 10) - 1;
    return row >= 0 && row < this.rows && seat >= 0 && seat < this.seatsPerRow;
  }

  autoSelectSeats(count: number): Set<string> {
    const center = Math.floor(this.seatsPerRow / 2);

    for (let i = 0; i < this.rows; i++) {
      for (let start = center - count; start <= center + count; start++) {
        if (start < 0 || start + count > this.seatsPerRow) continue;
        const range = Array.from({ length: count }, (_, j) => [i, start + j]);
        if (range.every(([r, s]) => this.seatingMap[r][s] === '.')) {
          return new Set(range.map(([r, s]) => `${r}-${s}`));
        }
      }
    }

    const fallback = new Set<string>();
    for (let i = 0; i < this.rows && fallback.size < count; i++) {
      for (let j = 0; j < this.seatsPerRow && fallback.size < count; j++) {
        if (this.seatingMap[i][j] === '.') fallback.add(`${i}-${j}`);
      }
    }

    if (fallback.size < count) throw new Error("Unable to find enough available seats.");
    return fallback;
  }

  selectFromSeatCode(code: string, count: number): Set<string> {
    const row = code.charCodeAt(0) - 65;
    const start = parseInt(code.slice(1), 10) - 1;

    if (start + count > this.seatsPerRow) throw new Error("Not enough seats from this position.");

    const range = Array.from({ length: count }, (_, j) => [row, start + j]);
    if (range.some(([r, s]) => this.seatingMap[r][s] === 'o')) {
      throw new Error("One or more of these seats are already booked.");
    }

    return new Set(range.map(([r, s]) => `${r}-${s}`));
  }

  confirmSelection(tempSelected: Set<string>): { bookingId: string; seats: { row: string; seat: number }[] } {
    const seats = [...tempSelected].map(key => {
      const [r, s] = key.split('-').map(Number);
      this.seatingMap[r][s] = 'o';
      return { row: String.fromCharCode(65 + r), seat: s + 1 };
    });

    const bookingId = `GIC${String(++this.bookingCount).padStart(4, '0')}`;
    const booking = { bookingId, seats };
    this.bookings.push(booking);
    return booking;
  }
}

// Preserve CommonJS export so require('./Cinema') still works
export = Cinema;
