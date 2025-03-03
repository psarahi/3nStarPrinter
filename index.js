const io = require("socket.io-client");
const escpos = require("escpos");
escpos.USB = require("escpos-usb");
const htmlToText = require("html-to-text");

const sharp = require("sharp");
const path = require("path");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("America/Guatemala");
const { formatearNumero, textValidator } = require("./helpers/formato");

const socket = io(
  "https://backendopticaecheverria-production-eeb4.up.railway.app"
); // Echeverria Cambia por la dirección IP de tu servidor
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

  if (datosImprimir.sucursales !== "6785925e15960a3605c427d0") {
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
            .text("CON VISION DE SERVICIO")
            .text(`RTN ${datosImprimir.rtnSucursal}`)
            .text(`TEL: ${datosImprimir.tel} / CEL: ${datosImprimir.cel}`)
            .text(`DIRECCION ${datosImprimir.direccion}`)
            .text(`EMAIL ${datosImprimir.email}`)
            .text("")
            .align("LT")
            .text(`#FACTURA: ${datosImprimir.numFacRec}`)
            .text(
              `FECHA: ${dayjs()
                .tz("America/Guatemala")
                .format("YYYY-MM-DD hh:mm a")}`
            )
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
              `${datosImprimir.formaPago} L ${formatearNumero(
                datosImprimir.total
              )}`
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
                .tz("America/Guatemala")
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
  if (datosImprimir.sucursales !== "6785925e15960a3605c427d0") {
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
        .text(
          `FECHA: ${dayjs()
            .tz("America/Guatemala")
            .format("YYYY-MM-DD hh:mm a")}`
        )
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
        .text(
          `Fecha ${dayjs(datosImprimir.fecha)
            .tz("America/Guatemala")
            .format("YYYY-MM-DD hh:mm a")}`
        )
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

socket.on("printOrdenTrabajo", (data) => {
  let { datosImprimir } = data;
  if (datosImprimir.sucursalId !== "6785925e15960a3605c427d0") {
    return;
  }
  try {
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    const table = `
    <table style='width:100%' class='receipt-table' border='0'>
      <thead>
        <tr class='heading'>
          <th>Cant</th>
          <th>Descripcion</th>
        </tr>
      </thead>
        <tbody>
          ${datosImprimir.articulos.map(
            (item) =>
              `
                <tr>
                  <td>${item.cantidad}</td>
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
      printer
        .font("a")
        .align("CT")
        .encode("utf8")
        .size(0, 0)
        .text(datosImprimir.tipoVenta)
        .align("LT")
        // .text("Orden de trabajo")
        .text(datosImprimir.nombreSucursal)
        .text("")
        .text(`${datosImprimir.paciente}`)
        .text(`${datosImprimir.direccion}`)
        .text(
          `Tel: ${datosImprimir.telefono}  Edad: ${datosImprimir.edad}`
        )
        .text("")
        .text(
          `OD ${
            textValidator(datosImprimir.recetaOjoDerecho.esfera)
              ? datosImprimir.recetaOjoDerecho.esfera
              : ""
          } ${
            textValidator(datosImprimir.recetaOjoDerecho.cilindro)
              ? datosImprimir.recetaOjoDerecho.cilindro
              : ""
          } ${
            textValidator(datosImprimir.recetaOjoDerecho.eje)
              ? `x${datosImprimir.recetaOjoDerecho.eje}`
              : ""
          }`
        )
        .text(
          `Add:${
            textValidator(datosImprimir.recetaOjoDerecho.adicion)
              ? datosImprimir.recetaOjoDerecho.adicion
              : ""
          } DP:${
            textValidator(datosImprimir.recetaOjoDerecho.distanciaPupilar)
              ? datosImprimir.recetaOjoDerecho.distanciaPupilar
              : ""
          }`
        )
        .text("")
        .text(
          `OI ${
            textValidator(datosImprimir.recetaOjoIzquierdo.esfera)
              ? datosImprimir.recetaOjoIzquierdo.esfera
              : ""
          } ${
            textValidator(datosImprimir.recetaOjoIzquierdo.cilindro)
              ? datosImprimir.recetaOjoIzquierdo.cilindro
              : ""
          } ${
            textValidator(datosImprimir.recetaOjoIzquierdo.eje)
              ? `x${datosImprimir.recetaOjoIzquierdo.eje}`
              : ""
          }`
        )
        .text(
          `Add:${
            textValidator(datosImprimir.recetaOjoIzquierdo.adicion)
              ? datosImprimir.recetaOjoIzquierdo.adicion
              : ""
          } DP:${
            textValidator(datosImprimir.recetaOjoIzquierdo.distanciaPupilar)
              ? datosImprimir.recetaOjoIzquierdo.distanciaPupilar
              : ""
          }`
        )
        .text("")
        .text(textHtml)
        .text("")
        .text(`Observaciones # ${datosImprimir.observaciones}`)
        .text(
          `Monto: ${formatearNumero(
            parseFloat(datosImprimir.monto)
          )} Acuenta: ${formatearNumero(parseFloat(datosImprimir.acuenta))}`
        )
        .text(
          `Saldo: ${formatearNumero(
            datosImprimir.total - parseFloat(datosImprimir.acuenta)
          )} Total: ${datosImprimir.total}`
        )
        .text(`Forma Pago: ${datosImprimir.formaPago}`)
        .text(
          `Ticket# ${datosImprimir.numFacRec} ${dayjs()
            .tz("America/Guatemala")
            .format("YYYY-MM-DD hh:mm a")}`
        )
        .text(`Generado por: ${datosImprimir.usuario}`)
        .feed(3)
        .cut()
        .close();
    });
  } catch (error) {
    console.error("Error al imprimir:", error);
  }
});

socket.off("disconnect", () => {
  console.log("Desconectado del servidor en la nube");
});
