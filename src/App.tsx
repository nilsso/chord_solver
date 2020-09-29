import React, { useState, useEffect } from 'react';
import { Accordion, Button, Card, Container, InputGroup, FormControl, Table } from 'react-bootstrap';
import './App.scss';
import { parseNotes, processNotes } from './lib';

/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
function App() {
    const [input, setInput] = useState('');
    const [label, setLabel] = useState('');
    const [labelColor, setLabelColor] = useState<'danger' | undefined>();
    const [components, setComponents] = useState(<React.Fragment/>);

    const PLACEHOLDER = 'C E G';

    const setLabelWrapper = (s: string, valid: boolean) => {
        setLabelColor(valid ? undefined : 'danger');
        setLabel(s);
    };

    useEffect(() => {
        const s = input || PLACEHOLDER;
        try {
            const notes = parseNotes(s);
            const [name, components] = processNotes(notes);
            setLabelWrapper(name, true);
            if (components) {
                const COMPONENTS = [
                    "Root",
                    "Third",
                    "Fifth",
                    "Seventh"
                ];

                const items = <React.Fragment>
                    {
                        components.map((name, i) => <tr key={i}>
                            <td>{COMPONENTS[i]}</td>
                            <td>{name}</td>
                        </tr>)
                    }
                </React.Fragment>;
                setComponents(items);
            } else {
                setComponents(<React.Fragment/>);
            }
        } catch(e) {
            setLabelWrapper(e.message, false);
        }
    }, [input]);

    return (
        <Container id='main'>
            <Accordion>
                <Card>
                    <Card.Header>
                        Chord Solver
                    </Card.Header>
                    <Card.Body>
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
                    </Card.Body>
                </Card>
                <Card text={labelColor}>
                    <Card.Body id="label">
                        {label}
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Header id="components-header">
                        <Accordion.Toggle
                            as={Button}
                            variant="link"
                            eventKey="0"
                        >
                            Components
                        </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <Table id="components" size="sm">
                                <tbody>
                                    {components}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        </Container>
    );
}

export default App;
