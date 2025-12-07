import Head from 'next/head'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Layout from '@/components/layouts/default'
import PageTitle from '@/components/PageTitle'
import { WorkProps, type WorkItems, Items } from '@/types'
import { connectToDatabase } from '@/util/mongodb'

export async function getStaticProps() {
  const { db } = await connectToDatabase()

  const work = await db
    .collection('work')
    .find({})
    .sort({ weight: 1 })
    //.limit(20)
    .toArray()

  return {
    props: {
      work: JSON.parse(JSON.stringify(work))
    },
    revalidate: 60 // In seconds
  }
}

function WorkItems({ items }: Items) {
  const workItems = items.map(({ _id, slug, name, logo }: WorkItems) => {
    return (
      <Box key={_id} sx={{ width: { xs: '100%', sm: '50%', md: '33%' }, p: 2 }}>
        <Link href={`work/[slug]`} as={`work/${slug}`}>
          <Box className="work-item">
            <img
              className="img-fluid"
              src={`${process.env.awsS3Logo}${logo}`}
              alt={name}
            />
          </Box>
          <Box sx={{ textAlign: 'center', marginTop: 3 }}>
            <p>{name}</p>
          </Box>
        </Link>
      </Box>
    )
  })

  return <>{workItems}</>
}

export default function Work({ work }: WorkProps) {
  return (
    <Layout>
      <Head>
        <title>{`Work | ${process.env.siteTitle}`}</title>
      </Head>
      <PageTitle>Work</PageTitle>
      <Box
        id="work"
        sx={{ display: 'flex', flexWrap: 'wrap', mx: -2 }}
      >
        <WorkItems items={work} />
      </Box>
    </Layout>
  )
}
