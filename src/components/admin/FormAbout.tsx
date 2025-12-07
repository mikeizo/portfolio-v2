import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useRouter } from 'next/router'
import axios from 'axios'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Alerts from './Alerts'
import SubmitButton from './SubmitButton'
import { AlertProps } from '@/types'

type FormProps = {
  about: FormValues
  id?: number
}

type FormValues = {
  year_from?: string
  year_to?: string
  description?: string
}

export default function FormAbout({ about, id }: FormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState(false)
  const [alertData, setAlertData] = useState<AlertProps>({} as AlertProps)
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<FormValues>()

  const closeAlert = () => {
    setAlert(false)
  }

  const onSubmit = async (data: any) => {
    await axios
      .post(`/api/admin/about/${id}`, { data })
      .then(function (response) {
        if (!id) {
          router.push('/admin/about')
        }
        setAlert(true)
        setAlertData({
          severity: 'success',
          message: 'Success! Your timeline has been saved'
        })
        return response.data
      })
      .catch(function (error) {
        setAlert(true)
        setAlertData({
          severity: 'error',
          message: `${error.response.status} - ${error.response.statusText}`
        })
      })
      .finally(function () {
        setSubmitting(false)
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Alerts isOpen={alert} data={alertData} closeAlert={closeAlert} />
      <Grid container spacing={4}>
        <Grid item sm={6}>
          <Controller
            name="year_from"
            defaultValue={about.year_from}
            control={control}
            rules={{
              required: 'Year From is required',
              pattern: {
                value: /^\d{4}$/,
                message: 'Year must be in format YYYY'
              }
            }}
            render={({ field }) => (
              <TextField
                label="Year From"
                variant="outlined"
                fullWidth
                error={errors.year_from ? true : false}
                helperText={errors.year_from ? errors.year_from.message : ' '}
                {...field}
              />
            )}
          />
        </Grid>
        <Grid item sm={6}>
          <Controller
            name="year_to"
            defaultValue={about.year_to}
            control={control}
            rules={{
              pattern: {
                value: /^\d{4}$/,
                message: 'Year must be in format YYYY'
              }
            }}
            render={({ field }) => (
              <TextField
                label="Year To"
                variant="outlined"
                fullWidth
                error={errors.year_to ? true : false}
                helperText={errors.year_to ? errors.year_to.message : ' '}
                {...field}
              />
            )}
          />
        </Grid>
        <Grid item sm={12}>
          <Controller
            name="description"
            defaultValue={about.description}
            control={control}
            rules={{
              required: 'Description is required',
              minLength: {
                value: 10,
                message: 'Name must be longer than 10 characters'
              },
              maxLength: {
                value: 400,
                message: 'Name must be less than 400 characters'
              }
            }}
            render={({ field }) => (
              <TextField
                label="Description"
                variant="outlined"
                rows={3}
                multiline
                fullWidth
                error={errors.description ? true : false}
                helperText={
                  errors.description ? errors.description.message : ' '
                }
                {...field}
              />
            )}
          />
        </Grid>
      </Grid>
      <SubmitButton submitting={submitting} />
    </form>
  )
}
