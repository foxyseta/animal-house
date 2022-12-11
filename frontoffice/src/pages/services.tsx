import * as React from "react";
import { Link } from "react-router-dom";
import type { IService } from "shared/models/service";
import Pagination from "../components/pagination";

const Services: React.FC = () => {
  return (
    <>
      <h1 className="title">Services</h1>
      <Pagination
        url={(page) => `store/services?page=${page}`}
        resource={(page) => ["services", page]}
        className="is-flex is-flex-direction-row is-flex-wrap-wrap"
      >
        {(serv: IService, i) => (
          <div
            key={i}
            className="card m-4"
            style={{ display: "block", width: "100%", maxWidth: "24rem" }}
          >
            <Link to={`/services/${serv._id}`}>
              {serv.photos.length > 0 && (
                <div className="card-image">
                  <figure className="image is-square">
                    <img
                      style={{ objectFit: "cover" }}
                      src={serv.photos[0]}
                      alt={`${serv.name} main image`}
                    />
                  </figure>
                </div>
              )}
              <div className="card-content">
                <div className="media">
                  <div className="media-content">
                    <p className="title is-4">{serv.name}</p>
                  </div>
                </div>
                <div className="content">
                  <p>
                    {serv.description?.slice(0, 147) + "..." ||
                      "No description provided"}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        )}
      </Pagination>
    </>
  );
};

export default Services;
