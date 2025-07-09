import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";

const ingredientesGenericos = {
  Pimiento: ["Pimiento verde", "Pimiento rojo", "Pimiento amarillo"],
  Cebolla: ["Cebolla blanca", "Cebolla morada"],
};

const acciones = ["Cortar", "Saltear", "Hervir", "Freír", "Hornear"];

function App() {
  // Estats
  const [ingredientes, setIngredientes] = useState(() => {
    // Cargar de localStorage si existe
    const saved = localStorage.getItem("ingredientes");
    return saved ? JSON.parse(saved) : [];
  });
  const [nuevoIngrediente, setNuevoIngrediente] = useState({ generico: "", especifico: "", peso: 0, accion: "" });
  const [comensales, setComensales] = useState(() => {
    const saved = localStorage.getItem("comensales");
    return saved ? parseInt(saved) : 1;
  });
  const [notas, setNotas] = useState(() => localStorage.getItem("notas") || "");
  const [error, setError] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  // Guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem("ingredientes", JSON.stringify(ingredientes));
  }, [ingredientes]);

  useEffect(() => {
    localStorage.setItem("comensales", comensales.toString());
  }, [comensales]);

  useEffect(() => {
    localStorage.setItem("notas", notas);
  }, [notas]);

  // Funcions
  const validarIngrediente = () => {
    if (!nuevoIngrediente.generico) return "Selecciona un ingrediente genérico.";
    if (!nuevoIngrediente.especifico) return "Selecciona un ingrediente específico.";
    if (nuevoIngrediente.peso <= 0) return "El peso debe ser mayor que 0.";
    if (!nuevoIngrediente.accion) return "Selecciona una acción.";
    return "";
  };

  const agregarIngrediente = () => {
    const errorMsg = validarIngrediente();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    setError("");
    if (editIndex !== null) {
      // Editar
      const nuevos = [...ingredientes];
      nuevos[editIndex] = nuevoIngrediente;
      setIngredientes(nuevos);
      setEditIndex(null);
    } else {
      // Agregar nuevo
      setIngredientes([...ingredientes, nuevoIngrediente]);
    }
    setNuevoIngrediente({ generico: "", especifico: "", peso: 0, accion: "" });
  };

  const eliminarIngrediente = (index) => {
    const nuevos = ingredientes.filter((_, i) => i !== index);
    setIngredientes(nuevos);
    if (editIndex === index) {
      setEditIndex(null);
      setNuevoIngrediente({ generico: "", especifico: "", peso: 0, accion: "" });
    }
  };

  const editarIngrediente = (index) => {
    setNuevoIngrediente(ingredientes[index]);
    setEditIndex(index);
  };

  const handleExportPDF = () => {
    if (ingredientes.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Receta", 10, 15);

    doc.setFontSize(14);
    ingredientes.forEach((ing, i) => {
      const texto = `${ing.accion} ${ing.especifico} (${ing.peso * comensales}g)`;
      doc.text(texto, 10, 30 + i * 10);
    });

    if (notas.trim()) {
      doc.setFontSize(16);
      doc.text("Notas:", 10, 40 + ingredientes.length * 10);
      doc.setFontSize(12);
      doc.text(notas, 10, 50 + ingredientes.length * 10);
    }

    doc.save("receta.pdf");
  };

  const handleComensalesChange = (e) => {
    const val = parseInt(e.target.value);
    if (val < 1) return; // mínimo 1
    setComensales(val);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 font-sans">
      <h1 className="text-4xl font-bold text-center">Crear Receta</h1>

      {/* Form ingredientes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="block mb-1 font-semibold">Ingrediente Genérico</label>
          <select
            className="w-full border rounded p-2"
            value={nuevoIngrediente.generico}
            onChange={(e) =>
              setNuevoIngrediente({ ...nuevoIngrediente, generico: e.target.value, especifico: "" })
            }
          >
            <option value="">Selecciona uno</option>
            {Object.keys(ingredientesGenericos).map((gen) => (
              <option key={gen} value={gen}>{gen}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Ingrediente Específico</label>
          <select
            className="w-full border rounded p-2"
            value={nuevoIngrediente.especifico}
            onChange={(e) => setNuevoIngrediente({ ...nuevoIngrediente, especifico: e.target.value })}
            disabled={!nuevoIngrediente.generico}
          >
            <option value="">Selecciona uno</option>
            {(ingredientesGenericos[nuevoIngrediente.generico] || []).map((esp) => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Peso (g)</label>
          <input
            type="number"
            min="0"
            className="w-full border rounded p-2"
            value={nuevoIngrediente.peso}
            onChange={(e) =>
              setNuevoIngrediente({ ...nuevoIngrediente, peso: parseFloat(e.target.value) || 0 })
            }
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Acción</label>
          <select
            className="w-full border rounded p-2"
            value={nuevoIngrediente.accion}
            onChange={(e) => setNuevoIngrediente({ ...nuevoIngrediente, accion: e.target.value })}
          >
            <option value="">Selecciona una</option>
            {acciones.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div>
          <button
            className={`w-full py-2 rounded font-semibold text-white ${
              validarIngrediente() ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={agregarIngrediente}
            disabled={!!validarIngrediente()}
          >
            {editIndex !== null ? "Guardar Cambios" : "Agregar Ingrediente"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {/* Número de comensales */}
      <div className="max-w-xs">
        <label className="block mb-1 font-semibold">Número de comensales</label>
        <input
          type="number"
          min="1"
          className="w-full border rounded p-2"
          value={comensales}
          onChange={handleComensalesChange}
        />
      </div>

      {/* Notas */}
      <div>
        <label className="block mb-1 font-semibold">Notas para la receta</label>
        <textarea
          rows="3"
          className="w-full border rounded p-2"
          placeholder="Ejemplo: Presentación festiva, acompañar con salsa especial..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </div>

      {/* Llista ingredientes */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Ingredientes</h2>
        {ingredientes.length === 0 && <p className="italic text-gray-600">No hay ingredientes agregados.</p>}
        <ul className="space-y-2">
          {ingredientes.map((ing, i) => (
            <li
              key={i}
              className="border rounded p-3 flex justify-between items-center bg-gray-50"
            >
              <div>
                {`${ing.accion} ${ing.especifico} (${ing.peso * comensales}g)`}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => editarIngrediente(i)}
                  className="text-blue-600 hover:underline"
                  aria-label={`Editar ingrediente ${i + 1}`}
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarIngrediente(i)}
                  className="text-red-600 hover:underline"
                  aria-label={`Eliminar ingrediente ${i + 1}`}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Exportar PDF */}
      <div className="text-center">
        <button
          onClick={handleExportPDF}
          disabled={ingredientes.length === 0}
          className={`mt-6 px-6 py-3 rounded font-semibold text-white ${
            ingredientes.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Exportar PDF
        </button>
      </div>
    </div>
  );
}

export default App;
