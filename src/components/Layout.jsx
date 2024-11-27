import { Link, Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen relative bg-purple-50/30 backdrop-blur-3xl overflow-hidden">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <nav className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-semibold text-purple-600">
              Image Flow
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/"
                className="text-purple-900/60 hover:text-purple-600 px-3 py-2 rounded-md transition-colors"
              >
                Upload
              </Link>
              <Link
                to="/gallery"
                className="text-purple-900/60 hover:text-purple-600 px-3 py-2 rounded-md transition-colors"
              >
                Gallery
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content with Padding for Header */}
      <div className="pt-16 min-h-screen flex items-center justify-center p-4">
        {/* Mesh Gradient Background */}
        <div className="fixed inset-0 bg-[radial-gradient(at_top_left,rgba(233,213,255,0.5)_0%,transparent_50%),radial-gradient(at_bottom_right,rgba(147,51,234,0.2)_0%,transparent_50%)] z-[-1]"></div>

        {/* Glass panels in background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-lg"></div>
          <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-purple-100/10 to-transparent backdrop-blur-lg"></div>
        </div>

        <div className="w-full max-w-xl relative z-10">
          {/* Main container with enhanced glass effect */}
          <div
            className="relative bg-white/40 backdrop-blur-2xl shadow-[0_8px_30px_rgb(147,51,234,0.2)] 
                    rounded-2xl p-6 sm:p-8 border border-white/40 hover:bg-white/50 transition-all duration-300"
          >
            <div className="max-w-md mx-auto">
              <div className="relative mb-8">
                <h1 className="text-2xl sm:text-3xl font-semibold text-center bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent pb-4">
                  ImageFlow
                </h1>
                <p className="text-center text-purple-900/60 text-sm">
                  Upload and manage your images
                </p>
              </div>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
