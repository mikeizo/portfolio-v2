import { useState, SyntheticEvent } from 'react'
import { InferGetServerSidePropsType } from 'next'
import axios from 'axios'
import Box from '@mui/material/Box'
import AddIcon from '@mui/icons-material/Add'
import Fab from '@mui/material/Fab'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AdminLayout from '@/components/layouts/admin'
import Alerts from '@/components/admin/Alerts'
import SubmitButton from '@/components/admin/SubmitButton'
import Title from '@/components/admin/Title'
import { AlertProps } from '@/types'
import { connectToDatabase } from '@/util/mongodb'
type ExperienceProps = {
  name: string
  icon: string
}

export async function getServerSideProps() {
  const { db } = await connectToDatabase()
  const experience = await db.collection('experience').find({}).toArray()

  return {
    props: {
      experience: JSON.parse(JSON.stringify(experience))
    }
  }
}

export default function AdminExperience({
  experience
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [submitting, setSubmitting] = useState(false)
  const [experiences, setExperiences] = useState<ExperienceProps[]>(experience)
  const [remove, setRemove] = useState<ExperienceProps[]>([])
  const [add, setAdd] = useState<ExperienceProps[]>([])
  const [input, setInput] = useState<ExperienceProps>({
    name: '',
    icon: ''
  })
  const [error, setError] = useState(false)
  const [alert, setAlert] = useState(false)
  const [alertData, setAlertData] = useState<AlertProps>({} as AlertProps)

  const onSubmit = async (event: SyntheticEvent) => {
    event.preventDefault()

    if (add.length) {
      setExperiences(experiences.concat(add))
      setAdd([])
    }

    if (add.length || remove.length) {
      await axios
        .post('/api/admin/experience/', { remove, add })
        .then(function (response) {
          setAlert(true)
          setAlertData({
            severity: 'success',
            message: 'Success! Your experiences have been saved'
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
  }

  const handleChange = (event: { target: { name: string; value: string } }) => {
    const name = event.target.name
    const value = event.target.value

    setInput({
      ...input,
      [name]: value
    })
  }

  const addExperience = () => {
    if (input.name && input.icon) {
      setAdd(add.concat(input))
      setInput({
        name: '',
        icon: ''
      })
      setError(false)
    } else {
      setError(true)
    }
  }

  const removeAddition = (id: number) => {
    const newExperiences = [...add]
    newExperiences.splice(id, 1)
    setAdd(newExperiences)
  }

  const deleteExperience = (id: number) => {
    const newExperiences = [...experiences]
    const newRemove = remove

    newExperiences.splice(id, 1)
    newRemove.push(experiences[id])

    setExperiences(newExperiences)
    setRemove(newRemove)
  }

  const closeAlert = () => {
    setAlert(false)
  }

  return (
    <AdminLayout>
      <Alerts isOpen={alert} data={alertData} closeAlert={closeAlert} />
      <Title title="Experience" />
      <form onSubmit={onSubmit} id="experience-form">
        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          {experiences.map((item: ExperienceProps, index: number) => (
            <Box key={index} width={{ xs: '50%', sm: '25%', md: '16.6%' }}>
              <Box
                textAlign="center"
                sx={{
                  fontSize: '3rem'
                }}
              >
                <i className={item.icon}></i>
              </Box>
              <Box textAlign="center">
                <span>{item.name}</span>
              </Box>
              <Box textAlign="center">
                <IconButton
                  aria-label="Delete"
                  color="error"
                  onClick={() => deleteExperience(index)}
                >
                  <HighlightOffIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          <Box flex="1 1 40%">
            <TextField
              name="name"
              value={input.name}
              label="Name"
              variant="outlined"
              fullWidth
              onChange={handleChange}
              error={error ? true : false}
              helperText={error ? 'Name is required' : ' '}
            />
          </Box>
          <Box flex="1 1 40%">
            <TextField
              name="icon"
              value={input.icon}
              label="Icon Class"
              variant="outlined"
              fullWidth
              onChange={handleChange}
              error={error ? true : false}
              helperText={error ? 'Icon is required' : ' '}
            />
          </Box>
          <Box flex="0 0 auto" display="flex" alignItems="center">
            <Fab color="primary" aria-label="add" onClick={addExperience}>
              <AddIcon />
            </Fab>
          </Box>
        </Box>
        <Box>
          <List>
            {add.map((item: ExperienceProps, index: number) => (
              <ListItem key={index}>
                <IconButton
                  aria-label="Remove"
                  color="error"
                  onClick={() => removeAddition(index)}
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
                {item.name} -
                <Typography variant="h4">
                  <i className={item.icon}></i>
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
        <SubmitButton submitting={submitting} />
      </form>
    </AdminLayout>
  )
}
