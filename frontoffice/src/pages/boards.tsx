import * as React from "react";
import { Link } from 'react-router-dom'
import type { IBoard } from "shared/models/board";
import Pagination from '../components/pagination'

const Boards: React.FC = () => {
  return (
    <>
      <div className="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center my-2">
        <h1 className="title m-0">Boards</h1>
        <Link to="/boards/add">
          <button className="button is-primary">New Post</button>
        </Link>
      </div>
      <div className="m-2 px-5 is-flex is-justify-content-space-between" style={{ width: '100%' }}>
        <span className="is-size-5 has-text-weight-bold">Title</span>
        <span className="is-size-5 has-text-weight-bold">Author</span>
      </div>
      <Pagination url={page => `community/boards?limit=30&page=${page}`} resource={page => ['boards', page]}
        className="is-flex is-flex-direction-row is-flex-wrap-wrap"
      >
        {(board: IBoard, i) => (
          <div key={i} className="box m-2 is-flex is-justify-content-space-between" style={{ width: '100%' }}>
            <Link to={`/boards/${board._id}`}>{board.name}</Link>
            <Link to={`/users/${board.author._id}`}>{board.author.username}</Link>
          </div>
        )}
      </Pagination>
    </>
  );
};

export default Boards;
