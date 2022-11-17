const dateControl = document.querySelector('input[type="date"]')
const geolimit = document.getElementById('sellimit')
const lista = document.getElementById('lista')
const btnConsultar = document.getElementById('btnConsultar')
const buscar = document.getElementById('buscar')
const calcular = document.getElementById('calcular')
const contenidobuscar = document.getElementById('contenidobuscar')
const contenidocalcular = document.getElementById('contenido-calcular')
const inputkwh = document.getElementById('input-kwh')
const btncalcularkwh = document.getElementById('calcular-kwh')
const resultadoenergia = document.getElementById('resultado-energia')
// const literaleuroshora = document.getElementById('literal-euros-hora')
const resultadocalculo = document.getElementById('resultado-calculo')




// -----------Registrar el Service Worker------------------
let swLocation = "./swtarifaluz.js";
if (navigator.serviceWorker) {
	navigator.serviceWorker.register(swLocation);
} else {
	console.log("no se ha podido registrar el SW " + navigator.serviceWorker)
}

let todoPrecios = [];
let precios = [];
resultadocalculo.classList.add("ocultar")
resultadocalculo.classList.remove("mostrar")
activarCalcular(precios)

const fecha = new Date();
dateControl.value = fecha.toJSON().slice(0, 10);

geolimit.addEventListener("click", (event) => {
	event.preventDefault();
	lista.innerHTML = '';
	maxmin.innerHTML = '';
});
dateControl.addEventListener("click", (event) => {
	lista.innerHTML = '';
	maxmin.innerHTML = '';
});

btnConsultar.addEventListener("click", (event) => {
	event.preventDefault();
	const startdate = dateControl.value + "T00:00";
	const enddate = dateControl.value + "T23:59";
	cargarPrecios(startdate, enddate);
});


const cargarPrecios = async (startdate, enddate) => {
	try {
		btnConsultar.setAttribute("disabled", "")
		btnConsultar.setAttribute("aria-busy", "true")
		mostrarLoading();
		let imagen = '';
		lista.innerHTML = ''

		const apirest = `https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real?start_date=${startdate}&end_date=${enddate}&geo_limit=${geolimit.value}&time_trunc=hour`
		const respuesta = await fetch(apirest);
		ocultarLoading();
		btnConsultar.removeAttribute('disabled')
		btnConsultar.removeAttribute('aria-busy')
		if (respuesta.status === 200) {
			const datos = await respuesta.json();
			todoPrecios = datos
			precios = [];
			datos.included[0].attributes.values.forEach(precio => {
				precios.push((precio.value / 1000).toFixed(5));
			});
			let min = Math.min(...precios);
			let max = Math.max(...precios);
			let med = precios.reduce((a, b) => a + parseFloat(b, 10), 0)
			med = med / 24;
			med = (Math.round(med * 1000000) / 1000000).toPrecision(5)
			let cuarto = (+med + min) / 2;
			let minimoMaximo = `
			<div id="minimo" class="minimo"><p>MÍNIMO</p> <p>${min} €/kwh</p></div>
			<div id="medio" class="medio"><p>MEDIA</p> <p>${med} €/kwh</p></div>
			<div id="maximo" class="maximo"><p>MÁXIMO</p> <p>${max} €/kwh</p></div>`;
			maxmin.innerHTML = minimoMaximo;
			let preciosHora = '';
			let colorhora = ''
			let horanext = ''
			datos.included[0].attributes.values.forEach(hora => {
				let valor = (hora.value / 1000).toFixed(5);
				if (valor < cuarto) {
					colorhora = 'minimo'
					imagen = './img/cuadradoVerde.png'
				} else if (valor < med) {
					colorhora = 'medio'
					imagen = './img/cuadradoNaranja.png'
				} else {
					colorhora = 'maximo'
					imagen = './img/puntorojo.png'
				}
				horanext = +hora.datetime.slice(11, 13) + 1
				if ((String(horanext).length) == 1) {
					horanext = '0' + horanext
				}

				preciosHora += `
				<div class="itempreciohora">
					<img src="${imagen}">
					<span1> ${hora.datetime.slice(11, 13)}h-${horanext}h: <span class="${colorhora}">  ${(hora.value / 1000).toFixed(5)} €/kWh </span></span1>
				</div>`;
			});

			document.getElementById('lista').innerHTML = preciosHora;

		} else if (respuesta.status === 401) {
			ocultarLoading();
			lista.innerHTML = 'Precios no encontrados';
		} else if (respuesta.status === 404) {
			ocultarLoading();
			lista.innerHTML = 'Precios no encontrados';
		} else if (respuesta.status === 502) {
			ocultarLoading();
			lista.innerHTML = 'No hay datos para los filtros seleccionados.'
		} else {
			ocultarLoading();
			lista.innerHTML = 'Hubo un error y no sabemos que paso';
		}

	} catch (error) {
		ocultarLoading();
		lista.innerHTML = 'Hubo un error y no sabemos que paso';
		console.log(error);
	}

}
function ocultarLoading() {
	document.getElementById("loading").style.display = "none";
}
function mostrarLoading() {
	document.getElementById("loading").style.display = "block";
}

