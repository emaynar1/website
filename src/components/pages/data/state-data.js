import React from 'react'
import marked from 'marked'
import { Link } from 'gatsby'
import slug from '../../../utilities/slug'
import { UnstyledList } from '../../common/lists'
import StateGrade from '../../common/state-grade'
import SummaryTable from '../../common/summary-table'
import '../../../scss/components/pages/data/state-data.scss'

const State = ({ state }) => (
  <>
    <div className="state-header">
      <h3 id={`state-${state.state.toLowerCase()}`}>
        <Link to={`/data/state/${slug(state.name)}`}>{state.name}</Link>
      </h3>
      <StateGrade letterGrade={state.stateData.grade} />
    </div>
    <SummaryTable
      data={state.stateData}
      lastUpdated={state.stateData.lastUpdateEt}
    />
    <UnstyledList>
      {state.twitter && (
        <li>
          <a href={`https://twitter.com/${state.twitter}`}>
            {state.name} on Twitter
          </a>
        </li>
      )}
      {state.covid19Site && (
        <li>
          <a href={state.covid19Site}>
            Best current data source for {state.name}
          </a>
        </li>
      )}
      <li>
        <Link to={`/data/state/${slug(state.name)}#historical`}>
          Historical data for {state.name}
        </Link>
      </li>
    </UnstyledList>
    {state.notes && (
      <div
        dangerouslySetInnerHTML={{
          __html: marked(state.notes),
        }}
      />
    )}
    <a className="top-link" href="#states-top" title="top">
      ↑ (return to top)
    </a>
  </>
)

export default State
