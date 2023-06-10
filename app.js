let cantidadProductosMostrados = 12;
const limiteProductos = 12;
let totalProductos = 0;

async function cargarProductos() {
  const listaProductos = document.querySelector("#listaProductos");
  botonesLocacion = document.querySelectorAll(".btn-location");
  const URL = "http://acnhapi.com/v1/fish/";

  try {
    for (let i = 1; i <= 80; i++) {
      const response = await fetch(URL + i);
      if (response.ok) {
        const data = await response.json();
        productos.push(data);
        totalProductos++;
        if (totalProductos <= cantidadProductosMostrados) {
          mostrarProductos(data);
        }
      } else {
        console.error("Error al cargar el producto", response.status);
      }
    }
  } catch (error) {
    console.error("Error al cargar los productos:", error);
  }
}

cargarProductos();

let carrito = {};
let productos = [];

//BOTONLOCACION

botonesLocacion.forEach((boton) => {
  boton.addEventListener("click", async (event) => {
    const botonId = event.currentTarget.id;
    const URL = "http://acnhapi.com/v1/fish/";

    listaProductos.innerHTML = ""; // Limpiar el contenido del div listaProductos

    try {
      for (let i = 1; i <= 80; i++) {
        const response = await fetch(URL + i);
        const data = await response.json();

        const locations = data.location;
        if (
          (locations && locations.some((e) => e.includes(botonId))) ||
          botonId === "btn-ver-todos"
        ) {
          mostrarProductos(data);
        }
      }
    } catch (error) {
      console.error("Error al obtener los productos:", error);
    }
  });
});

//Probe de mil maneras y no puedo hacer que al pulsar los botones con el id = al data.location de los peces
//que traigo de la api, me los muestre por en el listaProductos, pude dejar que me muestre
//de nuevo todos al pulsar el "ver todos", pero no que me tome los demas desde el location

document.addEventListener("DOMContentLoaded", mostrarCarrito);

const btnVaciar = document.querySelector("#btn-vaciar");
btnVaciar.removeEventListener("click", confirmarVaciarCarrito);
btnVaciar.addEventListener("click", confirmarVaciarCarrito);

function mostrarProductos(producto) {
  const div = document.createElement("div");
  div.classList.add("producto");
  div.innerHTML = `
    <div class="producto-imagen">
      <img src="${producto.image_uri}" alt="${producto.name["name-USen"]}" />
    </div>
    <div class="producto-info">
      <div class="producto-contenedor">
        <h2 class="producto-nombre">${producto.name["name-USen"]}</h2>
      </div>
      <div class="producto-descripcion">
        <p class="precio">$ ${producto.price}</p>
      </div>
      <div class="button-on">
        <button onclick="agregarAlCarrito(${producto.id})" class="btn btn-primary btn-agregar" type="submit">Comprar</button>
      </div>
    </div>
  `;
  const listaProductos = document.getElementById("listaProductos");
  listaProductos.appendChild(div);

  productos.push(producto);
}

function mostrarProductosAdicionales() {
  const productosRestantes = totalProductos - cantidadProductosMostrados;
  const limiteCarga = Math.min(productosRestantes, limiteProductos);

  for (
    let i = cantidadProductosMostrados;
    i < cantidadProductosMostrados + limiteCarga;
    i++
  ) {
    const producto = productos[i];
    mostrarProductos(producto);
  }

  cantidadProductosMostrados += limiteCarga;

  if (cantidadProductosMostrados >= totalProductos) {
    const btnVerMas = document.querySelector("#btn-ver-mas");
    btnVerMas.style.display = "none"; // Ocultar el botón "Ver más" cuando no hay más productos para cargar
  }
}

const btnVerMas = document.querySelector("#btn-ver-mas");
btnVerMas.addEventListener("click", mostrarProductosAdicionales);

function mostrarCarrito() {
  const carritoRestablecido = JSON.parse(
    localStorage.getItem("carritoGuardado")
  );
  carrito = carritoRestablecido || {};

  const carritoProductosElement = document.querySelector("#productosCarrito");
  const totalCarritoElement = document.querySelector(".totalCarrito p");

  carritoProductosElement.innerHTML = "";
  let totalCarrito = 0;

  for (const productoId in carrito) {
    if (carrito.hasOwnProperty(productoId)) {
      const item = carrito[productoId];
      const producto = productos.find(
        (producto) => producto.id === parseInt(productoId)
      );

      if (producto) {
        const cantidad = item.cantidad;

        carritoProductosElement.innerHTML += `
          <div class="modal-contenedor">
            <div>
              <img class="img-fluid img-carrito" src="${producto.image_uri}" alt="${producto.name["name-USen"]}">
            </div>
            <div>
              <div class="d-flex justify-content-center">
                <p>Producto: ${producto.name["name-USen"]}</p>
              </div>
              <div class="d-flex justify-content-around">
                <p>Cantidad: ${cantidad}</p>
                <p>Precio: ${producto.price}</p>
              </div>
              <div class="d-flex justify-content-center">
                <button class="btn btn-danger btn-eliminar" data-producto-id="${productoId}">Eliminar</button>
              </div>
            </div>
          </div>
        `;

        totalCarrito += producto.price * cantidad;
      }
    }
  }

  totalCarritoElement.textContent = `Total $${totalCarrito}`;

  const btnEliminar = document.querySelectorAll(".btn-eliminar");
  btnEliminar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const productoId = boton.dataset.productoId;
      eliminarDelCarrito(productoId);
    });
  });
}

