//fishing html elements
const fileInput = document.getElementById("csvFileInput"); //csv input
const table = document.getElementById("carTable"); //table
const thead = table.querySelector("thead"); //table header 
const tbody = table.querySelector("tbody"); //table body
const columnControls = document.getElementById("columnControls"); //dropdown div
const columnsBtn = document.getElementById("columnsBtn"); //dropdown div button

// add form elements
const addFormContainer = document.getElementById("addFormContainer");
const addForm = document.getElementById("addForm");
const addRecordBtn = document.getElementById("addRecordBtn");

// pagination
const pagination = document.getElementById("pagination");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo"); //current page

//undo delete
let lastDeleted = null;
let lastDeletedIndex = null;
const undoBtn = document.getElementById("undoBtn");

//export button
const exportBtn = document.getElementById("exportBtn");

// data
let headers = []; 
let allData = []; 
let hiddenColumns = []; 
let currentPage = 1; 
const rowsPerPage = 10; 

//load csv
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader(); 

    reader.onload = (e) => { //when reading is complete
        const text = e.target.result.trim();
        const lines = text.split("\n"); //split file in rows

        headers = lines[0].split(",").map(h => h.trim()); //headers

        // reset
        thead.innerHTML = "";
        tbody.innerHTML = "";
        columnControls.innerHTML = "";
        addForm.innerHTML = "";
        hiddenColumns = [];

        const headerRow = document.createElement("tr");
        const optionsTh = document.createElement("th");
        optionsTh.textContent = "Options";
        headerRow.appendChild(optionsTh);

        headers.forEach((header, index) => { //for every column
            const th = document.createElement("th"); //create <th> 
            th.textContent = header;
            headerRow.appendChild(th);

            createCheckbox(header, index);

            const input = document.createElement("input"); //input for every column
            input.type = "text";
            input.placeholder = header;
            input.name = header;
            addForm.appendChild(input);
        });

        thead.appendChild(headerRow);

        // data
        allData = lines.slice(1).map(line => { //ignore first line 
            const values = line.split(",");
            const obj = {};
            headers.forEach((h, i) => obj[h] = values[i]?.trim() ?? "");
            return obj;
        });

        currentPage = 1;
        renderTablePage();
        
        //show controls
        columnsBtn.classList.remove("hidden");
        addFormContainer.classList.remove("hidden");
        pagination.style.display = "block";
        exportBtn.classList.remove("hidden");
    };

    reader.readAsText(file); 
});

//creates from scratch the table of the current page 
const renderTablePage = () => { 
    tbody.innerHTML = ""; //change page or load new csv
    const start = (currentPage - 1) * rowsPerPage; 
    const end = start + rowsPerPage;
    const pageRows = allData.slice(start, end); //current page

    pageRows.forEach((rowObj, rowIndex) => { 
        const tr = document.createElement("tr"); //new row (tr) for every object

        // options column (edit / delete)
        const optionsTd = document.createElement("td");
        optionsTd.textContent = ""; //buttons 
        tr.appendChild(optionsTd);

        // delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";  
        deleteBtn.classList.add("delete-btn"); //class for css

        deleteBtn.addEventListener("click", () => {
            const confirmed = confirm("Are you sure?"); //confirm browser method
            if (!confirmed) return; //cancel

            const globalIndex = (currentPage - 1) * rowsPerPage + rowIndex;

            lastDeleted = allData[globalIndex];
            lastDeletedIndex = globalIndex;

            allData.splice(globalIndex, 1);

            undoBtn.classList.remove("hidden"); // delete button appear after first delete

            const totalPages = Math.ceil(allData.length / rowsPerPage); 
            if (currentPage > totalPages) currentPage = totalPages; 

            renderTablePage();
        });

        //edit button
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        optionsTd.appendChild(editBtn);
        editBtn.classList.add("edit-btn");

        editBtn.addEventListener("click", () => { 
            const isEditing = tr.classList.contains("editing"); //local check

            if (!isEditing) { // start editing
                tr.classList.add("editing"); 
                editBtn.textContent = "Save"; 

                headers.forEach((header, i) => {
                    const cell = tr.children[i + 1];
                    const input = document.createElement("input"); 
                    input.value = cell.textContent; 
                    cell.textContent = ""; 
                    cell.appendChild(input); 
                });
            } else { // finish editing
                tr.classList.remove("editing"); 
                editBtn.textContent = "Edit";

                const globalIndex = (currentPage - 1) * rowsPerPage + rowIndex;

                headers.forEach((header, i) => {
                    const input = tr.children[i + 1].querySelector("input"); // +1 because first <td> is options
                    allData[globalIndex][header] = input.value; 
                    tr.children[i + 1].textContent = input.value; 
                });
            }
        });

        optionsTd.appendChild(deleteBtn);
        tr.appendChild(optionsTd);

        // fill row with data
        Object.values(rowObj).forEach(value => {
            const td = document.createElement("td"); 
            td.textContent = value ?? ""; 
            tr.appendChild(td); 
        });

        tbody.appendChild(tr); 
    });

    hiddenColumns.forEach(colIndex => toggleColumn(colIndex, false));
    updatePageInfo();
};

