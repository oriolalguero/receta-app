import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "./App.css"; // Assumeix que aquí poses els estils

const ingredientesGenericos = {
  Pimiento: ["Pimiento verde", "Pimiento rojo", "Pimiento amarillo"],
  Cebolla: ["Cebolla blanca", "Cebolla morada"],
};

const acciones = ["Cortar", "Saltear", "Hervir", "Freír", "Hornear"];

function App() {
  const [ingredientes, setIngredientes] = useState(() => {
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

  useEffect(() => {
    localStorage.setItem("ingredientes", JSON.stringify(ingredientes));
  }, [ingredientes]);

  useEffect(() => {
    localStorage.setItem("comensales", comensales.toString());
  }, [comensales]);

  useEffect(() => {
    localStorage.setItem("notas", notas);
  }, [notas]);

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
      const nuevos = [...ingredientes];
      nuevos[editIndex] = nuevoIngrediente;
      setIngredientes(nuevos);
      setEditIndex(null);
    } else {
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
    if (val < 1) return;
    setComensales(val);
  };

  return (
    <div className="container">
      <h1 className="title">Crear Receta</h1>

      <div className="form-grid">
        <div className="form-group">
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

        <div className="form-group">
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

        <div className="form-group">
          <label>Peso (g)</label>
          <input
            type="number"
            min="0"
            value={nuevoIngrediente.peso}
            onChange={(e) =>
              setNuevoIngrediente({ ...nuevoIngrediente, peso: parseFloat(e.target.value) || 0 })
            }
          />
        </div>

        <div className="form-group">
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

        <div className="form-group">
          <button
            onClick={agregarIngrediente}
            disabled={!!validarIngrediente()}
            className={validarIngrediente() ? "btn-disabled" : "btn-primary"}
          >
            {editIndex !== null ? "Guardar Cambios" : "Agregar Ingrediente"}
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="small-form-group">
        <label>Número de comensales</label>
        <input
          type="number"
          min="1"
          value={comensales}
          onChange={handleComensalesChange}
        />
      </div>

      <div className="form-group">
        <label>Notas para la receta</label>
        <textarea
          rows="3"
          placeholder="Ejemplo: Presentación festiva, acompañar con salsa especial..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </div>

      <div>
        <h2>Ingredientes</h2>
        {ingredientes.length === 0 && <p>No hay ingredientes agregados.</p>}
        <ul className="ingredientes-list">
          {ingredientes.map((ing, i) => (
            <li key={i} className="ingrediente-item">
              <span>{`${ing.accion} ${ing.especifico} (${ing.peso * comensales}g)`}</span>
              <div>
                <button onClick={() => editarIngrediente(i)} className="btn-link">Editar</button>
                <button onClick={() => eliminarIngrediente(i)} className="btn-link btn-danger">Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="centered">
        <button
          onClick={handleExportPDF}
          disabled={ingredientes.length === 0}
          className={ingredientes.length === 0 ? "btn-disabled" : "btn-success"}
        >
          Exportar PDF
        </button>
      </div>
    </div>
  );
}

export default App;
