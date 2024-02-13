import React, { useEffect, useState } from 'react';
import Post from '../components/Post';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch('https://mern-stack-app-beta.vercel.app/api/post').then((response) => {
      response.json().then((posts) => {
        setPosts(posts);
      });
    });
  }, []);

  return <>{posts.length > 0 && posts.map((post) => <Post {...post} />)}</>;
};

export default HomePage;
