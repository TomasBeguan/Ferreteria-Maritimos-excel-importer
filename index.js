

class Excel {
    constructor(content, columnOffset = 0) {
        this.content = content;
        this.columnOffset = columnOffset;
    }

    header() {
        return this.content[0].slice(this.columnOffset, this.columnOffset + 6);
        // devuelve las primeras 6 columnas a partir del índice columnOffset
    }

    rows() {
        return new RowCollection(this.content.slice(1).map(row => row.slice(this.columnOffset)));
    }
}

class RowCollection{
    constructor(rows){
        this.rows = rows
    }

    first(){
        return new Row(this.rows[0])
    }

    get(index){
        return new Row(this.rows[index])
    }

    count(){
        return this.rows.length
    }
}

class Row{

    constructor(row){
        this.row = row
    }

    producto(){
        return this.row[0]
    }

    medida(){
        return this.row[1]
    }

    marca(){
        return this.row[2]
    }
    
    codigo(){
        return this.row[3]
    }

    precio(){
        return Math.round(this.row[4])
    }

}

class ExcelPrinter{
    static print(tableId, excel){

        const table = document.getElementById(tableId)

         // Agrega los encabezados de la tabla
        excel.header().forEach( title => {
            table.querySelector("thead>tr").innerHTML += `<td>${title}</td>`
        })
        table.querySelector("thead>tr").innerHTML += `<td></td>`

        // Agrega las filas de la tabla
        for (let index = 0; index < excel.rows().count(); index++) {
            const row = excel.rows().get(index);
            console.log()

            table.querySelector('tbody').innerHTML += `
            <tr>
                <td class="nombre">${row.producto()}</td>
                <td class="medida">${row.medida()}</td>
                <td class="medida">${row.marca()}</td>
                <td class="medida">${row.codigo()}</td>
                <td class="precio">$ ${row.precio()}</td>
                <td class="justify-content-center td_boton_añadir ">
                    <button type="button" class="btn boton_añadir" id="add" onclick="add_button(${index})">+</button>
                </td>
            </tr>
            `

            
        }
        
    }
}



// Espera que el input de archivo tenga el archivo
const excelInput = document.getElementById('excel-input')
excelInput.addEventListener('change', async function(){
    const file = excelInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const content = XLSX.utils.sheet_to_json(sheet, {header: 1});
        //Ignora las 3 primeras
        const excel = new Excel(content, 3);
        console.log(ExcelPrinter.print('excel-table', excel));
    }

    reader.readAsArrayBuffer(file);
})


