import { useEffect } from 'react'
import Head from 'next/head'
import Layout from '@/components/layouts/default'
import Astronaut from '@/components/img/Astronaut'
import Box from '@mui/material/Box'
import gsap from 'gsap'

export default function Index() {
  let loaded = false

  useEffect(() => {
    // Prevent from loading twice
    if (!loaded) {
      loaded = true

      gsap.from('.vertical', {
        opacity: 0,
        y: -100,
        ease: 'easeIn',
        duration: 2
      })
      gsap.from('.title-home', {
        x: 200,
        opacity: 0,
        ease: 'easeIn',
        duration: 2,
        delay: 1.5
      })
      gsap.from('#moon', {
        x: 0,
        y: 100,
        scale: -0.5,
        ease: 'easeIn',
        duration: 5
      })
      gsap.timeline({ repeat: -1 }).to('#moon', {
        rotate: 1080,
        duration: 300,
        repeatDelay: 0
      })
    }
  }, [])

  return (
    <Layout>
      <Head>
        <title>{`${process.env.siteTitle}`}</title>
      </Head>
      <Astronaut />
      <Box
        className="home-title"
        sx={{
          flexWrap: 'wrap',
          display: { sm: 'flex', xs: 'block' },
          paddingTop: { md: -10, xs: 0 },
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center'
        }}
      >
        <Box>
          <h1 className="outline vertical">Web</h1>
        </Box>
        <Box>
          <h1 className="title-home">
            Developer <br />
            &amp;&nbsp;Designer
          </h1>
        </Box>
      </Box>
      <div id="moon"></div>
    </Layout>
  )
}
