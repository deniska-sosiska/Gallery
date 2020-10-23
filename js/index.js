//=============================================================
let $clean = document.querySelector('#clean')
let $myFIle = document.querySelector('#myFIle')
let $forContent = document.querySelector('#forContent')
let $newImgForm = document.querySelector('#newImgForm')
let $theGallery = document.querySelector('#theGallery')
let $chgImgForm = document.querySelector('#chgImgForm')
let $content = document.querySelector('#content_block')
let $nameNewFile = document.querySelector('#nameNewFile')
let $descNewFile = document.querySelector('#descNewFile')
let $theAdditionalInformation = document.querySelector('#theAdditionalInformation')
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

var url = window.URL || window.webkitURL;
//Вызов ф. добавление картины по пути
const addImgForm = () => {
  let $files = document.querySelector('#myFIle').files
  for(let i = 0; i < $files.length; i++){
    let file = $files[i]
    let info, fileName, sizeW, sizeH, format, description,fileSize, date
    var img = new Image()
    img.onload = function () {
      sizeW = this.width; sizeH = this.height;
      //Для названия картины
      if (!$nameNewFile.value) {
        if (file.type.slice(6) == 'webp') { fileName = file.name.slice(0, -5) }
        else {  fileName = file.name.slice(0, -4) }
      }
      else {fileName = $nameNewFile.value}
      //Для высоты\ширины\формата
      if (sizeW > sizeH) { format = "Альбом"}
      else if (sizeW < sizeH) { format = "Портрет"}
      else { format = "Квадрат"}
      //Для описания картины
      description = $descNewFile.value ?  $descNewFile.value : '*Без описания*'
      //Для размера картины
      if ((file.size / 1024) > 1) {
        fileSize = file.size / 1024 //Становится КБ
        if ((fileSize / 1024) > 1) {  fileSize = (fileSize / 1024) + 'МБ' } //Становится МБ
        else (fileSize += 'КБ')
      }
      else {fileSize = file.size + 'Байт' }
      //Для размера картины
      date = file.lastModifiedDate.getDate() + '.' + file.lastModifiedDate.getMonth() + '.' + file.lastModifiedDate.getFullYear()
      formatObj = {
        format: format,
        sizeW: sizeW,
        sizeH:sizeH
      }
      info = {
        name: fileName,
        formatObj: formatObj,
        size: fileSize,
        mimetype: file.type.slice(6),
        date: date,
        description: description
      }
      var reader = new FileReader();
      reader.onload = (function() {
        let objImg = {link: reader.result, info: info}
        console.log('Новый объект: \n', objImg)
        transactions(db, 'add', objImg)

        $myFIle.type = ''; $myFIle.type = 'file' // для сброса информации
        $nameNewFile.value = ''; $descNewFile.value = '';
        $newImgForm.style.display = 'none'
        $clean.style.display = 'inline-block'
      })
      reader.readAsDataURL(file);
    }
    img.src = url.createObjectURL(file)
  }
}
   //Вызов ф. удаление картины по индексу
const btnDelImages = () => {
  transactions(db, 'delete')
}   //Вызов ф. удаление картины по индексу
const cleanStorageForm = () => {
  transactions(db, 'clean')
  $clean.style.display = 'none'
}   //Вывод в html
const outptHtml = (allImages) => {
  $content.innerHTML = '';
  allImages.forEach((item, i) => {
    let html = ''
    html = newImage(item, allImages[i].id)
    $content.insertAdjacentHTML('afterbegin', html)
  })
}

//==================================================================
const transactions = (db, option, item = {}) => {
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
  ts.oncomplete = () => { console.log('Updated') }
  ts.onerror = (event) => { console.log('error with transaction: update') }
}


//===============================================================
const getObjFromDB = (objectForAddInfo) => {
  let html = `
    <div class="addtlInform">
      <div class="addtlInform__image">
        <img src="${objectForAddInfo.link}" title="${objectForAddInfo.info.name}">
      </div>
      <div class="addtlInform__title">
        <p>Дополнительная информация</p>
      </div>
      <div class="addtlInform__content">
        <div><p class = "for_p">Название картины:</p><p>${objectForAddInfo.info.name}</p></div>
        <div><p class = "for_p">Описание: </p><p class="da">${objectForAddInfo.info.description}</p></div>
        <div><p class = "for_p">Дата создания: </p><p>${objectForAddInfo.info.date}</p></div>
        <div>
          <p class = "for_p">Формат, выс/шир: </p>
          <p>${objectForAddInfo.info.formatObj.format}, ${objectForAddInfo.info.formatObj.sizeH}/${objectForAddInfo.info.formatObj.sizeW}</p>
        </div>
        <div>
          <p class = "for_p">Расширение файла: </p>
          <p>${objectForAddInfo.info.mimetype}</p>
        </div>
        <div>
          <p class = "for_p">Вес: </p>
          <p>${objectForAddInfo.info.size}</p>
        </div>
      </div>
      <div class = "buttons inAddInfo">
        <button onclick="backToTheGallery()">Вернуться</button>
        <button onclick="showChangeImages()">Изменить</button>
        <button><a download = "${objectForAddInfo.info.name}" href="${objectForAddInfo.link}">Скачать</a></button>
        <button onclick="btnDelImages()">Удалить</button>
      </div>
    </div>
  `;
  $forContent.innerHTML = html
}
const getKey = (db, key) => {
  let objectForAddInfo = {}
  let ts = db.transaction('images', 'readonly')
  let store = ts.objectStore('images')
  let req = store.get(key)
  req.onsuccess = (event) => {
    objectForAddInfo = event.target.result
    getObjFromDB(objectForAddInfo, key)
  }
  ts.oncomplete = () => { console.log('Объект для просмотра дополнительной информации: \n', objectForAddInfo) }
  ts.onerror = (event) => { console.log('error with transaction: objectForAddInfo') }
}

const showAdditionalInfo = (itemID) => {
  $theGallery.style.display = 'none'
  getKey(db, itemID)
  $theAdditionalInformation.style.display = 'block'
}
const backToTheGallery = () => {
  $theGallery.style.display = 'block'
  $theAdditionalInformation.style.display = 'none'
  $forContent.innerHTML = ''
}

//================================================================
function newImage(item, itemID) {
  let nameFile
  if (item.info.name.length > 17) { nameFile = item.info.name.slice(0, 17) + '...' }
  else {  nameFile = item.info.name }
  return `
  <div class="image">
    <img src="${item.link}">
    <p title = "Название">${nameFile}</p>
    <div class = "buttons inImages">
      <button id="showAdditionalInfo" onclick = "showAdditionalInfo(${itemID})">Просмотреть доп. информацию</button>
    </div>
  </div>
  `
}
