const contentful = require('contentful-management')
const { DateTime } = require('luxon')

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_API,
})

const latestDate = DateTime.fromISO(process.env.CONTENTFUL_SNAPSHOT_DATE)

const nodeList = []

exports.onCreateNode = async ({ node }, configOptions) => {
  if (typeof node.contentful_id === 'undefined') {
    return
  }
  nodeList.push({
    id: node.id,
    contentful_id: node.contentful_id,
  })
}

exports.onPostBootstrap = async ({ actions, reporter }) => {
  const { createNode, deleteNode } = actions
  reporter.info(
    `Patching ${
      nodeList.length
    } contentful nodes match content from ${latestDate.toISODate()}`,
  )
  const space = await client.getSpace(process.env.CONTENTFUL_SPACE)
  const environment = await space.getEnvironment('master')

  let i = 0
  const updateSnapshot = async () => {
    let latestSnapshot = false
    if (typeof nodeList[i] === 'undefined') {
      return
    }
    const entry = await environment.getEntry(nodeList[i].contentful_id)
    const snapshots = await entry.getSnapshots()
    if (!snapshots.items) {
      reporter.info(`Found no snapshots for ${nodeList[i].contentful_id}`)
      i += 1
      updateSnapshot()
      return
    }
    snapshots.items.forEach(snapshot => {
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
      reporter.info(`Found snapshot for ${nodeList[i].contentful_id}`)
      i += 1
      updateSnapshot()
    } else {
      deleteNode({ id: nodeList[i].id })
      i += 1
      updateSnapshot()
    }
  }
  updateSnapshot()
}
