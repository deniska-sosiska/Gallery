// import {model} from 'model.js'
class ImageBlock {
  constructor(name, link, info = {}) {
    this.name = name
    this.link = link
    this.info = info
  } //format, size, weight, mimetype, date, description
}

const model = [
   new ImageBlock('Розы', 'Розы.jpg'
   // {
     // format: 'Портрет',
     // size: ''
     // weight:
     // mimetype:
     // date:
     // description:
   // }
 ),
   new ImageBlock('Манхеттен', 'Манхеттен.jpg'),
   new ImageBlock('Лунная ночь', 'Лунная ночь.jpg'),
   new ImageBlock('Натюрморт с устрицами', 'Натюрморт с устрицами.jpg'),
   new ImageBlock('Осенний день', 'Осенний день.jpg')
   // new ImageBlock('Пейзаж с речкой', 'Пейзаж с речкой.jpg'),
   // new ImageBlock('Букет', 'Букет.jpg'),
   // new ImageBlock('Навстречу мечте', 'Навстречу мечте.jpg'),
   // new ImageBlock('Вот и осень', 'Вот и осень.jpg'),
   // new ImageBlock('Осенний мотив', 'Осенний мотив.jpg'),
   // new ImageBlock('У пруда', 'У пруда.jpg')
]
//=============================================================
let $clean = document.querySelector('#clean')
let $content = document.querySelector('#content_block')
let $newImgForm = document.querySelector('#newImgForm')
let $chgImgForm = document.querySelector('#chgImgForm')
//======================IndexedDB==============================
let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB

if (!window.indexedDB)
  console.error('Ваш браузер не поддерживает indexedDB');
let request = indexedDB.open("gallery", 1)
let db

request.onerror = function(event) {
  console.log('Ошибка с IDB: ', event.target.errorCode)
};
request.onupgradeneeded = function(event){
  db = event.target.result
  let imagesStorage = db.createObjectStore('images', {keyPath: 'id', autoIncrement: true})
};
request.onsuccess = function(event) {
  db = event.target.result
  updateDisplay(db)
}
//===================================================================

const showAddForm = () => {
  $chgImgForm.style.display = 'none'
  $newImgForm.style.display = 'inline-block'
}
const showChangeImages = () => {
  $newImgForm.style.display = 'none'
  $chgImgForm.style.display = 'inline-block'
}



//Вызов ф. добавление картины по пути
const addImgForm = () => {
  let $files = $newImgForm.children[2].children[0].files
  for(let i = 0; i < $files.length; i++){
    let file = $files[i]
    let fileName = file.name
    var reader = new FileReader();
    reader.onload = (function() {
      let objImg = {link: reader.result, info: {name: fileName,  date: file.lastModifiedDate, size: file.size, mimetype: file.type}}
      template(db, 'add', objImg)
    })
    reader.readAsDataURL(file);
  }

  $newImgForm.style.display = 'none';
  $clean.style.display = 'inline-block'

}
   //Вызов ф. удаление картины по индексу
const btnDelImages = () => {
  template(db, 'delete')
}   //Вызов ф. удаление картины по индексу
const cleanStorageForm = () => {
  template(db, 'clean')
  $clean.style.display = 'none'
}   //Вывод в html
const outptHtml = (allImages) => {
  $content.innerHTML = '';
  allImages.forEach((item) => {
    let html = ''
    html = newImage(item)
    $content.insertAdjacentHTML('beforeend', html)
  })
}
          //=====================//

const template = (db, option, item = {}) => {
  let ts = db.transaction('images', 'readwrite')
  let store = ts.objectStore('images')
  if (option == 'add') {
    let newImg = {link: item.link, info: item.info}
    let req = store.add(newImg)
  }
  else if (option == 'delete') {
    const ind = parseInt(prompt('"Удаление по индексу": Картину с каким индексом нужно удалить? '))
    let req = store.getAll()
      req.onsuccess = (event) => {
        let key = req.result;
        let deleteRequest = store.delete(ind)
        console.log(req.result)
      }
  }
  else if (option == 'clean') {
      let req = store.clear();
  }
  ts.oncomplete = (event) => { updateDisplay(db) }
  ts.onerror = function(event) {
    console.log('error with transaction: ', option)
  }
}

    //Функция добавления
/*const addImages = (db, item) => {
  let ts = db.transaction('images', 'readwrite')
  let store = ts.objectStore('images')
  let newImg = {name: item.name, link: item.link}
  let req = store.add(newImg)
  ts.oncomplete = (event) => { updateDisplay(db) }
  ts.onerror = function(event) {
    console.log('error with transaction: add')
  }
}*/   //Функция просмотра данных
const updateDisplay = (db) => {
  let ts = db.transaction('images', 'readonly')
  let store = ts.objectStore('images')
  let req = store.openCursor()
  let allImages = []
    req.onsuccess = (event) => {
      let cursor = event.target.result;
      if (cursor != null) {
        allImages.push(cursor.value);
        cursor.continue()
      } else {  outptHtml(allImages)  }
    }
    req.onerror = (event) => {
      console.log('error in cursor request ' + event.target.errorCode)
    }
  ts.oncomplete = () => { console.log('updated') }
  ts.onerror = (event) => { console.log('error with transaction: update') }
}   //Функция замены картины
/*const chgImages = (db, id) => {
  let ts = db.transaction('images', 'readwrite')
  let store = ts.objectStore('images')
  let newImg = {name: item.name, link: item.link}
  let added = store.put(newImg)
  ts.oncomplete = () => { updateDisplay(db) }
  ts.onerror = (event) => { console.log('error with transaction: change') }
}   //Функция удаление по индексу
const deleteImages = (db) => {
  let ts = db.transaction('images', 'readwrite')
  let store = ts.objectStore('images')
  const req = store.getAll()
  const q = parseInt(prompt('"Удаление по индексу": Картину с каким индексом нужно удалить? '))
    req.onsuccess = (event) => {
      let key = req.result;
      let deleteRequest = store.delete(q)
    }
  ts.oncomplete = (event) => { updateDisplay(db) }
  ts.onerror = function(event) { console.log('error with transaction: delete') }
}   //Функция очистки хранилища
const cleanStorage = (db) => {
  let ts = db.transaction('images', 'readwrite')
  let store = ts.objectStore('images')
  let req = store.clear();
  ts.oncomplete = (event) => { updateDisplay(db) }
  ts.onerror = function(event) { console.log('error with transaction: clean') }
}*/
//===============================//
//================================================================
function newImage(item) {
  return `
  <div class="image">
    <img src="${item.link}">
    <p>${item.info.name}</p>
  </div>
  `
}
