
const SelectArray = ({ label, data, onSelect, ...rest }) => (
    <label {...rest}>
          { label }
          <select onChange={e => onSelect(e.target.value)}>
            { data.map(text => <option key={text} value={text}>{text.toUpperCase()}</option>) }
          </select>
    </label>
)

export default SelectArray