// undo delete  
undoBtn.addEventListener("click", () => {
    if (lastDeleted !== null) {
        allData.splice(lastDeletedIndex, 0, lastDeleted); // add record where it was
        lastDeleted = null;
        lastDeletedIndex = null;
        undoBtn.classList.add("hidden"); //hide undo-button after use
        renderTablePage(); 
    }
});

//pagination
const updatePageInfo = () => {
    const totalPages = Math.ceil(allData.length / rowsPerPage); 
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.style.display = totalPages > 1 ? "inline-block" : "none"; 
    nextBtn.style.display = totalPages > 1 ? "inline-block" : "none";
};

nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(allData.length / rowsPerPage);
    currentPage = currentPage === totalPages ? 1 : currentPage + 1;
    renderTablePage();
});

prevBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(allData.length / rowsPerPage);
    currentPage = currentPage === 1 ? totalPages : currentPage - 1;
    renderTablePage(); 
});

columnsBtn.addEventListener("click", () => { 
    columnControls.classList.toggle("hidden"); 
});

const createCheckbox = (columnName, columnIndex) => {
    const label = document.createElement("label"); 
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true; 

    checkbox.addEventListener("change", () => toggleColumn(columnIndex, checkbox.checked)); 

    label.appendChild(checkbox); 
    label.appendChild(document.createTextNode(" " + columnName)); 
    columnControls.appendChild(label); 
};

const toggleColumn = (columnIndex, show) => { 
    const displayValue = show ? "" : "none"; 
    const headerCell = thead.querySelectorAll("th")[columnIndex + 1]; 
    headerCell.style.display = displayValue; 
    tbody.querySelectorAll("tr").forEach(row => { 
        const cell = row.children[columnIndex + 1];
        if (cell) cell.style.display = displayValue;
    });

    if (!show) { 
        if (!hiddenColumns.includes(columnIndex)) hiddenColumns.push(columnIndex); 
    } else { 
        hiddenColumns = hiddenColumns.filter(i => i !== columnIndex); 
    }
};

//export CSV
exportBtn.addEventListener("click", () => { 
    if (allData.length === 0) return; 
    
    const shownColumns = headers.filter((_, i) => !hiddenColumns.includes(i)); 
    let allCsvLines = []; 
    allCsvLines.push(shownColumns.join(",")); // headers

    allData.forEach(row => {
        let rowCells = shownColumns.map(col => {
            let value = row[col] || ""; 
            if (value.includes(",") || value.includes('"')) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
        });
        allCsvLines.push(rowCells.join(","));
    });

    let csvContent = allCsvLines.join("\n");
    let fileBlob = new Blob([csvContent], { type: "text/csv" });
    let fileUrl = URL.createObjectURL(fileBlob);

    let tempLink = document.createElement("a");
    tempLink.href = fileUrl;
    tempLink.download = "export.csv"; 
    tempLink.click(); 
});

//add record 
addRecordBtn.addEventListener("click", () => {
    const newRecord = {}; //create empty obj
    headers.forEach(header => {
        //fill object from inputs
        newRecord[header] = addForm.querySelector(`[name="${header}"]`).value;
    });

    //check if any field is empty
    if (Object.values(newRecord).some(v => v === "")) { 
        alert("Please complete all fields"); 
        return; 
    }

    allData.push(newRecord); //add record
    currentPage = Math.ceil(allData.length / rowsPerPage); //go to last page
    renderTablePage(); //update table

    // clean form inputs
    addForm.querySelectorAll("input").forEach(input => input.value = "");
});