const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();

// Configuración
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta base
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API funcionando correctamente"
  });
});

// Ruta usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios");

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener usuarios"
    });
  }
});

// Ruta Login 
app.post("/login", async (req, res) => {
  try {
    const { usuarioCorreo, contrasena } = req.body;

    if (!usuarioCorreo || !contrasena) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios"
      });
    }

    const query = `
      SELECT * FROM usuarios
      WHERE (usuario = $1 OR correo = $1) AND contrasena = $2
    `;

    const result = await pool.query(query, [usuarioCorreo, contrasena]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Credenciales incorrectas"
      });
    }

    const usuario = result.rows[0];

    res.status(200).json({
      message: "Login exitoso",
      usuario: {
        id: usuario.id,
        usuario: usuario.usuario,
        correo: usuario.correo
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al iniciar sesión"
    });
  }
});

// Ruta crear perfil
app.post("/perfil", async (req, res) => {
  try {
    const { usuario_id, nombre, apellido, edad, correo, telefono } = req.body;

    if (!usuario_id || !nombre || !apellido || !edad || !correo || !telefono) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios"
      });
    }

    if (isNaN(edad)) {
      return res.status(400).json({
        message: "La edad debe ser numérica"
      });
    }

    if (!/^[0-9]{8}$/.test(telefono)) {
      return res.status(400).json({
        message: "El teléfono debe tener 8 dígitos"
      });
    }

    const query = `
      INSERT INTO perfil (usuario_id, nombre, apellido, edad, correo, telefono)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [usuario_id, nombre, apellido, edad, correo, telefono];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Perfil creado correctamente",
      perfil: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al crear el perfil"
    });
  }
});

// Ruta obtener perfil
app.get("/perfil/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const query = `
      SELECT * FROM perfil WHERE usuario_id = $1
    `;

    const result = await pool.query(query, [usuarioId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Perfil no encontrado"
      });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener el perfil"
    });
  }
});

// Ruta actualizar perfil
app.put("/perfil/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { nombre, apellido, edad, correo, telefono } = req.body;

    // validaciones
    if (!nombre || !apellido || !edad || !correo || !telefono) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios"
      });
    }

    if (isNaN(edad)) {
      return res.status(400).json({
        message: "La edad debe ser numérica"
      });
    }

    if (!/^[0-9]{8}$/.test(telefono)) {
      return res.status(400).json({
        message: "El teléfono debe tener 8 dígitos"
      });
    }

    const query = `
      UPDATE perfil
      SET nombre = $1, apellido = $2, edad = $3, correo = $4, telefono = $5
      WHERE usuario_id = $6
      RETURNING *
    `;

    const values = [nombre, apellido, edad, correo, telefono, usuarioId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Perfil no encontrado"
      });
    }

    res.status(200).json({
      message: "Perfil actualizado de forma correcta",
      perfil: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al actualizar el perfil"
    });
  }
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    message: "Ruta no encontrada"
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});