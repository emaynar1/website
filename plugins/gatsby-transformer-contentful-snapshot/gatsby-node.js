const contentful = require('contentful-management')
const { DateTime } = require('luxon')

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_API,
})

const latestDate = DateTime.fromISO(process.env.CONTENTFUL_SNAPSHOT_DATE)

const onCreateNode = async ({ node }, configOptions) => {
  if (node.internal.type !== 'ContentfulPage') {
    return
  }
  const space = await client.getSpace(process.env.CONTENTFUL_SPACE)
  const environment = await space.getEnvironment('master')
  const entry = await environment.getEntry(node.contentful_id)
  const snapshots = await entry.getSnapshots()
  let latestSnapshot = false
  snapshots.forEach(snapshot => {
    if (
      !latestSnapshot ||
      (DateTime.fromISO(snapshot.sys.updatedAt) < latestDate &&
        DateTime.fromISO(snapshot.sys.updatedAt) >
          DateTime.fromISO(latestSnapshot.sys.updatedAt))
    ) {
      latestSnapshot = snapshot
    }
  })
  if (latestSnapshot) {
    const entrySnapshot = entry.getSnapshot(latestSnapshot.sys.id)
    console.log(entrySnapshot)
    process.exit(1)
  }

  return null
}

exports.onCreateNode = onCreateNode
