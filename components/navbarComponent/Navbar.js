import React from 'react';

export default () => {
    return(
        <div className={'navbar'}>
            <div className={'navbar-div-container'}>
                <div className={'navbar-divs fg-3'}>
                    <img src={'https://makastech.com/images/logo/logo.png'} alt={'logo'} height={50}/>
                </div>
                <div className={'navbar-divs fg-1'}>
                    <a className={'navbar-links'} href={'/metamask'}>
                        Metamask
                    </a>
                </div>
                <div className={'navbar-divs fg-1'}>
                    <a className={'navbar-links'} href={'/metamask'}>
                        About
                    </a>
                </div>
            </div>

        </div>
    )
}