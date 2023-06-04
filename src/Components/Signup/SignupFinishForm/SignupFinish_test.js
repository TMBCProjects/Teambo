import React, { useState, useEffect } from 'react'
import { Button } from 'antd';
import '../SignupFinishForm/main.css'
import { Link } from 'react-router-dom';

export default function SignupFinish_test() {

    const [name, setName] = useState('')

    useEffect(() => {
        setName(JSON.parse(sessionStorage.getItem("currentUser")));
    }, [])
    
  return (
    <div className='header2'>
    <span style={{ fontWeight: 'bold'}}>Hi,<span style={{color: '#1E768F'}}> {name} </span></span><br />
    <span style={{ marginBlock: '1vh', display: 'block' }}>Thank you for signing up</span><br />
    <span style={{color: '#A1A1A1', display: 'block', marginTop: '-3vh'}}>You can start using your Teambo account</span>
    <Link to={'/'}>
    <Button className='continue-button' style={{marginTop: '5vh'}}>Continue</Button>
    </Link>
</div>
  )
}
