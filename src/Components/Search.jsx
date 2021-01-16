
const Search = ({ onRandom, onChange, ...rest }) => (<>
        <input onChange={e => onChange(e.target.value)} {...rest} />
        <input type="submit" value="Search" />
        <input type="button" value="I'm Feeling Lucky" onClick={onRandom} />
</>)

export default Search