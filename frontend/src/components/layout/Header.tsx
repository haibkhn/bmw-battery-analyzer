import logo from "../../assets/bmw-logo.png";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* BMW Logo */}
            <img src={logo} alt="BMW Logo" className="w-10 h-10" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
              BMW Battery Analysis Dashboard
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
