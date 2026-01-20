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

// data
let headers = []; 
let allData = []; 
let hiddenColumns = []; 
let currentPage = 1; 
const rowsPerPage = 10; 

//load csv
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return; //if 

    Papa.parse(file, {
        header: true, //
        skipEmptyLines: true, //skip emtpy rows
        complete: (results) => { //callback after csv load
            //reset 
            thead.innerHTML = "";
            tbody.innerHTML = "";
            columnControls.innerHTML = "";
            addForm.innerHTML = "";
            hiddenColumns = [];

            //results.data[0] -> { Brand: "Toyota", Model: "Corolla"} 
            //Object.keys -> ["Brand", "Model", "Year"]
            headers = Object.keys(results.data[0]); 

            const headerRow = document.createElement("tr"); //creates row (will be filled with headers)
            headers.forEach((header, index) => { //for every column (headers)
                const th = document.createElement("th"); //creates row header
                th.textContent = header; 
                headerRow.appendChild(th); //add row in tr (headerRow)

                createCheckbox(header, index); //call createCheckbox

                // for every header create an input 
                const input = document.createElement("input");
                input.type = "text";
                input.placeholder = header;
                input.name = header; //
                addForm.appendChild(input);
            });
            thead.appendChild(headerRow);

            allData = results.data; //save all data
            currentPage = 1;
            renderTablePage(); //call renderTablePage

            // show button and form
            columnsBtn.classList.remove("hidden");
            addFormContainer.classList.remove("hidden");
            pagination.style.display = "block";
        }
    });
});

//creates from scratch the table of the current page 
const renderTablePage = () => { 
    tbody.innerHTML = ""; //change page or load new csv
    const start = (currentPage - 1) * rowsPerPage; 
    const end = start + rowsPerPage;
    const pageRows = allData.slice(start, end); //current page

    pageRows.forEach(rowObj => { //
        const tr = document.createElement("tr"); //new row (tr) for every object

        Object.values(rowObj).forEach(value => {
            const td = document.createElement("td"); //creates td
            td.textContent = value ?? ""; //fill each td and check if null or undefined
            tr.appendChild(td); //fill each tr with td
        });

        tbody.appendChild(tr); //fill tbody with every tr
    });

    hiddenColumns.forEach(colIndex => toggleColumn(colIndex, false));
    updatePageInfo();
};

//pagination
const updatePageInfo = () => {
    const totalPages = Math.ceil(allData.length / rowsPerPage); 
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.style.display = totalPages > 1 ? "inline-block" : "none"; //hide if csv has a single page
    nextBtn.style.display = totalPages > 1 ? "inline-block" : "none";
};

nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(allData.length / rowsPerPage);

    if (currentPage === totalPages) { //if current page is last page
        currentPage = 1; //go to 1st page
    } else {
        currentPage++;
    }
    renderTablePage();
});

prevBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(allData.length / rowsPerPage);

    if (currentPage === 1) { //if current page is first page
        currentPage = totalPages; // go to last page
    } else {
        currentPage--;
    }
    renderTablePage();
});

columnsBtn.addEventListener("click", () => { 
    columnControls.classList.toggle("hidden"); //gives access to css class 
});

const createCheckbox = (columnName, columnIndex) => {
    const label = document.createElement("label"); //and column name 
    const checkbox = document.createElement("input");//checkbox 
    checkbox.type = "checkbox";
    checkbox.checked = true; 

    checkbox.addEventListener("change", () => toggleColumn(columnIndex, checkbox.checked)); //if checkbox change 

    label.appendChild(checkbox); //add checkbox in label
    label.appendChild(document.createTextNode(" " + columnName)); //add column name in label
    columnControls.appendChild(label); //add label in dropdown div
};

const toggleColumn = (columnIndex, show) => { 
    const displayValue = show ? "" : "none"; // if show = true, show column
    const headerCell = thead.querySelectorAll("th")[columnIndex]; //hide/show header
    headerCell.style.display = displayValue; 
    tbody.querySelectorAll("tr").forEach(row => { //for each row of the table
        const cell = row.children[columnIndex];
        if (cell) cell.style.display = displayValue;
    });

    if (!show) { //to hide  
    if (!hiddenColumns.includes(columnIndex)) { //if column isnt in hiddenColumns[] 
        hiddenColumns.push(columnIndex); //add it
        }
    } else { //if column should be displayed again
        hiddenColumns = hiddenColumns.filter(i => i !== columnIndex); //Remove it from  hidden list
    }
};

// add record
addRecordBtn.addEventListener("click", () => {
    const newRecord = {}; //create empty obj
    headers.forEach(header => {
        newRecord[header] = addForm.querySelector(`[name="${header}"]`).value; //fill objects with inputs
    });

    if (Object.values(newRecord).some(v => v === "")) { //defensive check 
        alert("Please complete all fields"); 
        return; //out of the event listener
    }

    allData.push(newRecord); //add record in table (last page)
    currentPage = Math.ceil(allData.length / rowsPerPage); //direct to last page
    renderTablePage(); //recreate table (thats why the new record appears)

    // clean form 
    addForm.querySelectorAll("input").forEach(input => input.value = "");
});
