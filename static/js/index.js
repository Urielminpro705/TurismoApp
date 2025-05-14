const headers_desplegables = document.querySelectorAll(".btn-header");
const btns_secciones = document.querySelectorAll(".btn-bar-seccion");
const menu_lateral = document.getElementById("cont-bar-lateral");
const main = document.getElementById("main");
var pantallaActual = document.getElementById("cont-pantalla-inicio");
const checkBoxes = document.querySelectorAll(".filtro");
const capaPoligonos = L.layerGroup();
const capaPuntos = L.layerGroup();
var poligonos = null;
var puntos =  null;
var marker_temporal = null;
var marker_ubicacion = null;
var data_temporal_ubicacion = null;
var ubicacion_actual = null;
var listPuntos = [];
var listPolys = [];
var steps = 0;
let pantallaCooldownActivo = false;

var filtros = () => {
    var filtros = [];
    checkBoxes.forEach((checkBox) => {
        if (checkBox.checked) {
            filtros.push(checkBox.value);
        }
    })
    return filtros;
}

// La ubicaicion se pone de forma manual

// navigator.geolocation.getCurrentPosition(
//   function (position) {
//     const lat = position.coords.latitude;
//     const lng = position.coords.longitude;

//     ubicacion_actual = {
//         lat: lat,
//         long: lng
//     }
//   },
//   function (error) {
//     console.error("Error al obtener la ubicación:", error.message);
//   }
// );


var mostrarUbicacionActual = () => {
    document.querySelector(".direccion-actual-txt").textContent = ubicacion_actual.nombre;
    document.querySelector(".direccion-actual-cords").textContent = `[${ubicacion_actual.lat}, ${ubicacion_actual.lon}]`;
}

const mapas = [
    {
        nombre: "normal",
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: null
    },
    {
        nombre: "limpio",
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        attribution: "&copy; OpenStreetMap & CartoDB"
    },
    {
        nombre: "satelital",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles © Esri"
    }
]
const map = L.map('map').setView([21.1219650, -101.6829766], 13);
var capaMapaActual = L.tileLayer(mapas[0].url, {
    attribution: mapas[0].attribution
}).addTo(map);

document.querySelectorAll(".btn-vista-mapa").forEach((btn) => {
    btn.addEventListener("click", function () {
        var mapaInfo = {}
        switch(btn.getAttribute("data-id")) {
            case "normal":
                mapas.forEach((mapa) => {
                    if (mapa.nombre == "normal"){
                        mapaInfo = mapa;
                    }
                });
                break;
            case "limpio":
                mapas.forEach((mapa) => {
                    if (mapa.nombre == "limpio"){
                        mapaInfo = mapa;
                    }
                });
                break;
            case "satelital":
                mapas.forEach((mapa) => {
                    if (mapa.nombre == "satelital"){
                        mapaInfo = mapa;
                    }
                });
                break;

        }
        map.removeLayer(capaMapaActual);
        eliminarClase("btn-vista-mapa-selected");
        btn.classList.toggle("btn-vista-mapa-selected");
        capaMapaActual = L.tileLayer(mapaInfo.url, {
            attribution: mapaInfo.attribution
        }).addTo(map);
    })
});

function eliminarClase(clase) {
    document.querySelectorAll("." + clase).forEach((elemento) => {
        elemento.classList.remove(clase);
    });
}

checkBoxes.forEach((checkBox) => {
    checkBox.addEventListener("change", () => {
        dibujarPuntosPoligonos(poligonos, capaPoligonos);
        dibujarPuntosPoligonos(puntos, capaPuntos);
        loadLocations(puntos, poligonos)
    });
});

headers_desplegables.forEach((header) => {
    header.addEventListener("click", function() {
        toggleCont(header);
        const hasArrow = header.getAttribute("data-hasarrow") === "true" ? true : false;
        if (hasArrow) {
            const icono = header.querySelector("i");
            icono.style.transform = icono.style.transform === "rotate(180deg)" ? "rotate(0deg)" : "rotate(180deg)";
        }
    });
});

function volarHacia(lat, lng, zoom=18){
    map.flyTo([lat, lng], zoom);
}

