const BASE_NOTES = new Map([
    ['C', 0],
    ['D', 2],
    ['E', 4],
    ['F', 5],
    ['G', 7],
    ['A', 9],
    ['B', 11]
]);

const INTERVALS = new Map([
    [0, 'Unison'],
    [1, 'Minor second'],
    [2, 'Major second'],
    [3, 'Minor third'],
    [4, 'Major third'],
    [5, 'Perfect fourth'],
    [6, 'Tritone'],
    [7, 'Perfect fifth'],
    [8, 'Minor sixth'],
    [9, 'Major sixth'],
    [10, 'Minor seventh'],
    [11, 'Major seventh']
]);

/**
 * Note abstraction.
 *
 * Contains only a specified name and pitch class for a note.
 *
 * Examples
 * ```
 * const note = Note.parse('G#');
 * assert(note.note === "G#");
 * assert(note.pitch_class === 8);
 * ```
 */
export class Note {
    note: string;
    pitch_class: number;

    private constructor(note: string, pitch_class: number) {
        this.note = note;
        this.pitch_class = pitch_class;
    }

    /**
     * Parse
     */
    static parse(unparsed_note: string): Note {
        let m = unparsed_note.match(/(\S)(\S*)/);
        if (m === null) throw new SyntaxError('Malformed note "'+unparsed_note+'"');
        let [letter, accidentals] = [m[1], m[2]];
        if (!BASE_NOTES.has(letter)) throw new SyntaxError('Invalid note letter in "'+unparsed_note+'"');
        if (accidentals.search(/[^#b]/) >= 0) throw new SyntaxError('Invalid accidentals in "'+unparsed_note+'"');

        const base_pitch_class = BASE_NOTES.get(letter)!;
        const pitch_class = base_pitch_class + accidentals.split('')
            .reduce((acc, c) => acc + (c === '#' ? 1 : -1), 0);

        return new Note(unparsed_note, pitch_class);
    }

    /**
     * Get distance from another note in semitones
     * @param {Note} other - Another note
     * @return {number} - Distance in semitones
     */
    distance(other: Note): number {
        return (other.pitch_class - this.pitch_class + 12) % 12;
    }
}

/**
 * Parse whitespace delimited note strings.
 * @param {string} unparsed_notes - Whitespace delimited notes
 * @return {Array<Note>} - Array of parsed notes
 */
export function parseNotes(unparsed_notes: string): Array<Note> {
    return Array.from(unparsed_notes.matchAll(/(\S+)\s*/g))
        .map(([_, unparsed_note]) => Note.parse(unparsed_note));
}

/**
 * Interpret an array of notes.
 *
 * For the number of notes in the array:
 * - 1: The note name
 * - 2: The interval between the notes
 * - 3: The triad built upon the first note
 * - 4: The seventh chord built upon the first note
 * @param {Array<note>} notes - Array of notes
 * @param {string} - Intepreted result
 */
export function processNotes(notes: Array<Note>): string {
    const [a, b, c, d] = notes;

    switch (notes.length) {
        case 1: {
            return a.note;
        }
        case 2: {
            return INTERVALS.get(a.distance(b))!;
        }
        case 3: {
            return 'Triad';
        }
        case 4: {
            return 'Seventh chord';
        }
        default: {
            throw new Error('Only up to four notes (seventh chords) supported')
        }
    }
}
