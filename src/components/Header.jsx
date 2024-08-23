import React from 'react'
import { LogOut, LogIn } from 'react-feather'
import { useAuth } from '../utils/AuthContext'
import { Link } from 'react-router-dom'

function Header() {

    const {user, handleUserLogOut} = useAuth()

    return (
    
    <div id='header--wrapper'>
        {user ? (
            <>
                Welcome {user.name}
                <LogOut className='header--link' onClick={handleUserLogOut}/>
            </>
        ) : (
            <>
                <Link to="/">
                    <LogIn className="header--link"/>
                </Link>
            </>
        )}
    </div>
  )
}

export default Header
