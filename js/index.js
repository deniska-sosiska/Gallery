import {model} from 'model.js'

function newImage(link) {
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
