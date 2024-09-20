document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("formulario");
  const resultadoDiv = document.getElementById("resultado");
  const rutaCortaDiv = document.getElementById("ruta-corta");
  const grafoDiv = document.getElementById("grafo");

  // Distancias en kilómetros entre las ciudades
  const distancias = {
      bogota: { soacha: 16, zipaquira: 49, cajica: 38 },
      soacha: { bogota: 16, chia: 45, zipaquira: 32, cajica: 35 },
      chia: { bogota: 25, soacha: 45, zipaquira: 30, cajica: 15 },
      zipaquira: { bogota: 49, soacha: 32, chia: 30, cajica: 30 },
      cajica: { bogota: 38, soacha: 35, chia: 15, zipaquira: 30 },
  };

  // Consumo promedio de combustible por tipo de vehículo (litros/100 km)
  const consumoVehiculos = {
      moto: 3,
      carro: 8,
      camion: 20,
      bus: 25,
  };

  formulario.addEventListener("submit", function (event) {
      event.preventDefault();

      // Obtener los valores del formulario
      const origen = document.getElementById("origen").value;
      const destino = document.getElementById("destino").value;
      const precioGasolina = parseFloat(
          document.getElementById("precio-gasolina").value
      );
      const vehiculo = document.getElementById("vehiculo").value;

      // Calcular la ruta más corta usando Dijkstra
      const rutaCorta = dijkstra(distancias, origen, destino);
      const distancia = rutaCorta.distancia;

      // Verificar si hay ruta posible
      if (distancia === Infinity) {
          resultadoDiv.innerHTML = `<p>No hay ruta posible de ${origen.charAt(0).toUpperCase() + origen.slice(1)} a ${destino.charAt(0).toUpperCase() + destino.slice(1)}</p>`;
          return;
      }

      // Calcular el consumo de combustible y el costo del recorrido
      const consumoPor100Km = consumoVehiculos[vehiculo];
      const litrosNecesarios = (distancia / 100) * consumoPor100Km;
      const costo = litrosNecesarios * precioGasolina;

      // Formatear el costo
      const formatter = new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
      });
      const costoFormateado = formatter.format(costo);

      // Mostrar el resultado
      resultadoDiv.innerHTML = `
          <p>Distancia de ${origen.charAt(0).toUpperCase() + origen.slice(1)} a ${destino.charAt(0).toUpperCase() + destino.slice(1)}: ${distancia} km</p>
          <p>Costo del recorrido: ${costoFormateado}</p>
      `;

      // Mostrar la ruta más corta
      rutaCortaDiv.innerHTML = `
          <p>Distancia más corta desde ${origen.charAt(0).toUpperCase() + origen.slice(1)} a ${destino.charAt(0).toUpperCase() + destino.slice(1)}: ${rutaCorta.distancia} km</p>
          <p>Ruta: ${rutaCorta.camino.join(' -----> ')}</p>
      `;

      // Mostrar el gráfico
      mostrarGrafo();
  });

  function dijkstra(grafo, inicio, destino) {
      const distancias = {}; // Distancia mínima desde el nodo de inicio
      const previos = {}; // Nodo previo en el camino más corto
      const nodosNoVisitados = new Set(Object.keys(grafo)); // Nodos que aún no han sido visitados

      // Inicializar distancias con infinito y nodo de inicio con distancia 0
      Object.keys(grafo).forEach(nodo => {
          distancias[nodo] = Infinity;
          previos[nodo] = null;
      });
      distancias[inicio] = 0;

      while (nodosNoVisitados.size > 0) {
          // Seleccionar el nodo con la distancia más corta
          const nodoActual = Array.from(nodosNoVisitados).reduce((minNodo, nodo) => {
              return distancias[nodo] < distancias[minNodo] ? nodo : minNodo;
          });

          // Si el nodo actual es el destino, se ha encontrado el camino más corto
          if (nodoActual === destino) break;

          // Eliminar el nodo actual del conjunto de nodos no visitados
          nodosNoVisitados.delete(nodoActual);

          // Actualizar distancias a los vecinos
          Object.keys(grafo[nodoActual]).forEach(vecino => {
              if (nodosNoVisitados.has(vecino)) {
                  const nuevaDistancia = distancias[nodoActual] + grafo[nodoActual][vecino];
                  if (nuevaDistancia < distancias[vecino]) {
                      distancias[vecino] = nuevaDistancia;
                      previos[vecino] = nodoActual;
                  }
              }
          });
      }

      // Reconstruir el camino más corto
      const camino = [];
      let paso = destino;
      while (previos[paso]) {
          camino.unshift(paso);
          paso = previos[paso];
      }
      if (camino.length > 0) {
          camino.unshift(inicio);
      }

      return { distancia: distancias[destino], camino };
  }

  function mostrarGrafo() {
      const cy = cytoscape({
          container: grafoDiv,
          elements: [
              { data: { id: "bogota", label: "Bogotá" } },
              { data: { id: "soacha", label: "Soacha" } },
              { data: { id: "chia", label: "Chía" } },
              { data: { id: "zipaquira", label: "Zipaquirá" } },
              { data: { id: "cajica", label: "Cajicá" } },
              { data: { source: "bogota", target: "soacha", label: "16 km" } },
              { data: { source: "bogota", target: "chia", label: "25 km" } },
              { data: { source: "bogota", target: "zipaquira", label: "49 km" } },
              { data: { source: "bogota", target: "cajica", label: "38 km" } },
              { data: { source: "soacha", target: "chia", label: "45 km" } },
              { data: { source: "soacha", target: "zipaquira", label: "32 km" } },
              { data: { source: "soacha", target: "cajica", label: "35 km" } },
              { data: { source: "chia", target: "zipaquira", label: "30 km" } },
              { data: { source: "chia", target: "cajica", label: "15 km" } },
              { data: { source: "zipaquira", target: "cajica", label: "30 km" } },
          ],
          style: [
              {
                  selector: "node",
                  style: {
                      "background-color": "#1f77b4", // Color de fondo de los nodos
                      "border-color": "#ffffff", // Color del borde de los nodos
                      "border-width": 2, // Ancho del borde de los nodos
                      width: "70px", // Ancho de los nodos
                      height: "70px", // Alto de los nodos
                      label: "data(label)", // Etiqueta del nodo
                      "text-valign": "center", // Alineación vertical del texto
                      "text-halign": "center", // Alineación horizontal del texto
                      color: "#ffffff", // Color del texto
                      "font-size": "14px",
                      "font-weight": "bold",
                      "text-wrap": "wrap", // Ajustar el texto en el nodo
                      "text-max-width": "50px", // Máximo ancho del texto para evitar desbordamiento
                  },
              },
              {
                  selector: "edge",
                  style: {
                      width: 2,
                      "line-color": "#b8b8b8",
                      "target-arrow-color": "#b8b8b8",
                      "target-arrow-shape": "triangle",
                      "curve-style": "bezier",
                      label: "data(label)", // Etiqueta de la línea
                      "font-size": "10px", // Tamaño de la etiqueta
                      "font-weight": "bold", // Peso de la etiqueta
                      color: "#808080", // Color de la etiqueta
                      "text-outline-width": 2,
                      "text-outline-color": "#ffffff",
                  },
              },
          ],
          layout: {
              name: "grid",
              rows: 2,
          },
      });
  }
});