function confirmarVaciarCarrito() {
  const confirmacion = confirm("¿Está seguro de vaciar el carrito?");
  if (confirmacion) {
    vaciarCarrito();
    closeModal();
  }
}

function vaciarCarrito() {
  carrito = {};
  localStorage.removeItem("carritoGuardado");
}

function closeModal() {
  const modal = document.querySelector("#exampleModal");
  const bootstrapModal = bootstrap.Modal.getInstance(modal);
  bootstrapModal.hide();
}

function eliminarDelCarrito(productoId) {
  delete carrito[productoId];
  const carritoSTR = JSON.stringify(carrito);
  localStorage.setItem("carritoGuardado", carritoSTR);
  mostrarCarrito();
}

function calcularTotalCarrito() {
  let totalCarrito = 0;
  for (const productoId in carrito) {
    if (carrito.hasOwnProperty(productoId)) {
      const producto = productos.find(
        (producto) => producto.id === parseInt(productoId)
      );
      if (producto) {
        const cantidad = carrito[productoId].cantidad;
        totalCarrito += producto.price * cantidad;
      }
    }
  }
  return totalCarrito;
}

const btnPago = document.querySelector("#btn-pago");
btnPago.addEventListener("click", confirmarCompra);

let productosComprados = 0;

function confirmarCompra() {
  if (Object.keys(carrito).length === 0) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Necesitas algún producto antes de finalizar la compra",
    });
    return;
  }

  const totalCarrito = calcularTotalCarrito();
  if (monedas < totalCarrito) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "No tienes suficientes monedas",
    });
    return;
  }

  Swal.fire({
    position: "top-end",
    icon: "success",
    title: "Compra finalizada con éxito",
    showConfirmButton: false,
    timer: 2500,
  });

  monedas -= totalCarrito;
  document.getElementById("monedas-value").textContent = monedas;

  for (const productoId in carrito) {
    if (carrito.hasOwnProperty(productoId)) {
      const cantidad = carrito[productoId].cantidad;
      productosComprados += cantidad;
    }
  }

  const productosCompradosElement = document.getElementById(
    "productos-comprados"
  );
  productosCompradosElement.textContent = ` ${productosComprados}`;

  vaciarCarrito();
  closeModal();
}

function pescarRandom() {
  let timerInterval;
  Swal.fire({
    title: "Tirando la caña!",
    html: "Veamos que pescas en <b></b>",
    timer: 2000,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
      const b = Swal.getHtmlContainer().querySelector("b");
      timerInterval = setInterval(() => {
        b.textContent = Swal.getTimerLeft();
      }, 100);
    },
    willClose: () => {
      clearInterval(timerInterval);
    },
  }).then((result) => {
    /* Read more about handling dismissals below */
    if (result.dismiss === Swal.DismissReason.timer) {
      console.log("I was closed by the timer");
    }
  });

  const indiceAleatorio = Math.floor(Math.random() * productos.length);
  const productoSeleccionado = productos[indiceAleatorio];

  if (productoSeleccionado) {
    agregarAlCarrito(productoSeleccionado.id);
  }
}

const agregarAlCarrito = (productoId) => {
  Toastify({
    text: "Producto agregado",
    duration: 1500,
    offset: {
      x: 100,
    },
  }).showToast();

  const item = productos.find((producto) => producto.id === productoId);

  if (carrito.hasOwnProperty(productoId)) {
    carrito[productoId].cantidad++;
  } else {
    carrito[productoId] = {
      producto: item,
      cantidad: 1,
    };
  }

  const carritoSTR = JSON.stringify(carrito);
  localStorage.setItem("carritoGuardado", carritoSTR);
};

let monedas = 0;

const intervalo = setInterval(() => {
  monedas += 100;
  console.log(monedas);
  document.getElementById("monedas-value").textContent = monedas;
}, 1000);
