function SearchInput({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <input
      className="search-input"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}

export default SearchInput