const io = require("socket.io-client");
const escpos = require("escpos");
escpos.USB = require("escpos-usb");
const htmlToText = require("html-to-text");

const sharp = require("sharp");
const path = require("path");
const dayjs = require("dayjs");
const { formatearNumero } = require("./helpers/formato");
// Conectar al servidor en la nube
// const socket = io("http://localhost:3005"); // Cambia por la dirección IP de tu servidor
const socket = io("https://backendopticaecheverria-production-eeb4.up.railway.app"); // Echeverria Cambia por la dirección IP de tu servidor
// const socket = io("https://centrovisualpsicocristiano-production.up.railway.app"); // Centro visual cristiano
// const socket = io("https://opticavisualhn-production.up.railway.app/"); // Optica visual HN Progreso
// const socket = io("https://backendcentrooptico-production.up.railway.app/"); // Centro Optico cristiano


socket.on("connect", () => {
  console.log("Conectado al servidor en la nube");
});

// Manejar eventos de impresión
socket.on("printFactura", (data) => {
  let { datosImprimir } = data;
  // console.log(datosImprimir);

  if (datosImprimir.sucursales !== "6783ce51f8cf2be5252615fc") {
    return;
  }
  try {
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    const resizeImage = async (inputPath, outputPath) => {
      await sharp(inputPath)
        .resize({ width: 400 }) // Match printer width
        .toFile(outputPath);
    };

    const table = `
      <table style='width:100%' class='receipt-table' border='0'>
        <thead>
          <tr class='heading'>
            <th>Cant</th>
            <th>Desc</th>
            <th>Monto</th>
          </tr>
        </thead>
          <tbody>
            ${datosImprimir.articulos.map(
      (item) =>
        `
                  <tr>
                    <td>${item.cantidad}</td>
                    <td>${item.descripcion.toLocaleUpperCase()}</td>
                    <td>${formatearNumero(item.precioVenta)}</td>
                   </tr>
                  `
    )}
          </tbody>
      </table>
    `;

    const textHtml = htmlToText.convert(table, {
      wordwrap: false,
      tables: [".receipt-box", ".receipt-table"],
    });

    device.open(function (error) {
      if (error) {
        console.error("Error al abrir el dispositivo:", error);
        return;
      }

      resizeImage("logoOptica.png", "output.png").then(() => {
      escpos.Image.load(path.resolve("output.png"), (image) => {
     // for (let index = 0; index < 2; index++) {
        printer
          .align("CT")
          
           .raster(image)
          .text(datosImprimir.nombreSucursal.toLocaleUpperCase())
          .font("a")
          .align("CT")
          .encode("utf8")
          .size(0, 0)
          .text("VISION Y VIDA A SU ALCANCE")
          .text(`RTN ${datosImprimir.rtnSucursal}`)
          .text(`TEL: ${datosImprimir.tel} / CEL: ${datosImprimir.cel}`)
          .text(`DIRECCION ${datosImprimir.direccion}`)
          .text(`EMAIL ${datosImprimir.email}`)
          .text("")
          .align("LT")
          .text(`#FACTURA: ${datosImprimir.numFacRec}`)
          .text(`FECHA: ${dayjs().format("YYYY-MM-DD hh:mm a")}`)
          .text(`CLIENTE: ${datosImprimir.cliente}`)
          .text(`RTN: ${datosImprimir.rtnCliente}`)
          .text(`VENDEDOR: ${datosImprimir.vendedor}`)
          .text("")
          .align("RT")
          .drawLine()
          .text(textHtml)
          .drawLine()
          .text(datosImprimir.labelsTotales[0])
          .text(datosImprimir.labelsTotales[1])
          .text(datosImprimir.labelsTotales[2])
          .text(datosImprimir.labelsTotales[3])
          .text(datosImprimir.labelsTotales[4])
          .text(datosImprimir.labelsTotales[5])
          .text(datosImprimir.labelsTotales[6])
          .text(datosImprimir.labelsTotales[7])
          .text(datosImprimir.labelsTotales[8])
          .text("")
          .text(
            `${datosImprimir.formaPago} L ${formatearNumero(datosImprimir.total)}`
          )
          .text("")
          .align("ct")
          .text(datosImprimir.totalLetras)
          .text("No ORDEN DE COMPRA EXENTA:")
          .text("No CONST. REGISTRO EXONERADO:")
          .text("No REGISTRO SAG:")
          .align("lt")
          .text(`CAI: ${datosImprimir.cai}`)
          .text(`RANGO AUTORIZADO: ${datosImprimir.rango}`)
          .text(
            `FECHA LIMITE DE EMISION : ${dayjs(datosImprimir.fechaEmision)
              .add(6, "hour")
              .format("YYYY-MM-DD")}`
          )
          .text("")
          .align("ct")
          .text("LA FACTURA ES BENEFICIO DE TODOS, EXIJALA")
          .text(datosImprimir.mensajeFactura.toLocaleUpperCase())
          .feed(3)
          // .beep(1, 100)
          .cut()
          .close();
      //}
    });
        });
      });
  } catch (error) {
    console.error("Error al imprimir:", error);
  }
});

