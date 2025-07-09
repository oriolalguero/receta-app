import React, { useState } from "react";
import jsPDF from "jspdf";

const ingredientesGenericos = {
  Pimiento: ["Pimiento verde", "Pimiento rojo", "Pimiento amarillo"],
  Cebolla: ["Cebolla blanca", "Cebolla morada"],
};

const acciones = ["Cortar", "Saltear", "Hervir", "Freír", "Hornear"];

function App() {
  const [ingredientes, setIngredientes] = useState([]);
  const [nuevoIngrediente, setNuevoIngrediente] = useState({ generico: "", especifico: "", peso: 0, accion: "" });
  const [comensales, setComensales] = useState(1);

  const agregarIngrediente = () => {
    if (nuevoIngrediente.generico && nuevoIngrediente.especifico && nuevoIngrediente.peso > 0 && nuevoIngrediente.accion) {
      setIngredientes([...ingredientes, nuevoIngrediente]);
      setNuevoIngrediente({ generico: "", especifico: "", peso: 0, accion: "" });
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Receta", 10, 10);
    ingredientes.forEach((ing, i) => {
      const texto = `${ing.accion} ${ing.especifico} (${ing.peso * comensales}g)`;
      doc.text(texto, 10, 20 + i * 10);
    });
    doc.save("receta.pdf");
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Crear Receta</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label>Ingrediente Genérico</label>
          <select
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
          <label>Ingrediente Específico</label>
          <select
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
          <label>Peso (g)</label>
          <input
            type="number"
            value={nuevoIngrediente.peso}
            onChange={(e) =>
              setNuevoIngrediente({ ...nuevoIngrediente, peso: parseFloat(e.target.value) || 0 })
            }
          />
        </div>

        <div>
          <label>Acción</label>
          <select
            value={nuevoIngrediente.accion}
            onChange={(e) => setNuevoIngrediente({ ...nuevoIngrediente, accion: e.target.value })}
          >
            <option value="">Selecciona una</option>
            {acciones.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={agregarIngrediente}>Agregar Ingrediente</button>

      <div className="mt-6">
        <label>Número de comensales</label>
        <input
          type="number"
          value={comensales}
          onChange={(e) => setComensales(parseInt(e.target.value) || 1)}
        />
      </div>

      <div className="mt-6 space-y-2">
        <h2 className="text-2xl font-semibold">Ingredientes</h2>
        {ingredientes.map((ing, i) => (
          <div key={i} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
            {`${ing.accion} ${ing.especifico} (${ing.peso * comensales}g)`}
          </div>
        ))}
      </div>

      <button onClick={handleExportPDF} className="mt-6">
        Exportar PDF
      </button>
    </div>
  );
}

export default App;