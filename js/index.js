// import {model} from 'model.js'
class ImageBlock {
  constructor(link, options) {
    this.link = link;
    this.options = options;
    // this.description = description;
  }
}

const model = [
   new ImageBlock('rozy_1.jpg', {
     width: '100px;',
     height: '150px;'
   }),
   new ImageBlock('manxetten.jpg', {
     width: '100px;',
     height: '150px;'
   })
];

function newImage(item) {
  return `
  <div class="image">
    <img src="image/${item.link}" alt="">
  </div>
  `
}

let $content = document.querySelector('#content_block');

model.forEach((item) => {
  let html = '';
  html = newImage(item);
  $content.insertAdjacentHTML('beforeend', html);
})