socket.on("printRecibo", (data) => {
  let { datosImprimir } = data;
  if (datosImprimir.sucursales !== "6783ce51f8cf2be5252615fc") {
    return;
  }
  try {
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    const table = `
    <table style='width:100%' class='receipt-table' border='0'>
      <thead>
        <tr class='heading'>
          <th>Descripcion</th>
        </tr>
      </thead>
        <tbody>
          ${datosImprimir.articulos.map(
      (item) =>
        `
                <tr>
                  <td>${item.descripcion.toLocaleUpperCase()}</td>
                 </tr>
                `
    )}
        </tbody>
    </table>
  `;

    const textHtml = htmlToText.convert(table, {
      wordwrap: false,
      tables: [".receipt-box", ".receipt-table"],
    });

    device.open(function (error) {
      if (error) {
        console.error("Error al abrir el dispositivo:", error);
        return;
      }
     // for (let index = 0; index < 2; index++) {
        printer
          .font("a")
          .align("LT")
          .encode("utf8")
          .size(0.5, 0.5)
          .text(datosImprimir.nombreSucursal)
          .size(0, 0)
          .text("Comprobante")
          .text(`Ticket # ${datosImprimir.numFacRec}`)
          .text(`FECHA: ${dayjs().format("YYYY-MM-DD hh:mm a")}`)
          .text(`Vendedor: ${datosImprimir.vendedor}`)
          .text("")
          .text(`Cliente: ${datosImprimir.cliente}`)
          .text(textHtml)
          .text("")
          .text(`Total: ${formatearNumero(datosImprimir.total)}`)
          .text(`Acuenta: ${formatearNumero(datosImprimir.acuenta)}`)
          .text(
            `Resta : ${formatearNumero(
              datosImprimir.total - datosImprimir.acuenta
            )}`
          )
          .text("")
          .text("Pago agregado")
          .text(`Cantidad L ${formatearNumero(datosImprimir.monto)}`)
          .text(`Fecha ${dayjs(datosImprimir.fecha).subtract(6,'hour').format("YYYY-MM-DD hh:mm a")}`)
          .text(`Forma de pago ${datosImprimir.formaPago}`)
          .feed(3)
          .drawLine()
          .text(datosImprimir.cliente.toLocaleUpperCase())
          .text("Firma de autorizacion")
          .text("")
          .text("Recuerda que tu ticket es tu GARANTIA, consevalo")
          .text(datosImprimir.mensajeFactura.toLocaleUpperCase())
          .text("Nuestros datos de contacto:")
          .text(datosImprimir.direccion)
          .text(`TEL: ${datosImprimir.tel} / CEL: ${datosImprimir.cel}`)
          .text(datosImprimir.email)
          .text(datosImprimir.paginaDigital)
          .feed(3)
          // .beep(1, 100)
          .cut()
          .close();
      //}
    });
  } catch (error) {
    console.error("Error al imprimir:", error);
  }
});