function searcher() {
    // Declare variables
    var input, filter, table, tr, td, td2, i, txtValue, txtValue2;
    input = document.getElementById("excel-searcher");
    filter = input.value.toUpperCase();
    table = document.getElementById("excel-table");
    tr = table.getElementsByTagName("tr");
  
    // Loop through all table rows starting from index 1, and hide those who don't match the search query
    for (i = 1; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      td2 = tr[i].getElementsByTagName("td")[3]; // Get the second td in each row
      if (td) {
        txtValue = td.textContent || td.innerText;
        txtValue2 = td2.textContent || td2.innerText; // Get the text content of the second td
        if (txtValue.toUpperCase().indexOf(filter) > -1 || txtValue2.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }



function addInput(){
    const inputProducto = document.getElementById("input_producto")
    const inputPrecio = document.getElementById("input_precio")
    const inputCantidad = document.getElementById("input_cantidad")

    const producto = inputProducto.value;
    const precio = parseFloat(inputPrecio.value);
    const cantidad = parseFloat(inputCantidad.value);

    const table = document.getElementById('selected-table');

    let rowExists = false;
    let quantityCell = cantidad;
    let subtotal = precio * quantityCell;

    for (let i = 1; i < table.rows.length - 1; i++) {
        const row = table.rows[i];
        if (row.cells[0].textContent === producto) {
            rowExists = true;
            quantityCell = row.cells[2];
            quantityCell.textContent = cantidad; // actualiza la cantidad en la celda correspondiente
            subtotal = precio * parseFloat(quantityCell.textContent);
            row.cells[3].textContent = subtotal.toFixed(2);
            break;
        }
    }

    if (rowExists) {
        // If a row exists for the product, add the quantity to the quantity cell
        //const currentQuantity = parseInt(quantityCell.textContent);
        quantityCell.textContent = cantidad;
        table.rows[table.rows.length - 2].cells[3].textContent = subtotal.toFixed(2);
    } else {
        // If no row exists for the product, create a new row with the quantity
        const newRow = table.insertRow(table.rows.length - 1);
        
        const productCell = newRow.insertCell();
        productCell.textContent = producto;
        productCell.classList.add("table-total-nombre");

        const priceCell = newRow.insertCell();
        priceCell.textContent = precio.toFixed(2);
        priceCell.classList.add("table-total-precio");
        
        const quantityCell = newRow.insertCell();
        quantityCell.classList.add("table-total-precio");
        quantityCell.textContent = cantidad;

        const subtotalCell = newRow.insertCell();
        subtotalCell.classList.add("table-total-precio", "subtotal-cell");
        subtotalCell.textContent = subtotal.toFixed(2);

        const removeButton = document.createElement("button");
        removeButton.textContent = "-";
        removeButton.type = "button";
        removeButton.classList.add("btn", "btn-danger");
        
        removeButton.onclick = function() {
            const currentQuantity = parseInt(quantityCell.textContent);
            if (currentQuantity > 1) {
                quantityCell.textContent = currentQuantity - 1;
                subtotal = precio * parseInt(quantityCell.textContent);
                subtotalCell.textContent = subtotal.toFixed(2);
            } else {
                table.deleteRow(newRow.rowIndex);
            }
            updateTotal();
        };

        const removeCell = newRow.insertCell();
        removeCell.appendChild(removeButton);
    }

    updateTotal();
    
}

function limpiar_input(){
    let producto = document.getElementById("input_producto")
    let precio = document.getElementById("input_precio")
    let cantidad = document.getElementById("input_cantidad")

    producto.value = ''
    precio.value = ''
    cantidad.value = ''
}


function add_button(indice){
    const row = document.querySelectorAll(`#excel-table tbody tr:nth-child(${indice+1}) td`);
    const rowData = [];
    row.forEach((cell) => {
        rowData.push(cell.textContent);
    });
    
    const table = document.getElementById('selected-table');
    const productName = rowData[0] + " " + rowData[1];
    const productPrice = parseFloat(rowData[4].replace(/[^0-9.-]+/g,""));
    let rowExists = false;
    let quantityCell = 1;
    let subtotal = productPrice * quantityCell;

    for (let i = 1; i < table.rows.length - 1; i++) {
        const row = table.rows[i];
        if (row.cells[0].textContent === productName) {
            rowExists = true;
            quantityCell = row.cells[2];
            subtotal = productPrice * parseInt(quantityCell.textContent);
            row.cells[3].textContent = Math.round(subtotal).toLocaleString("es-AR");
            break;
        }
    }
    
    if (rowExists) {
        const currentQuantity = parseInt(quantityCell.textContent);
        quantityCell.textContent = currentQuantity + 1;
        subtotal = productPrice * (currentQuantity + 1);
        table.rows[table.rows.length - 2].cells[3].textContent = Math.round(subtotal).toLocaleString("es-AR");
    } else {
        const newRow = table.insertRow(table.rows.length - 1);
        
        const productCell = newRow.insertCell();
        productCell.textContent = productName;
        productCell.classList.add("table-total-nombre");

        const priceCell = newRow.insertCell();
        priceCell.textContent = productPrice.toFixed(2);
        priceCell.classList.add("table-total-precio");
        
        quantityCell = newRow.insertCell();
        quantityCell.classList.add("table-total-precio");
        quantityCell.textContent = "1";

        const subtotalCell = newRow.insertCell();
        subtotalCell.classList.add("table-total-precio", "subtotal-cell");
        subtotalCell.textContent = Math.round(subtotal).toLocaleString("es-AR");

        const removeButton = document.createElement("button");
        removeButton.textContent = "-";
        removeButton.type = "button";
        removeButton.classList.add("btn", "btn-danger");
        
        removeButton.onclick = function() {
            const currentQuantity = parseInt(quantityCell.textContent);
            if (currentQuantity > 1) {
                quantityCell.textContent = currentQuantity - 1;
                subtotal = productPrice * parseInt(quantityCell.textContent);
                subtotalCell.textContent = Math.round(subtotal).toLocaleString("es-AR");
            } else {
                table.deleteRow(newRow.rowIndex);
            }
            updateTotal();
        };

        const removeCell = newRow.insertCell();
        removeCell.appendChild(removeButton);
    }
    updateTotal();
}

function eliminarTabla() {
    const table = document.getElementById('selected-table');

    // Eliminar todas las filas del tbody excepto la última
    const tbody = table.querySelector('tbody');
    let lastRow = tbody.lastElementChild;
    while (tbody.childNodes.length > 1) {
        tbody.removeChild(tbody.firstChild);
    }

    // Agregar la última fila nuevamente al final del tbody
    tbody.appendChild(lastRow);

    updateTotal();
}


function updateTotal(valor = 0, tipo) {
    const table = document.getElementById('selected-table');
    const tableTotal = document.getElementById('selected-table-total');
    let total = 0;
    let comentarios = document.getElementById("input-comentarios");
    
    for (let i = 1; i < table.rows.length - 1; i++) {
        const row = table.rows[i];
        const price = parseFloat(row.cells[1].textContent);
        const quantity = row.cells[2].textContent;
        total += price * quantity;
    }
    
    if (tipo == "descuento"){
        if (valor > 0) {
            console.log("descuento aplicado")

            comentarios.value = comentarios.value + " (Descuento aplicado del " + valor + "%)"

            total *= (1 - valor/100); // apply discount
        }
    }

    if (tipo == "recargo"){
        if (valor > 0) {
            console.log("recargo aplicado")

            comentarios.value = comentarios.value + " (Recargo aplicado del " + valor + "%)"

            total *= (1 + valor/100); // apply surcharge
        }
    }

    
    let totalRow = tableTotal.rows[tableTotal.rows.length - 1];
    if (totalRow.cells.length < 2) {
        // If the last row doesn't have enough cells, add them
        const cell1 = totalRow.insertCell();
        cell1.textContent = "Total:";
        const cell2 = totalRow.insertCell();
    }
    
    totalRow = tableTotal.rows[tableTotal.rows.length - 1]; // Update the reference to the last row
    totalRow.cells[1].textContent = Math.round(total).toLocaleString("es-AR");
    //totalRow.cells[1].textContent = total.toFixed(2);

    //console.log(table)
    //console.log(tableTotal)

}

    updateTotal()


    const btnDescuento = document.getElementById('btn-descuento');
    btnDescuento.addEventListener('click', function() {
    const tipo = "descuento"
    const valor = parseFloat(document.querySelector('.input-descuento').value);
    updateTotal(valor, tipo);
    });

    const btnRecargo = document.getElementById('btn-recargo');
    btnRecargo.addEventListener('click', function() {
        const tipo = "recargo"
        const valor = parseFloat(document.querySelector('.input-descuento').value);
        updateTotal(valor, tipo);
    });








  // GUARDAR TABLA //

  function guardarTabla() {

    //animacion carga
    const button = document.getElementById('guardar-venta');
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML  = 'Guardando...';
    button.classList.add('button-waiting');
    setTimeout(function() {
      button.disabled = false;
      button.innerHTML  = originalText + '<i class="fas fa-arrow-alt-circle-up"></i>';
      button.classList.remove('button-waiting');
    }, 1000);


    // Crear objeto de venta con los datos actuales
    var venta = {
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}),
        comentarios: document.getElementById('input-comentarios').value,
        tabla: [],
        tablaHTML: document.getElementById("table-total").innerHTML,
    };
    
    // Obtener la tabla con el id "table-total"
    var tabla = document.getElementById("table-total");
    var filas = tabla.getElementsByTagName("tr");

    // Recorrer las filas de la tabla y guardar los datos en el arreglo "tabla" del objeto de venta
    for (var i = 0; i < filas.length; i++) {
        var celdas = filas[i].getElementsByTagName("td");
        var fila = [];
        for (var j = 0; j < celdas.length; j++) {
            fila.push(celdas[j].textContent.trim());
        }
        venta.tabla.push(fila);
    }

    //console.log(venta)

    // Obtener ventas guardadas del local storage
    var ventasGuardadas = JSON.parse(localStorage.getItem("ventas")) || [];
  
    // Agregar nueva venta al arreglo de ventas guardadas
    ventasGuardadas.push(venta);
  
    // Guardar arreglo de ventas en el local storage
    localStorage.setItem("ventas", JSON.stringify(ventasGuardadas));

    var inputComentarios = document.getElementById('input-comentarios');
    inputComentarios.value = ''
    eliminarTabla()

}

  
  function eliminarVenta(index) {
    // Obtener ventas guardadas del local storage
    var ventasGuardadas = JSON.parse(localStorage.getItem("ventas")) || [];
  
    // Eliminar la venta en la posición indicada del arreglo de ventas guardadas
    ventasGuardadas.splice(index, 1);
  
    // Guardar arreglo de ventas en el local storage
    localStorage.setItem("ventas", JSON.stringify(ventasGuardadas));
  
    // Actualizar la tabla del modal
    mostrarVentasGuardadas();
  }





  
  
  function mostrarVentasGuardadas() {
    var ventasGuardadas = JSON.parse(localStorage.getItem("ventas")) || [];
  
    // Crear HTML para mostrar las ventas guardadas
    var modalBodyHTML = "";
    for (var i = 0; i < ventasGuardadas.length; i++) {
      var venta = ventasGuardadas[i];
      var fecha = venta.fecha;
      var hora = venta.hora;
      var comentarios = venta.comentarios;
      var tablaGuardada = venta.tabla;
      var tablaHTML = venta.tablaHTML;
  
      // Agregar el botón de eliminar venta y el HTML correspondiente a la tabla guardada
      modalBodyHTML +=
        '<div class="ventas-body">' +
        '<h3 class="venta_fecha">Fecha: ' + fecha +"</h3>" +
        '<h3 class="venta_fecha">Hora: ' + hora +"</h3>" +
        '<h4 class="venta_comentarios">Comentarios: ' + comentarios +"</h4>" +
        tablaHTML +
        "<button class='btn btn-danger mt-2 shake-button' onclick=\"eliminarVenta(" + i + ")\">Eliminar venta</button>" +
        "</div>";
    }

    //console.log(ventasGuardadas)
  
    // Mostrar HTML en el modal
    var modalBody = document.getElementById("modal-body");
    if (modalBody) {
      modalBody.innerHTML = modalBodyHTML;
    }
  }
  
  document.getElementById("open-modal").addEventListener("click", function () {
    mostrarVentasGuardadas();
  });






  function generateExcel() {
    // Obtener los datos almacenados en el localStorage
    var ventasGuardadas = JSON.parse(localStorage.getItem("ventas")) || [];
    console.log(ventasGuardadas)

    //Funcion hora
    const horaActual = getHoraActual();
    const fechaActual = getFechaActual();
    
    // Crear un archivo de Excel
    const workbook = XLSX.utils.book_new();
    
    // Recorrer cada elemento de ventasGuardadas y crear una hoja de cálculo para cada uno
    for (let i = 0; i < ventasGuardadas.length; i++) {
      var venta = ventasGuardadas[i];
      var fecha = venta.fecha;
      var hora = venta.hora;
      var comentarios = venta.comentarios;

      // Eliminar los datos de venta.tablaHTML
      venta.tablaHTML = '';
      venta.tablaHTML.value = "";

      // Crear una hoja de cálculo para los datos de esta venta
      const worksheet = XLSX.utils.json_to_sheet([venta]);

      // Definir los encabezados de las columnas
      XLSX.utils.sheet_add_aoa(worksheet, [["Fecha: ", fecha,"",""]], {origin: 'A1'});
      XLSX.utils.sheet_add_aoa(worksheet, [["Hora: ", hora,"",""]], {origin: 'A2'});
      XLSX.utils.sheet_add_aoa(worksheet, [["Comentarios: ", comentarios,"",""]], {origin: 'A3'});
      XLSX.utils.sheet_add_aoa(worksheet, [["","","",""]], {origin: 'A4'});

      // Crear una nueva matriz que contenga solo las dos primeras columnas de cada fila de venta.tabla
      const tablaReducida = venta.tabla.map(row => row.slice(0, 3));

      // Agregar la nueva matriz como filas a la hoja de cálculo
      XLSX.utils.sheet_add_aoa(worksheet, tablaReducida, {origin: 'A5'});

      // Agregar la hoja de cálculo al archivo de Excel
      XLSX.utils.book_append_sheet(workbook, worksheet, `Venta ${i+1}`);
    }
    
    // Guardar el archivo de Excel
    XLSX.writeFile(workbook, `ventas_${fechaActual}.xlsx`);
  }


  function getHoraActual() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}-${minutes}`;
    return formattedTime;
  }
  function getFechaActual() {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }


