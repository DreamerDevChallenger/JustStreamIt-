const baseUrl = "http://localhost:8000/api/v1";

async function getMovies(param) {
  return fetch(`${baseUrl}/titles/${param}`).then((res) => res.json());
}

async function getGenres(param) {
  return fetch(`${baseUrl}/genres/${param}`).then((res) => res.json());
}

async function getBestMovie() {
  const data = await getMovies("?sort_by=-imdb_score");
  return fetch(`${data.results[0].url}`).then((res) => res.json());
}

async function elementBestMovie() {
  const bestMovieData = await getBestMovie();
  const movie = document.getElementById("best-movie");
  const article = document.createElement("article");
  const img = document.createElement("img");
  const title = document.createElement("h2");
  const p = document.createElement("p");
  const button = document.createElement("button");
  const contain = document.createElement("div");

  img.setAttribute("src", bestMovieData.image_url);

  title.innerText = bestMovieData.title;
  p.innerText = bestMovieData.description;
  button.innerText = "Détails";

  button.addEventListener("click", () => openModal(bestMovieData.id));

  article.classList.add("container");
  title.classList.add("movie-title");
  contain.classList.add("contain");

  article.appendChild(img);
  article.appendChild(contain);
  contain.appendChild(title);
  contain.appendChild(p);
  contain.appendChild(button);
  movie.appendChild(article);
}

async function elementByGenre() {
  const results = await fetchPage(`${baseUrl}/genres/`);
  const categoryList = results.map((item) => item.name);

  for (let index = 0; index < 5; index++) {
    await elementMovieByCategory(
      categoryList[index],
      index >= 3 ? categoryList : false
    );
  }
}

async function fetchPage(pageUrl, results = []) {
  async function fetchRecursive(url) {
    const response = await fetch(url);
    const data = await response.json();

    results = results.concat(data.results);

    if (data.next) {
      await fetchRecursive(data.next);
    }
  }

  await fetchRecursive(pageUrl);
  return results;
}

async function elementMovieByCategory(param, categoryList) {
  const main = document.getElementById("app-main");
  const section = document.createElement("section");
  const container = document.createElement("div");
  const select = document.createElement("select");

  const category = document.createElement("h2");
  const header = document.createElement("header");

  section.classList.add(param.toLowerCase(), "app-genre", "app-section");
  category.textContent = categoryList ? "Autre:" : param;
  container.classList.add("container", "genre-container");
  header.classList.add("app-genre-title");
  header.appendChild(category);
  if (categoryList) {
    header.appendChild(select);
    for (let index = 0; index < categoryList.length; index++) {
      const option = document.createElement("option");
      option.value = categoryList[index];
      option.textContent = categoryList[index];
      if (param === categoryList[index]) {
        option.selected = true;
      }
      select.appendChild(option);
    }
    select.addEventListener("change", async function (event) {
      const selectedValue = event.target.value;
      container.innerHTML = "";
      await createMovieContainer(selectedValue, container);
    });
  }
  section.appendChild(header);
  section.appendChild(container);

  await createMovieContainer(param, container);

  applyResponsiveHide(container, section);

  main.appendChild(section);
}

const createMovieContainer = async (param, container) => {
  const data = await getMovies(`?genre=${param}`);
  for (let i = 0; i < data.results.length; i++) {
    const article = document.createElement("article");
    const title = document.createElement("p");
    const img = document.createElement("img");
    const button = document.createElement("button");
    const div = document.createElement("div");

    img.setAttribute("src", data.results[i].image_url);
    div.classList.add("btn-container");
    button.textContent = "Détails";
    title.textContent = data.results[i].title;
    div.appendChild(title);
    div.appendChild(button);
    article.appendChild(img);
    article.appendChild(div);
    button.addEventListener("click", () => openModal(data.results[i].id));

    container.appendChild(article);
  }
};

function hideLastNElements(n, container) {
  const listItems = container.children;

  for (let i = 0; i < listItems.length; i++) {
    listItems[i].style.display = "block";
  }

  for (let i = n; i < listItems.length; i++) {
    listItems[i].style.display = "none";
  }
}

function applyResponsiveHide(container, section) {
  const screenWidth = window.innerWidth;
  const button = document.createElement("button");
  button.textContent = "Voir plus";
  let range = 6;
  if (screenWidth < 768) {
    range = 2;
    if (container.children.length > 2) {
      hideLastNElements(range, container);
      section.appendChild(button);
      button.addEventListener("click", () => {
        if (range === 6) {
          range = range - 2;
          hideLastNElements(range, container);
          if (range !== 6) {
            button.textContent = "Voir plus";
          }
        } else {
          range = range + 2;
          hideLastNElements(range, container);
          if (range === 6) {
            button.textContent = "Voir moins";
          }
        }
      });
    }
  } else if (screenWidth >= 768 && screenWidth < 1024) {
    range = 4;
    if (container.children.length > 4) {
      hideLastNElements(range, container);
      section.appendChild(button);
      button.addEventListener("click", () => {
        if (range === 6) {
          range = range - 2;
          hideLastNElements(range, container);
          if (range !== 6) {
            button.textContent = "Voir plus";
          }
        } else {
          range = range + 2;
          hideLastNElements(range, container);
          if (range === 6) {
            button.textContent = "Voir moins";
          }
        }
      });
    }
  } else {
    hideLastNElements(6, container);
  }
}

async function openModal(id) {
  const modal = document.getElementById("app-modal");
  const close = document.getElementById("app-modal-btn-close");
  const closeBottom = document.getElementById("app-modal-btn-close-bottom");

  modal.classList.add("open");

  close.addEventListener("click", () => modal.classList.remove("open"));
  closeBottom.addEventListener("click", () => modal.classList.remove("open"));

  fetchModalData(id);
}

function fetchModalData(id) {
  fetch(baseUrl + "/titles/" + id)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("app-modal-cover").src = data.image_url;
      document.getElementById("app-modal-title").textContent = data.title;
      document.getElementById("modal-description").textContent =
        data.long_description;

      document.getElementById("app-modal-year").textContent = data.year;
      document.getElementById("app-modal-duration").textContent =
        data.duration + " minutes";
      document.getElementById("app-modal-genres").textContent = data.genres;
      document.getElementById("app-modal-imdb").textContent =
        data.imdb_score + " / 10";

      document.getElementById("app-modal-directors").textContent =
        data.directors;
      document.getElementById("app-modal-cast").textContent =
        data.actors + "...";
      document.getElementById("app-modal-country").textContent = data.countries;

      if (typeof data.rated === "string")
        document.getElementById("app-modal-rating").textContent = data.rated;
      else
        document.getElementById("app-modal-rating").textContent =
          data.rated + "+";
    });
}

function init() {
  elementBestMovie();
  elementByGenre();
}

init();
