// import {model} from 'model.js'
class ImageBlock {
  constructor(name, link, options = '') {
    this.name = name
    this.link = link
    this.options = options
  }
}

const model = [
   new ImageBlock('Розы', 'Розы.jpg'),
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
let $newImgForm = document.querySelector('#newImgForm')
let $chgImgForm = document.querySelector('#chgImgForm')
let $content = document.querySelector('#content_block')
//======================IndexedDB==============================

if (!window.indexedDB){
  console.error('Ваш браузер не поддерживает indexedDB');
}

let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
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
    //Добавление картины по пути. доделать
const formAddImg = (form) => {
  let str = form.file.value
  let newStr = str.slice(12)
  // console.log(str)
  let item = {name: form.nameFile.value, link: newStr}

  addImages(db, item)
  form.style.display = 'none'
}

const newImagesForm = () => {
  $chgImgForm.style.display = 'none'
  $newImgForm.style.display = 'inline-block'
}


    //Добавление картин с массива model
const imagesArr = () => {
  model.forEach((item) => {
    addImages(db, item)
  });

}
    //Вывод в html
const outptHtml = (allImages) => {
  $content.innerHTML = '';
  allImages.forEach((item) => {
    let html = ''
    html = newImage(item)
    $content.insertAdjacentHTML('beforeend', html)
  })
}
const changeImages = () => {
  $newImgForm.style.display = 'none'
  $chgImgForm.style.display = 'inline-block'
  // chgImages(db, id);
}
    //Удаление картины по индексу
const delImages = () => {
  deleteImages(db);
}
         //Добавление
const addImages = (db, item) => {
  let ts = db.transaction(['images'], 'readwrite')
  let store = ts.objectStore('images')
  let newImg = {name: item.name, link: item.link}
  let added = store.add(newImg)
  ts.oncomplete = () => {
    console.log('images was add!')
    updateDisplay(db)
  }
  ts.onerror = (event) => {
    console.log('error adding images: ' + event.target.errorCode);
  }
}
   //Просмотр данных
const updateDisplay = (db) => {
  let ts = db.transaction(['images'], 'readonly')
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
}
    //Замена картины
const chgImages = (db, id) => {
  let ts = db.transaction(['images'], 'readwrite')
  let store = ts.objectStore('images')
  let newImg = {name: item.name, link: item.link}
  let added = store.put(newImg)
  ts.oncomplete = () => {
    console.log('images was add!')
    updateDisplay(db)
  }
  ts.onerror = (event) => {
    console.log('error adding images: ' + event.target.errorCode);
  }
}
    //Удаление по индексу
const deleteImages = (db) => {
  const ts = db.transaction(['images'], 'readwrite');
  const store = ts.objectStore('images');
  const req = store.getAll()
  const q = parseInt(prompt('"Удаление по индексу": Картину с каким индексом нужно удалить? '));
  req.onsuccess = (event) => {
    let key = req.result;
    let deleteRequest = store.delete(q);
    deleteRequest.onsuccess = (event) => {
      console.log('Delete request successful')
      updateDisplay(db)
    };
    deleteRequest.onerror = (event) => {
      console.log('Ошибка удаления: ', event.target.errorCode)
    }
  }
  ts.oncomplete = (event) => {
    console.log('Удаление прошло успешно')
    updateDisplay(db);
  };
  ts.onerror = function(event) {
    console.log('error in cursor request ' + event.target.errorCode);
  };
}

//================================================================
function newImage(item) {
  return `
  <div class="image">
    <img src="image/${item.link}">
    <p>${item.name}</p>
  </div>
  `
}
