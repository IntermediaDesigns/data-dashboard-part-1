import { useState, useEffect } from "react";
import md5 from "md5";

const LetterSelector = ({ selectedLetter, onLetterSelect }) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="flex flex-wrap justify-center mb-4">
      <button
        className={`m-1 px-3 py-1 border-2 border-black ${
          selectedLetter === "" ? "bg-red-600 text-white" : "bg-white"
        }`}
        onClick={() => onLetterSelect("")}
      >
        All
      </button>
      {alphabet.map((letter) => (
        <button
          key={letter}
          className={`m-1 px-3 py-1 border-2 border-black ${
            selectedLetter === letter ? "bg-red-600 text-white" : "bg-white"
          }`}
          onClick={() => onLetterSelect(letter)}
        >
          {letter}
        </button>
      ))}
    </div>
  );
};

const App = () => {
  const [characters, setCharacters] = useState([]);
  const [displayedCharacters, setDisplayedCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("");
  const [filters, setFilters] = useState({
    comics: "",
    series: "",
  });
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const PUBLIC_KEY = import.meta.env.VITE_MARVEL_PUBLIC_KEY;
  const PRIVATE_KEY = import.meta.env.VITE_MARVEL_PRIVATE_KEY;
  const FETCH_LIMIT = 100;
  const DISPLAY_LIMIT = 30;

  const fetchCharacters = async (newSearch = false) => {
    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      const hash = md5(timestamp + PRIVATE_KEY + PUBLIC_KEY);
      let url = `https://gateway.marvel.com/v1/public/characters?ts=${timestamp}&apikey=${PUBLIC_KEY}&hash=${hash}&limit=${FETCH_LIMIT}&offset=${
        newSearch ? 0 : offset
      }`;

      if (selectedLetter) {
        url += `&nameStartsWith=${selectedLetter}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.data.results.length > 0) {
        if (newSearch) {
          setCharacters(data.data.results);
          setOffset(FETCH_LIMIT);
        } else {
          setCharacters((prevCharacters) => [
            ...prevCharacters,
            ...data.data.results,
          ]);
          setOffset((prevOffset) => prevOffset + FETCH_LIMIT);
        }
        setHasMore(data.data.total > offset + FETCH_LIMIT);
      } else {
        setHasMore(false);
      }

      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters(true);
  }, [selectedLetter]);

  useEffect(() => {
    filterAndDisplayCharacters();
  }, [characters, searchTerm, filters]);

  const filterAndDisplayCharacters = () => {
    const filtered = characters.filter((character) => {
      return (
        character.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filters.comics === "" ||
          character.comics.available > parseInt(filters.comics)) &&
        (filters.series === "" ||
          character.series.available > parseInt(filters.series))
      );
    });
    setDisplayedCharacters(filtered.slice(0, DISPLAY_LIMIT));
  };

  const loadMore = () => {
    if (displayedCharacters.length < characters.length) {
      const nextBatch = characters.slice(
        displayedCharacters.length,
        displayedCharacters.length + DISPLAY_LIMIT
      );
      setDisplayedCharacters((prev) => [...prev, ...nextBatch]);
    } else if (hasMore) {
      fetchCharacters();
    }
  };

  const handleLetterSelect = (letter) => {
    setSelectedLetter(letter);
    setCharacters([]);
    setDisplayedCharacters([]);
    setOffset(0);
    setHasMore(true);
  };

  // Summary statistics
  const totalCharacters = characters.length;
  const averageComics =
    characters.reduce((sum, character) => sum + character.comics.available, 0) /
      totalCharacters || 0;
  const maxSeries = Math.max(
    ...characters.map((character) => character.series.available),
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-bangers text-7xl text-shadow-xl mb-8 text-center font-bold text-red-600 tracking-wide">
        MARVEL CHARACTERS DASHBOARD
      </h1>

      <LetterSelector
        selectedLetter={selectedLetter}
        onLetterSelect={handleLetterSelect}
      />

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search characters"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 text-gray-800 placeholder:text-gray-800 border-black border-4"
      />

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <label className="flex-1 ">
          <span className="block mb-1 font-sans font-bold">Min Comics:</span>
          <input
            type="number"
            value={filters.comics}
            onChange={(e) => setFilters({ ...filters, comics: e.target.value })}
            className="w-full p-2 border-4 text-gray-800 border-black"
          />
        </label>
        <label className="flex-1">
          <span className="block mb-1 font-sans font-bold">Min Series:</span>
          <input
            type="number"
            value={filters.series}
            onChange={(e) => setFilters({ ...filters, series: e.target.value })}
            className="w-full p-2 border-4 border-black "
          />
        </label>
      </div>

      {/* Summary statistics */}
      <div className="bg-lime-300 p-6 mb-8 shadow-lg border-8 border-white">
        <h2 className="text-2xl font-semibold mb-4">Summary Statistics</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 shadow-lg border-8 border-black">
            <p className="text-lg font-semibold">Total Characters</p>
            <p className="text-3xl text-red-600">{totalCharacters}</p>
          </div>
          <div className="bg-white p-4 shadow-lg border-8 border-black">
            <p className="text-lg font-semibold">Avg Comics/Character</p>
            <p className="text-3xl text-red-600">{averageComics.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 border-8 border-black shadow-lg">
            <p className="text-lg font-semibold">Max Series</p>
            <p className="text-3xl text-red-600">{maxSeries}</p>
          </div>
        </div>
      </div>

      {/* Character list */}
      {loading && displayedCharacters.length === 0 ? (
        <p className="text-center text-xl">Loading...</p>
      ) : error ? (
        <p className="text-center text-xl text-red-600">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCharacters.map((character) => (
              <div
                key={character.id}
                className="bg-white p-6 shadow-md border-8 border-black"
              >
                <h3 className="text-2xl text-center font-semibold mb-2">
                  {character.name}
                </h3>
                <p className="text-xl mb-1">
                  Comics:{" "}
                  <span className="text-blue-600">
                    {character.comics.available}
                  </span>
                </p>
                <p className="text-xl">
                  Series:{" "}
                  <span className="text-pink-600">
                    {character.series.available}
                  </span>
                </p>
              </div>
            ))}
          </div>
          {(displayedCharacters.length < characters.length || hasMore) && (
            <button
              onClick={loadMore}
              className="mt-6 px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default App;
