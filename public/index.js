let globalIndexedStore = null;


window.onload= async function() {
    globalIndexedStore = await startDB();
    let btnSave = document.querySelector('#btnSave');
    let btnFind = document.querySelector('#btnFind');
    let btnRemove = document.querySelector('#btnRemove');
    let btnFindAll = document.querySelector('#btnFindAll');

    btnSave.addEventListener('click', onSave);
    btnFind.addEventListener('click', onFind);
    btnRemove.addEventListener('click',onDelete);
    btnFindAll.addEventListener('click',onFindAll);

    async function onSave (par = {voltage:1, modell:'abc'}) {
        let modell = document.querySelector('#modell').value;
        let voltage = document.querySelector('#voltage').value;
        let result;
        try{
            result = await addBjt({modell:modell, voltage:voltage},globalIndexedStore);
        } catch(e){
            alert(e);
            return
        }
        alert(result)
    }

     async function onFind (par={voltage:1,modell:'abc'}) {
        let modell = document.querySelector('#modell').value;
        let voltage = document.querySelector('#voltage').value;
        let result;
        try{
            result = await findBjt(modell, globalIndexedStore);
        } catch(e){
            alert(e);
            return
        }
        document.querySelector('#results').innerText = JSON.stringify(result);
    }

     async function onFindAll (par={voltage:1,modell:'abc'}) {
        let modell = document.querySelector('#modell').value;
        let voltage = document.querySelector('#voltage').value;
        let result;
        try{
            result = await findAll( globalIndexedStore);
        } catch(e){
            alert(e);
            return
        }
        document.querySelector('#results').innerText = JSON.stringify(result);
    }


    async function onDelete (par={voltage:1,modell:'abc'}) {
        let modell = document.querySelector('#modell').value;
        let voltage = document.querySelector('#voltage').value;
        let result;
        try{
            result = await deleteBjt(modell,globalIndexedStore);
        } catch(e){
            alert(e);
            return
        }
        alert(result)
    }








}


function startDB(){
    new Promise((resolve, reject) => {
        
    /*******************IndexedDB******************************/
    /**for the start you can checking - is the browser supporting IndexeDB?*/
    if (! ("indexedDB" in window) ) {
        alert('indexedDB not supported!');
        return; 
        //No support? Go in the corner and pout.
    }
    /**********************************
    *****if there is OK, try to open (or create ) a DB*/
    //open the database: params are @name and @version
    //No need do bother about DB name - because 
    //each site (domain) in a browser has his own storage  
    var openRequest = indexedDB.open("myTestDb1",1);
    //when our version greater that current in the browser (or not exists there)-
    //calls this callback function 
    openRequest.onupgradeneeded = function(e) {
        var thisDB = e.target.result;

        console.log("running onupgradeneeded");

        if (!thisDB.objectStoreNames.contains("bjt")) {
            //if there isn`t a store 'people' - create it, 
            //asign a property 'keyPath'.
            //It means that you have in an object which you want to save
            // a property with name "email", which will use as the primary key 
            var bjtObjStore = thisDB.createObjectStore("bjt",{keyPath: "modell"});   
            //create an index - for searching
            bjtObjStore.createIndex("voltage", "voltage", {unique:false});

        }
    }
    //THis callback usually calls AFTER 'onupgradeneeded'
    //when a database has opened successfully:
    openRequest.onsuccess = function(e) {
        console.log("running onsuccess");
        //retrive a database and assign to a global variable 
        resolve( e.target.result);
        
    }

    openRequest.onerror = function(e) {
        console.log("onerror!");
        alert(e);
        reject(e);
    }
    });
}




async function addBjt(par={modell:'kt315',voltage:30}, db) {
    return new Promise((resolve, reject) => {
        //start transaction
        var transaction = db.startTransaction(['bjt'],'readwrite');
        //ask for the object store
        let store = transaction.objectStore('bjt')
        //perform and add
        var request = store.add(par);
        request.onerror=(e)=>{
            reject(e);
            return;
        }
        request.onsuccess=()=>{
            resolve('Object has created!');
            return;
        }
    });
}

async function deleteBjt (modell,db) {
    return new Promise((resolve, reject) => {
        //start a transaction
        let transaction = db.transaction(['bjt'],'readwrite');
        //ask a store
        let store = transaction.objectStore('bjt');
        let result = store.delete(modell);
        result.onsuccess=()=>{
            console.log('the resource deleted successfully');
            resolve('OK');
        }
        result.onerror=(e)=>{
            reject(e);
        }
    });

}

async function findAll(db) {
    let arrayOfResults = [];
    //start a transaction
    let transactoin = db.startTransaction(['bjt'],'readonly');
    //ask a store
    let store = transactoin.objectStore('bjt');
    //get a cursor for iteration
    let cursor = store.openCursor();
    //iterate
    cursor.onsuccess=(r)=>{
        let result = r.target.result;
        if (result) {
            //when the item exists - push it to the array
            recordsList.push(result.value);
            //continue iteration
            result.continue();
        } else {

        }

    }

    transactoin.oncomplete = () =>{
        resolve(arrayOfResults);
    }

    transactoin.onerror=(e) =>{
        reject(e)
    }

}

async function findBjt (modell,db) {
 return new Promise((resolve, reject) => {
     //start a transacton
     let transaction = db.transaction(['bjt'],'readonly');
     //ask a store
     let store = transaction.objectStore('bjt');
     //start a query
     var request = store.get(modell);

     request.onsuccess=(e)=>{
        if (!e.target.result) {
            resolve({});
        } else {
            resolve(e.target.result);
            return;
        }
     }

     request.onerror=(e)=>{
        console.error(e);
       reject(e);
     }
 });
}



