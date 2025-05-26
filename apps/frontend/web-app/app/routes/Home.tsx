const Home = ({ title }: { title: string }) => {
  return (
    <div className="wrapper">
      <div className="container">
        <div id="welcome">
          <h1 className="font-hoves font-bold text-4xl">
            <span className="heading"> Hello there, </span>
            Welcome {title} 👋
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Home;
