import { Link } from "react-router-dom";

const FeatureCard = ({ title, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-red-600 transition duration-300 ease-in-out hover:shadow-2xl hover:scale-105">
      <h3 className="text-xl font-bold mb-2 text-blue-600">{title}</h3>
      <p>{description}</p>
    </div>
  );

const LandingPage = () => {
  const features = [
    {
      title: "Alphabetical Browsing",
      description:
        "Easily navigate through characters by selecting their starting letter.",
    },
    {
      title: "Smart Search",
      description:
        "Find specific characters quickly with our responsive search function.",
    },
    {
      title: "Advanced Filtering",
      description:
        "Refine your search based on the number of comics or series a character appears in.",
    },
    {
      title: "Detailed Information",
      description:
        "Get instant access to key stats about each character, including their comic and series appearances.",
    },
    {
      title: "Dynamic Loading",
      description:
        'Explore more characters with our "Load More" feature, ensuring you never miss out on a hidden gem.',
    },
    {
      title: "Real-time Statistics",
      description:
        "Stay informed with live updates on total characters, average comics per character, and more!",
    },
  ];

  return (
    <>
      <nav className="p-4">
        <div className="flex items-center justify-between mx-6">
          <img src="/dataverselogo.png" alt="logo" className="w-40" />
          <h1 className="font-bangers text-9xl text-shadow-xl text-center font-bold text-red-600 tracking-wide">
            DATAVERSE
          </h1>
          <Link to="/dashboard">
            <button className="mt-6 px-6 py-4 bg-red-600 text-white font-bold rounded transition duration-300 ease-in-out hover:shadow-2xl hover:scale-105 hover:bg-red-700">
              Go To Dashboard
            </button>
          </Link>
        </div>
      </nav>
      <div className="flex flex-col items-center">
        <h2 className="font-medium text-3xl text-shadow-xl mb-8 text-center text-black">
          A Marvel Comic Database
        </h2>
        <div className="bg-lime-200 p-6 mb-8 mx-8 shadow-lg border-8 border-black">
          <p className="mb-4 text-center">
            Dive into the vast universe of Marvel with our interactive
            Characters Dashboard! This powerful tool allows you to explore and
            discover a wealth of information about your favorite Marvel
            characters.
          </p>
          <h3 className="text-2xl font-bold mb-4 text-center">Key Features:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
          <p className="mb-6 text-center">
            Whether you&apos;re a longtime Marvel fan or new to the universe, our
            dashboard provides an engaging way to learn about the vast array of
            characters in the Marvel universe. Start your journey of discovery
            now and uncover the heroes, villains, and everyone in between that
            make the Marvel universe so captivating!
          </p>

          <p className="text-sm italic text-center">
            Powered by the official Marvel API, this dashboard brings you the
            most up-to-date and accurate information straight from the source.
            Excelsior!
          </p>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