function toggleCont(header) {
    const cont_info = header.parentElement.querySelector(".cont-desplegable-info");
    const altura = cont_info.scrollHeight;
    const isOpened = cont_info.getAttribute("data-isopened") === "true" ? true : false;

    if (isOpened) {
        console.log(altura);
        cont_info.style.height = altura + "px";
        setTimeout(function () {
            cont_info.style.height = "0px";
        }, 10);
        cont_info.setAttribute("data-isopened", false);
    } else {
        console.log(altura);
        cont_info.style.height = altura + "px";
        const duracionMs = obtenerTiempoAnimacion(cont_info);
        setTimeout(function () {
            cont_info.style.height = "auto";
        }, duracionMs);
        cont_info.setAttribute("data-isopened", true);
    }
}

function obtenerTiempoAnimacion(componente) {
    const estilos = getComputedStyle(componente);
    const duraciones = estilos.transitionDuration.split(',').map(d => d.trim());
    const duracion = duraciones[0];
    var duracionMs = 3000;
    if (duracion.includes('ms')) {
        duracionMs = parseFloat(duracion);
    } else if (duracion.includes('s')) {
        duracionMs = parseFloat(duracion) * 1000;
    }

    return duracionMs;
}

document.querySelectorAll(".btn-menu").forEach((btn) => {
    btn.addEventListener("click", function() {
        eliminarClase("btn-bar-seccion-active");
        main.classList.add("con-bar-lateral-closed");
    });
});

function cambiarPantalla(pantallaSiguienteID) {
    if (pantallaCooldownActivo) return;

    pantallaCooldownActivo = true;

    const pantallaSiguiente = document.getElementById(pantallaSiguienteID)
    pantallaSiguiente.hidden = false;

    btns_secciones.forEach((btn) => {
        if (btn.getAttribute("data-id") == pantallaSiguienteID) {
            eliminarClase("btn-bar-seccion-active");
            btn.classList.add("btn-bar-seccion-active");
            main.classList.remove("con-bar-lateral-closed");
        }
    });

    setTimeout(function () {
        pantallaSiguiente.style.right = "0px";
        pantallaSiguiente.style.zIndex = 3;
    },10);
    const duracionMs = obtenerTiempoAnimacion(pantallaSiguiente);
    setTimeout(function () {
        pantallaSiguiente.classList.add("cont-bar-display-active");
        pantallaActual.hidden = true;
        pantallaActual.classList.remove("cont-bar-display-active");
        pantallaActual = pantallaSiguiente;
        pantallaActual.style.removeProperty("right");
        pantallaActual.style.removeProperty("z-index");

        pantallaCooldownActivo = false;
    },duracionMs);
}

btns_secciones.forEach((btn) => {
    btn.addEventListener("click", function() {
        if (pantallaCooldownActivo) return
        eliminarClase("btn-bar-seccion-active");
        btn.classList.add("btn-bar-seccion-active");
        main.classList.remove("con-bar-lateral-closed");
        const idPantalla = btn.getAttribute("data-id");
        const pantallaSiguiente = document.getElementById(idPantalla);
        if (pantallaSiguiente != pantallaActual) {
            cambiarPantalla(idPantalla);
        }
    });
});

