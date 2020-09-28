import React, { useState, useEffect } from 'react';
import { Card, Container, InputGroup, FormControl, ListGroup } from 'react-bootstrap';
import './App.scss';
import { parseNotes, processNotes } from './lib';

function App() {
    const [input, setInput] = useState('');
    const [variant, setVariant] = useState('');
    const [label, setLabel] = useState('');

    const PLACEHOLDER = 'C E G';

    const setChord = (s: string, valid: boolean) => {
        setVariant(valid ? '' : 'danger');
        setLabel(s);
    };

    useEffect(() => {
        const s = input || PLACEHOLDER;
        try {
            const notes = parseNotes(s);
            const result = processNotes(notes);
            setChord(result, true);
        } catch(e) {
            setChord(e.message, false);
        }
    }, [input]);

    return (
        <Container id='main'>
            <Card>
                <Card.Header>
                    Chord Solver
                </Card.Header>
                <ListGroup variant='flush'>
                    <ListGroup.Item>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text>Notes</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl
                                placeholder={PLACEHOLDER}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                            />
                        </InputGroup>
                    </ListGroup.Item>
                    <ListGroup.Item variant={variant} id='label'>
                        {label}
                    </ListGroup.Item>
                </ListGroup>
            </Card>
        </Container>
    );
}

export default App;
