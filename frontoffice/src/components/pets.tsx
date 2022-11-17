import * as React from 'react'
import { useForm, Controller } from "react-hook-form";
import type { IPet } from 'shared/models/pet'

import { useAuth } from "../auth";
import SelectCategory from './select-category';

export interface PetsProps {
  pets: IPet[]
  id: string
  onAdd: (pet: IPet) => void
  isLoading: boolean
}

const Pets: React.FC<PetsProps> = ({ pets, id, onAdd, isLoading }) => {
  const [{ authenticated, user }] = useAuth();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<IPet>();

  const customOnAdd = (pet: IPet) => {
    onAdd({ ...pet, category: pet.category._id as any })
  }

  return (
    <div className="is-flex is-flex-direction-column my-6">
      {pets.length > 0 && (
        <>
          <h2 className="title my-3">{authenticated && user!._id == id ? 'My' : 'Their'} pets</h2>
          {pets.map((pet, i) => (
            <div key={i} className="is-flex is-flex-direction-row is-justify-content-space-between">
              <h4 className='subtitle is-6'>{pet.name}</h4>
              <span className='subtitle is-6'>{pet.category.name}</span>
            </div>
          ))}
        </>
      )}
      {authenticated && user!._id == id && (
        <>
          <h3 className="subtitle my-3">Add a new pet</h3>
          <form onSubmit={handleSubmit(customOnAdd)}>
            <div className="is-flex is-flex-direction-column">
              <div>
                <input
                  className="input"
                  placeholder="Name"
                  aria-label="Name"
                  type="text"
                  id="name"
                  disabled={isLoading}
                  {...register("name", { required: true })}
                />
                {formErrors.name && (
                  <span className="help is-danger">A pet name is required</span>
                )}
              </div>
              <Controller
                render={
                  ({ field: { onChange, value } }) => <SelectCategory category={value} onSelect={onChange} />
                }
                control={control}
                name="category"
                defaultValue={undefined}
              />

              <div className="mt-4 is-flex is-justify-content-end" style={{ width: '100%' }}>
                <button className="button is-success" disabled={isLoading}>
                  Save
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

export default Pets
