import { format, formatISO9075 } from 'date-fns';
import React, { useContext, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { UserContext } from '../Context/UserContext';
import { MdDelete } from 'react-icons/md';
import { MdEdit } from 'react-icons/md';
import Image from '../components/Image';
const PostPage = () => {
  const params = useParams();
  const [post, setPost] = useState({});
  const [redirect, setRedirect] = useState('');
  const { userInfo, setUserInfo } = useContext(UserContext);

  useEffect(() => {
    fetch(`http://localhost:4000/api/post/${params.id}`).then((response) => {
      response.json().then((post) => {
        setPost(post);
      });
    });
  }, []);
  const deletePost = async () => {
    const ans = window.confirm('Are you sure you want to delete this post?');

    if (ans) {
      const response = await fetch(`http://localhost:4000/api/post/${params.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setRedirect(true);
      }
    }
  };

  if (redirect) {
    return <Navigate to={'/'} />;
  }

  const date_str = new Date(post?.createdAt)?.toJSON()?.split('T')[0];
  return (
    <div className="post-page">
      <h1>{post.title}</h1>
      <time>{date_str}</time>

      <div className="author">by {post.author?.username}</div>
      {userInfo.id === post.author?._id && (
        <div className="edit-row">
          <Link to={`/edit/${post?._id}`} className="edit-btn">
            <MdEdit />
            Edit
          </Link>
          <Link className="edit-btn-delete" onClick={deletePost}>
            <MdDelete />
            Delete
          </Link>
        </div>
      )}
      <div className="image">
        <Image src={post.cover} alt="" />
      </div>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
};

export default PostPage;
