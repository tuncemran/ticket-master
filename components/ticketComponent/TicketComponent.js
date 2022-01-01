import React from 'react';
import { Card, Icon, Image } from 'semantic-ui-react'


export default ({ownerName,ownerFacebookAccount, ticketTitle, ticketDescription, ticketPriceInDollars, ticketAddress }) => {
    return(
        <a href={process.env.NODE_ENV === 'production' ? `https://immense-sands-81442.herokuapp.com/ticket/${ticketAddress}` :`http://localhost:3000/ticket/${ticketAddress}`}>
            <Card style={{margin: 0, float: "left", width: "300px", marginRight: "5%"}}>
                <Image src='https://react.semantic-ui.com/images/avatar/large/matthew.png' wrapped ui={false} />
                <Card.Content>
                    <Card.Header>{ticketTitle}</Card.Header>
                    <Card.Meta>
                        <span className='date'>{ownerName} - <a href={ownerFacebookAccount}>Check Me On Facebook</a></span>
                    </Card.Meta>
                    <Card.Description>
                        {ticketDescription}
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                    <a>
                        <Icon name='dollar' />
                        {ticketPriceInDollars}
                    </a>
                </Card.Content>
            </Card>
        </a>

    )
}