import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./paginas/Login";
import Registro from "./paginas/Registro";
import Inicio from "./paginas/Inicio"; // tu página principal
import RutaPrivada from "./componentes/RutaPrivada"; // importa la nueva ruta privada

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/" element={<Inicio />} /> {/* o tu home sin login */}

        {/* Rutas protegidas */}
        <Route
          path="/inicio"
          element={
            <RutaPrivada>
              <Inicio />
            </RutaPrivada>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
git