function dibujarPuntosPoligonos(data, capa) {
    capa.clearLayers();
    const filtrosActivos = filtros();

    L.geoJSON(data, {
        filter: function (feature) {
            return filtrosActivos.includes(feature.properties.tipo);
        },
        style: function (feature) {
            let color = "#3388ff";

            switch (feature.properties.tipo) {
                case "zona_natural":
                    color = "#1fb471a5";
                    break;
                case "zona_turistica":
                    color = "#00eaffb3";
                    break;
            }

            return {
                color: color,
                fillColor: color,
                weight: 2,
                opacity: 1,
                fillOpacity: 0.6
            };
        },

        pointToLayer: (feature, latlng) =>{

            let url = "";

            switch(feature.properties.tipo) {
                case "zona_natural": url = "https://cdn-icons-png.flaticon.com/512/472/472521.png"; break;
                case "atraccion" : url = "https://cdn-icons-png.flaticon.com/512/1313/1313129.png"; break;
                case "hotel" : url = "https://cdn-icons-png.flaticon.com/512/1889/1889519.png"; break;
                case "centro_info" : url = "https://cdn-icons-png.flaticon.com/512/4010/4010565.png"; break;
                case "restaurante" : url = "https://cdn-icons-png.flaticon.com/512/1589/1589709.png"; break;
                case "zona_turistica" : url = "https://cdn-icons-png.flaticon.com/512/7205/7205797.png"; break;
                default: url = "https://cdn-icons-png.flaticon.com/512/7708/7708571.png"; break;
            
            }

            const iconoPersonalizado = L.icon({
                iconUrl: url,
                iconSize: [40, 40], 
                iconAnchor: [16, 32], 
                popupAnchor: [0, -32] 
            });

            return L.marker(latlng, { icon: iconoPersonalizado });
        },

        onEachFeature: (feature, layer) => {
            layer.bindPopup(feature.properties.nombre);
            capa.addLayer(layer);
        }
    });
    if (!map.hasLayer(capa)) {
        capa.addTo(map);
    }
}

fetch('http://localhost:3000/poligonos')
    .then(res => res.json())
    .then(data => {
        poligonos = data;
        loadLocations(puntos, poligonos)
        dibujarPuntosPoligonos(data, capaPoligonos)
    });

fetch('http://localhost:3000/puntos')
    .then(res => res.json())
    .then(data => {
        puntos = data;
        loadLocations(puntos, poligonos)
        dibujarPuntosPoligonos(data, capaPuntos)
    });

async function convertirDireccion(direccion) {
    if (direccion) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.length > 0) {
                return data;
            } else {
                return null
            }
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }
}

function agregarMarkerTemporal(lat, lon, titulo) {
    if (marker_temporal) {
        marker_temporal.remove();
        marker_temporal = null;
    }
    const iconoPersonalizado = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/7708/7708571.png',
        iconSize: [40, 40],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
    map.flyTo([lat, lon], 15);
    marker_temporal = L.marker([lat, lon], {icon: iconoPersonalizado}).addTo(map).bindPopup(`
        <b>¿Quieres guardar el marcador?</b><p>${titulo}</p><p>[${lat}, ${lon}]</p>
        <button class="btn-agregar-marker">Agregar</button>
        <button class="btn-eliminar-marker">Cancelar</button>
    `).openPopup();
}

async function buscarUbicacion() {
    const input = document.getElementById("barra-busqueda");
    const direccion = input.value;
    if (direccion) {
        var data = await convertirDireccion(direccion);
        if (data != null) {
            data_temporal_ubicacion = data;
            agregarMarkerTemporal(data[0].lat, data[0].lon, data[0].display_name);
        } else {
            alert("No se encontraron resultados");
        }
    } else {
        alert("Por favor ingresa una dirección");
    }
}

document.getElementById("btn-busqueda").addEventListener("click", function() {
    buscarUbicacion();
});

document.getElementById("barra-busqueda").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        buscarUbicacion();
    }
});

document.addEventListener("click", function(event) {
    if (event.target && event.target.classList.contains("btn-agregar-marker")) {
        agregarMarker();
    } else if (event.target && event.target.classList.contains("btn-eliminar-marker")){
        marker_temporal.remove();
        marker_temporal = null;
    }
});

function agregarMarker() {
    if (marker_temporal) {
        if (marker_ubicacion) {
            marker_ubicacion.remove();
        }
        marker_temporal.bindPopup(`
            <b>${data_temporal_ubicacion[0].display_name}</b><p>[${data_temporal_ubicacion[0].lat}, ${data_temporal_ubicacion[0].lon}]</p>
        `).openPopup();
        marker_ubicacion = marker_temporal;
        ubicacion_actual = {
            lat: parseFloat(data_temporal_ubicacion[0].lat),
            lon: parseFloat(data_temporal_ubicacion[0].lon),
            nombre: data_temporal_ubicacion[0].display_name
        };
        mostrarUbicacionActual();
        const { puntosVecinos, poligonosVecinos } = encontrarVecinos(2);
        loadLocations(puntosVecinos, poligonosVecinos, ".cont-desplegable-ubicaciones-cercanas");
        loadLocations(puntos, poligonos);
        marker_temporal = null;
    }
}