socket.on("printOrdenTrabajo", (data) => {
  let { datosImprimir } = data;
  if (datosImprimir.sucursalId !== "6783ce51f8cf2be5252615fc") {
    return;
  }
  try {
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    const table = `
    <table style='width:100%' class='receipt-table' border='0'>
      <thead>
        <tr class='heading'>
          <th>Descripcion</th>
        </tr>
      </thead>
        <tbody>
          ${datosImprimir.articulos.map(
      (item) =>
        `
                <tr>
                  <td>${item.descripcion.toLocaleUpperCase()}</td>
                 </tr>
                `
    )}
        </tbody>
    </table>
  `;

    const textHtml = htmlToText.convert(table, {
      wordwrap: false,
      tables: [".receipt-box", ".receipt-table"],
    });

    device.open(function (error) {
      if (error) {
        console.error("Error al abrir el dispositivo:", error);
        return;
      }
     // for (let index = 0; index < 2; index++) {
        printer
          .font("a")
          .align("LT")
          .encode("utf8")
          .size(0, 0)
          .text(datosImprimir.nombreSucursal)
          .size(0, 0)
          .text(`Direccion: ${datosImprimir.direccion}`)
          .text(`Telefono: ${datosImprimir.telefono}  Edad: ${datosImprimir.edad}`)
          .text(`OD E: ${datosImprimir.recetaOjoDerecho.esfera}  C: ${datosImprimir.recetaOjoDerecho.cilindro} Eje: ${datosImprimir.recetaOjoDerecho.eje} Add: ${datosImprimir.recetaOjoDerecho.adicion} DP: ${datosImprimir.recetaOjoDerecho.distanciaPupilar}`)
          .text(`OI E: ${datosImprimir.recetaOjoIzquierdo.esfera}  C: ${datosImprimir.recetaOjoIzquierdo.cilindro} Eje: ${datosImprimir.recetaOjoIzquierdo.eje} Add: ${datosImprimir.recetaOjoIzquierdo.adicion} DP: ${datosImprimir.recetaOjoIzquierdo.distanciaPupilar}`)
          .text(textHtml)


          .text(`Ticket # ${datosImprimir.numFacRec}`)
          .text(`FECHA: ${dayjs().format("YYYY-MM-DD hh:mm a")}`)
          .text(`Vendedor: ${datosImprimir.vendedor}`)
          .text("")
          .text(`Cliente: ${datosImprimir.cliente}`)
          .text("")
          .text(`Total: ${formatearNumero(datosImprimir.total)}`)
          .text(`Acuenta: ${formatearNumero(datosImprimir.acuenta)}`)
          .text(
            `Resta : ${formatearNumero(
              datosImprimir.total - datosImprimir.acuenta
            )}`
          )
          .text("")
          .text("Pago agregado")
          .text(`Cantidad L ${formatearNumero(datosImprimir.monto)}`)
          .text(`Fecha ${dayjs(datosImprimir.fecha).format("YYYY-MM-DD hh:mm a")}`)
          .text(`Forma de pago ${datosImprimir.formaPago}`)
          .feed(3)
          .drawLine()
          .text(datosImprimir.cliente.toLocaleUpperCase())
          .text("Firma de autorizacion")
          .text("")
          .text("Recuerda que tu ticket es tu GARANTIA, consevalo")
          .text(datosImprimir.mensajeFactura.toLocaleUpperCase())
          .text("Nuestros datos de contacto:")
          .text(datosImprimir.direccion)
          .text(`TEL: ${datosImprimir.tel} / CEL: ${datosImprimir.cel}`)
          .text(datosImprimir.email)
          .text(datosImprimir.paginaDigital)
          .feed(3)
          .cut()
          .close();
      //}
    });
  } catch (error) {
    console.error("Error al imprimir:", error);
  }
});

socket.on("disconnect", () => {
  console.log("Desconectado del servidor en la nube");
});
