import React from "react";
import {Card} from 'semantic-ui-react';

export default ({userAddress}) => {
    return(
        <Card className={'landing-notification-container'}>
            <Card.Content>
                <Card.Header style={{color: "#030e22"}}>Metamask Login Status</Card.Header>
            </Card.Content>
            <Card.Content>
                <div>This website is built with blockchain. In order to complete transactions here you need ethereum in your balance.</div>
                <br />
                {userAddress.length > 0 ?
                    <div>User is logged in at address: {userAddress}</div> :
                    <div>We can't seem to find your account. Please turn on Metamask or check instructions on how to use Metamask <a href={'/metamask'}>here</a>.</div>
                }

            </Card.Content>

        </Card>
    )
}