import promptSync from 'prompt-sync';
import { parseInitialInput, displaySeatingMap } from './src/utils';
import Cinema from './src/cinema';

const prompt = promptSync({ sigint: true }); // optional: enables Ctrl+C to exit gracefully
let cinema: Cinema | null = null;

console.log("Please define movie title and seating map in [Title] [Row] [SeatsPerRow] format:");
const input = prompt("> ");

try {
  const { title, rows, seatsPerRow } = parseInitialInput(input);
  cinema = new Cinema(title, rows, seatsPerRow);
} catch (e: any) {
  console.log(e.message);
  process.exit(1);
}

function showMenu(): void {
  if (!cinema) return;

  console.log(`\nWelcome to GIC Cinemas`);
  console.log(`[1] Book tickets for ${cinema.title} (${cinema.getAvailableSeatsCount()} seats available)`);
  console.log("[2] Check bookings");
  console.log("[3] Exit");

  const choice = prompt("Please enter your selection: ");
  handleMenuSelection(choice);
}

function handleMenuSelection(choice: string): void {
  if (!cinema) return;

  switch (choice) {
    case "1": {
      const countStr = prompt("Enter number of tickets to book, or enter blank to go back to main menu: ");
      const count = parseInt(countStr);
      if (isNaN(count) || count <= 0) return;

      if (count > cinema.getAvailableSeatsCount()) {
        console.log(`Sorry, There are only ${cinema.getAvailableSeatsCount()} seats left`);
        return;
      }

      try {
        let selectedSeats = cinema.autoSelectSeats(count);
        if (!selectedSeats) throw new Error("Unable to auto-select seats.");

        while (true) {
                    displaySeatingMap(cinema.seatingMap, selectedSeats);
                    console.log("Selected seats:", [...selectedSeats].map(key => {
                        const [r, s] = key.split('-').map(Number);
                        return String.fromCharCode(65 + r) + String(s + 1).padStart(2, '0');
                    }).join(', '));

          const seatInput = prompt("Press Enter to accept selection, or enter new starting seat code (e.g., B03): ");
          if (!seatInput.trim()) {
            const booking = cinema.confirmSelection(selectedSeats);
            if (!booking) throw new Error("Booking failed.");

            console.log(`\nSuccessfully booked ${count} ${cinema.title} tickets.`);
            console.log(`Booking id: ${booking.bookingId}`);
            console.log("Selected seats:", [...selectedSeats].map(key => {
                const [rowIndex, seatIndex] = key.split('-').map(Number);
                const rowChar = String.fromCharCode(65 + rowIndex);
                const seatNum = (seatIndex + 1).toString().padStart(2, '0');
            return `${rowChar}${seatNum}`;
            }).join(', '));
            break;
          }

          if (!cinema.isValidSeatCode(seatInput)) {
            console.log("Invalid seat code.");
            continue;
          }

          try {
            selectedSeats = cinema.selectFromSeatCode(seatInput.toUpperCase(), count);
          } catch (err: any) {
            console.log(" X " + err.message);
          }
        }
      } catch (e: any) {
        console.log(`${e}`);
      }
      break;
    }

    case "2": {
      const bookingId = prompt("Enter booking id, or enter blank to go back to menu: ").trim();
      if (!bookingId) break;

      const booking = cinema.bookings.find(b => b.bookingId.toString() === bookingId);
      if (!booking) {
        console.log(`Booking ID "${bookingId}" not found.`);
      } else {
        console.log(`Booking ID: ${booking.bookingId}`);
        console.log("Selected Seats:");
        console.log("Selected seats:", [...booking.seats].map(key => {
            const [rowIndex, seatIndex] = key.row.split('-').map(Number);
            const rowChar = String.fromCharCode(65 + rowIndex);
            const seatNum = (seatIndex + 1).toString().padStart(2, '0');
        return `${rowChar}${seatNum}`;
        }).join(', '));

        const bookedSeatKeys = new Set<string>();
        booking.seats.forEach(code => {
          const rowIndex = code.row.charCodeAt(0) - 65;
          const seatIndex = code.seat - 1;  // <-- Fixed here: removed .toString().slice(1)
          bookedSeatKeys.add(`${rowIndex}-${seatIndex}`);
        });

        displaySeatingMap(cinema.seatingMap, bookedSeatKeys);
      }
      break;
    }

    case "3": {
      console.log("Thank you for using GIC Cinemas system. Bye!");
      process.exit(0);
    }

    default:
      console.log("Invalid selection.");
  }

  showMenu();
}

showMenu();