function calcularDistancia(destinoLat, destinoLng) {
    if (ubicacion_actual) {
        console.log(ubicacion_actual.lon)
        console.log(ubicacion_actual.lat)
        const from = turf.point([ubicacion_actual.lon, ubicacion_actual.lat]);
        const to = turf.point([destinoLng, destinoLat]);
    
        const distancia = turf.distance(from, to, { units: 'kilometers' });
    
        return distancia.toFixed(2);
    } else {
        return 0.00;
    }
}

//#region CARGAR Card-Locations

    function loadLocations(puntos, polys, id = '#cont-locations'){
        console.log("Se cargan los load locations");

        if(puntos == null || polys == null){
            return;
        }

        listPuntos = puntos.features.map(point => {
            console.log("se agrego el id: "+point.id)
            const [lng, lat] = point.geometry.coordinates;
            return{
                ...point.properties,
                lat,
                lng,
                type: "point",
                distance: calcularDistancia(lat, lng)
            }
        });

        listPolys = polys.features.map(point => {
            const centroide = turf.centroid(point) 
            const [lng, lat] = centroide.geometry.coordinates;
            return{
                ...point.properties,
                lat,
                lng,
                type: "poly",
                distance: calcularDistancia(lat, lng)
            }
        });

        console.log("||| PUNTOS:")
        console.log(listPuntos)
        const container = document.querySelector(id);
        let htmlContent = "";
        const filters = filtros();

        container.innerHTML = "";

        for (let c = 0; c < listPuntos.length; c++) {

            const type = listPuntos[c].tipo;
            const descr = (listPuntos[c].descripcion.length > 40) ? listPuntos[c].descripcion.slice(0, 40)+"..." : listPuntos[c].descripcion;
            const display = (filters.includes(type)) ? '' : 'style="display:none;"';

            htmlContent += `
                <div class="card-location" data-id="${listPuntos[c].id}" ${display} data-lat="${listPuntos[c].lat}" data-lng="${listPuntos[c].lng}" data-type="${listPuntos[c].type}">
                    <div class="card-location-img" style="background-image:url(${listPuntos[c].imagen})"></div>
                    <div class="card-location-top">
                        <p>${listPuntos[c].tipo}</p>
                        <p><i class="fa-solid fa-map-location-dot"></i> A ${listPuntos[c].distance} km</p>
                    </div>
                    <p class="card-location-title">${listPuntos[c].nombre}</p>
                    <p class="card-location-sub">${descr}</p>
                </div>`;    
        }

        for (let c = 0; c < listPolys.length; c++) {

            const type = listPolys[c].tipo;
            const descr = (listPolys[c].descripcion.length > 40) ? listPolys[c].descripcion.slice(0, 40)+"..." : listPolys[c].descripcion;
            const display = (filters.includes(type)) ? '' : 'style="display:none;"';

            htmlContent += `
                <div class="card-location" data-id="${listPolys[c].id}" ${display} data-lat="${listPolys[c].lat}" data-lng="${listPolys[c].lng}" data-type="${listPolys[c].type}">
                    <div class="card-location-img" style="background-image:url(${listPolys[c].imagen})"></div>
                    <div class="card-location-top">
                        <p>${listPolys[c].tipo}</p>
                        <p><i class="fa-solid fa-map-location-dot"></i> A ${listPolys[c].distance} km</p>
                    </div>
                    <p class="card-location-title">${listPolys[c].nombre}</p>
                    <p class="card-location-sub">${descr}</p>
                </div>`;    
        }

        container.innerHTML += htmlContent;
    }

    // FUNCION DEPRECADA
    function checkForLoadingCards(){ /// FUNCION DEL DEMONIO SUPER INECESARIA PERO NECESARIA
        steps+=1;
        if(steps == 2){
            loadLocations(puntos, poligonos)
        }
    }

//#endregion

//#region TODO Locacion Detail

