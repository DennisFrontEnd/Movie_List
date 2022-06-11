const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"

//convert from JSON string to javascript object
const movies = JSON.parse(localStorage.getItem("favoriteMovies")) || []

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");

//提高function的重複利用性，故funtion內不使用global variable "movies"，否則該funtion就和movies這個變數綁定在一起
function renderMovieList(data) {
  let rawHTML = ''

  //processing 每個item都是一部電影的資料，包含title image等等 
  data.forEach((item) => {
    // console.log(item);
    rawHTML += `
      <div class="col-sm-3">
            <div class="mb-2">
              <div class="card">
                <img
                  src="${POSTER_URL + item.image}"
                  class="card-img-top" alt="Movie Poster" />
                <div class="card-body">
                  <h5 class="card-title">${item.title}</h5>
                </div>
                <div class="card-footer">
                  <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                    data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                  <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
                </div>
              </div>
            </div>
          </div> 
    `
  })

  dataPanel.innerHTML = rawHTML;
}

function showMovieModal(id) {
  //抓modal上每部電影需要修改的元素
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  //從API GET每個modal id需要的title, image, release date & description, 再套用進去剛剛抓到要修改的元素裡
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = "Release date: " + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster"
                class="img-fuid">`
  })
}

function removeFromFavorite(id) {
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  movies.splice(movieIndex, 1);

  localStorage.setItem("favoriteMovies", JSON.stringify(movies))
  renderMovieList(movies)
}

//在dataPanel上掛事件監聽器，如果是點到.btn-show-movie的按鈕，就執行showMovieModal這個function
dataPanel.addEventListener('click', function onPanelClicked(event) {
  let target = event.target;
  if (target.matches('.btn-show-movie')) {
    //因為dataset傳回來的物件裡的id是字串，所以要轉成number
    showMovieModal(Number(target.dataset.id))
  } else if (target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(target.dataset.id))
    //每點擊一次刪除電影按鈕就重新render一次畫面，不然刪除完還需要重新整理畫面才會出現最新的favorite movie list
  }
})

//excute function to render favorite move list from movies
renderMovieList(movies);
