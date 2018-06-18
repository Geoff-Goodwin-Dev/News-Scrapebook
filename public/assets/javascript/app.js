$(document).ready(() => {
  const articleContainer = $('#articles');

  const initPage = () => {
    articleContainer.empty();
    $.get('/api/articles').then((data) => {
      (data && data.length) ? renderArticles(data) : renderEmpty();
    });
  };

  const renderArticles = (data) => {
    const articlePanels = [];
    for (let article of data) {
      articlePanels.push(createPanel(article));
    }
    articleContainer.append(articlePanels);
  };

  const createPanel = (article) => {
    const panel = $(
      [
        `<div id="${article._id}" class="article">`,
        `<div id="image_${article._id}" class="imageContainer">`,
        `<img class="articleImage" src="${article.image}">`,
        `</div>`,
        `<div id="details_${article._id}" class="articleDetailsContainer">`,
        `<a href="${article.URL}" target="_blank"><h2>${article.headline}</h2></a>`,
        `<h3 class="author">By: ${article.author}</h3>`,
        `<hr>`,
        `<p class="summary">${article.summary}</p>`,
        `</div>`,
        `<img class="saveButton" src="assets/images/saveIcon.png" data-id="${article._id}">`,
        `</div>`
      ].join('')
    );
    panel.data('_id', article._id);
    return panel;
  };

  const renderEmpty = () => {
    const emptyAlert = $(
      [
        `<div class="alert alert-warning text-center">`,
        `<h4>Uh Oh. Looks like we don't have any new articles.</h4>`,
        `</div>`,
        `<div class="panel panel-default">`,
        `<div class="panel-heading text-center">`,
        `<h3>What Would You Like To Do?</h3>`,
        `</div>`,
        `<div class="panel-body text-center">`,
        `<h4><a class="scrape-new">Try Scraping New Articles</a></h4>`,
        `<h4><a href="/saved">Go to Saved Articles</a></h4>`,
        `</div>`,
        `</div>`
      ].join('')
    );
    articleContainer.append(emptyAlert);
  };

  const handleArticleSave = (articleID) => {
    $.ajax({
      method: 'PUT',
      url: `/api/saveArticle/${articleID}`,
    }).then((data) => {
      console.log(data.saved);
      data.saved ? initPage() : console.log('error in saving alert');
    });
  };

  const handleArticleScrape = () => {
    $.get('/api/scrape').then((data) => {
      initPage();
      alert(data.message);
    });
  };

  $(document).on('click', '.saveButton', function(event) {
    event.preventDefault();
    const articleID = $(this).data("id");
    handleArticleSave(articleID);
  });

  $(document).on("click", "#scrapeButton", (event) => {
    event.preventDefault();
    handleArticleScrape();
  });

  initPage();
});