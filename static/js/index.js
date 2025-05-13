const headers_desplegables = document.querySelectorAll(".btn-header");
const btns_secciones = document.querySelectorAll(".btn-bar-seccion");
const menu_lateral = document.getElementById("cont-bar-lateral");
const main = document.getElementById("main");
var pantallaActual = document.getElementById("cont-pantalla-inicio");
const checkBoxes = document.querySelectorAll(".filtro");
var filtros = () => {
    var filtros = [];
    checkBoxes.forEach((checkBox) => {
        if (checkBox.checked) {
            filtros.push(checkBox.value);
        }
    })
    console.log(filtros)
    return filtros;
}
const map = L.map('map').setView([19.4326, -99.1332], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

checkBoxes.forEach((checkBox) => {
    checkBox.addEventListener("change", filtros)
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

// function obtenerPadding(componente) {
//     const estilos = getComputedStyle(componente);
//     return {
//         paddingTop: parseFloat(estilos.paddingTop),
//         paddingLeft: parseFloat(estilos.paddingLeft),
//         paddingRight: parseFloat(estilos.paddingRight),
//         paddingBottom: parseFloat(estilos.paddingBottom),
//     };
// }

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
        desactivarBotonesSecciones();
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
        desactivarBotonesSecciones();
        btn.classList.add("btn-bar-seccion-active");
        main.classList.remove("con-bar-lateral-closed");
        const idPantalla = btn.getAttribute("data-id");
        const pantallaSiguiente = document.getElementById(idPantalla);
        if (pantallaSiguiente != pantallaActual) {
            cambiarPantalla(pantallaSiguiente);
        }
    });
});

function desactivarBotonesSecciones() {
    btns_secciones.forEach((btn) => {
        btn.classList.remove("btn-bar-seccion-active");
    });
}

fetch('http://localhost:3000/poligonos')
    .then(res => res.json())
    .then(data => {
        L.geoJSON(data, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(feature.properties.nombre);
        }
        }).addTo(map);
    });