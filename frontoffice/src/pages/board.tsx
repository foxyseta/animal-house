import * as React from "react";
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useNavigate } from "react-router-dom";
import fetch, { withOptions } from 'shared/fetch'
import type { IBoard, IPost } from "shared/models/board";
import Pagination from '../components/pagination'

import { useAuth } from "../auth";

const BoardAdd: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auth] = useAuth()
  const queryClient = useQueryClient()
  const { data: board } = useQuery(["board", id], () => fetch<IBoard>(`community/boards/${id}`), {
    suspense: true,
  });
  const mutation = useMutation({
    mutationFn: (post: IPost) => fetch(`community/boards/${id}`, withOptions('PUT', post)),
    onMutate: (post: IPost) => queryClient.setQueryData(['board', id], old => ({ ...old, docs: [...old.docs, post] }))
  })

  const del = async () => {
    await fetch(`community/boards/${id}`, withOptions('DELETE', {}))
    navigate('/boards')
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IPost>();
  return (
    <>
      <div className="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center mb-4">
        <h1 className="title m-0"><Link className="is-hidden-touch" to="/boards">Boards</Link><span className="is-hidden-touch"> > </span>{board?.name}</h1>
        {auth.authenticated && auth.user?._id == board?.author._id && <button className="button is-danger" onClick={del}>Delete</button>}
      </div>
      <Pagination url={page => `community/boards/${id}?page=${page}`} resource={page => ['boards', id, 'posts', page]}
        className="is-flex is-flex-direction-row is-flex-wrap-wrap"
      >
        {(post: IPost, i) => (
          <div key={i} className="columns" style={{ width: '100%' }}>
            <div className="column is-one-quarter is-flex is-flex-direction-row is-align-items-center is-size-5 has-text-weight-medium">
              <figure className="image is-64x64 mr-2">
                <img
                  style={{ objectFit: "cover", height: '100%', width: '100%' }}
                  src={post.author.avatar}
                  alt={`${post.author.username}'s profile picture`}
                />
              </figure>
              <Link to={`/users/${post.author._id}`} className="mr-2">
                {post.author.username}
              </Link>
              wrote
            </div>
            <div className="column">
              <article className="message" style={{ width: '100%' }}>
                <div className="message-body">
                  {post.message}
                </div>
              </article>
            </div>
          </div>
        )}
      </Pagination>
      {auth.authenticated && (
        <div className="columns" style={{ width: '100%' }}>
          <div className="column is-one-quarter is-flex is-flex-direction-row is-align-items-center is-size-5 has-text-weight-medium">
            <figure className="image is-64x64 mr-2">
              <img
                style={{ objectFit: "cover", height: '100%', width: '100%' }}
                src={auth.user.avatar}
                alt={`${auth.user.username}'s profile picture`}
              />
            </figure>
          </div>
          <div className="column">
            <form onSubmit={handleSubmit(post => mutation.mutate(post))}>
              <div className="field">
                <label htmlFor="post" className="label">
                  New post
                </label>
                <div className="control">
                  <textarea
                    className="input"
                    type="text"
                    disabled={mutation.isLoading}
                    style={{ minHeight: '8rem' }}
                    {...register("message", { required: true })}
                  />
                </div>
                {errors.text && (
                  <span className="help is-danger">A first post is required</span>
                )}
              </div>
              {mutation.error && (
                <span className="help is-danger">
                  {mutation.error.message}
                </span>
              )}
              <div className="field">
                <div className="control">
                  <button className="button is-link" disabled={mutation.isLoading}>
                    Post
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BoardAdd;

