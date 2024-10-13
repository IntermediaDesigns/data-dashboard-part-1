import { useState, useEffect } from "react";
import md5 from "md5";

const App = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    comics: "",
    series: "",
  });

  const PUBLIC_KEY = import.meta.env.VITE_MARVEL_PUBLIC_KEY;
  const PRIVATE_KEY = import.meta.env.VITE_MARVEL_PRIVATE_KEY;

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const timestamp = new Date().getTime();
        const hash = md5(timestamp + PRIVATE_KEY + PUBLIC_KEY);
        const response = await fetch(
          `https://gateway.marvel.com/v1/public/characters?ts=${timestamp}&apikey=${PUBLIC_KEY}&hash=${hash}`
        );
        const data = await response.json();
        setCharacters(data.data.results);
        setLoading(false);
      } catch (err) {
        setError("Error fetching data");
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  // Filter and search logic
  const filteredCharacters = characters.filter((character) => {
    return (
      character.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filters.comics === "" ||
        character.comics.available > parseInt(filters.comics)) &&
      (filters.series === "" ||
        character.series.available > parseInt(filters.series))
    );
  });

  // Summary statistics
  const totalCharacters = filteredCharacters.length;
  const averageComics =
    filteredCharacters.reduce(
      (sum, character) => sum + character.comics.available,
      0
    ) / totalCharacters || 0;
  const maxSeries = Math.max(
    ...filteredCharacters.map((character) => character.series.available),
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-bangers text-7xl text-shadow-xl mb-8 text-center font-bold text-red-600 tracking-wide">
        MARVEL CHARACTERS DASHBOARD
      </h1>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search characters"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 border text-gray-800 placeholder:text-gray-800 border-gray-600 rounded"
      />

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <label className="flex-1 ">
          <span className="block mb-1">Min Comics:</span>
          <input
            type="number"
            value={filters.comics}
            onChange={(e) => setFilters({ ...filters, comics: e.target.value })}
            className="w-full p-2 border text-gray-800 border-gray-600 rounded"
          />
        </label>
        <label className="flex-1">
          <span className="block mb-1">Min Series:</span>
          <input
            type="number"
            value={filters.series}
            onChange={(e) => setFilters({ ...filters, series: e.target.value })}
            className="w-full p-2 border border-gray-600 rounded"
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
      {loading ? (
        <p className="text-center text-xl">Loading...</p>
      ) : error ? (
        <p className="text-center text-xl text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map((character) => (
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
                  {" "}
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
      )}
    </div>
  );
};

export default App;
