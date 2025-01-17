//#region Frontend callbacks
async function GetAll() {
    let data = await GetAllProcedures()
    await EmbedCheckDatas(data)

    UpdateOutput(data)
}

async function CreateNew() {
    CreateNewProcedure({
        "uuid": document.getElementById("uuid").value,
        "name": document.getElementById("name").value,
        "version": document.getElementById("version").value,
        "description": document.getElementById("description").value,
        "checks": GetCheckUUIDList()
    })
    
    document.getElementById("uuid").value = ""
    document.getElementById("name").value = ""
    document.getElementById("version").value = ""
    document.getElementById("description").value = ""
}

async function GetById() {
    let data = await GetProcedureByUUID(document.getElementById("id_get").value)
    await EmbedCheckData(data)

    document.getElementById("id_get").value = ""
    UpdateOutput(data)
}

async function PutById() {
    PutProcedureById(document.getElementById("id_put").value)
    
    document.getElementById("id_put").value = ""
    document.getElementById("id_put_body").value = ""
}

async function DeleteById() {
    DeleteProcedureById(document.getElementById("id_delete").value);

    document.getElementById("id_delete").value = ""
}

function UpdateOutput(data) {
    document.getElementById("output").innerHTML = "Output: <pre>" + JSON.stringify(data, null, 2) + "</pre>"
    document.getElementById("clearOutput").style.display = "block"
}

function ClearOutput() {
    document.getElementById("output").innerHTML = ""
    document.getElementById("clearOutput").style.display = "none"
}
//#endregion



//#region Frontend util
async function GetAllProcedures() {
    let data = []
    await fetch("http://localhost:8080/procedures/", {
        method: "GET",
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    }).then((response) => {
        data = response.json();
    })
    
    return data
}

async function GetProcedureByUUID(uuid) {
    let data = []
    await fetch("http://localhost:8080/procedures/" + uuid, {
        method: "GET",
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    }).then((response) => {
        data = response.json();
    })
    
    return data
}

async function CreateNewProcedure(procedure) {
    await CreateChecksIfNotExist(procedure)
    
    await fetch("http://localhost:8080/procedures/", {
        method: "Post",
        body: JSON.stringify(procedure),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
}

async function PutProcedureById(uuid) {
    await fetch("http://localhost:8080/procedures/" + uuid, {
        method: "Put",
        body: document.getElementById("id_put_body").value,
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
}

async function DeleteProcedureById(uuid) {
    await fetch("http://localhost:8080/procedures/" + uuid, {
        method: "Delete",
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    })
}
//#endregion



//#region Other util
async function EmbedCheckDatas(procedures) {
    for (const [i, procedure] of procedures.entries()) {
        await EmbedCheckData(procedure)
    }
}

async function EmbedCheckData(procedure) {
    let checks = []
    for (let index = 0; index < procedure.checks.length; index++) {
        await GetCheckById(procedure.checks[index]).then(check => checks.push(check))
    }
    procedure.checks = checks
}

async function GetCheckById(uuid) {
    let check = { "uuid" : uuid, "status" : -1 }
    await fetch("http://localhost:8080/checks/" + uuid, {
        method: "GET",
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    }).then(async (response) => {
        if (response.ok) {
            check = response.json();
        }
    })
    
    return check
}

function CreateNewCheck(uuid) {
    return {
        "uuid": uuid,
        "name": "sum_is_zero",
        "version": "0.0.1",
        "description": "Checks if the sum of the amounts is equal to zero.",
        "lang": "python",
        "params": [
            "amount_1: int",
            "amount_2: int",
            "amount_3: int"
        ],
        "func_body": "return (amount_1 + amount_2 + amount_3) == 0"
    }
}

async function CreateChecksIfNotExist(procedure) {
    for (let index = 0; index < procedure.checks.length; index++) {
        let uuid = procedure.checks[index]
        await GetCheckById(uuid).then(async (data) => {
            if (data.status == -1) {
                await fetch("http://localhost:8080/checks/", {
                    method: "Post",
                    body: JSON.stringify(CreateNewCheck(uuid)),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    }
                })
            }
        })
    }
}
//#endregion



//#region Check UUID List
var checkCount = 1
function AddCheck() {
    checkCount++
    
    let tbody = document.getElementById('table').getElementsByTagName('tbody')[0]
    let row = tbody.insertRow()
    row.id = "checks_tr_" + checkCount
    
    let cell = row.insertCell()
    let input = document.createElement("input")
    input.type = "text"
    input.name = "checks_" + checkCount
    input.id = "checks_" + checkCount
    
    cell.appendChild(input)
}

function RemoveCheck() {
    if (checkCount <= 1) { return }
    
    document.getElementById("checks_tr_" + checkCount).remove()
    checkCount--;
}

function GetCheckUUIDList() {
    let checks = []
    for (let index = 0; index < checkCount; index++) {
        let input = document.getElementById("checks_" + (index + 1))
        checks.push(input.value)
        
        if (index >= 1) {
            input.remove()
        }
        else {
            input.value = ""
        }
    }

    return checks
}
//#endregion