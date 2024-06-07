// SearchBox.jsx

import React, { useState } from "react";
import { services } from "@tomtom-international/web-sdk-services";

const SearchBox = ({ onPlaceSelect }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      try {
        const response = await services.fuzzySearch({
          key: import.meta.env.VITE_TOMTOM_API_KEY,
          query: value,
        })
        
        setSuggestions(response.results);
      } catch (error) {
        console.error(error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (suggestion) => {
    onPlaceSelect(suggestion.position);
    setQuery(suggestion.address.freeformAddress);
    setSuggestions([]);
  };

  return (
    <div className="search-box">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search for a location"
      />
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSelect(suggestion)}>
              {suggestion.address.freeformAddress}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBox;
