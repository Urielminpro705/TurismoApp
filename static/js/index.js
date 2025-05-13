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

var filtros = () => {
    var filtros = [];
    checkBoxes.forEach((checkBox) => {
        if (checkBox.checked) {
            filtros.push(checkBox.value);
        }
    })
    return filtros;
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
const map = L.map('map').setView([19.4326, -99.1332], 13);
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

function toggleCont(header) {
    const cont_info = header.parentElement.querySelector(".cont-desplegable-info");
    const altura = cont_info.scrollHeight;
    const isOpened = cont_info.getAttribute("data-isopened") === "true" ? true : false;

    if (isOpened) {
        cont_info.style.height = altura + "px";
        setTimeout(function () {
            cont_info.style.height = "0px";
        }, 10);
        cont_info.setAttribute("data-isopened", false);
    } else {
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

function cambiarPantalla(pantallaSiguiente) {
    pantallaSiguiente.hidden = false;
    setTimeout(function () {
        pantallaSiguiente.style.right = "0px";
    },10);
    const duracionMs = obtenerTiempoAnimacion(pantallaSiguiente);
    setTimeout(function () {
        pantallaSiguiente.classList.add("cont-bar-display-active");
        pantallaActual.hidden = true;
        pantallaActual.classList.remove("cont-bar-display-active");
        pantallaActual = pantallaSiguiente;
        pantallaActual.style.removeProperty("right");
    },duracionMs);
}

btns_secciones.forEach((btn) => {
    btn.addEventListener("click", function() {
        eliminarClase("btn-bar-seccion-active");
        btn.classList.add("btn-bar-seccion-active");
        main.classList.remove("con-bar-lateral-closed");
        const idPantalla = btn.getAttribute("data-id");
        const pantallaSiguiente = document.getElementById(idPantalla);
        if (pantallaSiguiente != pantallaActual) {
            cambiarPantalla(pantallaSiguiente);
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
        dibujarPuntosPoligonos(data, capaPoligonos)
    });

fetch('http://localhost:3000/puntos')
    .then(res => res.json())
    .then(data => {
        puntos = data;
        dibujarPuntosPoligonos(data, capaPuntos)
    });