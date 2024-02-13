import React, { useEffect } from 'react';
import { formatISO9075 } from 'date-fns';
import { Link } from 'react-router-dom';
import Image from './Image';

const Post = ({
  _id,
  title,
  summary,
  cover,
  content,
  createdAt,
  author: { username },
}) => {
  return (
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <Image src={cover}/>
        </Link>
      </div>

      <div className="text">
        <Link to={`/post/${_id}`}>
          <h2 className='decoration' style={{"color":"black","textDecoration":"none"}}>{title}</h2>
        </Link>
        <p className="info">
          <a href="/" className="author">
            {username}
          </a>
          <time>{formatISO9075(new Date(createdAt))}</time>
        </p>
        <p className="summary">{summary}</p>
      </div>
    </div>
  );
};

export default Post;
