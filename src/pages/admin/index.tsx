import { useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { useForm, Controller } from 'react-hook-form'
import axios from 'axios'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import AdminLayout from '@/components/layouts/admin'
import Alerts from '@/components/admin/Alerts'
import SubmitButton from '@/components/admin/SubmitButton'
import Title from '@/components/admin/Title'
import { AlertProps } from '@/types'
import { connectToDatabase } from '@/util/mongodb'

type FormValues = {
  about: string
  email: string
}

export async function getServerSideProps() {
  const { db } = await connectToDatabase()
  const settings = await db.collection('settings').findOne({})

  return {
    props: {
      settings: JSON.parse(JSON.stringify(settings))
    }
  }
}

export default function AdminSettings({
  settings
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState(false)
  const [alertData, setAlertData] = useState<AlertProps>({} as AlertProps)
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<FormValues>()

  const onSubmit = async (data: unknown) => {
    setSubmitting(true)
    await axios
      .post('/api/admin/settings', { data })
      .then(function (response) {
        setAlert(true)
        setAlertData({
          severity: 'success',
          message: 'Success! Your settings have been saved'
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

  const closeAlert = () => {
    setAlert(false)
  }

  return (
    <AdminLayout>
      <Alerts isOpen={alert} data={alertData} closeAlert={closeAlert} />
      <Title title="Settings" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="email"
              defaultValue={settings.email}
              control={control}
              render={({ field }) => (
                <TextField
                  label="Email Address"
                  type="email"
                  variant="outlined"
                  fullWidth
                  error={errors.email ? true : false}
                  helperText={errors?.email?.message}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="about"
              defaultValue={settings.about}
              control={control}
              render={({ field }) => (
                <TextField
                  label="About Statement"
                  variant="outlined"
                  rows={4}
                  multiline
                  fullWidth
                  {...field}
                />
              )}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3 }}>
          <SubmitButton submitting={submitting} />
        </Box>
      </form>
    </AdminLayout>
  )
}
