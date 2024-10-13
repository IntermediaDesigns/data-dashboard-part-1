import { useState, useEffect } from "react";
import md5 from "md5";
import { Link } from "react-router-dom";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 bg-red-600 text-white p-3 rounded-full shadow-lg transition duration-300 ease-in-out hover:bg-red-700 hover:scale-110"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </>
  );
};

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

const CharacterModal = ({ character, onClose }) => {
  if (!character) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl font-bold text-red-600">{character.name}</h2>
          <button onClick={onClose} className="text-2xl font-bold">
            &times;
          </button>
        </div>
        <img
          src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
          alt={character.name}
          className="w-full h-64 object-cover object-center mb-4"
        />
        <p className="mb-4">
          {character.description || "No description available."}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Comics</h3>
            <p>Available: {character.comics.available}</p>
            <ul className="list-disc list-inside">
              {character.comics.items.slice(0, 5).map((comic, index) => (
                <li key={index}>{comic.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Series</h3>
            <p>Available: {character.series.available}</p>
            <ul className="list-disc list-inside">
              {character.series.items.slice(0, 5).map((series, index) => (
                <li key={index}>{series.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
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
  const [selectedCharacter, setSelectedCharacter] = useState(null);

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
    } catch {
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

  const handleCharacterClick = (character) => {
    setSelectedCharacter(character);
  };

  return (
    <>
      <nav className="p-4">
        <div className="flex items-center justify-between mx-6">
          <img src="/dataverselogo.png" alt="logo" className="w-40" />
          <h1 className="font-bangers text-9xl text-shadow-xl text-center font-bold text-red-600 tracking-wide">
            DATAVERSE
          </h1>
          <Link to="/">
            <button className="mt-6 px-6 py-4 bg-red-600 text-white font-bold rounded transition duration-300 ease-in-out hover:shadow-2xl hover:scale-105 hover:bg-red-700">
              Main Page
            </button>
          </Link>
        </div>
      </nav>
      <div className="container mx-auto px-2 py-8">
        <h1 className="text-4xl text-center font-bold mt-2 mb-4">
          Welcome to the Marvel Dataverse Dashboard!
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
              onChange={(e) =>
                setFilters({ ...filters, comics: e.target.value })
              }
              className="w-full p-2 border-4 text-gray-800 border-black"
            />
          </label>
          <label className="flex-1">
            <span className="block mb-1 font-sans font-bold">Min Series:</span>
            <input
              type="number"
              value={filters.series}
              onChange={(e) =>
                setFilters({ ...filters, series: e.target.value })
              }
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
              <p className="text-3xl text-red-600">
                {averageComics.toFixed(2)}
              </p>
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
                  className="bg-white p-6 shadow-md border-8 border-black cursor-pointer transition duration-300 ease-in-out hover:shadow-xl hover:scale-105"
                  onClick={() => handleCharacterClick(character)}
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
        <BackToTopButton />
        {selectedCharacter && (
          <CharacterModal
            character={selectedCharacter}
            onClose={() => setSelectedCharacter(null)}
          />
        )}
      </div>
    </>
  );
};

export default Dashboard;
