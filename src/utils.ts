export function parseInitialInput(input: string): { title: string; rows: number; seatsPerRow: number } {
  const parts = input.trim().split(/\s+/);
  if (parts.length !== 3) throw new Error("Expected format: [Title] [Rows] [SeatsPerRow]");

  const title = parts[0];
  const rows = parseInt(parts[1], 10);
  const seatsPerRow = parseInt(parts[2], 10);

  if (!title || isNaN(rows) || isNaN(seatsPerRow)) {
    throw new Error("Invalid input. Title must be a string, Rows and SeatsPerRow must be numbers.");
  }

  if (rows > 26 || seatsPerRow > 50) {
    throw new Error("Maximum 26 rows and 50 seats per row allowed");
  }

  return { title, rows, seatsPerRow };
}

export function displaySeatingMap(seatingMap: string[][], tempSelected: Set<string> = new Set()): void {
  console.log("\n       S C R E E N");
  console.log("----------------------------------");
  for (let i = seatingMap.length - 1; i >= 0; i--) {
    const rowLabel = String.fromCharCode(65 + i);
    const row = seatingMap[i].map((seat, j) => {
      const key = `${i}-${j}`;
      if (tempSelected.has(key)) return ' o';
      return seat === 'o' ? ' #' : ' .';
    }).join('');
    console.log(`${rowLabel} ${row}`);
  }
  const seatNumbers = Array.from({ length: seatingMap[0].length }, (_, i) => (i + 1 < 10 ? ` ${i + 1}` : `${i + 1}`)).join('');
  console.log(`  ${seatNumbers}`);
}
