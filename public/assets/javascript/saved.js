$(document).ready(() => {
  const articleContainer = $('.articlesContainer');
  const modalBackground = $('#modalPageBackground');

  const initPage = () => {
    articleContainer.empty();
    $.get('/api/savedArticles').then((data) => {
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
        `<h3 class="author">${article.author}</h3>`,
        `<hr>`,
        `<p class="summary">${article.summary}</p>`,
        `</div>`,
        `<img class="deleteArticleButton" src="assets/images/trashIcon.png" data-id="${article._id}">`,
        `<img class="notesButton" src="assets/images/notesIcon.png" data-id="${article._id}">`,
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
        `<h4>Uh Oh. Looks like we don't have any saved articles.</h4>`,
        `</div>`,
        `<div class="panel panel-default">`,
        `<div class="panel-heading text-center">`,
        `<h3>Would You Like to Browse Available Articles?</h3>`,
        `</div>`,
        `<div class="panel-body text-center">`,
        `<h4><a href='/'>Browse Articles</a></h4>`,
        `</div>`,
        `</div>`
      ].join('')
    );
    articleContainer.append(emptyAlert);
  };

  const renderNotesList = (data) => {
    const notesToRender = [];
    let currentNote;
    if (!data.notes.length) {
      currentNote = `<li class="list-group-item">No notes for this article yet.</li>`;
      notesToRender.push(currentNote);
    }
    else {
      for (let note of data.notes) {
        currentNote = $(
          [
            `<li class="list-group-item note">`,
            note.noteText,
            `<button class="deleteNote" data-id=${note._id}>x</button>`,
            `</li>`
          ].join('')
        );
        notesToRender.push(currentNote);
      }
    }
    $(".note-container").append(notesToRender);
  };

  const handleArticleDelete = (articleID) => {
    $.ajax({
      method: "put",
      url: `/api/removeArticle/${articleID}`
    }).then((data) => {
      !data.saved ? initPage() : console.log('error in deleting article');
    });
  };

  const handleArticleNotes = (articleID) => {
    $.get(`/api/articleNotes/${articleID}`).then((data) => {
      const modalText = [
        `<div class="container-fluid text-center">`,
        `<h4>Notes for article ${articleID}</h4>`,
        `<hr>`,
        `<ul class="list-group note-container">`,
        `</ul>`,
        `<textarea placeholder="New Note" rows="4"></textarea>`,
        `<button class="saveNoteButton">Save Note</button>`,
        `</div>`
      ].join('');
      $('#modalContent').append(modalText);
    const noteData = {
      _id: articleID,
      notes: data || []
    };
    $('.saveNoteButton').data('article', noteData);
    renderNotesList(noteData);
    });
  };

  function handleNoteSave() {
    var noteData;
    var newNote = $(".bootbox-body textarea").val().trim();
    if (newNote) {
      noteData = {
        _id: $(this).data("article")._id,
        noteText: newNote
      };
      $.post("/api/notes", noteData).then(function() {
        bootbox.hideAll();
      });
    }
  }

  function handleNoteDelete() {
    var noteToDelete = $(this).data("_id");
    $.ajax({
      url: "/api/notes/" + noteToDelete,
      method: "DELETE"
    }).then(function() {
      bootbox.hideAll();
    });
  }

  $(document).on('click', '.deleteArticleButton', function(event) {
    event.preventDefault();
    const articleID = $(this).data('id');
    handleArticleDelete(articleID);
  });

  $(document).on("click", ".notesButton", function(event) {
    event.preventDefault();
    modalBackground.css("display","block");
    const articleID = $(this).data('id');
    console.log(`articleID: ${articleID}`);
    handleArticleNotes(articleID);
  });

  $(document).on("click", ".btn.save", handleNoteSave);
  $(document).on("click", ".btn.note-delete", handleNoteDelete);


  $(document).on("click", '#closeModal', () => {
    modalBackground.css("display","none");
  });

  $(document).on('click', (event) => {
    if (event.target.id === 'modalPageBackground') {
      modalBackground.css("display","none");
    }
  });


  initPage();


});
