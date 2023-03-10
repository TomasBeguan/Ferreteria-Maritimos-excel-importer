

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

        excel.header().forEach( title => {
            table.querySelector("thead>tr").innerHTML += `<td>${title}</td>`
        })

        for (let index = 0; index < excel.rows().count(); index++) {
            const row = excel.rows().get(index);

            table.querySelector('tbody').innerHTML += `
            <tr>
                <td class="nombre">${row.producto()}</td>
                <td class="medida">${row.medida()}</td>
                <td class="medida">${row.marca()}</td>
                <td class="medida">${row.codigo()}</td>
                <td class="precio">$ ${row.precio()}</td>
                <td class="d-flex justify-content-center td_boton_añadir ">
                    <button type="button" class="btn btn-success boton_añadir" id="add" onclick="add_button(${index})">+</button>
                </td>
            </tr>
            `
            
        }
        
    }
}


const excelInput = document.getElementById('excel-input')

excelInput.addEventListener('change', async function(){
    const content = await readXlsxFile( excelInput.files[0] )
    
    const excel = new Excel(content, 3) // 3 columnas para omitir
    
    console.log(ExcelPrinter.print('excel-table', excel))
    //console.log(excel.rows().get(1).producto())

})


function searcher() {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("excel-searcher");
    filter = input.value.toUpperCase();
    table = document.getElementById("excel-table");
    tr = table.getElementsByTagName("tr");
  
    // Loop through all table rows starting from index 1, and hide those who don't match the search query
    for (i = 1; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
}



  function add_button(indice){
    const row = document.querySelectorAll(`#excel-table tbody tr:nth-child(${indice+1}) td`);
    const rowData = [];
    row.forEach((cell) => {
        rowData.push(cell.textContent);
    });
    
    const table = document.getElementById('selected-table');
    const productName = rowData[0] + " " + rowData[1];
    //productName = productName + " " + rowData[1]
    const productPrice = parseFloat(rowData[4].replace(/[^0-9.-]+/g,""));
    let rowExists = false;
    let quantityCell;
    
    // Search if a row already exists for the product
    for (let i = 1; i < table.rows.length - 1; i++) {
        const row = table.rows[i];
        if (row.cells[0].textContent === productName) {
            rowExists = true;
            quantityCell = row.cells[2];
            break;
        }
    }
    
    if (rowExists) {
        // If a row exists for the product, add the quantity to the quantity cell
        const currentQuantity = parseInt(quantityCell.textContent);
        quantityCell.textContent = currentQuantity + 1;
    } else {
        // If no row exists for the product, create a new row with the quantity
        const newRow = table.insertRow(table.rows.length - 1);
        const productCell = newRow.insertCell();
        productCell.textContent = productName;
        productCell.classList.add("table-total-nombre");
        const priceCell = newRow.insertCell();
        priceCell.textContent = productPrice.toFixed(2);
        priceCell.classList.add("table-total-precio");
        const quantityCell = newRow.insertCell();
        quantityCell.classList.add("table-total-precio");
        quantityCell.textContent = "1";

        const removeButton = document.createElement("button");
        removeButton.textContent = "-";
        removeButton.type = "button";
        removeButton.classList.add("btn", "btn-danger");
        removeButton.onclick = function() {
            const currentQuantity = parseInt(quantityCell.textContent);
            if (currentQuantity > 1) {
                quantityCell.textContent = currentQuantity - 1;
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



function updateTotal(discount = 0) {
    const table = document.getElementById('selected-table');
    const tableTotal = document.getElementById('selected-table-total');
    let total = 0;
    
    for (let i = 1; i < table.rows.length - 1; i++) {
        const row = table.rows[i];
        const price = parseFloat(row.cells[1].textContent);
        const quantity = parseInt(row.cells[2].textContent);
        total += price * quantity;
    }
    
    if (discount > 0) {
        total *= (1 - discount/100); // apply discount
    }
    
    let totalRow = tableTotal.rows[tableTotal.rows.length - 1];
    if (totalRow.cells.length < 2) {
        // If the last row doesn't have enough cells, add them
        const cell1 = totalRow.insertCell();
        cell1.textContent = "Total:";
        const cell2 = totalRow.insertCell();
    }
    
    totalRow = tableTotal.rows[tableTotal.rows.length - 1]; // Update the reference to the last row
    totalRow.cells[1].textContent = total.toFixed(2);

}

    const btnDescuento = document.getElementById('btn-descuento');
    btnDescuento.addEventListener('click', function() {
    const discount = parseFloat(document.querySelector('.input-descuento').value);
    updateTotal(discount);
    });








  
  var tablaContainer = document.getElementById("table-container");

  function guardarTabla() {
    // Crear objeto de venta con la fecha actual
    var venta = {
        fecha: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        tabla: document.getElementById("table-total").innerHTML,
    };
  
    // Obtener ventas guardadas del local storage
    var ventasGuardadas = JSON.parse(localStorage.getItem("ventas")) || [];
  
    // Agregar nueva venta al arreglo de ventas guardadas
    ventasGuardadas.push(venta);
  
    // Guardar arreglo de ventas en el local storage
    localStorage.setItem("ventas", JSON.stringify(ventasGuardadas));
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
      var tablaGuardada = venta.tabla;
  
      // Eliminar la cuarta columna de la tabla guardada
      var tablaSinColumna = "";
if (typeof tablaGuardada === "string") {
  tablaSinColumna = tablaGuardada.replace(/<td class="eliminar-item">[^<]+<\/td>/g, "");
}
  
      // Agregar el botón de eliminar venta y el HTML correspondiente a la tabla guardada
      modalBodyHTML +=
        '<div class="ventas-body">' +
        '<p class="venta_fecha">Venta registrada el ' +
        fecha +
        "</p>" +
        tablaSinColumna +
        "<button class='btn btn-danger' onclick=\"eliminarVenta(" +
        i +
        ")\">Eliminar venta</button>" +
        "</div>";
    }
  
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
    const savedTables = Object.keys(localStorage).map(key => JSON.parse(localStorage.getItem(key)));
    // Crear un archivo de Excel
    const workbook = XLSX.utils.book_new();
    savedTables.forEach((table, index) => {
      // Crear una hoja de cálculo para cada tabla guardada
      const worksheet = XLSX.utils.aoa_to_sheet(table.data);
      // Agregar los encabezados
      XLSX.utils.sheet_add_aoa(worksheet, table.headers, { origin: "A1" });
      // Agregar la fecha y la hora
      XLSX.utils.sheet_add_aoa(worksheet, [["Fecha", table.date], ["Hora", table.time]], { origin: `A${table.data.length + 2}` });
      // Agregar el total
      XLSX.utils.sheet_add_aoa(worksheet, [["Total", table.total]], { origin: `A${table.data.length + 3}` });
      // Agregar la hoja de cálculo al archivo de Excel
      XLSX.utils.book_append_sheet(workbook, worksheet, `Tabla ${index + 1}`);
    });
    // Guardar el archivo de Excel
    XLSX.writeFile(workbook, "tablas.xlsx");
  }










/*

  const saveButton = document.getElementById("save-button");
    saveButton.addEventListener("click", function() {
    const table = document.getElementById("table-total");
    const filename = "Tabla Total";
    generateFile(table, filename);
    });



function generateFile(table, filename) {
    // Crear hoja de cálculo
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["producto", "precio", "cantidad", "total", "fecha", "hora"]
    ]);
    let total = 0;
    // Agregar datos a las celdas
    for (let i = 1; i < table.rows.length; i++) {
      const row = table.rows[i];
      const producto = row.cells[0].textContent;
      const precio = row.cells[1].textContent;
      const cantidad = row.cells[2].textContent;
      const subtotal = row.cells[3].textContent;
      total += parseFloat(subtotal.replace("$", ""));
      const fecha = new Date().toLocaleDateString();
      const hora = new Date().toLocaleTimeString();
      XLSX.utils.sheet_add_aoa(worksheet, [
        [producto, precio, cantidad, subtotal, fecha, hora]
      ], {
        origin: -1
      });
    }
    // Agregar la fila de totales
    XLSX.utils.sheet_add_aoa(worksheet, [
      ["Total", "", "", "$" + total.toFixed(2), "", ""]
    ], {
      origin: -1
    });
    // Crear libro de trabajo y agregar hoja de cálculo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tabla Total");
    // Guardar archivo
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }




  document.getElementById('save-button').addEventListener('click', saveAsExcel);
  function saveAsExcel() {
    const worksheet = XLSX.utils.table_to_sheet(document.getElementById('selected-table'));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');
    XLSX.writeFile(workbook, 'tabla-productos.xlsx');
  }

    */