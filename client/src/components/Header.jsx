import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../Context/UserContext';




const Header = () => {
  const { userInfo, setUserInfo } = useContext(UserContext);
  useEffect(() => {
    fetch('http://localhost:4000/api/profile', {
      credentials: 'include',
    }).then((response) => {
      response.json().then((userInfo) => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  const logout = () => {
    fetch('http://localhost:4000/api/logout', {
      credentials: 'include',
      method: 'POST',
    });
    setUserInfo(null);
  };
  const username = userInfo?.username;
  return (
    <header>
      <Link to="/" className="logo">
        My-Blogo
      </Link>
      <nav>
        {username && (
          <>
            <Link to="/create" className="button-40">
           
              Create new post
              
            </Link>
            <a onClick={logout} className="button-40" style={{'backgroundColor':'#405cf5'}}>
              
              
              Logout
              
            </a>
          </>
        )}
        {!username && (
          <>
            <Link to="/login" className="button-40" style={{'backgroundColor':'#405cf5'}}>Login</Link>
            <Link to="/register" className='button-40'>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
