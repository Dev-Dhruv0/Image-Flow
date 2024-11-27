import { ImageProvider } from "./context/ImageContext";
import ImageUploadForm from "./components/ImageUploadForm";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Gallery from "./components/Gallery";

function App() {
  return (
    <BrowserRouter>
      <ImageProvider>
        <Routes>
          <Route element={<Layout />}>
          <Route path="/" element={<ImageUploadForm />}/>
          <Route path="/gallery" element={<Gallery />}/>
          </Route>
        </Routes>
      </ImageProvider>
    </BrowserRouter>
  );
};

export default App;
