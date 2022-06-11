const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const MOVIES_PER_PAGE = 12;

const movies = [];
let filteredMovie = [];

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator")

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
                  <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                </div>
              </div>
            </div>
          </div> 
    `
  })

  dataPanel.innerHTML = rawHTML;
}

//產生分頁器的function
function renderPaginator(amount) {
  //Math.ceil無條件進位
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = '';

  //用for loop產生相應頁數的分頁器的html
  for (let page = 1; page <= numberOfPages; page++) {
    //data-page綁在<a>上是因為滑鼠點擊的元素其實是<a>，而不是<li>，<li>只是顯示外觀用的
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }

  paginator.innerHTML = rawHTML;
}


//電影分頁的function
function getMoviesByPage(page) {
  //如果filteredMovie這個陣列有長度，則data = filteredMovie, 反之如果filteredMovie沒有東西則data = movies這個陣列，因為沒有長度等於沒有做搜尋的動作或是
  //沒有搜尋到東西
  const data = filteredMovie.length ? filteredMovie : movies
  //page 1 = movies 0 - 11
  //page 2 = movies 12 - 23
  //page 3 = movies 24 - 35
  //...
  //startIndex 第一頁減1乘上 movies per page 還是 0, 所以movies.slice的起始位置就會是0
  //結束位置為 startIndex + 12也很好理解，因為是擷取從startIndex ~ endIndex前一位
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
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

function addToFavorite(id) {

  //如果localStorage裡已經有這個key, get到之後要先轉換成js object, 因為localStorage只能存字串; 如果get不到這個key那就回傳一個空陣列
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  //這個movie就是要存入localStorage的movie, 先用函式isMovieIdMatched從movies這個陣列中找有沒有符合點擊到的電影的id, 如果有找到符合的就return
  const movie = movies.find((movie) => movie.id === id);
  //檢查list內的每一個元素是否有重複到點擊的的id, 如果有重複會回傳true並且return alert
  if (list.some((movie) => movie.id === id)) {
    return alert("You already have added this movie into your list.")
  }

  list.push(movie);
  // console.log(list);
  //用JSON.stringify轉換成字串
  localStorage.setItem("favoriteMovies", JSON.stringify(list))

}

//在dataPanel上掛事件監聽器，如果是點到.btn-show-movie的按鈕，就執行showMovieModal這個function
dataPanel.addEventListener('click', function onPanelClicked(event) {
  let target = event.target;
  if (target.matches('.btn-show-movie')) {
    //因為dataset傳回來的物件裡的id是字串，所以要轉成number
    showMovieModal(Number(target.dataset.id))
  } else if (target.matches('.btn-add-favorite')) {
    addToFavorite(Number(target.dataset.id))
  }
})

searchForm.addEventListener('submit', function searchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();


  //兩種判斷條件，一個是如果搜尋欄位內沒有輸入關鍵字，另一個是如果用該關鍵字搜尋不到相關電影
  //但如果用submit來判斷的話，如果想重新顯示全部的電影清單，用輸入空值來刷新頁面，有下面的判斷條件就無法做到
  // if (!keyword.length) {
  //   return alert("Please Enter Valid Value")
  // }
  //用filter來篩選電影名稱
  filteredMovie = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  //用迴圈來篩選電影名稱
  // movies.forEach((movie) => {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovie.push(movie)
  //   }
  // })
  //filteredMovie.length === 0 意思是沒有找到用該關鍵字搜尋的電影，所以filteredMovie的長度才會是0
  if (filteredMovie.length === 0) {
    return alert("Can't find movies with keyword: " + keyword)
  }
  renderPaginator(filteredMovie.length);
  renderMovieList(getMoviesByPage(1));
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  const target = event.target;
  if (target.tagName !== "A") return
  const page = Number(target.dataset.page);
  renderMovieList(getMoviesByPage(page))
})


axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results);
  renderPaginator(movies.length);
  //execute render movie function 
  renderMovieList(getMoviesByPage(1));
})
