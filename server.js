const express = require('express');
const cors = require('cors');
const pool = require('./config/config_DB');
const app = express();
app.use(cors());

app.get('/puntos', async (req, res) => {
    const result = await pool.query(`
        SELECT id, nombre, tipo, imagen, descripcion, telefono, horario, ST_AsGeoJSON(geom) AS geom FROM lugares;
    `);
    const geojson = {
        type: "FeatureCollection",
        features: result.rows.map(row => ({
            type: "Feature",
            geometry: JSON.parse(row.geom),
            properties: { 
                id: row.id, 
                nombre: row.nombre, 
                tipo: row.tipo, 
                imagen: row.imagen, 
                descripcion: row.descripcion, 
                telefono: row.telefono, 
                horario: row.horario
            }
        }))
    };
    res.json(geojson);
});

app.get('/poligonos', async (req, res) => {
    const result = await pool.query(`
        SELECT id, nombre, tipo, imagen, descripcion, acceso, ST_AsGeoJSON(geom) AS geom FROM zonas;
    `);
    const geojson = {
        type: "FeatureCollection",
        features: result.rows.map(row => ({
            type: "Feature",
            geometry: JSON.parse(row.geom),
            properties: { 
                id: row.id, 
                nombre: row.nombre, 
                tipo: row.tipo, 
                imagen: row.imagen, 
                descripcion: row.descripcion, 
                acceso: row.acceso
            }
        }))
    };
    res.json(geojson);
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));