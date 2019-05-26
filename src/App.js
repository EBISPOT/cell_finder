import React, { Component } from 'react'
import extend from 'lodash/extend'
import { get, map } from "lodash";

import { SearchkitManager,SearchkitProvider,
  SearchBox, RefinementListFilter, Pagination,
  HierarchicalMenuFilter, HitsStats, SortingSelector, NoHits,
  ResetFilters, RangeFilter, NumericRefinementListFilter,
  ViewSwitcherHits, ViewSwitcherToggle, DynamicRangeFilter,
  InputFilter, GroupedSelectedFilters, Hits,
  Layout, TopBar, LayoutBody, LayoutResults,
  ActionBar, ActionBarRow, SideBar } from 'searchkit'
import './index.css'

const host = "http://localhost:9200/cell_finder";
const searchkit = new SearchkitManager(host);

// const MovieHitsGridItem = (props)=> {
//   const {bemBlocks, result} = props
//   let url = "http://www.imdb.com/title/" + result._source.imdbId
//   const source = extend({}, result._source, result.highlight)
//   return (
//     <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
//       <a href={url} target="_blank">
//         <img data-qa="poster" alt="presentation" className={bemBlocks.item("poster")} src={result._source.poster} width="170" height="240"/>
//         <div data-qa="title" className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:source.title}}></div>
//       </a>
//     </div>
//   )
// }
//
// const MovieHitsListItem = (props)=> {
//   const {bemBlocks, result} = props
//   let url = "http://www.imdb.com/title/" + result._source.imdbId
//   const source = extend({}, result._source, result.highlight)
//   return (
//     <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
//       <div className={bemBlocks.item("poster")}>
//         <img alt="presentation" data-qa="poster" src={result._source.poster}/>
//       </div>
//       <div className={bemBlocks.item("details")}>
//         <a href={url} target="_blank"><h2 className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:source.title}}></h2></a>
//         <h3 className={bemBlocks.item("subtitle")}>Released in {source.year}, rated {source.imdbRating}/10</h3>
//         <div className={bemBlocks.item("text")} dangerouslySetInnerHTML={{__html:source.plot}}></div>
//       </div>
//     </div>
//   )
// }
const CellHitsListItem = (props)=> {
  const {bemBlocks, result} = props;
  let url = result._source.uri;
  const source = extend({}, result._source, result.highlight)
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <div className={bemBlocks.item("details")}>
        <div className={bemBlocks.item("text")} dangerouslySetInnerHTML={{__html:source.label}}></div>
      </div>
    </div>
  )
};

class URIRenderer extends React.Component {

  render() {
      const term = this.props;
      let uri = term.uri;
      let curie = uri.substring(uri.lastIndexOf("/")+1).replace("_", ":");
      let olsLink = "https://www.ebi.ac.uk/ols/ontologies/cl/terms?obo_id=" + curie;
      return (
          <a target="_blank" href={olsLink}>{curie}</a>
      );

  }
}

class CellHitsTable extends React.Component {

    render(){
        const { hits } = this.props
        return (
            <div style={{width: '100%', boxSizing: 'border-box', padding: 8}}>
                <table className="sk-table sk-table-striped" style={{width: '100%', boxSizing: 'border-box'}}>
                    <thead>
                    <tr>
                        <th>Cell type</th>
                        <th>Id</th>
                        <th>Description</th>
                    </tr>
                    </thead>
                    <tbody>
                    {map(hits, hit => (
                        <tr key={hit._id}>
                            <td>{hit._source.label}</td>
                            <td><URIRenderer uri={hit._source.uri}/></td>
                            <td>{hit._source.definition}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        )
    }
}

class App extends Component {
  render() {
    return (
      <SearchkitProvider searchkit={searchkit}>
        <Layout>
          <TopBar>
            <div className="my-logo">Cell finder</div>
            <SearchBox autofocus={true} searchOnChange={true} prefixQueryFields={["label^5", "synonyms^3", "is_a_labels^2", "part_of_labels^1", "has_plasma_membrane_part_labels^1"]}/>
          </TopBar>

        <LayoutBody>

          <SideBar>
            {/*<HierarchicalMenuFilter fields={["type.raw", "genres.raw"]} title="Categories" id="categories"/>*/}
            {/*<DynamicRangeFilter field="metaScore" id="metascore" title="Metascore" rangeFormatter={(count)=> count + "*"}/>*/}
            {/*<RangeFilter min={0} max={10} field="imdbRating" id="imdbRating" title="IMDB Rating" showHistogram={true}/>*/}
            {/*<InputFilter id="writers" searchThrottleTime={500} title="Writers" placeholder="Search writers" searchOnChange={true} queryFields={["writers"]} />*/}
              <RefinementListFilter id="source" title="Source" field="source.raw"  size={10}/>
              <RefinementListFilter id="is_a_labels" title="Cell type" field="is_a_labels.raw"  size={10}/>
              <RefinementListFilter id="part_of_labels" title="Anatomy" field="part_of_labels.raw"  size={10}/>
              <RefinementListFilter id="has_plasma_membrane_part_labels" title="Surface markers" field="has_plasma_membrane_part_labels.raw"  size={10}/>
              <RefinementListFilter id="capable_of_labels" title="Function" field="capable_of_labels.raw"  size={10}/>
            {/*<RefinementListFilter id="writersFacets" translations={{"facets.view_more":"View more writers"}} title="Writers" field="writers.raw" operator="OR" size={10}/>*/}
            {/*<RefinementListFilter id="countries" title="Countries" field="countries.raw" operator="OR" size={10}/>*/}
            {/*<NumericRefinementListFilter id="runtimeMinutes" title="Length" field="runtimeMinutes" options={[*/}
              {/*{title:"All"},*/}
              {/*{title:"up to 20", from:0, to:20},*/}
              {/*{title:"21 to 60", from:21, to:60},*/}
              {/*{title:"60 or more", from:61, to:1000}*/}
            {/*]}/>*/}
          </SideBar>
          <LayoutResults>
            <ActionBar>

              <ActionBarRow>
                <HitsStats translations={{
                  "hitstats.results_found":"{hitCount} results found"
                }}/>
                <ViewSwitcherToggle/>
                <SortingSelector options={[
                  {label:"Relevance", field:"_score", order:"desc"}
                  // {label:"Latest Releases", field:"released", order:"desc"},
                  // {label:"Earliest Releases", field:"released", order:"asc"}
                ]}/>
              </ActionBarRow>

              <ActionBarRow>
                <GroupedSelectedFilters/>
                <ResetFilters/>
              </ActionBarRow>

            </ActionBar>

              <Hits
                  hitsPerPage={20}
                  sourceFilter={["label", "uri", "definition"]} listComponent={CellHitsTable}
                  highlightFields={["label"]}
              />

            {/*<ViewSwitcherHits*/}
                {/*hitsPerPage={12} highlightFields={["label"]}*/}
                {/*sourceFilter={["label"]}*/}
                {/*hitComponents={[*/}
                  {/*{key:"list", label:"List", itemComponent:CellHitsListItem, defaultOption:true}*/}
                {/*]}*/}
                {/*scrollTo="body"*/}
            {/*/>*/}
            <NoHits suggestionsField={"label"}/>
            <Pagination showNumbers={true}/>
          </LayoutResults>

          </LayoutBody>
        </Layout>
      </SearchkitProvider>
    );
  }
}

export default App;
