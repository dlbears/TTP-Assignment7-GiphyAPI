import { useEffect, useReducer } from 'react'
import { Gif, Search, SelectArray } from './Components'
import { useScrollBottom, useWindowSize } from './Hooks'
import './App.css';

const API_KEY = 'ASm5FU9hWdI91IB2OOUAR8uR19Ss4IWz',
      baseUrl = 'https://api.giphy.com/v1/gifs/'

const ratings = [ "g", "pg", "pg-13", "r" ]
const ratingsIndex = ratings.reduce((a, v, i) => ({ ...a, [v]: i }) , {})
const regions = [ "en", "es", "pt", "id", "fr", "ar", "tr", "th", "vi", "de", "it", "ja", "zh-CN", "zh-TW", "ru", "ko", "pl", "nl", "ro", "hu", "sv", "cs", "hi", "bn", "da", "fa", "tl", "fi", "iw", "ms", "no", "uk" ]

const buildSearchUrl = (
    query, 
    offset=0, 
    limit=50, 
    rating='g', 
    lang='en'
  ) => `${baseUrl}search?api_key=${API_KEY}&q=${query}&limit=${limit}&offset=${offset}&rating=${rating}&lang=${lang}`,
  buildTrendingUrl = (
    limit=50,
    rating='g'
  ) => `${baseUrl}trending?api_key=${API_KEY}&limit=${limit}&rating=${rating}`,
  buildRandomUrl = (
    tag='',
    rating='g'
  ) => `${baseUrl}random?api_key=${API_KEY}&rating=${rating}${tag === '' ? '' : `&tag=${tag}`}` 


const mapGifs = ({ 
  images: {
    fixed_width: {
      mp4: mp4Src,
      url: gifSrc
    },
    fixed_width_small: {
      mp4: mp4SmallSrc,
      url: gifSmallSrc
    }
  }, 
  url, 
  rating, 
  title 
}) => ({
  gifSrc,
  gifSmallSrc,
  mp4Src,
  mp4SmallSrc,
  url,
  title,
  rating
})

const reducers = {
  gifLoad: (state, action) => ({
    ...state,
    gifs: action.data,
    isSearching: false,
    isEnd: (action.data?.length ?? 0) < 50
  }),
  gifMore: (state, action) => ({
    ...state,
    gifs: state.trending ? action.data : state.gifs.concat(action.data),
    isEnd: state.trending ? action.data.length < (state.gifs.length + 50) : (state.gifs.length + (action.data?.length ?? 0)) < 100,
    isBottom: false
  }),
  reset: (state, action) => ({
    ...state,
    trending: true,
    isSearching: false,
    gifs: []
  }),
  searchSubmit: (state, action) => ({
    ...state,
    trending: state.query === '',
    isSearching: state.query !== '',
    gifs: [],
    isEnd: false
  }),
  queryUpdate: (state, action) => ({
    ...state,
    query: action.value
  }),
  regionUpdate: (state, action) => ({
    ...state,
    gif: [],
    region: action.value,
    trending: state.query === '',
    isSearching: state.query !== '',
    isEnd: false
  }),
  ratingUpdate: (state, action) => ratingsIndex[action.value] < ratingsIndex[state.rating]
    ? ({ ...state, gifs: state.gifs.filter(({ rating }) => ratingsIndex[rating] <= ratingsIndex[action.value]), rating: action.value })
    : ({ ...state, gifs: [], rating: action.value, isEnd: false }),
  bottomHit: (state, action) => ({
    ...state,
    trending: state.query === '',
    isSearching: state.query !== '',
    isBottom: true,
    isEnd: state.isEnd
  })
 }

const rootReducer = (state, action) => reducers[action.type]?.(state, action) ?? state

const initialState = {
  trending: true,
  isSearching: false, 
  isBottom: false,
  isEnd: false, 
  query: '',
  gifs: [],
  rating: 'g',
  region: 'en'
}