function detectarClickCardUbicacion(event) {
    const card = event.target.closest(".card-location");
    if (card) {
        const id = card.getAttribute('data-id')
        const lng = card.getAttribute('data-lng')
        const lat = card.getAttribute('data-lat')
        const type = card.getAttribute('data-type')
        console.log("se mueve a pantalla detalles: "+id);
        cambiarPantalla("cont-pantalla-detalles");
        volarHacia(lat, lng);
        updateDetail(id, type)
    }
}

document.getElementById("cont-locations").addEventListener("click", function(event) {
    detectarClickCardUbicacion(event);
});

document.querySelector(".cont-desplegable-ubicaciones-cercanas").addEventListener("click", function(event) {
    detectarClickCardUbicacion(event);
});

function updateDetail(id, type){
    const objList = (type == "poly") ? listPolys : listPuntos;
    const punto = objList.find(punt => punt.id == id);
    const contImg = document.querySelector('#img-detail'); 
    contImg.style.backgroundImage = `url('${punto.imagen}')`;
    contImg.innerHTML = "";
    document.querySelector('#title-detail').textContent = punto.nombre;
    document.querySelector('#text-detail').textContent = punto.descripcion;
    document.querySelector('#km-detail').textContent = punto.distance;

    const props = (type == "poly") ? {Acceso: punto.acceso} : {Telefono: punto.telefono, Horario: punto.horario};
    const contProps = document.querySelector('#props-detail');
    contProps.innerHTML = "";
    
    for (let key in props) {
        const valor = props[key];
        contProps.innerHTML += `
            <p class="sub-title-detail">${key}:</p>
            <p class="sub-detail">${valor}</p>
        `;
    }

}

//#endregion

function encontrarVecinos(distancia) {
    if (ubicacion_actual) {        
        const puntoBase = turf.point([ubicacion_actual.lon, ubicacion_actual.lat]);
        const buffer = turf.buffer(puntoBase, distancia, { units: 'kilometers' });

        const vecinosPuntos = puntos.features.filter(p => 
            turf.booleanPointInPolygon(p, buffer)
        );

        const vecinosPoligonos = poligonos.features.filter(poly => {
            const tipo = poly.geometry.type;
            return tipo === "Polygon" || tipo === "MultiPolygon" ? turf.booleanIntersects(poly, buffer) : false;
        });

        return {
            puntosVecinos: {
                type: "FeatureCollection",
                features: vecinosPuntos
            },
            poligonosVecinos: {
                type: "FeatureCollection",
                features: vecinosPoligonos
            }
        }
    }
}


// function agruparPuntosPorZoom() {
//     const zoom = map.getZoom();
//     const distancia = zoom > 14 ? 100 : zoom > 12 ? 500 : 1000;
//     const coleccionPuntos = turf.featureCollection(puntos.features);

//     const clustered = turf.clustersDbscan(coleccionPuntos, distancia, { units: 'meters' });

//     const clustersFiltrados = {};  // agrupamos los puntos por id de cluster

//     clustered.features.forEach(feature => {
//         const clusterId = feature.properties.cluster;
//         if (clusterId !== undefined && clusterId !== null) {
//             if (!clustersFiltrados[clusterId]) clustersFiltrados[clusterId] = [];
//             clustersFiltrados[clusterId].push(feature);
//         }
//     });

//     const puntosClusterizados = [];

//     // Generamos un punto central por cada grupo de puntos
//     Object.values(clustersFiltrados).forEach(cluster => {
//         const centroide = turf.centroid(turf.featureCollection(cluster));
//         centroide.properties.tipo = cluster[0].properties.tipo;
//         centroide.properties.nombre = "Cluster de " + cluster.length + " puntos";
//         puntosClusterizados.push(centroide);
//     });

//     // Agregar los puntos no agrupados (cluster = null)
//     clustered.features.forEach(feature => {
//         if (feature.properties.cluster === null) {
//             puntosClusterizados.push(feature);
//         }
//     });

//     const agrupados = turf.featureCollection(puntosClusterizados);
//     dibujarPuntosPoligonos(agrupados, capaPuntos);
// }

// map.on('zoomend', function() {
//     agruparPuntosPorZoom();
// });

// agruparPuntosPorZoom();