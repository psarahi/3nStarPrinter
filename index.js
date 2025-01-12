const io = require("socket.io-client");
const escpos = require("escpos");
escpos.USB = require("escpos-usb");
const htmlToText = require("html-to-text");

const sharp = require("sharp");
const path = require("path");
const dayjs = require("dayjs");
const { formatearNumero } = require("./helpers/formato");
// Conectar al servidor en la nube
<<<<<<< Updated upstream
const socket = io("http://localhost:3005"); // Cambia por la dirección IP de tu servidor
// const socket = io("https://api-appointsmentscontrol.onrender.com"); // Cambia por la dirección IP de tu servidor
=======
// const socket = io("http://localhost:3005"); // Cambia por la dirección IP de tu servidor
// const socket = io("https://api-appointsmentscontrol.onrender.com"); // Cambia por la dirección IP de tu servidor
const socket = io("https://backendopticaecheverria-production-eeb4.up.railway.app"); // Cambia por la dirección IP de tu servidor
>>>>>>> Stashed changes

//////// Sucursal Optica Cristiana Echeverria //////////////

socket.on("connect", () => {
  console.log("Conectado al servidor en la nube");
});

// Manejar eventos de impresión
socket.on("printFactura", (data) => {
  let { datosImprimir } = data;

  if (datosImprimir.sucursales !== "Optica Cristiana Echeverria"){
    console.log("No pertenece a esta sucursal");
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
            <th>Cantidad</th>
            <th>Descripcion</th>
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
          device.open(() => {
            if (error) {
              console.error("Error al abrir el dispositivo:", error);
              return;
            }

            escpos.Image.load(path.resolve("output.png"), (image) => {
              printer
                .align("ct")
                .raster(image)
                .font("a")
                .align("ct")
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
                    .add(6, "hour")
                    .format("YYYY-MM-DD")}`
                )
                .text("")
                .align("ct")
                .text("LA FACTURA ES BENEFICIO DE TODOS, EXIJALA")
                .text(datosImprimir.mensaje.toLocaleUpperCase())
                .feed(3)
                .beep(1, 100)
                .cut()
                .close();
            });
          });
        });
      });
    } catch (error) {
      console.error("Error al imprimir:", error);
    }
});

socket.on("printRecibo", (data) => {
  let { datosImprimir } = data;
  if (datosImprimir.sucursales !== "Optica Cristiana Echeverria"){
    console.log("No pertenece a esta sucursal");
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
        .text(`Fecha ${datosImprimir.fecha}`)
        .text(`Forma de pago ${datosImprimir.formaPago}`)
        .feed(3)
        .drawLine()
        .text(datosImprimir.cliente.toLocaleUpperCase())
        .text("Firma de autorizacion")
        .text("")
        .text("Recuerda que tu ticket es tu GARANTIA, consevalo")
        .text("Nuestros datos de contacto:")
        .text(datosImprimir.direccion)
        .text(`TEL: ${datosImprimir.tel} / CEL: ${datosImprimir.cel}`)
        .text(datosImprimir.email)
        .text(datosImprimir.paginaDigital)
        .feed(3)
        .beep(1, 100)
        .cut()
        .close();
    });
  } catch (error) {
    console.error("Error al imprimir:", error);
  }
});

socket.on("disconnect", () => {
  console.log("Desconectado del servidor en la nube");
});
