import * as React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AppointmentPicker,
  AppointmentAttributesType,
} from "react-appointment-picker";
import fetch from "shared/fetch";
import type { IService, ICalendar, IInterval } from "shared/models/service";
import type { IStore } from "shared/models/store";
import type { IAppointment } from "shared/models/appointment";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import Pictures from "../components/pictures";
import Map from "../components/map";
import Pagination from "../components/pagination";

function initialDate(disponibility: ICalendar): Date {
  const res = new Date();
  let minutes = Math.min(
    ...disponibility.intervals.map((interval) => interval.from[0])
  );
  if (minutes == Infinity) minutes = 0;
  res.setHours(minutes / 60, minutes % 60, 0);
  return res;
}

function addAppointmentCallback(i: number) {
  return ({ addedAppointment: { day, number, time, id }, addCb }) => {
    (document.getElementById("reserve-" + i) as HTMLButtonElement).disabled =
      false;
    addCb(day, number, time, id);
  };
}

function removeAppointmentCallback(i: number) {
  return ({ day, number, _, __ }, removeCb) => {
    (document.getElementById("reserve-" + i) as HTMLButtonElement).disabled =
      true;
    removeCb(day, number);
  };
}

const DAYS_IN_A_WEEK = 7,
  MINUTES_IN_A_PERIOD = 15,
  COLUMNS = 10,
  slots = (intervals: IInterval[], initialTime: number, size: number) => {
    let res: AppointmentAttributesType[] = [],
      number = 0;
    for (let i = 0; i < intervals.length; ++i) {
      let interval = intervals[i];
      while (initialTime + MINUTES_IN_A_PERIOD <= interval.from[0]) {
        res.push(null);
        initialTime += MINUTES_IN_A_PERIOD;
      }
      let periods = Math.floor(size / MINUTES_IN_A_PERIOD),
        appointments = Math.floor(
          (interval.to[0] - interval.from[0]) / (periods * MINUTES_IN_A_PERIOD)
        );
      for (let j = 0; j < appointments; ++j) {
        res.push({
          number: ++number,
          periods: periods,
        });
        initialTime += MINUTES_IN_A_PERIOD * periods;
      }
    }
    if (!res.length) res = [null];
    return res;
  },
  getDayAppointments = (disp: ICalendar, day: number) =>
    slots(
      disp.intervals.filter((interval) => interval.dayOfWeek == day),
      initialDate(disp).getTime() / 60000,
      disp.slotDuration ?? 60
    ),
  disponibilityToAppointmentAttributesType = (disponibility: ICalendar) =>
    Array.from(
      { length: COLUMNS },
      (_, i) => (new Date().getDay() + i) % DAYS_IN_A_WEEK
    ).map((i) => getDayAppointments(disponibility, i));

const Service: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [{ authenticated }] = useAuth();
  const { data: service } = useQuery(
    ["service", id],
    () => fetch<IService>(`store/services/${id}`),
    {
      suspense: true,
    }
  );
  const { data: store } = useQuery(
    ["store", id],
    () => fetch<IStore>(`store/stores/${service?.store}`),
    {
      suspense: true,
    }
  );

  async function addAppointment(calendar: string, from: Date) {
    await fetch("store/appointments/", {
      method: "PUT",
      body: JSON.stringify({
        service: id,
        calendar,
        from,
      }),
    });
    navigate(".");
  }

  async function deleteAppointment(appointment: any) {
    await fetch(`store/appointments/${appointment}`, { method: "DELETE" });
    navigate(".");
  }

  return (
    <>
      <main className="columns">
        <section className="column is-one-third">
          <Pictures pictures={service?.photos || []} editable={false} />
        </section>
        <section className="column">
          <h1 className="has-text-weight-bold is-size-2 my-4">
            {service?.name}
          </h1>
          <span className="is-size-5">{service?.description}</span>
          <h2 className="has-text-weight-bold is-size-4 mt-4">Price</h2>$
          {service?.price.toFixed(2)}
          <h2 className="has-text-weight-bold is-size-4 mt-4">Store</h2>
          {store?.name}
          <Map lat={store?.location[0]} lng={store?.location[1]} />
          <h2 className="has-text-weight-bold is-size-4 mt-4">
            Disponibilities
          </h2>
          {service?.disponibilities?.length ?? 0 > 0 ? (
            <div className="menu my-4">
              {service?.disponibilities?.map((disponibility, i) => (
                <div key={i} className="card my-4">
                  <div className="card-content">
                    {disponibility.name
                      ? disponibility.name
                      : "Unnamed disponibility"}{" "}
                    ({disponibility.slotDuration ?? 60} minutes slots)
                    <AppointmentPicker
                      addAppointmentCallback={addAppointmentCallback(i)}
                      removeAppointmentCallback={removeAppointmentCallback(i)}
                      initialDay={initialDate(disponibility)}
                      visible
                      continuous
                      local={"en-UK"}
                      days={disponibilityToAppointmentAttributesType(
                        disponibility
                      )}
                      maxReservableAppointments={1}
                    />
                    {authenticated ? (
                      <div>
                        <button
                          id={"reserve-" + i}
                          disabled
                          className="button is-primary my-2"
                        >
                          Reserve
                        </button>
                      </div>
                    ) : (
                      <p>Only logged in users can make reservations.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No disponibilities at the moment.</p>
          )}
          <h2 className="has-text-weight-bold is-size-4 mt-4">
            My Appointments
          </h2>
          {authenticated ? (
            <Pagination
              url={(page) =>
                `store/appointments/?service=${id}&page=${page}&sort=minutes&order=1`
              }
              resource={(page): any[] => ["services", id, "appointments", page]}
              className="is-flex is-flex-direction-row is-flex-wrap-wrap"
            >
              {(appointment: IAppointment, i) => (
                <div className="card m-4" key={i}>
                  <div className="card-content">
                    <div className="content">
                      {appointment.calendar},{" "}
                      {new Date(appointment.minutes).toLocaleString("en-US")}
                    </div>
                  </div>
                  <footer className="card-footer">
                    <button
                      className="card-footer-item button is-danger"
                      aria-label="Remove pet"
                      onClick={(_) => deleteAppointment(appointment._id)}
                    >
                      Delete
                    </button>
                  </footer>
                </div>
              )}
            </Pagination>
          ) : (
            <p>Log in to view your appointments.</p>
          )}
        </section>
      </main>
    </>
  );
};

export default Service;
