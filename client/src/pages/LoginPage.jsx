import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../Context/UserContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState('');

  const {setUserInfo} = useContext(UserContext)

  async function login(ev) {
    ev.preventDefault();
    const response = await fetch('https://mern-stack-app-beta.vercel.app/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      response.json().then(userInfo=>{
        setUserInfo(userInfo);
        setRedirect(true);
      })
    } else {
      alert('Wrong Credentials');
    }
  }

  if (redirect) {
    return <Navigate to={'/'} />;
  }


  return (
    <form className="login" onSubmit={login}>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
      ></input>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
      ></input>
      <button>Login</button>
    </form>
  );
};

export default LoginPage;