function App() {
  const [ state, dispatch ] = useReducer(rootReducer, initialState)
  const { width } = useWindowSize()
  const [ isBottom, cleanBottom ] = useScrollBottom()
  const pictureWidth = width >= 600 ? 200 : 100
  const handleRandom = () => {
    const url = buildRandomUrl(state.query, state.rating) 
    console.log('Endpoint: ', url)
    fetch(url).then(res => res.json())
              .then(({ data: { url }}) => window.open(url, '_blank'))
  }

  useEffect(() => {
    const controller = new AbortController()

    async function fetchMore() {
      const abortSignal = controller.signal,
            url = state.trending ? buildTrendingUrl(state.gifs.length * (Math.floor(state.gifs.length / 50) + 1), state.rating)
                             : buildSearchUrl(state.query, state.gifs.length, undefined, state.rating, state.region)
      console.log('Endpoint ', url)
      try {
        
        const response = await fetch(url, { abortSignal })
        const { data } = await response.json()
        dispatch({ type: 'gifMore', data: data.map(mapGifs) })
      } catch (e) {
        console.log('Error ', e)
      }
    }

    async function fetchGifs() {
      const abortSignal = controller.signal,
            searchUrl = state.trending ? buildTrendingUrl(undefined, state.rating)
                                 : buildSearchUrl(state.query, undefined, undefined, state.rating, state.region)
      console.log('Endpoint ', searchUrl)
      try {
        const response = await fetch(searchUrl, { abortSignal })
        const { data } = await response.json()
        dispatch({ type: 'gifLoad',  data: data.map(mapGifs) })
      } catch (e) {
        console.log('Error ', e)
      }
    }

    if(!state.isEnd) {
      if (state.isSearching) {
        if (state.query === '') dispatch({ type: 'reset' })
        else if (state.gifs.length < 50) fetchGifs()
        else if (state.isBottom || ((Math.floor(width) >= 1000) && (state.gifs?.length ?? 0) <= Math.floor((width / 1000) * 50))) fetchMore()
      } else if (state.trending) {
        if (state.gifs.length < 50) fetchGifs()
        else if (state.isBottom || ((Math.floor(width) >= 1000) && (state.gifs?.length ?? 0) <= Math.floor((width / 1000) * 50))) fetchMore()
      }
    }

    return () => {
      console.log('Abort')
      controller.abort()
    }

  }, [ state, width ])

  useEffect(() => { 
    if (isBottom) {
      dispatch({ type: 'bottomHit' }) 
      cleanBottom()
    }
  }, [isBottom, cleanBottom] ) 

  return (
    <div className="App">
      <form id="SearchBar" onSubmit={e => { e.preventDefault(); dispatch({ type: 'searchSubmit' }) }}>
        <Search 
          placeholder="Search Giphy" 
          value={state.query} 
          onChange={value => dispatch({ type: 'queryUpdate', value })}  
          onRandom={handleRandom} 
          id="SearchInput"
        />
        <div id="filters">
          <SelectArray className="filter" label="Region: " data={regions} onSelect={value => dispatch({ type: 'regionUpdate', value })} />
          <SelectArray className="filter" label="Rating: " data={ratings} onSelect={value => dispatch({ type: 'ratingUpdate', value })} />
        </div>
      </form>
      { state.trending ? <h2>Trending: </h2> : <h2>Search Results: </h2> }
      <section id="gifs" style={{ width: Math.floor(width / pictureWidth) * pictureWidth , columns: Math.floor(width / pictureWidth) }}>
        {
          state.isEnd && state.gifs.length === 0
            ? <h2>No Results.</h2>
            : state.isSearching && state.gifs.length === 0
              ? <h2>Loading...</h2>
              : state.gifs.map((props, i) => <Gif {...props} key={i} />)
        }
      </section>
      { state.isEnd && <h2>End of Results</h2>}
    </div>
  );
}

export default App;
