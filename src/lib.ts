
// Base note pitch classes
const BASE_NOTES = new Map([
    ['C', 0],
    ['D', 2],
    ['E', 4],
    ['F', 5],
    ['G', 7],
    ['A', 9],
    ['B', 11]
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
    base_class: number;
    pitch_class: number;

    private constructor(name: string, base_class: number, pitch_class: number) {
        this.name = name;
        this.base_class = base_class;
        this.pitch_class = pitch_class;
    }

    /**
     * Parse a string as a note.
     * @param {string} unparsed_note - Unparsed note string
     * @return {Note} - Parsed Note object
     * @throws {SyntaxError} A note string contained an invalid note letter/accidental character
     */
    static parse(unparsed_note: string): Note {
        let m = unparsed_note.match(/(\S)(\S*)/)!;
        let [letter, accidentals] = [m[1], m[2]];
        if (!BASE_NOTES.has(letter)) {
            throw new SyntaxError('Invalid note letter in "'+unparsed_note+'"');
        }
        if (accidentals.search(/[^#b]/) >= 0) {
            throw new SyntaxError('Invalid accidentals in "'+unparsed_note+'"');
        }

        const base_class = BASE_NOTES.get(letter)!;
        const shift = accidentals.split('').reduce((acc, c) => acc + (c === '#' ? 1 : -1), 0);
        const pitch_class = base_class + shift;

        return new Note(unparsed_note, base_class, pitch_class);
    }

    /**
     * Get distance from another note in semitones.
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
 * Get intervals between pitch classes.
 * @param {Array<number} pitch_classes - Array of pitch classes
 * @return {Array<number>} Array of intervals
 */
function intervals(pitch_classes: Array<number>): Array<number> {
    const n = pitch_classes.length - 1;
    let intervals = Array(n);
    for (let i = 0; i < n; i++) {
        const a = pitch_classes[i];
        const b = pitch_classes[i + 1];
        intervals[i] = (b - a + 12) % 12;
    }
    return intervals;
}

// Note interval helpers
const pitchClassIntervals = (notes: Array<Note>): Array<number> => intervals(notes.map(n => n.pitch_class));
const baseClassIntervals  = (notes: Array<Note>): Array<number> => intervals(notes.map(n => n.base_class));

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

/**
 * Attempt to interpret an array notes as a chord.
 * @param {Array<Note>} notes - Array of notes
 * @return {[string, Array<string>]} Tuple of the interpreted chord name and components (root, third, etc.)
 * @throws {Error} Notes do not form a conventional chord
 */
function chordName(notes: Array<Note>): [string, Array<string>] {
    for (let i = 0; i < notes.length; i++) {
        const intervals = baseClassIntervals(notes);
        console.log(intervals);
        if (CHORDS.has(intervals.join())) {
            const chord_type = CHORDS.get(pitchClassIntervals(notes).join());
            if (chord_type) {
                const name = notes[0].name + ' ' + chord_type;
                const components = notes.map(n => n.name);
                if (i === 0) {
                    return [name, components];
                } else {
                    return [name + ' (' + nth(i) + ' inversion)', components];
                }
            } else {
                throw new Error("Invalid chord");
            }
        }
        notes.unshift(notes.pop()!);
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
            return [INTERVALS.get(a.distance(b))!, undefined];
        }
        case 3:
        case 4: {
            return chordName(notes);
        }
        default: {
            throw new Error('Only up to four notes (seventh chords) supported')
        }
    }
}
