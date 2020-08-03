import React from 'react'
import { Container } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <Container style={{marginTop: '7em' }}>
            <h1>Home page</h1>
            <h3>GO to <Link to='/activies'>Activities </Link></h3>
        </Container>
    )
}

export default HomePage
