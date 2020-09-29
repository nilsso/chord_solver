
// Base note pitch classes (and helper indices)
const BASE_NOTES = new Map([
    ['C', [ 0, 0]],
    ['D', [ 2, 1]],
    ['E', [ 4, 2]],
    ['F', [ 5, 3]],
    ['G', [ 7, 4]],
    ['A', [ 9, 5]],
    ['B', [11, 6]]
]);

// Validated intervals and their names
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

// Validated chord intervals and their names
const CHORDS = new Map([
    // Triads
    [ '4,3', 'major triad' ],
    [ '3,4', 'minor triad' ],
    [ '3,3', 'diminished triad' ],
    [ '4,4', 'augmented triad' ],
    // Seventh chords
    [ '4,3,4', 'major 7th' ],
    [ '4,3,3', 'dominant 7th' ],
    [ '3,4,3', 'minor 7th' ],
    [ '3,4,4', 'minor major 7th' ],
    [ '3,3,3', 'half diminished 7th' ],
    [ '3,3,2', 'fully diminished 7th' ],
]);

/**
 * Note encapsulation.
 *
 * Contains the specified name of the note, the pitch class of the base note letter (calling this
 * the base class), and the pitch class of the note (with accidentals).
 */
export class Note {
    name: string;
    letter_index: number;
    base_class: number;
    pitch_class: number;

    private constructor(name: string, letter_index: number, base_class: number, pitch_class: number) {
        this.name = name;
        this.letter_index = letter_index;
        this.base_class = base_class;
        this.pitch_class = pitch_class;
    }

    /**
     * Parse a string as a note.
     * @param {string} unparsed_note - Unparsed note string
     * @return {Note} Parsed Note object
     * @throws {SyntaxError} A note string contained an invalid note letter/accidental character
     */
    static parse(unparsed_note: string): Note {
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        const m = unparsed_note.match(/(\S)(\S*)/)!;
        const [letter, accidentals] = [m[1], m[2]];
        if (!BASE_NOTES.has(letter)) {
            throw new SyntaxError('Invalid note letter in "'+unparsed_note+'"');
        }
        if (accidentals.search(/[^#b]/) >= 0) {
            throw new SyntaxError('Invalid accidentals in "'+unparsed_note+'"');
        }

        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        const [base_class, letter_index] = BASE_NOTES.get(letter)!;
        const shift = accidentals.split('').reduce((acc, c) => acc + (c === '#' ? 1 : -1), 0);
        const pitch_class = base_class + shift;

        return new Note(unparsed_note, letter_index, base_class, pitch_class);
    }

    /**
     * Get distance from another note in semitones.
     * @param {Note} other - Another note
     * @return {number} Distance in semitones
     */
    distance(other: Note): number {
        return (other.pitch_class - this.pitch_class + 12) % 12;
    }
}

/**
 * Parse whitespace delimited note strings.
 * @param {string} unparsed_notes - Whitespace delimited notes
 * @return {Array<Note>} Array of parsed notes
 */
export function parseNotes(unparsed_notes: string): Array<Note> {
    return Array.from(unparsed_notes.matchAll(/(\S+)\s*/g))
        .map((m) => Note.parse(m[1]));
}

// Number to English ordinal
function nth(n: number): string {
    const s = n.toString();
    switch (n) {
        case 1:  return s+'st';
        case 2:  return s+'nd';
        case 3:  return s+'rd';
        default: return s+'th';
    }
}

function arraysEqual<T>(a: Array<T>, b: Array<T>): boolean {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

function inversion(notes: Array<Note>): number {
    const indices = notes.map(n => n.letter_index);
    const b = Array.from(Array(indices.length).keys()).map((_, k) => k * 2);
    for (let i = 0; i < notes.length; i++) {
        const s = indices[0];
        const a = indices.map(i => (i - s + 7) % 7);
        if (arraysEqual(a, b)) {
            return i;
        }
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        indices.unshift(indices.pop()!);
    }
    return -1;
}

function intervals(notes: Array<Note>): Array<number> {
    const n = notes.length - 1;
    const intervals = Array(n);
    for (let i = 0; i < n; i++) {
        const a = notes[i].pitch_class;
        const b = notes[i + 1].pitch_class;
        intervals[i] = (b - a + 12) % 12;
    }
    return intervals;
}

/**
 * Attempt to interpret an array notes as a chord.
 * @param {Array<Note>} notes - Array of notes
 * @return {[string, Array<string>]} Tuple of the interpreted chord name and components (root, third, etc.)
 * @throws {Error} Notes do not form a conventional chord
 */
function chordInfo(notes: Array<Note>): [string, Array<string>] {
    const i = inversion(notes);
    if (i >= 0) {
        const tail: Array<Note> = notes.splice(notes.length - i, i);
        const fixed = tail.concat(notes);
        const chord_type = CHORDS.get(intervals(fixed).join());
        if (chord_type) {
            const name = fixed[0].name + ' ' + chord_type;
            const components = fixed.map(n => n.name);
            if (i === 0) {
                return [name, components];
            } else {
                return [name + ' (' + nth(i) + ' inversion)', components];
            }
        }
    }
    throw new Error("Invalid chord");
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
 * @return {[string, Array<string>]} Tuple of the interpreted name and any components (root, third, etc.)
 */
export function processNotes(notes: Array<Note>): [string, Array<string> | undefined] {
    switch (notes.length) {
        case 1: {
            return [notes[0].name, undefined];
        }
        case 2: {
            const a = notes[0];
            const b = notes[1];
            /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
            return [INTERVALS.get(a.distance(b))!, undefined];
        }
        case 3:
        case 4: {
            return chordInfo(notes);
        }
        default: {
            throw new Error('Only up to four notes (seventh chords) supported')
        }

    }
}