// ---------- calcular --------------
inputkwh.addEventListener("click", (evt) => {
	resultadocalculo.classList.add("ocultar")
	resultadocalculo.classList.remove("mostrar")
})
btncalcularkwh.addEventListener("click", (evt) => {
	resultadocalculo.classList.add("mostrar")
	resultadocalculo.classList.remove("ocultar")
	let resultado = ""
	let preciohora = 0
	// literaleuroshora.innerText = "Precio en Euros por cada hora"
	precios.forEach((precio) => {
		preciohora = parseFloat(precio) * parseFloat(inputkwh.value) / 1000
		// console.log("precio ", parseFloat(precio) , " resultado: ", parseFloat(precio) * parseFloat(inputkwh.value) )
		resultado += `
		<div class="eurohora">
		<span class="dd">  ${(preciohora).toFixed(5)} € </span>
		</div>`;
	})
	resultadoenergia.innerHTML = resultado

	resultado = ""
	let imagenColor = {"claseColor": '', "imagen": '' }
	let horanext = ""
	if ((String(horanext).length) == 1) {
		horanext = '0' + horanext
	}
	todoPrecios.included[0].attributes.values.forEach(precio => {
		horanext = +precio.datetime.slice(11, 13) + 1
		preciohora = parseFloat(precio.value / 1000) * parseFloat(inputkwh.value) / 1000
		if ((String(horanext).length) == 1) {
			horanext = '0' + horanext
		}
		imagenColor = colores(preciohora.toFixed(5), 0.05, 0.2)
		resultado += `
		<div class="eurohora">
		<img src="${colorImagen.imagen}">&nbsp;&nbsp;
		<span1> ${precio.datetime.slice(11, 13)}h-${horanext}h:&nbsp;<span class="${colorImagen.claseColor}">  ${preciohora.toFixed(5)} € </span></span1>
		</div>`;

	});
	resultadoenergia.innerHTML = resultado

})

function colores (valor, nivel1, nivel2){
	colorImagen = {"claseColor": '', "imagen": '' }
	if (valor < nivel1) {
		colorImagen.claseColor = 'minimo'
		colorImagen.imagen = './img/cuadradoVerde.png'
	} else if (valor < nivel2) {
		colorImagen.claseColor = 'medio'
		colorImagen.imagen = './img/cuadradoNaranja.png'
	} else {
		colorImagen.claseColor = 'maximo'
		colorImagen.imagen = './img/puntorojo.png'
	}

	return colorImagen
}

// ---------- pestañas --------------
buscar.addEventListener("click", (evt) => {
	activarCalcular(precios)
})

calcular.addEventListener("click", (evt) => {
	if (precios.length < 1) return

	contenidobuscar.style.display = "none"
	buscar.className = buscar.className.replace(" active", "")
	contenidocalcular.style.display = "block"
	calcular.className += " active"
})

function activarCalcular(precios) {
	contenidocalcular.style.display = "none"
	calcular.className = calcular.className.replace(" active", "")
	contenidobuscar.style.display = "block"
	buscar.className += " active"
}
