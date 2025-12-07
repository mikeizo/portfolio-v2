import { useState, useEffect } from 'react'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import Grid from '@mui/material/Grid'
import { gsap } from 'gsap/dist/gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import Layout from '@/components/layouts/default'
import PageTitle from '@/components/PageTitle'
import { AboutProps, Items } from '@/types'
import { connectToDatabase } from '../util/mongodb'

export async function getStaticProps() {
  const { db } = await connectToDatabase()
  const settings = await db.collection('settings').findOne({})
  const about = await db
    .collection('about')
    .find({})
    .sort({ year_from: 1 })
    .toArray()

  return {
    props: {
      settings: JSON.parse(JSON.stringify(settings)),
      about: JSON.parse(JSON.stringify(about))
    },
    revalidate: 60 // In seconds
  }
}

export default function About({ settings, about }: AboutProps) {
  const [open, setOpen] = useState(false)
  const [portfolio, setPortfolio] = useState('')
  let loaded = false

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    if (!loaded) {
      loaded = true

      gsap.utils.toArray('.timeline-year').forEach((year: any) => {
        gsap.from(year, {
          scrollTrigger: {
            trigger: year,
            start: 'top 70%',
            end: 'bottom 80%',
            scrub: 1
            //markers: true
          },
          x: -100,
          opacity: 0,
          ease: 'none',
          duration: 3
        })
      })

      gsap.utils.toArray('.timeline-description').forEach((year: any) => {
        gsap.from(year, {
          scrollTrigger: {
            trigger: year,
            start: 'top 70%',
            end: 'bottom 80%',
            scrub: 1
            //markers: true
          },
          x: 100,
          opacity: 0,
          ease: 'none',
          duration: 3
        })
      })
    }
  }, [])

  function openDialog(value: string) {
    setPortfolio(value)
    setOpen(true)
  }
  function closeDialog() {
    setOpen(false)
  }

  function Modal() {
    return (
      <Dialog open={open} onClose={closeDialog} maxWidth="lg">
        <img
          src={`/img/old-sites/${portfolio}`}
          alt="Portfolio"
          className="img-fluid"
        />
      </Dialog>
    )
  }

  function TimelineItems({ items }: Items) {
    const timelineItems = items.map(
      ({ _id, year_from, year_to, description, image }) => {
        return (
          <Grid
            container
            key={_id}
            className="timeline-item"
            justifyContent="center"
          >
            <Grid item sm={12} md={2}>
              <Box
                className="timeline-year"
                display="flex"
                flexWrap="wrap"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
              >
                {year_to ? (
                  <>
                    <Box>{year_from}</Box>
                    <Box>
                      <span>to</span>
                    </Box>
                    <Box>{year_to}</Box>
                  </>
                ) : (
                  <Box>{year_from}</Box>
                )}
              </Box>
            </Grid>
            <Grid item sm={12} md={1}></Grid>
            <Grid item sm={12} md={8}>
              <Box
                className="timeline-description"
                display="flex"
                alignItems="center"
              >
                <Box>
                  {description}
                  {image && (
                    <>
                      <span>&nbsp;-&nbsp;</span>
                      <a onClick={() => openDialog(image)}>View</a>
                    </>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        )
      }
    )
    return <>{timelineItems}</>
  }

  return (
    <Layout>
      <Head>
        <title>{`About | ${process.env.siteTitle}`}</title>
      </Head>
      <PageTitle>About Me</PageTitle>
      <Grid container spacing={5} justifyContent="space-between">
        <Grid item xs={12} sm={8} md={8}>
          <div dangerouslySetInnerHTML={{ __html: settings.about }} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box textAlign="center">
            <img
              className="img-fluid about-photo"
              src="/img/mike-tropea.jpg"
              alt="Mike Tropea"
            />
          </Box>
        </Grid>
      </Grid>

      <Box textAlign="center" my={10}>
        <h2 className="message">My Journey</h2>
      </Box>
      <Box className="timeline" mt={5} mb={10}>
        <TimelineItems items={about} />
        <Modal />
      </Box>
    </Layout>
  )
}
