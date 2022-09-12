var dateControl = document.querySelector('input[type="date"]')
var geolimit = document.getElementById('sellimit')
var lista = document.getElementById('lista')
var btnConsultar = document.getElementById('btnConsultar')

var fecha = new Date();
dateControl.value = fecha.toJSON().slice(0, 10);

geolimit.addEventListener("click", (event) => {
	event.preventDefault();
	lista.innerHTML = '';
});
dateControl.addEventListener("click", (event) => {
	lista.innerHTML = '';
});

btnConsultar.addEventListener("click", (event) => {
	event.preventDefault();
	// console.log('click boton xxx');
	// console.log(dateControl.value);
	const startdate = dateControl.value + "T00:00";
	const enddate = dateControl.value + "T23:59";
	cargarPrecios(startdate, enddate);
});



const cargarPrecios = async (startdate, enddate) => {
	try {
		let imagen = '';
		lista.innerHTML = ''
		// console.log(geolimit.value)
		// console.log(startdate)
		// console.log(enddate)
		const apirest = `https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real?start_date=${startdate}&end_date=${enddate}&geo_limit=${geolimit.value}&time_trunc=hour`

		// console.log(apirest)


		const respuesta = await fetch(apirest);

		// console.log(respuesta.status);
		//		console.log(respuesta);

		// Si la respuesta es correcta
		if (respuesta.status === 200) {
			const datos = await respuesta.json();
			let precios = [];
			datos.included[0].attributes.values.forEach(precio => {
				precios.push((precio.value / 1000).toFixed(5));
			});
			// console.log(precios)
			let minimo = Math.min(...precios) + 0.02;
			let maximo = minimo + 0.04;
			// console.log(minimo)

			//  console.log(datos);
			// console.log(datos.included[0].attributes.values[0].datetime + ": " + datos.included[0].attributes.values[0].value);
			let preciosHora = '';
			//			const datos1 = await datos.included[0].json();
			// console.log(datos.included[0].attributes.values);




			datos.included[0].attributes.values.forEach(hora => {
				//				console.log(hora.datetime.slice(11,16))
				let valor = (hora.value / 1000).toFixed(5);
				if (valor <= minimo) {
					imagen = './img/verde.png'
				} else if (valor <= maximo) {
					imagen = './img/naranja.png'
				} else {
					imagen = './img/rojo.png'
				}
				preciosHora += `
			<div class="itempreciohora">
				<img src="${imagen}">
				<span> ${hora.datetime.slice(11, 16)} -- ${(hora.value / 1000).toFixed(5)} €/kWh </span>
			</div>`;
			});

			document.getElementById('lista').innerHTML = preciosHora;

		} else if (respuesta.status === 401) {
			console.log('Pusiste la llave mal');
		} else if (respuesta.status === 404) {
			console.log('Precios no encontrados');
		} else if (respuesta.status === 502) {
			lista.innerHTML = 'No hay datos para los filtros seleccionados.'
			console.log('No hay datos para los filtros seleccionados.');
		} else {

			console.log('Hubo un error y no sabemos que paso');
		}

	} catch (error) {
		console.log(error);
	}

}

//cargarPrecios();
